import { get_skill_data } from 'course-client';

// slippylabs: a lesson shuffles its options on every render. Prerendered, the
// server's shuffle and the browser's differ, and hydration keeps the server's
// <img src> while updating the text -- so every card showed the wrong picture.
// Render lessons in the browser only (the page is still prerendered as a shell).
export const ssr = false;

export async function load(page) {
	const { skillName, courseName } = page.params;

	return {
		...(await get_skill_data({ skillName, courseName })),
	};
}
