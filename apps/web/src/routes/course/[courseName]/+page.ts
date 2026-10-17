import { courseEntries } from '$lib/entries';

// The dashboard is all about the learner's own progress, which lives in the browser.
export const ssr = false;
export const entries = courseEntries;
export const load = ({ params }) => ({ course: params.courseName });
