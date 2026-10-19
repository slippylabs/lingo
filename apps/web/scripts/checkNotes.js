// slippylabs: every target-language example our notes put in **bold** must be
// a word or phrase the course actually teaches, so a note never teaches
// vocabulary the exercises don't accept. English labels are allow-listed.
// Run: node scripts/checkNotes.js   (exit 1 on any unknown example)
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENGLISH = new Set(
	`masculine feminine neuter common mistake watch out note spelling word order polite vous
	after spacing: cloudy watch the accents: is are the a and or of to in all you we they he she i you all man woman one several ending example
	example one several first second -n / -en -e -en -ar -er -ar verbs -er / -ir -ando -iendo -endo -ndo -eux -s -es
	-a -as -os -am -an -t a + el = al ser estar spelling: watch the accents: note: common mistake: watch out: quick test: accents matter
	quick test where how right now only women same verb form start`
		.split(/\s+/)
);
const norm = (s) =>
	s
		.toLowerCase()
		.normalize('NFC')
		.replace(/[’ʼ]/g, "'")
		.replace(/\s+([?!:;])/g, '$1')
		.replace(/[.¡¿!?,:;"]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

let bad = 0;
for (const course of readdirSync(path.join(web, 'src/notes'))) {
	const idxPath = path.join(web, 'src/courses', course, 'index.json');
	if (!existsSync(idxPath)) continue;
	const idx = JSON.parse(readFileSync(idxPath, 'utf8'));
	const corpus = ' ' + idx.items.flatMap((i) => [i.t, ...(i.alt ?? [])]).map(norm).join(' | ') + ' ';
	for (const f of readdirSync(path.join(web, 'src/notes', course))) {
		// The opening "In this lesson: …" line is English; endings use U+2011.
		const md = readFileSync(path.join(web, 'src/notes', course, f), 'utf8')
			.replace(/^In this lesson:.*$/m, '')
			.replace(/\u2011/g, '-');
		const slug = f.replace(/\.md$/, '');
		if (!idx.skills.some((s) => s.slug === slug)) {
			console.log(`${course}/${f}: no such skill`);
			bad++;
		}
		for (const m of md.matchAll(/\*\*([^*]+)\*\*/g)) {
			for (const part of m[1].split(/\s*(?:\/|→|,)\s*/)) {
				const n = norm(part);
				if (!n || ENGLISH.has(n) || ENGLISH.has(part.toLowerCase().trim())) continue;
				if (/^-\p{L}{1,5}$/u.test(n)) continue; // an ending such as -o, -iendo
				if (/^[a-z -]+:?$/.test(n) && n.split(' ').every((w) => ENGLISH.has(w))) continue;
				const re = new RegExp(`(^|[^\\p{L}])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'u');
				if (!re.test(corpus)) {
					console.log(`${course}/${f}: "${part}"`);
					bad++;
				}
			}
		}
	}
}
console.log(bad ? `${bad} unknown examples` : 'notes ok');
process.exit(bad ? 1 : 0);
