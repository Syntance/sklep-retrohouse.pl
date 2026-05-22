"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { mergeShopParams, type ShopSearchParams } from "./shop-params";

type SortOption = {
	value: string;
	label: string;
};

type SortDropdownProps = {
	params: ShopSearchParams;
	activeSort: string;
	options: readonly SortOption[];
};

export function SortDropdown({ params, activeSort, options }: SortDropdownProps) {
	const router = useRouter();

	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;
		const href = `/sklep${mergeShopParams(params, {
			sort: value === "najnowsze" ? undefined : value,
		})}`;
		router.push(href, { scroll: false });
	};

	return (
		<div className="flex items-center justify-end gap-2">
			<label
				htmlFor="shop-sort"
				className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/60"
			>
				Sortowanie
			</label>
			<select
				id="shop-sort"
				value={activeSort}
				onChange={handleChange}
				className={cn(
					"h-10 min-w-[11rem] rounded-xl border border-border bg-card px-3 text-sm text-foreground",
					"focus-visible:border-terracotta/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta",
				)}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}
