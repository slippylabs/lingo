import parseMarkdown from "../../utils/parseMarkdown"

export async function load() {
	// SvelteKit load function - replaces Sapper's preload()
	const { default: rawMarkdown } = await import("../../../../docs/LICENSE.md")

	return {
		readmeHTML: parseMarkdown(rawMarkdown),
	}
}
