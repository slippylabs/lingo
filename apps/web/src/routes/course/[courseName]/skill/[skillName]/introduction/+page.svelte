<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { get_skill_introduction } from 'course-client';
	import Button from 'components/DeprecatedButton.svelte';
	import MarkDownPage from 'components/MarkDownPage.svelte';
	import isBrowser from 'utils/isBrowser';
	import { page } from '$app/state';

	export let preview = page.data.preview;
	export let loading = page.data.loading;
	export let readmeHTML: string = page.data.readmeHTML;
	export let title: string = page.data.title;
	export let practiceHref: string = page.data.practiceHref;
	export let courseName: string = page.data.courseName;
	export let gistId: string = page.data.gistId;

	let homepageLink = `/course/${courseName}/`;
	if (gistId) {
		homepageLink += `?gistId=${gistId}`;
	}

	// Fetching preview data
	if (preview !== null) {
		let gistParams = preview.gistId;
		if (isBrowser()) {
			const urlSearchParams = new URLSearchParams(window.location.search);
			gistParams = Object.fromEntries(urlSearchParams.entries());
		}

		const { skillName, gistId } = gistParams;

		get_skill_introduction({ courseName: 'preview', skillName, gistId }).then((skillData) => {
			title = skillData.title;
			readmeHTML = skillData.readmeHTML;
			practiceHref = skillData.practiceHref + (gistId ? `?gistId=${gistId}` : '');
			loading = false;
		});
	}
</script>

{#if !loading}
  <div class="page-container">
<MarkDownPage
  {readmeHTML}
  {title}
  description={$_('about.meta.description')}
  style="
    min-height: 70vh;
    background-color: var(--color-primary-light);
    display: flex;
    flex-direction: column;
    padding: 1rem;
  "
>
  <div class="button-container">
    <Button style="secondary" href={homepageLink}>Go back to course</Button>
    <Button style="primary" href={`/course/${courseName}/skill/${practiceHref}${gistId ? `?gistId=${gistId}` : ''}`}>
      Practice {title}
    </Button>
  </div>
</MarkDownPage>

  </div>
{/if}

<style>
  .page-container {
    display: flex;
    flex-direction: column;
    min-height: 70vh; /* Mindesthöhe der Seite */
    background-color: var(--color-primary-light); /* Durchgehender blauer Hintergrund */
  }

  .markdown-content {
    flex: 1; /* Füllt den verfügbaren Platz */
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .button-container {
    margin-top: auto; /* Buttons nach unten schieben */
    padding: 1rem 0;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
</style>
