<script lang="ts">
	// slippylabs: the placement check. Module by module: 80%+ right marks the
	// unit known (its words go into reviews, spaced over a week); under 60%
	// stops the check there. Answers here don't count toward the daily goal.
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { loadSkills, moduleTitle, type CourseMeta } from '$lib/data';
	import { DEFAULT_PROFILE, makeEnv, openCourse } from '$lib/session-env';
	import Choice from '$lib/ui/Choice.svelte';
	import Typed from '$lib/ui/Typed.svelte';
	import Chips from '$lib/ui/Chips.svelte';
	import FeedbackSheet from '$lib/ui/FeedbackSheet.svelte';
	import Icon from '$lib/ui/Icon.svelte';
	import type { Env, Feedback } from '$lib/ui/types';
	import type { Learner } from '../../../../learn/learner';
	import {
		MAX_QUESTIONS,
		judgeModule,
		markModuleKnown,
		moduleQuestions,
		type PlacementQ
	} from '../../../../learn/placement';
	import { saveItems } from '../../../../learn/store';
	import type { Challenge, CourseIndex } from '../../../../learn/types';

	let { data } = $props();
	const course: string = data.course;

	let learner: Learner;
	let meta: CourseMeta | undefined = $state();
	let index: CourseIndex | undefined = $state();
	let challenges = new Map<string, Challenge[]>();
	let phase: 'intro' | 'asking' | 'done' = $state('intro');
	let moduleNo = $state(0);
	let qs: PlacementQ[] = $state([]);
	let qi = $state(0);
	let right = 0;
	let asked = $state(0);
	let knownModules: number[] = $state([]);
	let markedWords = $state(0);
	let fb: Feedback | null = $state(null);
	let ready = $state(false);
	let exRef: { check: () => Feedback } | undefined = $state();
	let env: Env | undefined = $state();

	onMount(async () => {
		const o = await openCourse(course);
		learner = o.learner;
		if (!learner.profile) learner.setProfile(DEFAULT_PROFILE());
		meta = o.meta;
		index = o.index;
	});

	async function loadModule(m: number) {
		if (!index || !meta) return;
		const slugs = index.skills.filter((s) => s.module === m).map((s) => s.slug);
		challenges = await loadSkills(course, slugs);
		qs = moduleQuestions(index, m, challenges);
		if (qs.length === 0) {
			// nothing askable in this unit: skip it
			if (m + 1 < index.modules.length) {
				moduleNo = m + 1;
				return loadModule(m + 1);
			}
			return finish();
		}
		qi = 0;
		right = 0;
		env = makeEnv(course, meta, index, challenges, new Set(), false, undefined, false);
	}

	async function begin() {
		moduleNo = 0;
		await loadModule(0);
		phase = 'asking';
	}

	function check(dontKnow = false) {
		if (fb || !exRef) return;
		const r = exRef.check();
		fb = dontKnow ? { ...r, ok: false, kind: 'wrong', given: '' } : r;
		if (fb.ok) right++;
		asked++;
	}

	async function next() {
		fb = null;
		ready = false;
		if (qi + 1 < qs.length && asked < MAX_QUESTIONS) {
			qi++;
			return;
		}
		const verdict = judgeModule({ module: moduleNo, asked: qs.length, right });
		if (verdict === 'known') {
			markedWords += markModuleKnown(index!, moduleNo, learner.items, learner.today);
			knownModules = [...knownModules, moduleNo];
			saveItems(learner.p);
		}
		const more = moduleNo + 1 < index!.modules.length;
		if (verdict === 'stop' || !more || asked >= MAX_QUESTIONS) return finish();
		moduleNo++;
		await loadModule(moduleNo);
	}

	function finish() {
		const p = learner.profile!;
		learner.setProfile({ ...p, placement: { known: markedWords, modules: knownModules.length } });
		phase = 'done';
	}

	let q = $derived(qs[qi]);
	let startUnit = $derived(knownModules.length);
</script>

<svelte:head><title>Placement check · LibreLingo</title></svelte:head>

