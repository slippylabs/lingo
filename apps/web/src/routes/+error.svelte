<script lang="ts">
	import { page } from '$app/state';
	import TopBar from '$lib/ui/TopBar.svelte';
</script>

<svelte:head><title>{page.status} · LibreLingo</title></svelte:head>

<TopBar />
<main class="wrap err">
	<h1>{page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
	<p class="muted">{page.error?.message ?? ''}</p>
	<a class="btn primary" href="/">All courses</a>
</main>

<style>
	.err {
		padding-top: 40px;
	}
</style>
