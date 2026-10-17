// slippylabs: every page is prerendered for the static build (nginx serves
// the files). Pages that depend on the learner's progress set ssr = false and
// render in the browser, where that progress lives.
export const prerender = true;
