// slippylabs: the course list, read from the exported courses at build time.
import { courseNames, loadIndex, loadMeta, fromLanguage, EXPERIMENTAL } from '$lib/data';
import { uniqueItems } from '../learn/plan';

export async function load() {
	const courses = await Promise.all(
		courseNames().map(async (path) => {
			const [meta, idx] = await Promise.all([loadMeta(path), loadIndex(path)]);
			return {
				path,
				language: meta.languageName,
				from: fromLanguage(path),
				items: uniqueItems(idx).length,
				skills: idx.skills.length,
				audio: idx.items.some((i) => i.a),
				notes: idx.skills.filter((s) => s.intro).length,
				experimental: path in EXPERIMENTAL
			};
		})
	);
	courses.sort((a, b) => b.items - a.items || a.language.localeCompare(b.language));
	return { courses };
}
