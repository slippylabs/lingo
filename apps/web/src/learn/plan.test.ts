import { describe, expect, it } from 'vitest';
import {
	dailyTarget,
	finishDay,
	newPerDay,
	orderedItems,
	projectWeek,
	skillProgress,
	streak,
	today
} from './plan';
import { newState } from './srs';
import type { CourseIndex, ItemState, Profile } from './types';

const index: CourseIndex = {
	modules: ['Basics'],
	skills: [
		{ slug: 'a', title: 'Animals', module: 0, items: 4, intro: false },
		{ slug: 'b', title: 'Food', module: 0, items: 20, intro: false }
	],
	items: [
		{ id: 'p1', s: 'a', k: 'p', t: 'Es un gato', m: "It's a cat" },
		{ id: 'w1', s: 'a', k: 'w', t: 'gato', m: 'cat' },
		{ id: 'w2', s: 'a', k: 'w', t: 'perro', m: 'dog' },
		{ id: 'p2', s: 'a', k: 'p', t: 'Un perro', m: 'A dog' },
		...Array.from({ length: 20 }, (_, i) => ({
			id: `f${i}`,
			s: 'b',
			k: 'w' as const,
			t: `f${i}`,
			m: `f${i}`
		}))
	],
	dict: {}
};
const prof: Profile = { goal: 'general', minutes: 5, created: 0, seenNotes: [] };
const D = 20000;

describe('plan', () => {
	it('targets scale with minutes', () => {
		expect(dailyTarget({ minutes: 5 })).toBe(15);
		expect(dailyTarget({ minutes: 20 })).toBe(60);
		expect(newPerDay({ minutes: 10 })).toBe(7);
	});
	it('teaches words before phrases within a skill', () => {
		expect(orderedItems(index).slice(0, 4).map((i) => i.id)).toEqual(['w1', 'w2', 'p1', 'p2']);
	});
	it('skill statuses', () => {
		const items: Record<string, ItemState> = {};
		expect(skillProgress(index, items, D)[0].status).toBe('new');
		items.w1 = { ...newState('a', D), box: 1, due: D + 1 };
		expect(skillProgress(index, items, D)[0]).toMatchObject({ status: 'learning', seen: 1, due: 0 });
		for (const id of ['w2', 'p1', 'p2']) items[id] = { ...newState('a', D), box: 4, due: D + 9 };
		expect(skillProgress(index, items, D)[0].status).toBe('learned');
		items.w1.box = 4;
		expect(skillProgress(index, items, D)[0].status).toBe('mastered');
	});
	it('streak counts back from today or yesterday', () => {
		const days = { [D]: { ex: 3, ok: 3, new: 0 }, [D - 1]: { ex: 1, ok: 1, new: 0 } };
		expect(streak(days, D)).toBe(2);
		expect(streak(days, D + 1)).toBe(2);
		expect(streak(days, D + 2)).toBe(0);
	});
	it('today: due, new left, next skill, backlog pause', () => {
		const items: Record<string, ItemState> = { w1: newState('a', D) };
		const t = today(index, items, { [D]: { ex: 5, ok: 4, new: 1 } }, prof, D);
		expect(t).toMatchObject({ due: 1, done: 5, target: 15, newLeft: 3, paused: false });
		expect(t.next?.slug).toBe('a');
		const many: Record<string, ItemState> = {};
		for (let i = 0; i < 20; i++) many[`f${i}`] = newState('b', D);
		for (const id of ['w1', 'w2', 'p1', 'p2']) many[id] = newState('a', D);
		// 24 due is under 3 days' worth (45) at 5 minutes a day
		expect(today(index, many, {}, prof, D)).toMatchObject({ due: 24, paused: false });
	});
	it('backlog pauses new items', () => {
		const big: CourseIndex = {
			...index,
			items: Array.from({ length: 60 }, (_, i) => ({ id: `x${i}`, s: 'b', k: 'w', t: 'x', m: 'x' }))
		};
		const items: Record<string, ItemState> = {};
		for (let i = 0; i < 50; i++) items[`x${i}`] = newState('b', D);
		const t = today(big, items, {}, prof, D);
		expect(t.paused).toBe(true);
		expect(t.newLeft).toBe(0);
	});
	it('week projection takes new items in order and schedules them', () => {
		const week = projectWeek(index, {}, prof, D);
		expect(week).toHaveLength(7);
		expect(week[0]).toMatchObject({ reviews: 0, learn: [{ title: 'Animals', n: 4 }] });
		expect(week[1].reviews).toBe(4); // learned yesterday, box 1 => due next day
		expect(week[1].learn).toEqual([{ title: 'Food', n: 4 }]);
		expect(week[2].reviews).toBe(4); // day-1 items; day-0 items moved to box 2 (3 days)
	});
	it('a word shared by two lessons is one item, seen in both', () => {
		const dup: CourseIndex = {
			...index,
			items: [...index.items, { id: 'w1', s: 'b', k: 'w', t: 'gato', m: 'cat' }]
		};
		expect(orderedItems(dup).filter((i) => i.id === 'w1')).toHaveLength(1);
		const items = { w1: newState('a', D) };
		const sp = skillProgress(dup, items, D);
		expect(sp[0].seen).toBe(1);
		expect(sp[1]).toMatchObject({ seen: 1, total: 21 });
		expect(finishDay(dup, {}, prof, D)).toBe(D + 5);
	});
	it('finish day', () => {
		expect(finishDay(index, {}, prof, D)).toBe(D + 5); // 24 items / 4 a day = 6 days
	});
});
