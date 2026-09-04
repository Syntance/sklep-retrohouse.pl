/**
 * Wspólne zaokrąglenia edytora — zgodne z Button (rounded-lg) i paletą bloków.
 * Przełączniki segmentowe: układ jak w /konto (margines aktywnej pigułki), kolory magazynu (primary + border).
 * Próbka koloru: wewnętrzny radius = lg − inset − border (email-editor.css).
 */
export const editorBtnRounded = "rounded-lg";

/** Zmienne jak w `components/ui/tabs.tsx` (variant default). */
export const segmentTrackVars =
	"[--tabs-active-margin:0.125rem] [--tabs-inner-radius:calc(var(--radius-lg)-var(--tabs-track-padding,0.125rem)-var(--tabs-active-margin,0.125rem))] [--tabs-track-padding:0.125rem]";

/** Ramka grupy przełączników (Blok/Motyw, desktop/mobile, wyrównanie, szablony). */
export const segmentTrack = [
	"inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-input bg-background p-[var(--tabs-track-padding,0.125rem)]",
	segmentTrackVars,
].join(" ");

/** Wspólna geometria pigułki (aktywny, hover, focus — ten sam kształt i rozmiar). */
export const segmentItem =
	"relative inline-flex items-center justify-center m-[var(--tabs-active-margin)] rounded-[var(--tabs-inner-radius)] border border-transparent bg-transparent text-sm font-medium leading-none shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40";

/** Nieaktywny — tło tylko wewnątrz pigułki. */
export const segmentItemIdle = "text-muted-foreground hover:bg-muted hover:text-foreground";

/** Aktywny — terracotta/primary. */
export const segmentItemActive = "bg-primary text-primary-foreground hover:bg-primary/90";

/** Klasa input[type=color] — wymaga email-editor.css (zaokrąglona próbka w środku). */
export const colorSwatchInput = "email-editor-color-swatch h-9 w-10";
