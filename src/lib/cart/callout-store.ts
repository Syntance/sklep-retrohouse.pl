import { create } from "zustand";

export type CartCalloutVariant = "added" | "duplicate";

type CartCalloutState = {
	open: boolean;
	variant: CartCalloutVariant;
	productName: string;
	show: (opts: { productName: string; variant?: CartCalloutVariant }) => void;
	hide: () => void;
};

export const useCartCalloutStore = create<CartCalloutState>((set) => ({
	open: false,
	variant: "added",
	productName: "",
	show: ({ productName, variant = "added" }) => set({ open: true, productName, variant }),
	hide: () => set({ open: false }),
}));
