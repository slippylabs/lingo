import fs from "fs"
import { promisify } from "util"

const readdir = promisify(fs.readdir)

export async function load() {
	// SvelteKit load function - replaces Sapper's preload()
	try {
		const testSkills = (await readdir("./src/courses/test/challenges")).map(
			(fname: string) => fname.split(".")[0]
		)
		return {
			testSkills,
		}
	} catch (error) {
		// Return empty array if directory doesn't exist
		return {
			testSkills: [],
		}
	}
}
