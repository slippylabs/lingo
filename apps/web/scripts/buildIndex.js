// slippylabs: builds src/courses/<course>/index.json, the compact per-course
// item list the dashboard, review planner, Words page and tap-to-define need
// without loading every challenge file (the Slavic courses are 2.4 MB of them).
//
// One item = one challenge `group` = one word or phrase of the course.
// Run after prepareCourses (the export); the output is gitignored with the courses.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coursesDir = path.join(webRoot, 'src', 'courses');

const tokenize = (s) =>
	s
		.toLowerCase()
		.split(/[\s,.!?¿¡;:"“”«»()]+/u)
		.map((w) => w.replace(/^['’]+|['’]+$/gu, ''))
		.filter(Boolean);

export function buildCourseIndex(courseData, readSkill) {
	const skills = [];
	const items = [];
	const dict = {};
	const addDef = (word, def) => {
		if (!word || !def) return;
		const key = tokenize(word).join(' ');
		if (!key) return;
		const defs = String(def)
			.split('\n')
			.map((d) => d.trim())
			.filter(Boolean);
		const prev = dict[key] ?? [];
		for (const d of defs) if (!prev.includes(d)) prev.push(d);
		dict[key] = prev.slice(0, 4);
	};

	courseData.modules.forEach((module, mi) => {
		for (const skill of module.skills) {
			const { challenges } = readSkill(skill.practiceHref);
			const groups = new Map();
			for (const c of challenges) {
				if (!groups.has(c.group)) groups.set(c.group, []);
				groups.get(c.group).push(c);
			}
			const ids = [];
			for (const [group, cs] of groups) {
				const by = (t) => cs.find((c) => c.type === t);
				const cards = by('cards');
				const options = by('options');
				const listening = by('listeningExercise');
				const shortInput = by('shortInput');
				const chips = cs.find((c) => c.type === 'chips' && !c.translatesToSourceLanguage);
				const head = cards ?? options;
				const text = head?.formInTargetLanguage ?? listening?.answer ?? chips?.formattedSolution;
				const meaning = head?.meaningInSourceLanguage ?? listening?.meaning ?? '';
				if (!text) continue;
				const item = { id: group, s: skill.practiceHref, k: cards ? 'w' : 'p', t: text, m: meaning };
				const alts = (shortInput?.formInTargetLanguage ?? []).filter((a) => a !== text);
				if (alts.length) item.alt = alts;
				if (listening?.audio) item.a = listening.audio;
				if (cards?.pictures?.length) item.p = cards.pictures[0];
				items.push(item);
				ids.push(group);
				if (cards) addDef(text, meaning);
				for (const c of cs) {
					if (c.type === 'chips' && c.translatesToSourceLanguage) {
						for (const w of c.phrase ?? []) addDef(w.word, w.definition);
					}
				}
			}
			skills.push({
				slug: skill.practiceHref,
				title: skill.title,
				module: mi,
				items: ids.length,
				intro: Boolean(skill.introduction)
			});
		}
	});

	return {
		modules: courseData.modules.map((m) => m.title),
		skills,
		items,
		dict
	};
}

function main() {
	if (!existsSync(coursesDir)) return;
	for (const name of readdirSync(coursesDir)) {
		const dir = path.join(coursesDir, name);
		const dataPath = path.join(dir, 'courseData.json');
		if (!existsSync(dataPath)) continue;
		const courseData = JSON.parse(readFileSync(dataPath, 'utf8'));
		const index = buildCourseIndex(courseData, (slug) =>
			JSON.parse(readFileSync(path.join(dir, 'challenges', `${slug}.json`), 'utf8'))
		);
		writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index));
		console.log(`index ${name}: ${index.skills.length} skills, ${index.items.length} items`);
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