<div class="pl">
	<header class="wrap head">
		<a class="icon-btn" href={`/course/${course}`} aria-label="Leave"><Icon name="close" /></a>
		<strong>Placement check{meta ? ` · ${meta.languageName}` : ''}</strong>
		{#if phase === 'asking'}<span class="muted small push">{asked} answered</span>{/if}
	</header>

	<main class="wrap stage">
		{#if !index || !meta}
			<p class="muted">Loading…</p>
		{:else if phase === 'intro'}
			<div class="card intro">
				<h1>Find your starting point</h1>
				<p>We'll ask a few questions from each unit, starting with the first. Get most of a unit right and it's marked as known — its words go into your reviews instead of lessons.</p>
				<p class="muted">Don't guess: if you don't know, say so. Up to {MAX_QUESTIONS} questions, about 5 minutes. You can stop whenever you like.</p>
				<button class="btn primary big" onclick={begin} data-test="begin">Begin</button>
			</div>
		{:else if phase === 'asking' && q && env}
			<p class="unit muted small">Unit {moduleNo + 1} of {index.modules.length}: <strong>{moduleTitle(index.modules[moduleNo])}</strong></p>
			{#key `${moduleNo}-${qi}`}
				{#if q.ch.type === 'shortInput'}
					<Typed bind:this={exRef} ch={q.ch} {env} locked={!!fb} onready={(r) => (ready = r)} onhint={() => {}} />
				{:else if q.ch.type === 'chips'}
					<Chips bind:this={exRef} ch={q.ch} {env} locked={!!fb} onready={(r) => (ready = r)} onhint={() => {}} />
				{:else}
					<Choice bind:this={exRef} ch={q.ch} {env} locked={!!fb} onready={(r) => (ready = r)} />
				{/if}
			{/key}
		{:else if phase === 'done'}
			<div class="card intro">
				<h1>{startUnit === 0 ? "Let's start at the beginning" : `You start at Unit ${startUnit + 1}`}</h1>
				{#if markedWords}
					<p>We marked <strong>{markedWords}</strong> words and phrases from {startUnit} unit{startUnit === 1 ? '' : 's'} as known. They'll come up in your reviews over the next week, so anything you've half-forgotten gets caught.</p>
				{:else}
					<p>The first unit is the right place for you. Lessons teach each word before testing it.</p>
				{/if}
				<button class="btn primary big" onclick={() => goto(`/course/${course}`)} data-test="to-course">Go to my plan</button>
			</div>
		{/if}
	</main>

	{#if phase === 'asking' && env}
		<footer class="dock" class:ok={fb?.ok} class:bad={fb && !fb.ok}>
			{#if fb}<FeedbackSheet {fb} {env} notes={false} onnotes={() => {}} />{/if}
			<div class="wrap actions">
				{#if !fb}
					<button type="button" class="btn ghost" onclick={finish}>Stop here</button>
					<button type="button" class="btn ghost" onclick={() => check(true)}>I don't know</button>
					<button type="button" class="btn primary big push" disabled={!ready} onclick={() => check()} data-test="check">Check</button>
				{:else}
					<button type="button" class="btn big push" class:ok={fb.ok} class:bad={!fb.ok} onclick={next} data-test="continue">Continue</button>
				{/if}
			</div>
		</footer>
	{/if}
</div>

<svelte:window
	onkeydown={(e) => {
		if (e.key !== 'Enter' || phase !== 'asking') return;
		e.preventDefault();
		if (fb) next();
		else if (ready) check();
	}}
/>

<style>
	.pl {
		min-height: 100vh;
		padding-bottom: 240px;
	}
	.head {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 60px;
		max-width: 760px;
	}
	.push {
		margin-left: auto;
	}
	.stage {
		max-width: 760px;
		padding-top: 12px;
	}
	.intro {
		padding: 24px;
	}
	.unit {
		margin-bottom: 10px;
	}
	.dock {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 10;
		background: var(--surface);
		border-top: 1px solid var(--line);
		padding-bottom: env(safe-area-inset-bottom);
	}
	.dock.ok {
		background: var(--ok-soft);
	}
	.dock.bad {
		background: var(--bad-soft);
	}
	.actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		padding-top: 12px;
		padding-bottom: 12px;
		max-width: 720px;
	}
	.actions .push {
		min-width: 140px;
	}
	@media (max-width: 480px) {
		.actions .push {
			width: 100%;
			margin-left: 0;
		}
	}
</style>
