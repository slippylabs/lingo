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
  <div style="
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  ">
    <MarkDownPage
      {readmeHTML}
      {title}
      description={$_('about.meta.description')}
      style="
        flex: 1; /* Füllt den verfügbaren Platz */
        background-color: white;
        border-radius: 8px;
        margin: 1rem;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
      "
    >
      <div style="margin-top: auto; padding: 1rem 0; text-align: center;">
        <Button style="secondary" href={homepageLink}>Go back to course</Button>
        <Button style="primary" href={`/course/${courseName}/skill/${practiceHref}${gistId ? `?gistId=${gistId}` : ''}`}>
          Practice {title}
        </Button>
      </div>
    </MarkDownPage>
  </div>
{/if}

