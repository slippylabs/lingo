<script lang="ts">
	import TopBar from '$lib/ui/TopBar.svelte';
	let { data } = $props();
</script>

<svelte:head><title>{data.skill.title} notes · {data.language} · LibreLingo</title></svelte:head>

<TopBar course={data.course} title={data.language} />

<main class="wrap notes">
	<p class="muted small"><a href={`/course/${data.course}`}>Course</a> › Notes</p>
	<article class="card" lang="en">
		<p class="pill brand">Notes: {data.skill.title}</p>
		<div class="prose">{@html data.html}</div>
	</article>
	<div class="row">
		<a class="btn primary big" href={`/course/${data.course}/learn?mode=lesson&skill=${data.skill.slug}`}>Practise {data.skill.title}</a>
		<a class="btn ghost big" href={`/course/${data.course}`}>Back to the course</a>
	</div>
</main>

<style>
	.notes {
		padding-top: 16px;
		padding-bottom: 40px;
		max-width: 820px;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 16px;
	}
</style>
