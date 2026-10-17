import { courseEntries } from '$lib/entries';

// Progress lives in the browser, so this page renders there.
export const ssr = false;
export const entries = courseEntries;
export const load = ({ params }) => ({ course: params.courseName });
