import { describe, expect, it } from 'vitest';
import { checkTyped, diffWords, checkChips } from './check';

describe('checkTyped', () => {
	it('exact ignores case, punctuation, spacing', () => {
		expect(checkTyped('  es un  CABALLO.', ['Es un caballo'])).toMatchObject({ ok: true, kind: 'exact' });
		expect(checkTyped('¿cuánto cuesta', ['¿Cuánto cuesta?'])).toMatchObject({ ok: true, kind: 'exact' });
	});
	it('accent-only differences pass with a nudge', () => {
		expect(checkTyped('leon', ['león'])).toMatchObject({ ok: true, kind: 'accent', expected: 'león' });
	});
	it('short words get no typo allowance', () => {
		expect(checkTyped('oro', ['oso']).ok).toBe(false);
		expect(checkTyped('en', ['un']).ok).toBe(false);
		expect(checkTyped('pato', ['gato']).ok).toBe(false);
	});
	it('long words allow one slip', () => {
		expect(checkTyped('caballoo', ['caballo'])).toMatchObject({ ok: true, kind: 'typo' });
		expect(checkTyped('cabbalo', ['caballo']).ok).toBe(false);
	});
	it('accepts any valid form and reports the closest when wrong', () => {
		expect(checkTyped('can', ['perro', 'can'])).toMatchObject({ ok: true, expected: 'can' });
		expect(checkTyped('perrro', ['perro', 'can'])).toMatchObject({ ok: true, kind: 'typo' });
		expect(checkTyped('pero', ['perro', 'can'], new Set(['pero']))).toMatchObject({
			ok: false,
			expected: 'perro'
		});
	});
	it('slash options and bracketed notes need not be typed', () => {
		expect(checkTyped('rynek', ['Plac/Rynek'])).toMatchObject({ ok: true, kind: 'exact', expected: 'Plac/Rynek' });
		expect(checkTyped('plac', ['Plac/Rynek']).ok).toBe(true);
		expect(checkTyped('plac/rynek', ['Plac/Rynek']).ok).toBe(true);
		expect(checkTyped('dwa', ['dwa (m/n)']).ok).toBe(true);
		expect(checkTyped('Jesteś zdrowa?', ['Jesteś zdrowy/zdrowa?']).ok).toBe(true);
		expect(checkTyped('Jesteś', ['Jesteś zdrowy/zdrowa?']).ok).toBe(false);
		expect(checkTyped('1', ['1/2']).ok).toBe(false);
	});
	it('a spaced dash is punctuation, not a word', () => {
		expect(checkTyped('Любовь сильная эмоция', ['Любовь — сильная эмоция.'])).toMatchObject({ ok: true, kind: 'exact' });
		expect(checkChips(['Любовь', 'сильная', 'эмоция'], [['Любовь', '', 'сильная', 'эмоция']])).toBe(true);
	});
	it('apostrophes are unified', () => {
		expect(checkTyped("j'habite", ['J’habite'])).toMatchObject({ ok: true, kind: 'exact' });
	});
});

describe('diffWords', () => {
	it('marks missing and wrong words', () => {
		expect(diffWords('max es perro', 'Max es un perro')).toEqual([
			{ text: 'Max', ok: true },
			{ text: 'es', ok: true },
			{ text: 'un', ok: false },
			{ text: 'perro', ok: true }
		]);
		expect(diffWords('la gata', 'el gato').every((p) => !p.ok)).toBe(true);
	});
});

describe('checkChips', () => {
	it('matches any solution, ignoring case', () => {
		expect(checkChips(['es', 'un', 'caballo'], [['Es', 'un', 'caballo']])).toBe(true);
		expect(checkChips(['un', 'es', 'caballo'], [['Es', 'un', 'caballo']])).toBe(false);
	});
});
