import { courseEntries } from '$lib/entries';

export const ssr = false;
export const entries = courseEntries;
export const load = ({ params }) => ({ course: params.courseName });
