import { describe, expect, it } from 'vitest';
import { grade, newState, INTERVALS, isWeak, MAX_BOX } from './srs';

describe('srs', () => {
	const t = 1000;
	it('a new item is due the day it is learned', () => {
		expect(newState('animals', t)).toMatchObject({ box: 0, due: t, level: -1 });
	});
	it('right moves up one box and schedules by that box', () => {
		let s = newState('a', t);
		s = grade(s, 'right', t, 0);
		expect(s).toMatchObject({ box: 1, due: t + 1, right: 1, level: 0 });
		s = grade(s, 'right', t + 1, 2);
		expect(s).toMatchObject({ box: 2, due: t + 1 + INTERVALS[2], level: 2 });
	});
	it('level never goes down', () => {
		let s = grade(newState('a', t), 'right', t, 2);
		s = grade(s, 'right', t + 1, 0);
		expect(s.level).toBe(2);
	});
	it('wrong drops two boxes and counts a lapse only once learned', () => {
		let s = { ...newState('a', t), box: 1 };
		s = grade(s, 'wrong', t);
		expect(s).toMatchObject({ box: 0, lapses: 0, due: t, wrong: 1 });
		s = { ...s, box: 4 };
		s = grade(s, 'wrong', t);
		expect(s).toMatchObject({ box: 2, lapses: 1, due: t + INTERVALS[2] });
	});
	it('hinted keeps the box', () => {
		const s = grade({ ...newState('a', t), box: 3 }, 'hinted', t);
		expect(s).toMatchObject({ box: 3, due: t + INTERVALS[3] });
	});
	it('box is capped', () => {
		const s = grade({ ...newState('a', t), box: MAX_BOX }, 'right', t);
		expect(s.box).toBe(MAX_BOX);
	});
	it('weak rules', () => {
		expect(isWeak({ ...newState('a', t), lapses: 1 })).toBe(true);
		expect(isWeak({ ...newState('a', t), right: 3, wrong: 2 })).toBe(true);
		expect(isWeak({ ...newState('a', t), right: 4, wrong: 1 })).toBe(false);
		expect(isWeak({ ...newState('a', t), right: 0, wrong: 1 })).toBe(false);
	});
});
