<script lang="ts">
	import TopBar from '$lib/ui/TopBar.svelte';
	let { data } = $props();
</script>

<svelte:head><title>About · LibreLingo</title></svelte:head>

<TopBar />
<main class="wrap page">
	<article class="card prose">{@html data.html}</article>
</main>

<style>
	.page {
		padding-top: 20px;
		padding-bottom: 40px;
		max-width: 820px;
	}
</style>
