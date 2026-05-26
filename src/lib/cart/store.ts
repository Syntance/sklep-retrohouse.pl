import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartLine = {
	slug: string;
	addedAt: string;
};

type CartState = {
	items: CartLine[];
	addItem: (slug: string) => boolean;
	removeItem: (slug: string) => void;
	clear: () => void;
};

/**
 * Klientowy koszyk MVP — persist w localStorage.
 * Docelowo: sync z Medusa cart API; na razie slug + timestamp.
 * Unikaty: ten sam slug nie może być dodany dwa razy.
 */
export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			items: [],
			addItem: (slug) => {
				if (get().items.some((item) => item.slug === slug)) {
					return false;
				}
				set((state) => ({
					items: [...state.items, { slug, addedAt: new Date().toISOString() }],
				}));
				return true;
			},
			removeItem: (slug) => {
				set((state) => ({
					items: state.items.filter((item) => item.slug !== slug),
				}));
			},
			clear: () => set({ items: [] }),
		}),
		{ name: "retrohouse-cart" },
	),
);

export function selectCartCount(state: CartState): number {
	return state.items.length;
}
