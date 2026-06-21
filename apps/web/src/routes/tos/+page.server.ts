import parseMarkdown from "../../utils/parseMarkdown"

export async function load() {
	// SvelteKit load function - replaces Sapper's preload()
	const { default: rawMarkdown } = await import(
		"../../../../docs/website_tos.md"
	)

	return {
		readmeHTML: parseMarkdown(rawMarkdown),
	}
}
