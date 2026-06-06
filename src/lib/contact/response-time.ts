/** Gwarancja odpowiedzi na formularz kontaktowy i e-mail ogólny (B2C). */
export const CONTACT_FORM_RESPONSE = {
	hours: 24,
	label: "24 godzin roboczych",
	labelShort: "24 godzin",
	withAverage: "24 godzin roboczych",
	weekendNote: "W weekendy i święta — w poniedziałek rano.",
} as const;

/** Instagram DM / WhatsApp / telefon — w godzinach otwarcia. */
export const CONTACT_FAST_RESPONSE = {
	hours: 1,
	within: "w ciągu 1 godziny",
	openingHoursNote:
		"DM na Instagramie albo WhatsApp — staramy się odpisywać w godzinach otwarcia w ciągu 1 godziny.",
} as const;
