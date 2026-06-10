import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function TpayErrorPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
      <h1 className="mt-6 font-display text-2xl font-semibold text-foreground">
        Płatność nie powiodła się
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-foreground/60">
        Transakcja została anulowana lub wystąpił błąd. Możesz spróbować ponownie
        lub wybrać inną metodę płatności.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/koszyk"
          className="rounded-md bg-foreground px-8 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
        >
          Wróć do koszyka
        </Link>
        <Link
          href="/sklep"
          className="text-sm text-foreground/60 underline hover:text-foreground"
        >
          Wróć do sklepu
        </Link>
      </div>
    </div>
  );
}
