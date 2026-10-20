// slippylabs: answer checking for the typed exercises, plus the diff the
// feedback sheet shows. Stricter than upstream's answer-corrector, which
// accepted one wrong letter in ANY word ("oso" for "oro", "un" for "en").
import leven from 'leven';

export type Verdict = {
	ok: boolean;
	/** what the learner should see as the right answer */
	expected: string;
	/** 'exact' | 'accent' (only diacritics differ) | 'typo' (one slip in a long word) | 'wrong' */
	kind: 'exact' | 'accent' | 'typo' | 'wrong';
};

export const normalize = (s: string): string =>
	s
		.normalize('NFC')
		.toLowerCase()
		.replace(/[’ʼ`´]/g, "'")
		.replace(/[!¡?¿,.;:"“”«»…—–]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

export const stripAccents = (s: string): string =>
	s.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');

/** Allowed slips: none under 5 letters, one up to 11, two from 12. */
const allowedSlips = (s: string) => (s.length < 5 ? 0 : s.length < 12 ? 1 : 2);

/**
 * `known` is the course dictionary's set of normalised words: a slip that spells
 * another real word ("pero" for "perro") is a different word, not a typo.
 */
export function checkTyped(answer: string, valid: string[], known?: Set<string>): Verdict {
	const a = normalize(answer);
	const forms = valid.filter(Boolean);
	const expected = forms[0] ?? '';
	if (!a) return { ok: false, expected, kind: 'wrong' };
	for (const f of forms) if (normalize(f) === a) return { ok: true, expected: f, kind: 'exact' };
	for (const f of forms)
		if (stripAccents(normalize(f)) === stripAccents(a)) return { ok: true, expected: f, kind: 'accent' };
	const isOtherWord = known?.has(a) ?? false;
	for (const f of isOtherWord ? [] : forms) {
		const n = normalize(f);
		if (leven(stripAccents(n), stripAccents(a)) <= allowedSlips(n))
			return { ok: true, expected: f, kind: 'typo' };
	}
	// teach the main form, unless the learner was plainly aiming at another
	// accepted one (within two letters of it)
	let best = expected;
	let bestD = leven(normalize(expected), a);
	for (const f of forms.slice(1)) {
		const d = leven(normalize(f), a);
		if (d <= 2 && d < bestD) [best, bestD] = [f, d];
	}
	return { ok: false, expected: best, kind: 'wrong' };
}

export type DiffPart = { text: string; ok: boolean };

/**
 * Word-level diff of the learner's answer against the expected one, for the
 * feedback sheet: expected words the learner missed or got wrong are marked
 * not ok. (LCS over normalised words, so case and punctuation don't count.)
 */
export function diffWords(answer: string, expected: string): DiffPart[] {
	const exp = expected.split(/\s+/).filter(Boolean);
	const ans = normalize(answer).split(' ').filter(Boolean);
	const e = exp.map((w) => normalize(w));
	const n = e.length;
	const m = ans.length;
	const L: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
	for (let i = n - 1; i >= 0; i--)
		for (let j = m - 1; j >= 0; j--)
			L[i][j] = e[i] === ans[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
	const out: DiffPart[] = [];
	let i = 0;
	let j = 0;
	while (i < n) {
		if (j < m && e[i] === ans[j]) {
			out.push({ text: exp[i], ok: true });
			i++;
			j++;
		} else if (j < m && L[i][j + 1] >= L[i + 1][j]) {
			j++;
		} else {
			out.push({ text: exp[i], ok: false });
			i++;
		}
	}
	return out;
}

/** Chips: the answer must match one of the solutions word for word. */
export const checkChips = (answer: string[], solutions: string[][]): boolean => {
	const a = normalize(answer.join(' '));
	return solutions.some((s) => normalize(s.join(' ')) === a);
};
