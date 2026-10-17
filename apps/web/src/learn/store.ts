// slippylabs: progress lives only in this browser (localStorage), one key per
// document so a write never rewrites the whole course:
//   lingo:v2/<course>/items    { [itemId]: ItemState }
//   lingo:v2/<course>/profile  Profile (goal, minutes, notes seen…)
//   lingo:v2/<course>/days     { [dayNumber]: DayStats }
//   lingo:v2/<course>/log      LogEntry[] (last 500 answers, for weak spots)
//   lingo:v2/recent            course names, most recent first
// Every access is guarded: storage can be missing (private mode) or full.
import type { DayStats, ItemState, LogEntry, Profile } from './types';

const mem = new Map<string, string>();
const PREFIX = 'lingo:v2/';
const LOG_MAX = 500;

function rawGet(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return mem.get(key) ?? null;
	}
}
function rawSet(key: string, value: string) {
	try {
		localStorage.setItem(key, value);
	} catch {
		mem.set(key, value);
	}
}
function rawDel(key: string) {
	try {
		localStorage.removeItem(key);
	} catch {
		/* ignore */
	}
	mem.delete(key);
}

function read<T>(key: string, fallback: T): T {
	const v = rawGet(PREFIX + key);
	if (v == null) return fallback;
	try {
		return JSON.parse(v) as T;
	} catch {
		return fallback;
	}
}
const write = (key: string, value: unknown) => rawSet(PREFIX + key, JSON.stringify(value));

export type CourseProgress = {
	course: string;
	items: Record<string, ItemState>;
	profile: Profile | null;
	days: Record<string, DayStats>;
	log: LogEntry[];
};

export function loadProgress(course: string): CourseProgress {
	return {
		course,
		items: read(`${course}/items`, {}),
		profile: read(`${course}/profile`, null),
		days: read(`${course}/days`, {}),
		log: read(`${course}/log`, [])
	};
}

export const saveItems = (p: CourseProgress) => write(`${p.course}/items`, p.items);
export const saveProfile = (p: CourseProgress) => write(`${p.course}/profile`, p.profile);
export const saveDays = (p: CourseProgress) => write(`${p.course}/days`, p.days);
export function saveLog(p: CourseProgress) {
	if (p.log.length > LOG_MAX) p.log = p.log.slice(-LOG_MAX);
	write(`${p.course}/log`, p.log);
}

export function touchRecent(course: string) {
	const list = read<string[]>('recent', []).filter((c) => c !== course);
	write('recent', [course, ...list].slice(0, 30));
}
export const recentCourses = (): string[] => read<string[]>('recent', []);

/** Export file: everything for one course, as plain JSON. */
export function exportProgress(course: string) {
	const p = loadProgress(course);
	return { app: 'lingo.slippylabs.com', version: 2, ...p };
}

export function importProgress(course: string, data: unknown): string | null {
	const d = data as Partial<CourseProgress> & { app?: string; version?: number };
	if (!d || d.app !== 'lingo.slippylabs.com' || d.version !== 2) return 'Not a LibreLingo progress file.';
	if (d.course !== course) return `That file is for a different course (${d.course}).`;
	if (typeof d.items !== 'object' || typeof d.days !== 'object' || !Array.isArray(d.log))
		return 'The file is damaged.';
	write(`${course}/items`, d.items);
	write(`${course}/profile`, d.profile ?? null);
	write(`${course}/days`, d.days);
	write(`${course}/log`, d.log);
	return null;
}

export function resetProgress(course: string) {
	for (const k of ['items', 'profile', 'days', 'log']) rawDel(`${PREFIX}${course}/${k}`);
}

/**
 * v1 (slip-v1.0.x) kept one doc per skill, lingo:skills/<course>/<skillId>,
 * with a practice log. A skill whose practice reached all its levels is
 * seeded as learned (box 2) the first time the course opens in v2; the
 * reviews are spread over the next week so they don't all land on one day.
 */
export function migrateV1(
	p: CourseProgress,
	skills: { id: string; slug: string; levels: number }[],
	itemsBySkill: Map<string, string[]>,
	today: number
): number {
	let seeded = 0;
	for (const sk of skills) {
		const legacy = readLegacy(`lingo:skills/${p.course}/${sk.id}`);
		if (!legacy?.practiced?.length) continue;
		const progress = legacy.practiced
			.filter((x) => x.correct === undefined || x.correct > 0)
			.reduce((acc, x) => acc + (x.correct ?? 1) / ((x.correct ?? 1) + (x.skipped ?? 0)), 0);
		if (progress < sk.levels) continue;
		(itemsBySkill.get(sk.slug) ?? []).forEach((id, i) => {
			if (p.items[id]) return;
			p.items[id] = {
				s: sk.slug,
				box: 2,
				due: today + 1 + (i % 7),
				seen: today,
				last: today,
				right: 1,
				wrong: 0,
				lapses: 0,
				level: 0
			};
			seeded++;
		});
	}
	return seeded;
}

function readLegacy(key: string): { practiced?: { correct?: number; skipped?: number }[] } | null {
	const v = rawGet(key);
	if (!v) return null;
	try {
		return JSON.parse(v);
	} catch {
		return null;
	}
}
