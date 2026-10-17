// slippylabs: shared setup for the session-style pages (lesson/review/weak and
// the placement check): load the learner, the course, and build the Env.
import { Learner } from '../learn/learner';
import { knownWords } from '../learn/dictionary';
import { loadIndex, loadMeta, sourceLanguage, type CourseMeta } from './data';
import type { Challenge, CourseIndex, Profile } from '../learn/types';
import type { Env } from './ui/types';
import { dayNumber } from '../learn/dates';

export const DEFAULT_PROFILE = (): Profile => ({
	goal: 'general',
	minutes: 10,
	created: dayNumber(),
	seenNotes: []
});

export async function openCourse(course: string) {
	const learner = new Learner(course);
	const [meta, index] = await Promise.all([loadMeta(course), loadIndex(course)]);
	const courseAudio = index.items.some((i) => i.a);
	return { learner, meta, index, courseAudio };
}

export function makeEnv(
	course: string,
	meta: CourseMeta,
	index: CourseIndex,
	challenges: Map<string, Challenge[]>,
	met: Set<string>,
	audio: boolean,
	skill?: string,
	hints = true
): Env {
	const all = [...challenges.values()].flat();
	const own = skill ? (challenges.get(skill) ?? []) : [];
	return {
		lang: meta.languageCode,
		languageName: meta.languageName,
		source: sourceLanguage(course),
		special: meta.specialCharacters ?? [],
		dict: index.dict,
		known: knownWords(index.dict),
		pool: own.length ? [...own, ...all.filter((c) => !own.includes(c))] : all,
		met,
		audio,
		hints
	};
}
