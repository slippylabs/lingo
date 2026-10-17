// slippylabs: prerender entries for the per-course routes. The pages render in
// the browser (ssr = false), so the crawler can't find them from links.
import { courseNames } from './data';

export const courseEntries = () => courseNames().map((courseName) => ({ courseName }));
