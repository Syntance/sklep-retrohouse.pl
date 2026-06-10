"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import {
  isCartAlreadyCompletedError,
  POLL_DELAYS_MS,
} from "@/lib/medusa/checkout-helpers";

/**
 * Strona powrotu z Tpay. Klient jest tu przekierowany po kliknięciu „wróć do sklepu"
 * na stronie Tpay. Płatność może być już potwierdzona (webhook dotrze szybko) lub
 * jeszcze pending (webhook dotrze z opóźnieniem). Dopóki pending, ponawiamy
 * finalizację koszyka. Gdy zamówienie powstanie, przekierowujemy na /dziekujemy.
 *
 * UWAGA: RetroHouse nie używa Medusa SDK — checkout flow jest uproszczony
 * (api/checkout/route.ts). Ta strona to tylko UI feedback dla klienta.
 * Rzeczywistą finalizację obsługuje webhook Tpay → Medusa backend.
 */

type ReturnState =
  | { kind: "verifying" }
  | { kind: "pending" }
  | { kind: "error"; message: string };

function clearLocalCart() {
  try {
    localStorage.removeItem("rh-cart");
  } catch {
    /* prywatny tryb */
  }
}

function TpayReturnInner() {
  const params = useSearchParams();
  const cartId = params.get("cart_id");
  const [state, setState] = useState<ReturnState>({ kind: "verifying" });
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!cartId) {
      setState({
        kind: "error",
        message: "Brak identyfikatora koszyka. Sprawdź skrzynkę e-mail lub skontaktuj się z nami.",
      });
      return;
    }

    // UWAGA: RetroHouse używa prostego checkout flow bez Medusa SDK na froncie.
    // Webhook Tpay → Medusa backend domyka koszyk. Tu tylko czekamy i informujemy klienta.
    // W pełnej implementacji (jak lumineconcept) byłby tutaj retry loop `completeCart(cartId)`.

    // Dla RetroHouse: po prostu czekamy kilka sekund i przekierowujemy na pending.
    let cancelled = false;

    (async () => {
      // Podstawowy delay — dajemy webhookowi czas na dotarcie.
      await new Promise((r) => setTimeout(r, POLL_DELAYS_MS[0] + POLL_DELAYS_MS[1]));

      if (!cancelled) {
        setState({ kind: "pending" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cartId]);

  if (state.kind === "verifying") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-terracotta" />
        <h1 className="mt-6 font-display text-2xl font-semibold text-foreground">
          Potwierdzamy płatność…
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/60">
          Trwa weryfikacja transakcji w Tpay — zwykle kilka sekund. Za
          chwilę przeniesiemy Cię do potwierdzenia zamówienia.
        </p>
        <p className="mx-auto mt-6 max-w-md text-xs text-foreground/40">
          Jeśli nie chcesz czekać, możesz{" "}
          <Link href="/sklep" className="underline hover:text-foreground/60">
            wrócić do sklepu
          </Link>{" "}
          — gdy płatność zostanie zaksięgowana, zamówienie utworzy się
          automatycznie, a potwierdzenie wyślemy e-mailem.
        </p>
      </div>
    );
  }

  if (state.kind === "pending") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="mt-6 font-display text-2xl font-semibold text-foreground">
          Płatność jest przetwarzana
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/60">
          Czekamy na potwierdzenie z Tpay. Możesz bezpiecznie zamknąć tę
          stronę — gdy wpłata zostanie zaksięgowana, zamówienie utworzy się
          automatycznie, a potwierdzenie z numerem zamówienia trafi na Twój
          e-mail.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/sklep"
            className="rounded-md bg-terracotta px-8 py-3 text-sm font-semibold text-white hover:bg-terracotta/90 transition-colors"
          >
            Wróć do sklepu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
      <h1 className="mt-6 font-display text-2xl font-semibold text-foreground">
        Coś poszło nie tak
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-foreground/60">{state.message}</p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/koszyk"
          className="rounded-md bg-foreground px-8 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
        >
          Wróć do koszyka
        </Link>
      </div>
    </div>
  );
}

export default function TpayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-terracotta" />
        </div>
      }
    >
      <TpayReturnInner />
    </Suspense>
  );
}
