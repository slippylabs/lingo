// slippylabs: course content for the browser. Every file is a lazy Vite chunk
// (a template-string import() is opaque to Vite and 404s in the static build).
import parseMarkdown from '../utils/parseMarkdown';
import type { Challenge, CourseIndex } from '../learn/types';

export type CourseMeta = {
	languageName: string;
	languageCode: string;
	specialCharacters: string[];
	repositoryURL: string;
	license?: { name: { short: string; full: string }; link: string };
	modules: { title: string; skills: { id: string; practiceHref: string; levels: number; title: string }[] }[];
};

const metaFiles = import.meta.glob('../courses/*/courseData.json', { import: 'default' });
const indexFiles = import.meta.glob('../courses/*/index.json', { import: 'default' });
const skillFiles = import.meta.glob('../courses/*/challenges/*.json', { import: 'default' });
const introFiles = import.meta.glob('../courses/*/introduction/*.md', {
	query: '?raw',
	import: 'default'
});
// Our own notes (in git) win over the course's introduction.
const ourNotes = import.meta.glob('../notes/*/*.md', { query: '?raw', import: 'default' });

// Courses whose content is a modern reconstruction we can't vouch for: shown
// with an "Experimental" pill and this note.
export const EXPERIMENTAL: Record<string, string> = {
	'old-church-slavonic-from-english':
		'This course is experimental. It was converted from a modern template, so many sentences are reconstructions rather than attested Old Church Slavonic, and some forms may be wrong.'
};

export const courseNames = (): string[] =>
	Object.keys(metaFiles)
		.map((k) => k.split('/')[2])
		.filter((c) => !c.startsWith('test'));

async function get<T>(files: Record<string, () => Promise<unknown>>, key: string): Promise<T> {
	const f = files[key];
	if (!f) throw new Error(`missing ${key}`);
	return (await f()) as T;
}

export const loadMeta = (course: string) =>
	get<CourseMeta>(metaFiles, `../courses/${course}/courseData.json`);

export async function loadIndex(course: string): Promise<CourseIndex> {
	const idx = await get<CourseIndex>(indexFiles, `../courses/${course}/index.json`);
	for (const sk of idx.skills) if (hasOwnNote(course, sk.slug)) sk.intro = true;
	return idx;
}

const skillCache = new Map<string, Promise<Challenge[]>>();
export function loadSkill(course: string, slug: string): Promise<Challenge[]> {
	const key = `../courses/${course}/challenges/${slug}.json`;
	if (!skillCache.has(key))
		skillCache.set(key, get<{ challenges: Challenge[] }>(skillFiles, key).then((d) => d.challenges));
	return skillCache.get(key)!;
}

export async function loadSkills(course: string, slugs: Iterable<string>) {
	const m = new Map<string, Challenge[]>();
	await Promise.all([...new Set(slugs)].map(async (s) => m.set(s, await loadSkill(course, s))));
	return m;
}

const hasOwnNote = (course: string, slug: string) => `../notes/${course}/${slug}.md` in ourNotes;

/** The skill's notes as HTML, or '' if it has none. */
export async function loadNotes(course: string, slug: string): Promise<string> {
	const own = `../notes/${course}/${slug}.md`;
	const theirs = `../courses/${course}/introduction/${slug}.md`;
	const md = ourNotes[own]
		? await get<string>(ourNotes, own)
		: introFiles[theirs]
			? await get<string>(introFiles, theirs)
			: '';
	return md.trim() ? parseMarkdown(md) : '';
}

/** "1_Hello" / "8_Plurals.yaml" -> "Hello" / "Plurals" */
export const moduleTitle = (t: string) => t.replace(/\.ya?ml$/, '').replace(/^\d+[_\s.-]*/, '').replace(/_/g, ' ');

export const courseTitle = (meta: Pick<CourseMeta, 'languageName'>) => meta.languageName;

export const fromLanguage = (course: string): string | null => {
	const m = course.match(/-from-([a-z-]+)$/);
	return m && m[1] !== 'english' ? m[1][0].toUpperCase() + m[1].slice(1).replace(/-/g, ' ') : null;
};

export const sourceLanguage = (course: string) => fromLanguage(course) ?? 'English';
