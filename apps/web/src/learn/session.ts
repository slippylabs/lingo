// slippylabs: builds the step list for a lesson, a review or a weak-spot
// session, and runs it (grading each item once). Pure TS, so the rules the
// learner relies on are unit-tested:
//  - nothing is tested before it has been taught
//  - an item comes back at most twice after a mistake
//  - the exercise mix follows the learner's goal; no listening without audio
import { TIER, isDue, isWeak, weakness, type Outcome } from './srs';
import { skillItems, newPerLesson } from './plan';
import type {
	Challenge,
	CourseIndex,
	ExType,
	Goal,
	IndexItem,
	ItemState,
	LogEntry,
	PhraseWord,
	Profile
} from './types';

export type Role = 'new' | 'review' | 'retry';

export type Step =
	| { kind: 'notes'; skill: string }
	| { kind: 'teach'; item: IndexItem; example?: IndexItem; gloss?: PhraseWord[] }
	| { kind: 'mistakes' }
	| { kind: 'ex'; item: IndexItem; ch: Challenge; x: ExType; role: Role };

export const exType = (c: Challenge): ExType =>
	c.type === 'cards'
		? 'cards'
		: c.type === 'options'
			? 'options'
			: c.type === 'shortInput'
				? 'short'
				: c.type === 'listeningExercise'
					? 'listen'
					: c.translatesToSourceLanguage
						? 'chipsSrc'
						: 'chipsTgt';

export const EX_LABEL: Record<ExType, string> = {
	cards: 'Pick the picture',
	options: 'Pick the translation',
	chipsSrc: 'Translate into English',
	chipsTgt: 'Build the sentence',
	short: 'Type the word',
	listen: 'Type what you hear'
};

/** How much each goal wants each exercise kind (0 = never). */
export const GOAL_WEIGHTS: Record<Goal, Record<ExType, number>> = {
	general: { cards: 1, options: 1, chipsSrc: 1, chipsTgt: 1, short: 1, listen: 1 },
	travel: { cards: 1, options: 1.5, chipsSrc: 1, chipsTgt: 1, short: 1, listen: 2 },
	conversation: { cards: 1, options: 1, chipsSrc: 0.5, chipsTgt: 2, short: 1.5, listen: 2 },
	reading: { cards: 1, options: 1.5, chipsSrc: 2, chipsTgt: 0.7, short: 0.7, listen: 0.5 }
};

export type Rng = () => number;

export function shuffle<T>(a: T[], rng: Rng = Math.random): T[] {
	const r = [...a];
	for (let i = r.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[r[i], r[j]] = [r[j], r[i]];
	}
	return r;
}

function weighted<T>(list: T[], w: (t: T) => number, rng: Rng): T | undefined {
	const total = list.reduce((s, t) => s + w(t), 0);
	if (total <= 0) return undefined;
	let r = rng() * total;
	for (const t of list) {
		r -= w(t);
		if (r < 0) return t;
	}
	return list[list.length - 1];
}

export type Ctx = {
	index: CourseIndex;
	items: Record<string, ItemState>;
	profile: Profile;
	today: number;
	/** challenges of every loaded skill, by skill slug */
	challenges: Map<string, Challenge[]>;
	/** the course has audio and the learner hasn't turned listening off */
	audio: boolean;
	rng?: Rng;
};

const groupOf = (ctx: Ctx, item: IndexItem): Challenge[] =>
	(ctx.challenges.get(item.s) ?? []).filter((c) => c.group === item.id);

const usable = (ctx: Ctx, cs: Challenge[]) =>
	cs.filter((c) => (exType(c) === 'listen' ? ctx.audio : true));

const weightOf = (ctx: Ctx) => (c: Challenge) => GOAL_WEIGHTS[ctx.profile.goal][exType(c)] || 0;

export function recognition(ctx: Ctx, item: IndexItem): Challenge | undefined {
	const cs = groupOf(ctx, item);
	return cs.find((c) => c.type === 'cards') ?? cs.find((c) => c.type === 'options');
}

/** A recall exercise (tier >= minTier), picked by the goal's weights. */
export function recall(ctx: Ctx, item: IndexItem, minTier = 1): Challenge | undefined {
	const cs = usable(ctx, groupOf(ctx, item)).filter((c) => TIER[exType(c)] >= minTier);
	return weighted(cs, weightOf(ctx), ctx.rng ?? Math.random) ?? cs[0];
}

/**
 * For a review: one step harder than the hardest kind already passed, so a
 * word you could only recognise comes back as something to type or hear.
 */
export function reviewExercise(ctx: Ctx, item: IndexItem): Challenge | undefined {
	const st = ctx.items[item.id];
	const target = Math.min((st?.level ?? -1) + 1, 2);
	const cs = usable(ctx, groupOf(ctx, item));
	const harder = cs.filter((c) => TIER[exType(c)] >= target);
	if (harder.length) return weighted(harder, weightOf(ctx), ctx.rng ?? Math.random) ?? harder[0];
	return cs.sort((a, b) => TIER[exType(b)] - TIER[exType(a)])[0];
}

