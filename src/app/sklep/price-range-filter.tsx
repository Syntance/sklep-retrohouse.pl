import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ShopSearchParams } from "./shop-params";
import { mergeShopParams } from "./shop-params";

type PriceRangeFilterProps = {
	params: ShopSearchParams;
	priceMin?: number;
	priceMax?: number;
};

export function PriceRangeFilter({ params, priceMin, priceMax }: PriceRangeFilterProps) {
	const hasActiveRange = priceMin !== undefined || priceMax !== undefined;

	return (
		<fieldset className="border-t border-border py-5">
			<legend className="mb-3 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
				Cena
			</legend>
			<form action="/sklep" method="get" className="space-y-3">
				<PreserveParams params={params} omit={["cenaOd", "cenaDo"]} />
				<div className="grid grid-cols-2 gap-2">
					<label className="flex flex-col gap-1.5">
						<span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
							Od (zł)
						</span>
						<input
							type="number"
							name="cenaOd"
							min={0}
							step={1}
							inputMode="numeric"
							placeholder="0"
							defaultValue={priceMin ?? ""}
							className={inputClass}
						/>
					</label>
					<label className="flex flex-col gap-1.5">
						<span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
							Do (zł)
						</span>
						<input
							type="number"
							name="cenaDo"
							min={0}
							step={1}
							inputMode="numeric"
							placeholder="max"
							defaultValue={priceMax ?? ""}
							className={inputClass}
						/>
					</label>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="submit"
						className="inline-flex h-9 items-center justify-center rounded-full border border-walnut/25 bg-background px-4 text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-terracotta hover:text-terracotta"
					>
						Zastosuj
					</button>
					{hasActiveRange ? (
						<Link
							href={`/sklep${mergeShopParams(params, { cenaOd: undefined, cenaDo: undefined })}`}
							scroll={false}
							className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/55 hover:text-foreground"
						>
							Wyczyść
						</Link>
					) : null}
				</div>
			</form>
		</fieldset>
	);
}

const inputClass = cn(
	"h-10 w-full rounded-xl border border-border bg-background px-3 text-sm tabular-nums",
	"[appearance:textfield] [-moz-appearance:textfield]",
	"[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
	"placeholder:text-foreground/40",
	"focus-visible:border-terracotta/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta",
);

function PreserveParams({
	params,
	omit,
}: {
	params: ShopSearchParams;
	omit: Array<keyof ShopSearchParams>;
}) {
	return (
		<>
			{(Object.entries(params) as Array<[keyof ShopSearchParams, string | undefined]>)
				.filter(([key, value]) => value && !omit.includes(key))
				.map(([key, value]) => (
					<input key={key} type="hidden" name={key} value={value} />
				))}
		</>
	);
}
