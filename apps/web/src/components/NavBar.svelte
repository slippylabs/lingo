<script lang="ts">
	import { page } from '$app/state';
	import Logo from 'components/Logo.svelte';
	import LinkOrButton from 'components/primitives/LinkOrButton.svelte';

	let { repositoryURL = null }: { repositoryURL?: string | null } = $props();

	const courseName = page.params?.courseName || '';
	const homepageLink = `/course/${courseName}`;
</script>

<nav class="navbar" aria-label="main navigation">
	<div class="navbar__left">
		<Logo src="/images/logo.svg" alt="LibreLingo" link={homepageLink} />
	</div>

	<div class="navbar__middle"></div>

	<div class="navbar__right">
		{#if repositoryURL}
			<LinkOrButton href={repositoryURL} target="_blank">Course Feedback</LinkOrButton>
		{/if}
		<LinkOrButton href="/imprint">About</LinkOrButton>
		<LinkOrButton href="/privacy">Privacy</LinkOrButton>
		<!-- slippylabs: back to the hub this app is listed on -->
		<LinkOrButton href="https://projects.slippylabs.com/#tab=apps">← Projects</LinkOrButton>
	</div>
</nav>

<style>
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		min-height: var(--deprecated-navbar-height);
		padding: var(--deprecated-navbar-padding-vertical) var(--deprecated-navbar-padding-horizontal);
		background: var(--deprecated-navbar-background);
		color: var(--deprecated-navbar-text-color);
	}

	/* slippylabs: 44px touch targets (they were 35px tall on phones) */
	.navbar__right :global(a) {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}

	.navbar__middle {
		flex: 1;
	}

	.navbar__right {
		display: flex;
		gap: var(--spacing-medium);
		align-items: center;
		flex-wrap: wrap;
	}

	.navbar__left,
	.navbar__right {
		display: flex;
		align-items: center;
		height: 100%;
	}

	.navbar__right :global(a) {
		color: var(--deprecated-navbar-text-color);
		text-decoration: none;
		font-weight: 600;
		letter-spacing: 0.01em;
		padding: 0.35rem 0.65rem;
		border-radius: 999px;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}

	.navbar__right :global(a:hover),
	.navbar__right :global(a:focus-visible) {
		background: var(--deprecated-navbar-highlight-color);
		color: var(--deprecated-navbar-text-color);
		outline: none;
	}
</style>
