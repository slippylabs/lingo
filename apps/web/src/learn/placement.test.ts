import { describe, expect, it } from 'vitest';
import animals from './fixtures/es-animals.json';
import food from './fixtures/es-food.json';
import idx from './fixtures/es-index.json';
import { judgeModule, markModuleKnown, moduleQuestions, PER_MODULE } from './placement';
import type { Challenge, CourseIndex, ItemState } from './types';

const index = idx as CourseIndex;
const ch = new Map([
	['animals', animals.challenges as Challenge[]],
	['food', food.challenges as Challenge[]]
]);

describe('placement', () => {
	it('asks typed questions, two per skill, capped per module', () => {
		const qs = moduleQuestions(index, 0, ch);
		expect(qs.length).toBe(4);
		expect(qs.every((q) => q.ch.type === 'shortInput')).toBe(true);
		expect(qs.length).toBeLessThanOrEqual(PER_MODULE);
	});
	it('judges modules', () => {
		expect(judgeModule({ module: 0, asked: 10, right: 8 })).toBe('known');
		expect(judgeModule({ module: 0, asked: 10, right: 7 })).toBe('continue');
		expect(judgeModule({ module: 0, asked: 10, right: 5 })).toBe('stop');
	});
	it('marks a known module learned and staggers its reviews', () => {
		const items: Record<string, ItemState> = {};
		const n = markModuleKnown(index, 0, items, 100);
		expect(n).toBe(index.items.length);
		const dues = new Set(Object.values(items).map((s) => s.due));
		expect(dues.size).toBe(7);
		expect(Math.min(...dues)).toBe(101);
		expect(Object.values(items).every((s) => s.box === 3)).toBe(true);
	});
});
