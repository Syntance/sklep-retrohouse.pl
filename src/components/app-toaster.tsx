"use client";

import { Toaster } from "@/components/ui/sonner";

/** Globalne powiadomienia (sonner) — wymagane przy toast() z dowolnej strony. */
export function AppToaster() {
	return <Toaster position="top-center" richColors closeButton duration={5000} />;
}
