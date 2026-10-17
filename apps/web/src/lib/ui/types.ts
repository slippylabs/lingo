import type { Glossed } from '../../learn/dictionary';
import type { Challenge } from '../../learn/types';

/** What the feedback sheet shows after an answer. */
export type Feedback = {
	ok: boolean;
	kind: 'exact' | 'accent' | 'typo' | 'wrong';
	expected: string;
	given?: string;
	meaning?: string;
	gloss?: Glossed[];
	/** the expected answer is in the target language (diff + tap-to-define) */
	targetAnswer: boolean;
	audio?: string;
};

/** What every exercise gets besides its step. */
export type Env = {
	lang: string; // BCP 47 code of the target language
	languageName: string;
	source: string; // "English"
	special: string[];
	dict: Record<string, string[]>;
	known: Set<string>;
	/** challenges to draw wrong options from (same skill first) */
	pool: Challenge[];
	/** item ids the learner has met, so wrong options are words they know */
	met: Set<string>;
	audio: boolean;
	/** tap-to-define and the Hint button (off in the placement check) */
	hints: boolean;
};
