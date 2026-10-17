// slippylabs: the personal study plan. Everything here is derived from the
// profile (goal + minutes a day) and the item states; nothing is stored.
import { INTERVALS, MASTERED_BOX, MAX_BOX, isDue, isWeak } from './srs';
import type { CourseIndex, DayStats, Goal, IndexItem, ItemState, Profile } from './types';

export const GOALS: Record<Goal, { label: string; blurb: string }> = {
	general: { label: 'A bit of everything', blurb: 'Balanced reading, writing and listening.' },
	travel: { label: 'Travel', blurb: 'Everyday phrases, and understanding them when spoken.' },
	conversation: {
		label: 'Conversation',
		blurb: 'Listening, and building your own sentences.'
	},
	reading: { label: 'Reading', blurb: 'Recognising words and understanding sentences.' }
};

const known = (index: CourseIndex) => new Set(index.items.map((i) => i.id));

export const MINUTES = [5, 10, 15, 20] as const;

/** About 20 exercises take 6-7 minutes, so a day's target is 3 per minute. */
export const dailyTarget = (p: Pick<Profile, 'minutes'>): number => p.minutes * 3;

/** New words/phrases per day. Each costs ~3 exercises (teach, recognise, recall). */
export const newPerDay = (p: Pick<Profile, 'minutes'>): number =>
	({ 5: 4, 10: 7, 15: 10, 20: 14 })[p.minutes] ?? 7;

/** New items introduced by one lesson. */
export const newPerLesson = (p: Pick<Profile, 'minutes'>): number => (p.minutes >= 15 ? 5 : 4);

/** Reviews pile up if you skip days; past 3 days' worth, new words wait. */
export const backlogPaused = (due: number, p: Pick<Profile, 'minutes'>): boolean =>
	due > 3 * dailyTarget(p);

/**
 * A word can appear in several lessons ("Bonjour" is in three French ones);
 * it is one item with one memory. This is each item once, at its first lesson.
 */
export function uniqueItems(index: CourseIndex): IndexItem[] {
	const seen = new Set<string>();
	return index.items.filter((i) => !seen.has(i.id) && seen.add(i.id));
}

/** A lesson's own items, words before phrases, each once. */
export function skillItems(index: CourseIndex, skill: string): IndexItem[] {
	const seen = new Set<string>();
	const list = index.items.filter((i) => i.s === skill && !seen.has(i.id) && seen.add(i.id));
	return [...list.filter((i) => i.k === 'w'), ...list.filter((i) => i.k === 'p')];
}

/** Course order, with each skill's words before its phrases (teach words first), each item once. */
export function orderedItems(index: CourseIndex): IndexItem[] {
	const bySkill = new Map<string, IndexItem[]>();
	for (const it of index.items) {
		if (!bySkill.has(it.s)) bySkill.set(it.s, []);
		bySkill.get(it.s)!.push(it);
	}
	const out: IndexItem[] = [];
	const seen = new Set<string>();
	for (const sk of index.skills) {
		const list = (bySkill.get(sk.slug) ?? []).filter((i) => !seen.has(i.id) && seen.add(i.id));
		out.push(...list.filter((i) => i.k === 'w'), ...list.filter((i) => i.k === 'p'));
	}
	return out;
}

export type SkillStatus = 'new' | 'learning' | 'learned' | 'mastered';

export type SkillProgress = {
	slug: string;
	title: string;
	module: number;
	total: number;
	seen: number;
	mastered: number;
	due: number;
	status: SkillStatus;
};

export function skillProgress(
	index: CourseIndex,
	items: Record<string, ItemState>,
	today: number
): SkillProgress[] {
	const counts = new Map<string, { total: number; seen: number; mastered: number; due: number }>();
	for (const sk of index.skills) counts.set(sk.slug, { total: 0, seen: 0, mastered: 0, due: 0 });
	const once = new Set<string>();
	for (const it of index.items) {
		const c = counts.get(it.s);
		if (!c || once.has(`${it.s}/${it.id}`)) continue;
		once.add(`${it.s}/${it.id}`);
		c.total++;
		const st = items[it.id];
		if (!st) continue;
		c.seen++;
		if (st.box >= MASTERED_BOX) c.mastered++;
		if (isDue(st, today)) c.due++;
	}
	return index.skills.map((sk) => {
		const c = counts.get(sk.slug)!;
		const status: SkillStatus =
			c.seen === 0
				? 'new'
				: c.seen < c.total
					? 'learning'
					: c.mastered === c.total
						? 'mastered'
						: 'learned';
		return { slug: sk.slug, title: sk.title, module: sk.module, ...c, status };
	});
}

