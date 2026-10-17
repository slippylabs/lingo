import { courseNames, loadIndex, loadMeta, loadNotes } from '$lib/data';
import { error } from '@sveltejs/kit';

// Notes are plain content, so these pages are prerendered in full.
export async function entries() {
	const out: { courseName: string; skill: string }[] = [];
	for (const courseName of courseNames()) {
		const idx = await loadIndex(courseName);
		for (const s of idx.skills) if (s.intro) out.push({ courseName, skill: s.slug });
	}
	return out;
}

export async function load({ params }) {
	const [meta, idx] = await Promise.all([loadMeta(params.courseName), loadIndex(params.courseName)]);
	const sk = idx.skills.find((s) => s.slug === params.skill);
	if (!sk) error(404, 'No such lesson');
	const html = await loadNotes(params.courseName, params.skill);
	if (!html) error(404, 'This lesson has no notes');
	return { course: params.courseName, skill: sk, html, language: meta.languageName, lang: meta.languageCode };
}
