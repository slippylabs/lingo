// slippylabs: the placement check. Walks the modules in order asking two
// questions per skill (typing where the skill has words, otherwise picking a
// translation). A module answered 80%+ right is marked known; the check stops
// at the first module under 60%, or after MAX_QUESTIONS.
import { shuffle, type Rng } from './session';
import type { Challenge, CourseIndex, IndexItem, ItemState } from './types';

export const MAX_QUESTIONS = 30;
export const PER_MODULE = 8;
export const PASS = 0.8;
export const STOP = 0.6;

export type PlacementQ = { item: IndexItem; ch: Challenge; module: number };

export function moduleQuestions(
	index: CourseIndex,
	module: number,
	challenges: Map<string, Challenge[]>,
	rng: Rng = Math.random
): PlacementQ[] {
	const skills = index.skills.filter((s) => s.module === module);
	const out: PlacementQ[] = [];
	for (const sk of skills) {
		const cs = challenges.get(sk.slug) ?? [];
		const items = shuffle(index.items.filter((i) => i.s === sk.slug), rng);
		const words = items.filter((i) => i.k === 'w');
		const pick = (words.length >= 2 ? words : items).slice(0, 2);
		for (const it of pick) {
			const mine = cs.filter((c) => c.group === it.id);
			const ch =
				mine.find((c) => c.type === 'shortInput') ??
				mine.find((c) => c.type === 'chips' && !c.translatesToSourceLanguage) ??
				mine.find((c) => c.type === 'options');
			if (ch) out.push({ item: it, ch, module });
		}
	}
	// a long module is sampled down, keeping skills spread out
	return shuffle(out, rng).slice(0, PER_MODULE);
}

export type ModuleResult = { module: number; asked: number; right: number };

export type Verdict = 'known' | 'continue' | 'stop';

export const judgeModule = (r: ModuleResult): Verdict =>
	r.asked === 0 ? 'continue' : r.right / r.asked >= PASS ? 'known' : r.right / r.asked < STOP ? 'stop' : 'continue';

/** Mark every item of a known module as learned (box 3), reviews spread over a week. */
export function markModuleKnown(
	index: CourseIndex,
	module: number,
	items: Record<string, ItemState>,
	today: number
): number {
	const skills = new Set(index.skills.filter((s) => s.module === module).map((s) => s.slug));
	let n = 0;
	index.items
		.filter((i) => skills.has(i.s))
		.forEach((it, k) => {
			if (items[it.id]) return;
			items[it.id] = {
				s: it.s,
				box: 3,
				due: today + 1 + (k % 7),
				seen: today,
				last: today,
				right: 1,
				wrong: 0,
				lapses: 0,
				level: 1
			};
			n++;
		});
	return n;
}
