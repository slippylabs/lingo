<script lang="ts">
	import Icon from './Icon.svelte';
	let {
		course = '',
		title = ''
	}: { course?: string; title?: string } = $props();
</script>

<header class="top">
	<div class="wrap row">
		<a class="brand" href={course ? `/course/${course}` : '/'} aria-label="LibreLingo home">
			<img src="/images/logo-icon.svg" alt="" width="30" height="30" />
			<span class="name">LibreLingo</span>
		</a>
		{#if title}<span class="title">{title}</span>{/if}
		<nav>
			{#if course}
				<a href={`/course/${course}`} title="Course"><Icon name="home" /><span>Course</span></a>
				<a href={`/course/${course}/words`} title="Your words"><Icon name="list" /><span>Words</span></a>
				<a href={`/course/${course}/setup`} title="Plan & settings"><Icon name="gear" /><span>Plan</span></a>
			{:else}
				<a href="/imprint">About</a>
			{/if}
			<a class="projects" href="https://projects.slippylabs.com/#tab=apps">← Projects</a>
		</nav>
	</div>
</header>

<style>
	.top {
		background: var(--surface);
		border-bottom: 1px solid var(--line);
		position: sticky;
		top: 0;
		z-index: 20;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 56px;
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		color: var(--text);
		text-decoration: none;
		font-weight: 800;
	}
	.title {
		font-weight: 700;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}
	.title::before {
		content: '·';
		margin-right: 8px;
	}
	nav {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 2px;
		flex: none;
	}
	nav a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		min-width: 44px;
		justify-content: center;
		padding: 0 10px;
		border-radius: 999px;
		color: var(--text);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.95rem;
	}
	nav a:hover {
		background: var(--surface-2);
	}
	@media (max-width: 640px) {
		nav a span,
		.name {
			display: none;
		}
		nav a {
			padding: 0 6px;
		}
		.projects {
			font-size: 0.85rem;
		}
	}
</style>
