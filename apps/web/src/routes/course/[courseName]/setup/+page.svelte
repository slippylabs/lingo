<script lang="ts">
	// slippylabs: the study plan (first visit) and settings (later): goal,
	// minutes a day, listening, and the progress file tools.
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { loadIndex, loadMeta, type CourseMeta } from '$lib/data';
	import TopBar from '$lib/ui/TopBar.svelte';
	import { Learner } from '../../../../learn/learner';
	import { GOALS, MINUTES, dailyTarget, newPerDay } from '../../../../learn/plan';
	import { exportProgress, importProgress, resetProgress } from '../../../../learn/store';
	import { dayNumber } from '../../../../learn/dates';
	import type { Goal, Profile } from '../../../../learn/types';

	let { data } = $props();
	const course: string = data.course;

	let meta: CourseMeta | undefined = $state();
	let learner: Learner | undefined = $state();
	let first = $state(true);
	let hasAudio = $state(false);
	let goal: Goal = $state('general');
	let minutes: Profile['minutes'] = $state(10);
	let listen = $state(true);
	let start: 'begin' | 'placement' = $state('begin');
	let message = $state('');
	let fileInput: HTMLInputElement | undefined = $state();

	onMount(async () => {
		const l = new Learner(course);
		const [m, idx] = await Promise.all([loadMeta(course), loadIndex(course)]);
		meta = m;
		hasAudio = idx.items.some((i) => i.a);
		if (l.profile) {
			first = false;
			goal = l.profile.goal;
			minutes = l.profile.minutes;
			listen = !l.profile.noAudio;
		}
		learner = l;
	});

	function save(e: Event) {
		e.preventDefault();
		if (!learner) return;
		const prev = learner.profile;
		learner.setProfile({
			goal,
			minutes,
			created: prev?.created ?? dayNumber(),
			seenNotes: prev?.seenNotes ?? [],
			placement: prev?.placement,
			noAudio: hasAudio ? !listen : undefined
		});
		goto(first && start === 'placement' ? `/course/${course}/placement` : `/course/${course}`);
	}

	function download() {
		const blob = new Blob([JSON.stringify(exportProgress(course))], { type: 'application/json' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `librelingo-${course}-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 1000);
	}

	async function upload(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0];
		if (!f) return;
		try {
			const err = importProgress(course, JSON.parse(await f.text()));
			message = err ?? 'Progress restored.';
			if (!err) setTimeout(() => goto(`/course/${course}`), 600);
		} catch {
			message = 'That file could not be read.';
		}
	}

	function reset() {
		if (!confirm(`Erase all your ${meta?.languageName ?? ''} progress in this browser? This cannot be undone.`)) return;
		resetProgress(course);
		goto(`/course/${course}/setup`, { invalidateAll: true }).then(() => location.reload());
	}
</script>

<svelte:head><title>Your plan · LibreLingo</title></svelte:head>

<TopBar course={first ? '' : course} title={meta?.languageName ?? ''} />

{#if learner && meta}
	<main class="wrap setup">
		<form onsubmit={save}>
			<h1>{first ? `Let's set up your ${meta.languageName} plan` : 'Your plan'}</h1>
			<p class="muted">You can change any of this later. It shapes which exercises you get and how much is new each day.</p>

			<fieldset>
				<legend>What are you learning for?</legend>
				<div class="choices">
					{#each Object.entries(GOALS) as [k, g]}
						<label class="choice card" class:on={goal === k}>
							<input type="radio" name="goal" value={k} bind:group={goal} />
							<strong>{g.label}</strong>
							<span class="muted small">{g.blurb}</span>
						</label>
					{/each}
				</div>
			</fieldset>

			<fieldset>
				<legend>How much time a day?</legend>
				<div class="choices mins">
					{#each MINUTES as m}
						<label class="choice card" class:on={minutes === m}>
							<input type="radio" name="minutes" value={m} bind:group={minutes} />
							<strong>{m} min</strong>
							<span class="muted small">~{dailyTarget({ minutes: m })} exercises, {newPerDay({ minutes: m })} new words</span>
						</label>
					{/each}
				</div>
			</fieldset>

			{#if hasAudio}
				<fieldset>
					<legend>Listening</legend>
					<label class="check">
						<input type="checkbox" bind:checked={listen} />
						<span>Include listening exercises <span class="muted small">(turn off if you usually can't use sound)</span></span>
					</label>
				</fieldset>
			{:else}
				<p class="muted small">This course has no audio yet (there is no free, local voice for {meta.languageName}), so there are no listening exercises.</p>
			{/if}

			{#if first}
				<fieldset>
					<legend>Where do you want to start?</legend>
					<div class="choices two">
						<label class="choice card" class:on={start === 'begin'}>
							<input type="radio" name="start" value="begin" bind:group={start} />
							<strong>From the beginning</strong>
							<span class="muted small">New to {meta.languageName}.</span>
						</label>
						<label class="choice card" class:on={start === 'placement'}>
							<input type="radio" name="start" value="placement" bind:group={start} />
							<strong>Take a placement check</strong>
							<span class="muted small">Know some already? About 5 minutes; skips the units you know.</span>
						</label>
					</div>
				</fieldset>
			{/if}

			<button class="btn primary big" type="submit" data-test="save-plan">{first ? (start === 'placement' ? 'Start the check' : 'Start learning') : 'Save'}</button>
		</form>

		{#if !first}
			<section class="tools card">
				<h2>Your progress file</h2>
				<p class="muted small">Progress is kept only in this browser — nothing is sent anywhere. To move it to another device or browser, download it here and load it there.</p>
				<div class="row">
					<button type="button" class="btn" onclick={download}>Download progress</button>
					<button type="button" class="btn" onclick={() => fileInput?.click()}>Load a progress file</button>
					<input bind:this={fileInput} type="file" accept="application/json,.json" hidden onchange={upload} />
					<a class="btn ghost" href={`/course/${course}/placement`}>Retake the placement check</a>
				</div>
				{#if message}<p class="msg" role="status">{message}</p>{/if}
				<hr />
				<button type="button" class="btn bad" onclick={reset}>Erase my progress</button>
			</section>
		{/if}
	</main>
{:else}
	<main class="wrap"><p class="muted">Loading…</p></main>
{/if}

<style>
	.setup {
		padding-top: 20px;
		padding-bottom: 40px;
		max-width: 820px;
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0 0 22px;
	}
	legend {
		font-weight: 800;
		font-size: 1.1rem;
		margin-bottom: 8px;
	}
	.choices {
		display: grid;
		gap: 8px;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr));
	}
	.choices.two {
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
	}
	.choice {
		display: flex;
		flex-direction: column;
		gap: 2px;
		cursor: pointer;
		border-width: 2px;
		min-height: 44px;
	}
	.choice.on {
		border-color: var(--brand);
		background: var(--brand-soft);
	}
	.choice input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.choice:focus-within {
		outline: 3px solid var(--focus);
		outline-offset: 2px;
	}
	.check {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		cursor: pointer;
	}
	.check input {
		width: 22px;
		height: 22px;
	}
	.tools {
		margin-top: 32px;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	hr {
		border: 0;
		border-top: 1px solid var(--line);
		margin: 16px 0;
	}
	.msg {
		margin-top: 10px;
		font-weight: 650;
	}
</style>
