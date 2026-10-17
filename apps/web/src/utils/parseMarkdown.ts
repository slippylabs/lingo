import showdown from 'showdown';

// slippylabs: course notes are trusted, build-time content (ours, or the
// course's own introduction files). Line breaks are kept because many course
// notes write vocabulary lists as one "English | target" pair per line.
const converter = new showdown.Converter({
	tables: true,
	strikethrough: true,
	simpleLineBreaks: true,
	openLinksInNewWindow: true,
	emoji: false
});

export default function parseMarkdown(markdown: string): string {
	return converter.makeHtml(typeof markdown === 'string' ? markdown : '');
}
