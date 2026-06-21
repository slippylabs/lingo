import parseMarkdown from "../../utils/parseMarkdown"

export async function load() {
	// SvelteKit load function - replaces Sapper's preload()
	const { default: rawMarkdown } = await import("../../../../README.md")

	return {
		readmeHTML: parseMarkdown(rawMarkdown).split("<h2>Tech stack</h2>")[0],
	}
}
