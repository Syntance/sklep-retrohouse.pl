import { Paintbrush } from "lucide-react";
import { Card, PageHeader } from "@/components/panel/chrome";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ustawienia sklepu — Motywy magazynu" };

export default function SettingsMotywyPage() {
	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Motywy magazynu"
				description="Kolory i wygląd panelu administracyjnego."
			/>
			<Card>
				<div className="flex items-start gap-3">
					<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
						<Paintbrush className="size-4" aria-hidden />
					</span>
					<div>
						<p className="text-sm font-medium text-foreground">Motyw panelu</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Personalizacja motywu magazynu (kolory OKLCH, typografia) będzie dostępna w kolejnej
							iteracji. Obecnie panel korzysta z domyślnych tokenów RetroHouse zgodnych z Moduly.
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
