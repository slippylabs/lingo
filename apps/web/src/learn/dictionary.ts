// slippylabs: tap-to-define. The course index carries a dictionary of target
// words -> meanings (from the course's mini-dictionaries and word list).
import type { PhraseWord } from './types';

export type Glossed = { word: string; defs: string[] };

const clean = (w: string) =>
	w
		.toLowerCase()
		.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
		.replace(/[’ʼ]/g, "'");

/** Split target text into words, each with its meanings when the course has them. */
export function glossText(text: string, dict: Record<string, string[]>): Glossed[] {
	return text
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => {
			const k = clean(word);
			return { word, defs: dict[k] ?? dict[k.replace(/'/g, '’')] ?? [] };
		});
}

/** A challenge's own word-by-word definitions (newline-separated alternatives). */
export const glossPhrase = (phrase: PhraseWord[] | undefined): Glossed[] =>
	(phrase ?? []).map((p) => ({
		word: p.word,
		defs: (p.definition ?? '')
			.split('\n')
			.map((d) => d.trim())
			// Slavic template courses use the literal "undefined" as a placeholder gloss.
			.filter((d) => d && d !== 'undefined')
	}));

/** Normalised set of every word the course knows (for "that's a different word"). */
export const knownWords = (dict: Record<string, string[]>): Set<string> => new Set(Object.keys(dict));
