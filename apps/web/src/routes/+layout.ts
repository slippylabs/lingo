// +layout.ts
// slippylabs: prerender every page for the static build. The svelte-i18n setup
// that used to live here was removed upstream in 5b7f48da but this import
// was left behind, which broke the build.
import '@fortawesome/fontawesome-free/css/all.min.css';

export const prerender = true;