const exStep = (item: IndexItem, ch: Challenge, role: Role): Step => ({
	kind: 'ex',
	item,
	ch,
	x: exType(ch),
	role
});

/** Due items, most overdue first, then the least known. */
export function dueItems(ctx: Pick<Ctx, 'index' | 'items' | 'today'>, limit = Infinity): IndexItem[] {
	const byId = new Map(ctx.index.items.map((i) => [i.id, i]));
	return Object.entries(ctx.items)
		.filter(([id, st]) => byId.has(id) && isDue(st, ctx.today))
		.sort(([, a], [, b]) => a.due - b.due || a.box - b.box)
		.slice(0, limit)
		.map(([id]) => byId.get(id)!);
}

export function weakItems(ctx: Pick<Ctx, 'index' | 'items'>, limit = 12): IndexItem[] {
	const byId = new Map(ctx.index.items.map((i) => [i.id, i]));
	return Object.entries(ctx.items)
		.filter(([id, st]) => byId.has(id) && isWeak(st))
		.sort(([, a], [, b]) => weakness(b) - weakness(a))
		.slice(0, limit)
		.map(([id]) => byId.get(id)!);
}

/** An example phrase from the same skill that uses this word. */
export function exampleFor(index: CourseIndex, item: IndexItem): IndexItem | undefined {
	if (item.k !== 'w') return undefined;
	const words = item.t.toLowerCase().split(/\s+/);
	const head = words[words.length - 1]; // "el gato" -> "gato"
	const re = new RegExp(`(^|[^\\p{L}])${head.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'iu');
	return index.items.find((i) => i.s === item.s && i.k === 'p' && re.test(i.t));
}

const glossFor = (ctx: Ctx, item: IndexItem): PhraseWord[] | undefined =>
	groupOf(ctx, item).find((c) => c.type === 'chips' && c.translatesToSourceLanguage)?.phrase;

/**
 * A lesson on one skill:
 *   notes (first visit) -> for each pair of new items: teach, teach, recognise,
 *   recognise -> a recall exercise for each new item, with up to 4 due reviews
 *   from other skills mixed in.
 * A skill with nothing new left becomes a practice round of its weakest items.
 */
export function buildLesson(ctx: Ctx, skill: string, reviews: IndexItem[] = []): Step[] {
	const rng = ctx.rng ?? Math.random;
	const steps: Step[] = [];
	const sk = ctx.index.skills.find((s) => s.slug === skill);
	if (sk?.intro && !ctx.profile.seenNotes.includes(skill)) steps.push({ kind: 'notes', skill });

	const all = skillItems(ctx.index, skill);
	const fresh = all.filter((i) => !ctx.items[i.id]).slice(0, newPerLesson(ctx.profile));
	if (fresh.length === 0) return [...steps, ...buildPractice(ctx, all)];

	for (let i = 0; i < fresh.length; i += 2) {
		const pair = fresh.slice(i, i + 2);
		for (const it of pair)
			steps.push({ kind: 'teach', item: it, example: exampleFor(ctx.index, it), gloss: glossFor(ctx, it) });
		for (const it of pair) {
			const ch = recognition(ctx, it) ?? recall(ctx, it, 0);
			if (ch) steps.push(exStep(it, ch, 'new'));
		}
	}

	const recalls = shuffle(fresh, rng)
		.map((it) => {
			const ch = recall(ctx, it);
			return ch ? exStep(it, ch, 'new') : null;
		})
		.filter((s): s is Step => s !== null);
	const revs = reviews
		.filter((r) => r.s !== skill || !fresh.includes(r))
		.slice(0, 4)
		.map((it) => {
			const ch = reviewExercise(ctx, it);
			return ch ? exStep(it, ch, 'review') : null;
		})
		.filter((s): s is Step => s !== null);
	// spread the reviews through the recall round
	const mixed: Step[] = [];
	const gap = Math.max(1, Math.ceil(recalls.length / (revs.length + 1)));
	recalls.forEach((s, i) => {
		mixed.push(s);
		if ((i + 1) % gap === 0 && revs.length) mixed.push(revs.shift()!);
	});
	mixed.push(...revs);
	return [...steps, ...mixed];
}

/** Practice a fully-seen skill: its 8 least-known items, one exercise each. */
export function buildPractice(ctx: Ctx, skillItems: IndexItem[]): Step[] {
	const rng = ctx.rng ?? Math.random;
	const ranked = [...skillItems].sort(
		(a, b) =>
			(ctx.items[a.id]?.box ?? 0) - (ctx.items[b.id]?.box ?? 0) ||
			(ctx.items[a.id]?.due ?? 0) - (ctx.items[b.id]?.due ?? 0)
	);
	return shuffle(ranked.slice(0, 8), rng)
		.map((it) => {
			const ch = reviewExercise(ctx, it);
			return ch ? exStep(it, ch, 'review') : null;
		})
		.filter((s): s is Step => s !== null);
}

export function buildReview(ctx: Ctx, items: IndexItem[]): Step[] {
	return shuffle(items, ctx.rng ?? Math.random)
		.map((it) => {
			const ch = reviewExercise(ctx, it);
			return ch ? exStep(it, ch, 'review') : null;
		})
		.filter((s): s is Step => s !== null);
}

/** Weak spots: each item gets the kind of exercise this learner fails on most. */
export function buildWeak(ctx: Ctx, items: IndexItem[], log: LogEntry[]): Step[] {
	const fails = new Map<string, Map<ExType, number>>();
	const kindFails = new Map<ExType, number>();
	for (const e of log)
		if (!e.ok) {
			if (!fails.has(e.i)) fails.set(e.i, new Map());
			const m = fails.get(e.i)!;
			m.set(e.x, (m.get(e.x) ?? 0) + 1);
			kindFails.set(e.x, (kindFails.get(e.x) ?? 0) + 1);
		}
	return shuffle(items, ctx.rng ?? Math.random)
		.map((it) => {
			const cs = usable(ctx, groupOf(ctx, it)).filter((c) => TIER[exType(c)] >= 1);
			const mine = fails.get(it.id);
			const score = (c: Challenge) =>
				(mine?.get(exType(c)) ?? 0) * 10 + (kindFails.get(exType(c)) ?? 0);
			const ch = cs.sort((a, b) => score(b) - score(a))[0] ?? reviewExercise(ctx, it);
			return ch ? exStep(it, ch, 'review') : null;
		})
		.filter((s): s is Step => s !== null);
}

export const MAX_RETRIES = 2;

export type Graded = { id: string; outcome: Outcome; tier: number; skill: string };

/**
 * Runs a step list. Each item is graded exactly once: wrong as soon as it is
 * first missed; right (or hinted) once all its exercises are answered. A
 * missed exercise is queued again after the main round ("Fix your
 * mistakes"), at most MAX_RETRIES times per item.
 */
export class SessionRun {
	steps: Step[];
	pos = 0;
	correct = 0;
	wrong = 0;
	graded: Graded[] = [];
	mistakes: { item: IndexItem; x: ExType }[] = [];
	private left = new Map<string, number>();
	private passed = new Map<string, number>();
	private hinted = new Set<string>();
	private done = new Set<string>();
	private retries = new Map<string, number>();
	private mistakesHeader = false;

	constructor(steps: Step[]) {
		this.steps = [...steps];
		for (const s of steps)
			if (s.kind === 'ex') this.left.set(s.item.id, (this.left.get(s.item.id) ?? 0) + 1);
	}

	get current(): Step | undefined {
		return this.steps[this.pos];
	}
	get finished(): boolean {
		return this.pos >= this.steps.length;
	}
	/** progress 0..1 over the exercises (teach/notes cards count too) */
	get progress(): number {
		return this.steps.length ? this.pos / this.steps.length : 1;
	}

	/** Record the answer to the current exercise; returns the grade if this settled the item. */
	answer(ok: boolean, opts: { hinted?: boolean } = {}): Graded | null {
		const s = this.current;
		if (!s || s.kind !== 'ex') return null;
		const id = s.item.id;
		if (ok) this.correct++;
		else this.wrong++;
		if (opts.hinted) this.hinted.add(id);
		if (!ok) {
			if (!this.mistakes.some((m) => m.item.id === id)) this.mistakes.push({ item: s.item, x: s.x });
			const n = this.retries.get(id) ?? 0;
			if (n < MAX_RETRIES) {
				this.retries.set(id, n + 1);
				if (!this.mistakesHeader) {
					this.steps.push({ kind: 'mistakes' });
					this.mistakesHeader = true;
				}
				this.steps.push({ ...s, role: 'retry' });
			}
		}
		if (this.done.has(id) || s.role === 'retry') return null;
		if (!ok) return this.settle(s.item, 'wrong');
		this.passed.set(id, Math.max(this.passed.get(id) ?? -1, TIER[s.x]));
		const left = (this.left.get(id) ?? 1) - 1;
		this.left.set(id, left);
		if (left > 0) return null;
		return this.settle(s.item, this.hinted.has(id) ? 'hinted' : 'right');
	}

	private settle(item: IndexItem, outcome: Outcome): Graded {
		this.done.add(item.id);
		const g = { id: item.id, outcome, tier: this.passed.get(item.id) ?? -1, skill: item.s };
		this.graded.push(g);
		return g;
	}

	next() {
		this.pos++;
	}

	/** Leave early: drop what's left (ungraded items keep their old state). */
	stop() {
		this.steps = this.steps.slice(0, this.pos);
	}
}
