// slippylabs: the spaced-repetition scheduler. Leitner boxes on purpose: the
// rule fits in one sentence ("right moves a word up a box, wrong drops it two"),
// so the app can explain to the learner why a word came back.
import type { ExType, ItemState } from './types';

/** Days until the next review for each box. Box 0 = due again today. */
export const INTERVALS = [0, 1, 3, 7, 16, 35, 90] as const;
export const MAX_BOX = INTERVALS.length - 1;
export const MASTERED_BOX = 4;

/** Exercise tiers: 0 recognise, 1 read (translate to your language), 2 produce or hear. */
export const TIER: Record<ExType, number> = {
	cards: 0,
	options: 0,
	chipsSrc: 1,
	short: 2,
	chipsTgt: 2,
	listen: 2
};

export type Outcome = 'right' | 'hinted' | 'wrong';

export const newState = (skill: string, today: number): ItemState => ({
	s: skill,
	box: 0,
	due: today,
	seen: today,
	last: today,
	right: 0,
	wrong: 0,
	lapses: 0,
	level: -1
});

/**
 * Grade one item once per session. `hardestPassed` is the highest tier the
 * learner answered right for it in that session (-1 if none).
 *  - right: up one box
 *  - hinted (peeked at a hint): stays in its box, reviewed again after that box's interval
 *  - wrong: down two boxes, and a lapse if it had been learned (box >= 2)
 */
export function grade(
	state: ItemState,
	outcome: Outcome,
	today: number,
	hardestPassed = -1
): ItemState {
	const s = { ...state };
	if (outcome === 'right') {
		s.box = Math.min(s.box + 1, MAX_BOX);
		s.right++;
	} else if (outcome === 'hinted') {
		s.box = Math.max(s.box, 0);
		s.right++;
	} else {
		if (s.box >= 2) s.lapses++;
		s.box = Math.max(s.box - 2, 0);
		s.wrong++;
	}
	s.level = Math.max(s.level, hardestPassed);
	s.due = today + INTERVALS[s.box];
	s.last = today;
	return s;
}

export const isDue = (s: ItemState, today: number): boolean => s.due <= today;

/** 0..1 for the strength bar: how far up the boxes it is. */
export const strength = (s: ItemState | undefined): number =>
	s ? Math.min(s.box / MASTERED_BOX, 1) : 0;

/** Weak = forgotten after being learned, or wrong 40% of the time or more. */
export const isWeak = (s: ItemState): boolean => {
	const tries = s.right + s.wrong;
	return s.lapses >= 1 || (tries >= 3 && s.wrong / tries >= 0.4);
};

export const weakness = (s: ItemState): number => {
	const tries = s.right + s.wrong || 1;
	return s.lapses * 2 + s.wrong / tries;
};
