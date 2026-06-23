export type SettingsFieldStatus = "ok" | "warning" | "missing" | "info";

export type SettingsStatusField = {
	label: string;
	val: string;
	status?: SettingsFieldStatus;
	hint?: string;
};

export type SettingsStatusSection = {
	id: string;
	tytul: string;
	opis: string;
	pola: SettingsStatusField[];
};

export type SetupCheckItem = {
	id: string;
	label: string;
	status: SettingsFieldStatus;
	detail: string;
};
