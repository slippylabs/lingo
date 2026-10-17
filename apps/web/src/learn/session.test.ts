import { describe, expect, it } from 'vitest';
import animals from './fixtures/es-animals.json';
import food from './fixtures/es-food.json';
import idx from './fixtures/es-index.json';
import {
	SessionRun,
	buildLesson,
	buildReview,
	buildWeak,
	dueItems,
	exampleFor,
	type Ctx,
	type Step
} from './session';
import { newState, grade } from './srs';
import type { Challenge, CourseIndex, ItemState, Profile } from './types';

const index = idx as CourseIndex;
const D = 20000;
const profile: Profile = { goal: 'general', minutes: 10, created: D, seenNotes: [] };
let seed = 1;
const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const ctx = (over: Partial<Ctx> = {}): Ctx => ({
	index,
	items: {},
	profile,
	today: D,
	challenges: new Map([
		['animals', animals.challenges as Challenge[]],
		['food', food.challenges as Challenge[]]
	]),
	audio: true,
	rng,
	...over
});
const exs = (steps: Step[]) => steps.filter((s) => s.kind === 'ex') as Extract<Step, { kind: 'ex' }>[];

describe('buildLesson', () => {
	it('shows the notes first on the first visit only', () => {
		expect(buildLesson(ctx(), 'animals')[0].kind).toBe('notes');
		const seen = ctx({ profile: { ...profile, seenNotes: ['animals'] } });
		expect(buildLesson(seen, 'animals')[0].kind).toBe('teach');
	});
	it('never tests an item before teaching it', () => {
		for (let k = 0; k < 30; k++) {
			const taught = new Set<string>();
			for (const s of buildLesson(ctx(), 'animals')) {
				if (s.kind === 'teach') taught.add(s.item.id);
				if (s.kind === 'ex' && s.role === 'new') expect(taught.has(s.item.id)).toBe(true);
			}
		}
	});
	it('teaches words before phrases, 4 new at 10 min/day, recognition before recall', () => {
		const steps = buildLesson(ctx({ profile: { ...profile, seenNotes: ['animals'] } }), 'animals');
		const teach = steps.filter((s) => s.kind === 'teach');
		expect(teach).toHaveLength(4);
		expect(teach.every((s) => s.kind === 'teach' && s.item.k === 'w')).toBe(true);
		for (const t of teach) {
			const mine = exs(steps).filter((e) => e.item.id === (t as { item: { id: string } }).item.id);
			expect(mine[0].x).toBe('cards');
			expect(['short', 'listen']).toContain(mine[1].x);
		}
	});
	it('mixes in at most 4 reviews from other skills', () => {
		const items: Record<string, ItemState> = {};
		for (const it of index.items.filter((i) => i.s === 'food')) items[it.id] = newState('food', D - 1);
		const c = ctx({ items });
		const revs = exs(buildLesson(c, 'animals', dueItems(c))).filter((e) => e.role === 'review');
		expect(revs).toHaveLength(4);
		expect(revs.every((r) => r.item.s === 'food')).toBe(true);
	});
	it('a fully learned skill becomes practice', () => {
		const items: Record<string, ItemState> = {};
		for (const it of index.items.filter((i) => i.s === 'animals')) items[it.id] = newState('animals', D);
		const steps = buildLesson(ctx({ items, profile: { ...profile, seenNotes: ['animals'] } }), 'animals');
		expect(steps.every((s) => s.kind === 'ex' && s.role === 'review')).toBe(true);
		expect(steps.length).toBe(8);
	});
	it('no listening when audio is off', () => {
		for (let k = 0; k < 20; k++) {
			const steps = buildLesson(ctx({ audio: false }), 'animals');
			expect(exs(steps).some((e) => e.x === 'listen')).toBe(false);
		}
	});
	it('goal weights shift the mix', () => {
		const count = (goal: Profile['goal']) => {
			let listen = 0;
			for (let k = 0; k < 200; k++)
				listen += exs(buildLesson(ctx({ profile: { ...profile, goal } }), 'animals')).filter(
					(e) => e.x === 'listen'
				).length;
			return listen;
		};
		expect(count('conversation')).toBeGreaterThan(count('reading') * 1.2);
	});
});

describe('reviews', () => {
	it('a review asks one step harder than the hardest kind passed', () => {
		const word = index.items.find((i) => i.s === 'animals' && i.k === 'w')!;
		const items = { [word.id]: { ...newState('animals', D - 1), level: 0 } };
		for (let k = 0; k < 20; k++) {
			const [s] = exs(buildReview(ctx({ items }), [word]));
			expect(['short', 'listen']).toContain(s.x);
		}
	});
	it('due items: most overdue first', () => {
		const [a, b] = index.items;
		const items = { [a.id]: { ...newState('animals', D), due: D }, [b.id]: { ...newState('animals', D), due: D - 3 } };
		expect(dueItems(ctx({ items })).map((i) => i.id)).toEqual([b.id, a.id]);
	});
	it('weak spots use the kind of exercise the learner fails', () => {
		const word = index.items.find((i) => i.s === 'animals' && i.k === 'w')!;
		const items = { [word.id]: { ...newState('animals', D), lapses: 1, level: 2 } };
		const log = [
			{ d: D, i: word.id, x: 'listen' as const, ok: 0 as const },
			{ d: D, i: word.id, x: 'listen' as const, ok: 0 as const }
		];
		expect(exs(buildWeak(ctx({ items }), [word], log))[0].x).toBe('listen');
	});
});

describe('SessionRun', () => {
	const lesson = () => buildLesson(ctx({ profile: { ...profile, seenNotes: ['animals'] } }), 'animals');
	it('grades each item once, after all its exercises', () => {
		const run = new SessionRun(lesson());
		while (!run.finished) {
			if (run.current!.kind === 'ex') run.answer(true);
			run.next();
		}
		expect(run.graded).toHaveLength(4);
		expect(run.graded.every((g) => g.outcome === 'right' && g.tier === 2)).toBe(true);
	});
	it('a miss grades wrong at once and retries at most twice', () => {
		const run = new SessionRun(lesson());
		const target = (run.steps.find((s) => s.kind === 'ex') as { item: { id: string } }).item.id;
		let retries = 0;
		let sawHeader = false;
		while (!run.finished) {
			const s = run.current!;
			if (s.kind === 'mistakes') sawHeader = true;
			if (s.kind === 'ex') {
				if (s.role === 'retry') {
					retries++;
					expect(sawHeader).toBe(true);
				}
				run.answer(s.item.id !== target);
			}
			run.next();
		}
		expect(retries).toBe(2);
		expect(run.graded.find((g) => g.id === target)?.outcome).toBe('wrong');
		expect(run.graded.filter((g) => g.id === target)).toHaveLength(1);
		expect(run.mistakes).toHaveLength(1);
	});
	it('a hint makes it hinted, not right', () => {
		const run = new SessionRun(lesson());
		let first = true;
		while (!run.finished) {
			if (run.current!.kind === 'ex') {
				run.answer(true, { hinted: first });
				first = false;
			}
			run.next();
		}
		expect(run.graded.filter((g) => g.outcome === 'hinted')).toHaveLength(1);
	});
	it('graded states feed the scheduler', () => {
		const s = grade(newState('animals', D), 'right', D, 2);
		expect(s).toMatchObject({ box: 1, due: D + 1, level: 2 });
	});
});

describe('exampleFor', () => {
	it('finds a phrase using the word', () => {
		const perro = index.items.find((i) => i.t === 'perro')!;
		expect(exampleFor(index, perro)?.t).toMatch(/perro/i);
	});
});
