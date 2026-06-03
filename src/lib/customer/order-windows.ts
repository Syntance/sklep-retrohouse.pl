/** Odstąpienie od umowy — art. 27 UPK (dni od dostawy / zamówienia). */
export const WITHDRAWAL_WINDOW_DAYS = 14;

/** Zgodność towaru z umową — rozdz. 5a UPK (2 lata od wydania towaru). */
export const CLAIM_WARRANTY_DAYS = 730;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysSince(isoDate: string, nowMs = Date.now()): number {
	return Math.floor((nowMs - new Date(isoDate).getTime()) / MS_PER_DAY);
}

export function daysLeftInWindow(startIso: string, windowDays: number, nowMs = Date.now()): number {
	return Math.max(0, windowDays - daysSince(startIso, nowMs));
}
