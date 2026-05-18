import { get_skill_data } from 'course-client';

export async function load(page) {
	const { skillName, courseName } = page.params;
	if (courseName === 'preview') {
		const skillNameFromQuery = page.url.searchParams.get('skillName');
		return {
			loading: true,
			preview: {
				type: skillName,
				skillName: skillNameFromQuery
			}
		};
	}

	return {
		...(await get_skill_data({ skillName, courseName })),
		loading: false,
		preview: null
	};
}
