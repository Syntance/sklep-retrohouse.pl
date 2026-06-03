"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	CUSTOMER_SESSION_CHANGED_EVENT,
	clearCustomerToken,
	getEmailFromCustomerToken,
	readCustomerToken,
	writeCustomerToken,
} from "@/lib/customer/session-storage";

type CustomerSessionContextValue = {
	token: string | null;
	email: string | null;
	ready: boolean;
	isLoggedIn: boolean;
	login: (token: string) => void;
	logout: () => void;
};

const CustomerSessionContext = createContext<CustomerSessionContextValue | null>(
	null,
);

export function CustomerSessionProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(null);
	const [ready, setReady] = useState(false);

	const syncFromStorage = useCallback(() => {
		const stored = readCustomerToken();
		if (!stored) {
			setToken(null);
			return;
		}
		const email = getEmailFromCustomerToken(stored);
		if (!email) {
			clearCustomerToken();
			setToken(null);
			return;
		}
		setToken(stored);
	}, []);

	useEffect(() => {
		syncFromStorage();
		setReady(true);

		const onChange = () => syncFromStorage();
		window.addEventListener(CUSTOMER_SESSION_CHANGED_EVENT, onChange);
		window.addEventListener("storage", onChange);
		return () => {
			window.removeEventListener(CUSTOMER_SESSION_CHANGED_EVENT, onChange);
			window.removeEventListener("storage", onChange);
		};
	}, [syncFromStorage]);

	const login = useCallback((nextToken: string) => {
		writeCustomerToken(nextToken);
		setToken(nextToken);
	}, []);

	const logout = useCallback(() => {
		clearCustomerToken();
		setToken(null);
	}, []);

	const email = token ? getEmailFromCustomerToken(token) : null;

	const value = useMemo(
		() => ({
			token,
			email,
			ready,
			isLoggedIn: Boolean(token && email),
			login,
			logout,
		}),
		[token, email, ready, login, logout],
	);

	return (
		<CustomerSessionContext.Provider value={value}>
			{children}
		</CustomerSessionContext.Provider>
	);
}

export function useCustomerSession(): CustomerSessionContextValue {
	const ctx = useContext(CustomerSessionContext);
	if (!ctx) {
		throw new Error("useCustomerSession wymaga CustomerSessionProvider");
	}
	return ctx;
}
