"use client";

import { Building2, CreditCard } from "lucide-react";
import {
  CHECKOUT_VISIBLE_PROVIDER_IDS,
  TPAY_PROVIDER_ID,
  SYSTEM_PAYMENT_PROVIDER_ID,
} from "@/lib/medusa/checkout-helpers";

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  icon: typeof CreditCard;
  methods?: string[];
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: TPAY_PROVIDER_ID,
    name: "Tpay",
    description: "BLIK, szybki przelew online, karta — płatność od razu",
    icon: CreditCard,
    methods: ["BLIK", "Przelew online", "Karta"],
  },
  {
    id: SYSTEM_PAYMENT_PROVIDER_ID,
    name: "Przelew tradycyjny",
    description:
      "Wpłata na konto sklepu — zamówienie przyjmujemy od razu, realizacja po zaksięgowaniu przelewu",
    icon: Building2,
  },
];

interface PaymentSelectorProps {
  selectedProviderId: string;
  onSelect: (providerId: string) => void;
  /** Aktywne providery w regionie — filtrujemy do widocznych w checkoutcie. */
  availableProviderIds?: string[];
}

export function PaymentSelector({
  selectedProviderId,
  onSelect,
  availableProviderIds,
}: PaymentSelectorProps) {
  const visibleIds = new Set<string>(CHECKOUT_VISIBLE_PROVIDER_IDS);
  const isRegistered = (id: string) =>
    !availableProviderIds || availableProviderIds.includes(id);

  const options = PAYMENT_OPTIONS.filter(
    (option) => visibleIds.has(option.id) && isRegistered(option.id),
  );

  if (options.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-brand-800">
        Płatność online jest chwilowo niedostępna. Napisz na{" "}
        <a href="mailto:kontakt@retrohouse.pl" className="font-semibold underline">
          kontakt@retrohouse.pl
        </a>
        .
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedProviderId === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`flex w-full items-start gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
              isSelected
                ? "border-terracotta bg-terracotta/10 shadow-sm"
                : "border-border hover:border-terracotta/40 hover:bg-background/50"
            }`}
          >
            <div
              className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                isSelected ? "border-terracotta" : "border-border"
              }`}
            >
              {isSelected ? <div className="h-2.5 w-2.5 rounded-full bg-terracotta" /> : null}
            </div>
            <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-foreground/60" />
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">{option.name}</span>
              <p className="mt-0.5 text-xs text-foreground/60">{option.description}</p>

              {option.methods ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {option.methods.map((method) => (
                    <span
                      key={method}
                      className="rounded bg-background px-2 py-0.5 text-xs text-foreground/70 border border-border"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