/** First skill in course order that still has unseen items. */
export const nextSkill = (sp: SkillProgress[]): SkillProgress | undefined =>
	sp.find((s) => s.seen < s.total);

export function streak(days: Record<string, DayStats>, today: number): number {
	let d = days[today]?.ex ? today : today - 1;
	let n = 0;
	while (days[d]?.ex) {
		n++;
		d--;
	}
	return n;
}

export type Today = {
	due: number;
	done: number;
	target: number;
	newToday: number;
	newLeft: number;
	paused: boolean;
	weak: number;
	streak: number;
	next?: SkillProgress;
};

export function today(
	index: CourseIndex,
	items: Record<string, ItemState>,
	days: Record<string, DayStats>,
	profile: Profile,
	day: number
): Today {
	const ids = known(index);
	let due = 0;
	let weak = 0;
	for (const [id, st] of Object.entries(items)) {
		if (!ids.has(id)) continue;
		if (isDue(st, day)) due++;
		if (isWeak(st)) weak++;
	}
	const stats = days[day] ?? { ex: 0, ok: 0, new: 0 };
	const paused = backlogPaused(due, profile);
	return {
		due,
		done: stats.ex,
		target: dailyTarget(profile),
		newToday: stats.new,
		newLeft: paused ? 0 : Math.max(newPerDay(profile) - stats.new, 0),
		paused,
		weak,
		streak: streak(days, day),
		next: nextSkill(skillProgress(index, items, day))
	};
}

export type PlanDay = {
	day: number;
	reviews: number;
	learn: { title: string; n: number }[];
	paused: boolean;
};

/**
 * The next 7 days if the learner keeps to the plan: every review answered
 * right (so each moves up a box), and the day's new items taken in course
 * order. An estimate, and the dashboard says so.
 */
export function projectWeek(
	index: CourseIndex,
	items: Record<string, ItemState>,
	profile: Profile,
	day: number,
	newAlreadyToday = 0
): PlanDay[] {
	const sim = new Map<string, { box: number; due: number }>();
	for (const [id, st] of Object.entries(items)) if (known(index).has(id)) sim.set(id, { box: st.box, due: st.due });
	const unseen = orderedItems(index).filter((i) => !items[i.id]);
	const title = new Map(index.skills.map((s) => [s.slug, s.title]));
	const out: PlanDay[] = [];
	for (let d = 0; d < 7; d++) {
		const date = day + d;
		let reviews = 0;
		for (const st of sim.values()) {
			if (st.due <= date) {
				reviews++;
				st.box = Math.min(st.box + 1, MAX_BOX);
				st.due = date + INTERVALS[st.box];
			}
		}
		const paused = backlogPaused(reviews, profile);
		const n = paused ? 0 : Math.max(newPerDay(profile) - (d === 0 ? newAlreadyToday : 0), 0);
		const batch = unseen.splice(0, n);
		const learn: { title: string; n: number }[] = [];
		for (const it of batch) {
			const t = title.get(it.s) ?? it.s;
			const last = learn[learn.length - 1];
			if (last?.title === t) last.n++;
			else learn.push({ title: t, n: 1 });
			sim.set(it.id, { box: 1, due: date + INTERVALS[1] });
		}
		out.push({ day: date, reviews, learn, paused });
	}
	return out;
}

/** Day the last new item would be learned at this pace (ignoring pauses). */
export function finishDay(
	index: CourseIndex,
	items: Record<string, ItemState>,
	profile: Profile,
	day: number
): number | null {
	const left = uniqueItems(index).filter((i) => !items[i.id]).length;
	if (left === 0) return null;
	return day + Math.ceil(left / newPerDay(profile)) - 1;
}
