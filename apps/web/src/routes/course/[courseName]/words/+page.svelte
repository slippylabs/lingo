<script lang="ts">
	// slippylabs: every word and phrase the learner has met, how well they know
	// it, and when it comes back.
	import { onMount } from 'svelte';
	import { loadIndex, loadMeta, type CourseMeta } from '$lib/data';
	import { voice } from '$lib/sound';
	import TopBar from '$lib/ui/TopBar.svelte';
	import Icon from '$lib/ui/Icon.svelte';
	import { Learner } from '../../../../learn/learner';
	import { MASTERED_BOX, isDue, isWeak, strength } from '../../../../learn/srs';
	import { stripAccents } from '../../../../learn/check';
	import { uniqueItems } from '../../../../learn/plan';
	import type { CourseIndex, IndexItem, ItemState } from '../../../../learn/types';

	let { data } = $props();
	const course: string = data.course;

	let meta: CourseMeta | undefined = $state();
	let index: CourseIndex | undefined = $state();
	let items: Record<string, ItemState> = $state({});
	let today = $state(0);
	let q = $state('');
	let filter: 'all' | 'due' | 'weak' | 'mastered' = $state('all');
	let audio = $state(false);

	onMount(async () => {
		const l = new Learner(course);
		[meta, index] = await Promise.all([loadMeta(course), loadIndex(course)]);
		items = l.items;
		today = l.today;
		audio = !l.profile?.noAudio;
	});

	const norm = (s: string) => stripAccents(s.toLowerCase());
	let all = $derived(index ? uniqueItems(index) : []);
	let met = $derived(all.filter((i) => items[i.id]));
	let shown = $derived(
		met
			.filter((i) => {
				const st = items[i.id];
				if (filter === 'due' && !isDue(st, today)) return false;
				if (filter === 'weak' && !isWeak(st)) return false;
				if (filter === 'mastered' && st.box < MASTERED_BOX) return false;
				if (!q) return true;
				const n = norm(q);
				return norm(i.t).includes(n) || norm(i.m).includes(n);
			})
			.sort((a, b) => items[a.id].due - items[b.id].due)
	);
	const counts = $derived({
		all: met.length,
		due: met.filter((i) => isDue(items[i.id], today)).length,
		weak: met.filter((i) => isWeak(items[i.id])).length,
		mastered: met.filter((i) => items[i.id].box >= MASTERED_BOX).length
	});
	const when = (it: IndexItem) => {
		const d = items[it.id].due - today;
		return d <= 0 ? 'Due now' : d === 1 ? 'Tomorrow' : `In ${d} days`;
	};
	const skillTitle = (slug: string) => index?.skills.find((s) => s.slug === slug)?.title ?? slug;
</script>

<svelte:head><title>Your words · LibreLingo</title></svelte:head>

<TopBar {course} title={meta?.languageName ?? ''} />

<main class="wrap words">
	<h1>Your words</h1>
	{#if index}
		<p class="muted">{met.length} of {all.length} words and phrases learned. A word is <em>mastered</em> once you've got it right in four reviews in a row, spaced days apart.</p>
		<div class="tools">
			<input type="search" placeholder="Search in {meta?.languageName} or English" bind:value={q} aria-label="Search words" />
			<div class="tabs" role="tablist">
				{#each [['all', 'All'], ['due', 'Due'], ['weak', 'Weak'], ['mastered', 'Mastered']] as [k, label]}
					<button type="button" role="tab" aria-selected={filter === k} class="btn" class:primary={filter === k} onclick={() => (filter = k as typeof filter)}>
						{label} <span class="count">{counts[k as keyof typeof counts]}</span>
					</button>
				{/each}
			</div>
		</div>
		{#if met.length === 0}
			<div class="card"><p>Nothing yet — words appear here once a lesson has taught them.</p><a class="btn primary" href={`/course/${course}`}>Go to the course</a></div>
		{:else if shown.length === 0}
			<p class="muted">No matches.</p>
		{:else}
			<ul class="list">
				{#each shown as it (it.id)}
					{@const st = items[it.id]}
					<li class="card w">
						{#if it.p}<img src={`/images/${it.p}`} alt="" loading="lazy" />{/if}
						<div class="t">
							<strong lang={meta?.languageCode}>{it.t}</strong>
							<span class="muted">{it.m}</span>
							<span class="small muted">{skillTitle(it.s)}{#if isWeak(st)} · <span class="weak">often missed</span>{/if}</span>
						</div>
						<div class="meta">
							<div class="bar" class:ok={st.box >= MASTERED_BOX} title="Memory strength"><span style="width:{strength(st) * 100}%"></span></div>
							<span class="small" class:due={isDue(st, today)}>{when(it)}</span>
						</div>
						{#if audio && it.a}
							<button type="button" class="icon-btn" onclick={() => voice(it.a)} aria-label={`Listen to ${it.t}`}><Icon name="speaker" size={20} /></button>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	{:else}
		<p class="muted">Loading…</p>
	{/if}
</main>

<style>
	.words {
		padding-top: 20px;
		padding-bottom: 40px;
	}
	.tools {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 12px 0 16px;
	}
	.tabs {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.count {
		opacity: 0.7;
		font-weight: 500;
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 8px;
	}
	.w {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
	}
	.w img {
		width: 52px;
		height: 52px;
		object-fit: cover;
		border-radius: 10px;
		flex: none;
	}
	.t {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
		overflow-wrap: anywhere;
	}
	.meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
		width: 92px;
		flex: none;
	}
	.meta .bar {
		width: 100%;
	}
	.due {
		color: var(--warn);
		font-weight: 700;
	}
	.weak {
		color: var(--bad);
		font-weight: 650;
	}
</style>
