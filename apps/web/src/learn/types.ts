// slippylabs: shared types for the learning model (src/learn).

/** One word or phrase of a course, from src/courses/<c>/index.json. */
export type IndexItem = {
	id: string; // the challenge `group`
	s: string; // skill slug
	k: 'w' | 'p'; // word or phrase
	t: string; // target-language form
	m: string; // meaning in the source language
	alt?: string[]; // other accepted target forms
	a?: string; // audio id (static/voice/<a>.mp3)
	p?: string; // first picture
};

export type IndexSkill = {
	slug: string;
	title: string;
	module: number;
	items: number;
	intro: boolean;
};

export type CourseIndex = {
	modules: string[];
	skills: IndexSkill[];
	items: IndexItem[];
	dict: Record<string, string[]>;
};

export type PhraseWord = { word: string; definition: string };

export type Challenge = {
	id: string;
	group: string;
	priority: number;
	type: 'cards' | 'options' | 'shortInput' | 'listeningExercise' | 'chips';
	formInTargetLanguage?: string | string[];
	meaningInSourceLanguage?: string;
	pictures?: string[] | null;
	phrase?: PhraseWord[];
	answer?: string;
	meaning?: string;
	audio?: string;
	chips?: string[];
	solutions?: string[][];
	formattedSolution?: string;
	translatesToSourceLanguage?: boolean;
};

/** Exercise kinds as the planner sees them (chips split by direction). */
export type ExType = 'cards' | 'options' | 'chipsSrc' | 'chipsTgt' | 'short' | 'listen';

/** Per-item memory, stored in lingo:v2/<course>/items. */
export type ItemState = {
	s: string; // skill slug, so a review can load just the skills it needs
	box: number; // 0..6, see srs.INTERVALS
	due: number; // day number when it should be reviewed
	seen: number; // day number first learned
	last: number; // day number last graded
	right: number;
	wrong: number;
	lapses: number;
	level: number; // highest exercise tier passed: 0 recognise, 1 read, 2 produce/hear
};

export type Goal = 'general' | 'travel' | 'conversation' | 'reading';

export type Profile = {
	goal: Goal;
	minutes: 5 | 10 | 15 | 20;
	created: number; // day number
	placement?: { known: number; modules: number };
	seenNotes: string[];
	noAudio?: boolean; // "I can't listen" preference
};

export type DayStats = { ex: number; ok: number; new: number };

export type LogEntry = { d: number; i: string; x: ExType; ok: 0 | 1 };
