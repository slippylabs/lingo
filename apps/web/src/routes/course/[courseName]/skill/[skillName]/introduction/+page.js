import { get_skill_introduction } from 'course-client';

export async function load(page) {
	const { courseName, skillName } = page.params;

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
		...(await get_skill_introduction({ courseName, skillName })),
		loading: false,
		preview: null
	};
}
