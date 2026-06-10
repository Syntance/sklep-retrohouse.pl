import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { completeCartWorkflow } from "@medusajs/medusa/core-flows";
import {
  classifyCompleteCartError,
  isReconcilableSession,
  TPAY_PROVIDER_ID,
  RECONCILE_MAX_PER_RUN,
  uniqueCartIds,
  type TpaySessionRow,
} from "../lib/tpay-reconcile";

/**
 * Rekoncyliacja płatności Tpay — siatka bezpieczeństwa na spóźnione
 * lub zgubione potwierdzenia (standard branżowy: webhook + cykliczny sweep).
 *
 * Głównym torem domknięcia koszyka pozostaje:
 *  1. strona powrotu klienta (`/checkout/tpay/return` → completeCart),
 *  2. webhook Tpay (notificationUrl → Medusa `processPaymentWorkflow` →
 *     `completeCartAfterPaymentStep`).
 *
 * Ten job łapie resztę: klient zamknął przeglądarkę (np. zapłacił BLIK lub
 * przelewem, który księguje się następnego dnia), a webhook nie dotarł / nie
 * domknął koszyka. `completeCartWorkflow` autoryzuje sesję płatności — nasz
 * provider robi wtedy pull-based `GET /transactions/{id}` w Tpay, więc zamówienie
 * powstaje WYŁĄCZNIE gdy środki realnie są. Nieopłacone sesje kończą się
 * kontrolowanym `PAYMENT_AUTHORIZATION_ERROR` i job je po cichu pomija.
 *
 * Idempotencja: koszyki `completed_at != null` odpadają w query; wyścig ze
 * storefrontem / webhookiem kończy się błędem „already completed" (ignorowany);
 * `completeCartWorkflow` ma własny lock per koszyk.
 */

type QueryGraph = {
  graph: (q: {
    entity: string;
    fields: string[];
    filters?: Record<string, unknown>;
    pagination?: {
      skip?: number;
      take?: number;
      order?: Record<string, "ASC" | "DESC">;
    };
  }) => Promise<{ data: unknown[] }>;
};

type Logger = {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
};

export default async function reconcileTpayPaymentsJob(container: MedusaContainer) {
  const logger = container.resolve("logger") as Logger;

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY) as QueryGraph;

    // 1. Wiszące sesje Tpay (pending = klient był na bramce, brak potwierdzenia).
    const { data: sessionRows } = await query.graph({
      entity: "payment_session",
      fields: ["id", "status", "provider_id", "created_at", "payment_collection_id"],
      filters: { provider_id: TPAY_PROVIDER_ID, status: "pending" },
      pagination: { take: 500, order: { created_at: "DESC" } },
    });

    const now = Date.now();
    const reconcilable = (sessionRows as TpaySessionRow[]).filter((row) =>
      isReconcilableSession(row, now),
    );
    if (reconcilable.length === 0) return;

    // 2. Sesja → koszyk (link cart ↔ payment_collection).
    const collectionIds = [
      ...new Set(
        reconcilable
          .map((row) => row.payment_collection_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const { data: linkRows } = await query.graph({
      entity: "cart_payment_collection",
      fields: ["cart_id", "payment_collection_id"],
      filters: { payment_collection_id: collectionIds },
      pagination: { take: collectionIds.length },
    });
    const cartIds = uniqueCartIds(linkRows as Array<{ cart_id?: string | null }>);
    if (cartIds.length === 0) return;

    // 3. Tylko niedomknięte koszyki.
    const { data: cartRows } = await query.graph({
      entity: "cart",
      fields: ["id", "completed_at"],
      filters: { id: cartIds },
      pagination: { take: cartIds.length },
    });
    const candidates = (
      cartRows as Array<{ id: string; completed_at?: string | null }>
    )
      .filter((c) => !c.completed_at)
      .slice(0, RECONCILE_MAX_PER_RUN);

    if (candidates.length === 0) return;
    logger.info(
      `[tpay-reconcile] sprawdzam ${candidates.length} koszyków z wiszącą sesją Tpay`,
    );

    // 4. Sekwencyjnie (nie równolegle) — oszczędza Tpay API i workflow engine.
    let completed = 0;
    for (const cart of candidates) {
      try {
        const { result } = await completeCartWorkflow(container).run({
          input: { id: cart.id },
        });
        completed += 1;
        logger.info(
          `[tpay-reconcile] koszyk ${cart.id} domknięty → zamówienie ${result.id} (płatność potwierdzona w Tpay)`,
        );
      } catch (e) {
        const kind = classifyCompleteCartError(e);
        if (kind === "payment_pending" || kind === "already_completed") {
          continue; // normalny stan — wpłata jeszcze nie dotarła / ktoś nas ubiegł
        }
        logger.warn(
          `[tpay-reconcile] koszyk ${cart.id}: ${(e as Error)?.message ?? e}`,
        );
        // TODO: Integrate with Sentry for production error tracking
        // captureError(e, { job: "reconcile-tpay-payments", cart_id: cart.id });
      }
    }
    if (completed > 0) {
      logger.info(`[tpay-reconcile] domknięto ${completed} zamówień`);
    }
  } catch (e) {
    // Job nie może ubić procesu — logujemy i czekamy na kolejny przebieg.
    logger.error(`[tpay-reconcile] przebieg nieudany: ${(e as Error)?.message ?? e}`);
    // TODO: captureError(e, { job: "reconcile-tpay-payments" });
  }
}

export const config = {
  name: "reconcile-tpay-payments",
  schedule: "*/10 * * * *", // co 10 min
};
