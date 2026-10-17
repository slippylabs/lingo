<script lang="ts">
	import Button from 'components/Button.svelte';
	import Stack from 'components/Stack.svelte';
	import Hero from 'components/Hero/Hero.svelte';
	import Page from 'components/Page.svelte';
	import Footer from 'components/Footer.svelte';
	import Mascot from 'components/Mascot.svelte';
	import Heading from 'components/Heading.svelte';

	import { page } from '$app/state';

	let coursesFs = page.data.coursesFs;

	// slippylabs: course folder names are lower-case ("brazilian portuguese");
	// title-case them, and flag the two courses taught from French.
	const titleCase = (s: string) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
	const fromLanguage = (path: string) => {
		const m = path.match(/-from-([a-z-]+)$/);
		return m && m[1] !== 'english' ? titleCase(m[1].replace(/-/g, ' ')) : null;
	};
</script>

<svelte:head>
	<title>LibreLingo — learn a language for free · Slippy Labs</title>
	<meta
		name="description"
		content="LibreLingo is an experiment to create a community driven language-learning platform. Learn a language for free."
	/>
</svelte:head>

<main class="main-content app-page">
	<a class="sl-back" href="https://projects.slippylabs.com/#tab=apps">← Projects</a>
	<Page>
		<Hero>
			<Stack direction="column" spacing="m" fullHeight justify="center">
				<Stack spacing="m" direction="column" directionDesktop="row">
					<Stack shrink={4}>
						<Mascot shadow={false} glow={true} />
					</Stack>
					<Stack direction="column" justify="center" shrink={2}>
						<Heading level={1}>
							Learn a language for free: bite-sized lessons from a community-driven, open-source course library
						</Heading>
					</Stack>
				</Stack>

				<Stack spacing="m" direction="column">
					<!-- For each courses available locally.. -->
					{#if coursesFs}
						<h3 style="text-align:center">Choose a course</h3>
						<div class="course-grid">
							{#each coursesFs as course (course.path)}
								<Button style="primary" size="large" href={`/course/${course.path}`}>
									{titleCase(course.language)}
									{#if fromLanguage(course.path)}
										<small class="from">(from {fromLanguage(course.path)})</small>
									{/if}
								</Button>
							{/each}
						</div>
					{/if}
				</Stack>
			</Stack>
		</Hero>
		<Footer />
	</Page>
</main>

<style>
	/* slippylabs */
	.course-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
		gap: 0.75rem;
		width: 100%;
		max-width: 60rem;
		margin: 0 auto;
	}
	.course-grid :global(a),
	.course-grid :global(button) {
		width: 100%;
		min-height: 48px;
	}
	.from {
		margin-left: 0.4em;
		font-size: 0.7em;
		opacity: 0.85;
	}
	.sl-back {
		position: absolute;
		top: 8px;
		left: 12px;
		z-index: 5;
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 12px;
		font-weight: 600;
	}
</style>
