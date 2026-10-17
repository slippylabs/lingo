// slippylabs: calendar days in the learner's own time zone. Reviews are
// scheduled in whole days, so "due today" is the same all day long.
const DAY = 86_400_000;

export const dayNumber = (now: number | Date = Date.now()): number => {
	const t = typeof now === 'number' ? new Date(now) : now;
	return Math.floor((t.getTime() - t.getTimezoneOffset() * 60_000) / DAY);
};

/** The local midnight of a day number, as a Date. */
export const dayDate = (day: number): Date => {
	const utc = new Date(day * DAY);
	return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
};

export const weekdayShort = (day: number): string =>
	dayDate(day).toLocaleDateString('en', { weekday: 'short' });

export const formatDay = (day: number): string =>
	dayDate(day).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
