<script lang="ts">
	// slippylabs: the lesson player, for all three kinds of session:
	//   ?mode=lesson&skill=<slug>   teach-first lesson on one skill
	//   ?mode=review                 what's due today
	//   ?mode=weak                   the learner's weak spots
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { loadNotes, loadSkills, type CourseMeta } from '$lib/data';
	import { DEFAULT_PROFILE, makeEnv, openCourse } from '$lib/session-env';
	import { effect } from '$lib/sound';
	import Choice from '$lib/ui/Choice.svelte';
	import Typed from '$lib/ui/Typed.svelte';
	import Chips from '$lib/ui/Chips.svelte';
	import Teach from '$lib/ui/Teach.svelte';
	import FeedbackSheet from '$lib/ui/FeedbackSheet.svelte';
	import GoalRing from '$lib/ui/GoalRing.svelte';
	import Icon from '$lib/ui/Icon.svelte';
	import type { Env, Feedback } from '$lib/ui/types';
	import type { Learner } from '../../../../learn/learner';
	import {
		SessionRun,
		buildLesson,
		buildReview,
		buildWeak,
		dueItems,
		recall,
		exType,
		weakItems,
		EX_LABEL,
		type Ctx,
		type Step
	} from '../../../../learn/session';
	import { dailyTarget, today as todayPlan } from '../../../../learn/plan';
	import { INTERVALS } from '../../../../learn/srs';
	import type { Challenge, CourseIndex } from '../../../../learn/types';

	let { data } = $props();
	const course: string = data.course;
	const mode = page.url.searchParams.get('mode') ?? 'lesson';
	const skill = page.url.searchParams.get('skill') ?? '';

	let learner: Learner;
	let meta: CourseMeta | undefined = $state();
	let index: CourseIndex | undefined = $state();
	let challenges = new Map<string, Challenge[]>();
	let ctx: Ctx;
	let run: SessionRun | undefined = $state();
	let tick = $state(0);
	let error = $state('');
	let audioOn = $state(true);
	const met = new Set<string>();
	const newIds = new Set<string>();

	let ready = $state(false);
	let fb: Feedback | null = $state(null);
	let hinted = $state(false);
	let exRef: { check: () => Feedback } | undefined = $state();
	let notesHtml = $state('');
	let notesOpen = $state(false);
	let startedAt = Date.now();

	let step = $derived.by(() => {
		tick;
		return run?.current;
	});
	let progress = $derived.by(() => {
		tick;
		return run ? run.progress : 0;
	});
	let finished = $derived.by(() => {
		tick;
		return run ? run.finished : false;
	});
	let skillTitle = $derived(index?.skills.find((s) => s.slug === skill)?.title ?? '');
	let env: Env | undefined = $derived.by(() => {
		tick;
		if (!meta || !index || !step || step.kind === 'notes' || step.kind === 'mistakes') return undefined;
		return makeEnv(course, meta, index, challenges, met, audioOn, step.item.s);
	});
	let heading = $derived(
		mode === 'review' ? 'Review' : mode === 'weak' ? 'Weak spots' : skillTitle || 'Lesson'
	);

	onMount(async () => {
		try {
			const opened = await openCourse(course);
			learner = opened.learner;
			if (!learner.profile) learner.setProfile(DEFAULT_PROFILE());
			meta = opened.meta;
			index = opened.index;
			audioOn = opened.courseAudio && !learner.profile!.noAudio;
			for (const id of Object.keys(learner.items)) met.add(id);
			const base = { index, items: learner.items, profile: learner.profile!, today: learner.today, audio: audioOn };
			let items =
				mode === 'review'
					? dueItems(base, 20)
					: mode === 'weak'
						? weakItems(base, 12)
						: dueItems(base, 4);
			const skills = new Set(items.map((i) => i.s));
			if (mode === 'lesson') {
				if (!index.skills.some((s) => s.slug === skill)) throw new Error('No such lesson.');
				skills.add(skill);
			}
			challenges = await loadSkills(course, skills);
			ctx = { ...base, challenges };
			let steps: Step[] =
				mode === 'review'
					? buildReview(ctx, items)
					: mode === 'weak'
						? buildWeak(ctx, items, learner.p.log)
						: buildLesson(ctx, skill, items);
			if (mode === 'lesson' && index.skills.find((s) => s.slug === skill)?.intro)
				notesHtml = await loadNotes(course, skill);
			if (!notesHtml) steps = steps.filter((s) => s.kind !== 'notes');
			for (const s of steps) {
				const c = s.kind === 'teach' ? s.item.p : s.kind === 'ex' ? s.ch.pictures?.[0] : null;
				if (c) new Image().src = `/images/${c}`;
			}
			for (const s of steps) if (s.kind === 'teach') newIds.add(s.item.id);
			run = new SessionRun(steps);
			startedAt = Date.now();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	});

	function advance() {
		if (!run) return;
		const s = run.current;
		if (s?.kind === 'notes') learner.noteSeen(s.skill);
		if (s?.kind === 'teach') met.add(s.item.id);
		run.next();
		fb = null;
		hinted = false;
		ready = false;
		tick++;
		if (run.finished && run.graded.length) effect('fanfare');
		window.scrollTo({ top: 0 });
	}

	function submit(dontKnow = false) {
		if (!run || !step || step.kind !== 'ex' || fb) return;
		let result: Feedback;
		if (dontKnow || !exRef) {
			const probe = exRef?.check();
			result = { ...(probe ?? { expected: '', targetAnswer: true }), ok: false, kind: 'wrong', given: '' } as Feedback;
		} else {
			if (!ready) return;
			result = exRef.check();
		}
		fb = result;
		learner.logAnswer(step.item.id, step.x, result.ok);
		const g = run.answer(result.ok, { hinted });
		if (g) learner.settle(g);
		met.add(step.item.id);
		effect(result.ok ? 'correct' : 'wrong');
		tick++;
	}

	/** "Can't listen now": swap every listening exercise left for another kind. */
	function noListening() {
		if (!run) return;
		audioOn = false;
		const quiet = { ...ctx, audio: false };
		for (let i = run.pos; i < run.steps.length; i++) {
			const s = run.steps[i];
			if (s.kind === 'ex' && s.x === 'listen') {
				const alt = recall(quiet, s.item, 0);
				if (alt) run.steps[i] = { ...s, ch: alt, x: exType(alt) };
			}
		}
		ready = false;
		tick++;
	}

	function end() {
		if (!run || run.graded.length === 0) {
			goto(`/course/${course}`);
			return;
		}
		run.stop();
		tick++;
	}

	function onKey(e: KeyboardEvent) {
		if (e.key !== 'Enter' || notesOpen || !run || run.finished) return;
		if ((e.target as HTMLElement)?.tagName === 'BUTTON' && !(e.target as HTMLElement).closest('.actions')) return;
		e.preventDefault();
		if (step?.kind === 'ex' && !fb) submit();
		else advance();
	}

	// summary
	let summary = $derived.by(() => {
		tick;
		if (!run || !run.finished || !index) return null;
		const answered = run.correct + run.wrong;
		const learnedNew = run.graded.filter((g) => newIds.has(g.id)).length;
		const plan = todayPlan(index, learner.items, learner.p.days, learner.profile!, learner.today);
		const dues = run.graded.map((g) => learner.items[g.id]?.due).filter((d) => d !== undefined) as number[];
		const nextDue = dues.length ? Math.min(...dues) - learner.today : null;
		return {
			answered,
			accuracy: answered ? Math.round((run.correct / answered) * 100) : 0,
			learnedNew,
			reviewed: run.graded.length - learnedNew,
			mistakes: run.mistakes,
			plan,
			nextDue,
			minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000))
		};
	});
	const when = (d: number | null) =>
		d === null ? '' : d <= 0 ? 'later today' : d === 1 ? 'tomorrow' : `in ${d} days`;
</script>

<svelte:head><title>{heading} · LibreLingo</title></svelte:head>
<svelte:window onkeydown={onKey} />

<div class="session">
	<header class="wrap bar-row">
		<button type="button" class="icon-btn" onclick={end} aria-label="End session"><Icon name="close" /></button>
		<div class="bar grow" aria-label="Progress" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin="0" aria-valuemax="100">
			<span style="width:{finished ? 100 : progress * 100}%"></span>
		</div>
		<span class="mode muted small">{heading}</span>
	</header>

	<main class="wrap stage">
		{#if error}
			<div class="card"><p>Couldn't start: {error}</p><a class="btn primary" href={`/course/${course}`}>Back to the course</a></div>
		{:else if !run}
			<p class="muted">Loading…</p>
		{:else if run.steps.length === 0}
			<div class="card empty">
				<h1>{mode === 'review' ? 'Nothing to review' : mode === 'weak' ? 'No weak spots' : 'Nothing here yet'}</h1>
				<p class="muted">
					{mode === 'review'
						? "You're all caught up. Words come back for review just before you'd forget them."
						: mode === 'weak'
							? 'Words you miss more than once show up here for extra practice.'
							: 'This lesson has no exercises.'}
				</p>
				<a class="btn primary" href={`/course/${course}`}>Back to the course</a>
			</div>
		{:else if summary}
			<section class="summary">
				<h1>{summary.accuracy >= 80 ? 'Great work!' : summary.accuracy >= 50 ? 'Good practice!' : 'Keep going — that is how it sticks.'}</h1>
				<div class="stats">
					<div class="stat card"><strong>{summary.accuracy}%</strong><span>answers right</span></div>
					<div class="stat card"><strong>{summary.learnedNew}</strong><span>new words &amp; phrases met</span></div>
					<div class="stat card"><strong>{summary.reviewed}</strong><span>reviewed</span></div>
					<div class="stat card goal">
						<GoalRing done={summary.plan.done} target={summary.plan.target} size={56} />
						<span>{summary.plan.done}/{summary.plan.target} today</span>
					</div>
				</div>
				{#if summary.nextDue !== null}
					<p class="muted">These come back for review <strong>{when(summary.nextDue)}</strong>. Each time you get one right, it waits longer ({INTERVALS.slice(1, 5).join(', ')} days…).</p>
				{/if}
				{#if summary.mistakes.length}
					<h2>Worth another look</h2>
					<ul class="mistakes">
						{#each summary.mistakes as m}
							<li class="card">
								<span lang={meta?.languageCode}><strong>{m.item.t}</strong></span>
								<span class="muted">— {m.item.m}</span>
								<span class="pill">{EX_LABEL[m.x]}</span>
							</li>
						{/each}
					</ul>
				{/if}
				<div class="actions-row">
					{#if summary.plan.due > 0}
						<a class="btn primary big" href={`/course/${course}/learn?mode=review`} data-sveltekit-reload>Review {summary.plan.due} due</a>
					{:else if summary.plan.next}
						<a class="btn primary big" href={`/course/${course}/learn?mode=lesson&skill=${summary.plan.next.slug}`} data-sveltekit-reload>Next: {summary.plan.next.title}</a>
					{/if}
					<a class="btn ghost big" href={`/course/${course}`}>Back to the course</a>
				</div>
			</section>
		{:else if step?.kind === 'notes'}
			<article class="card notes">
				<span class="pill brand"><Icon name="book" size={16} /> Before you start</span>
				<div class="prose">{@html notesHtml}</div>
			</article>
		{:else if step?.kind === 'mistakes'}
			<div class="card empty">
				<span class="pill warn">Fix your mistakes</span>
				<h1>Let's go over the ones you missed</h1>
				<p class="muted">Getting them right now helps them stick. They'll also come back in your reviews.</p>
			</div>
		{:else if step?.kind === 'teach' && env}
			{#key run.pos}<Teach item={step.item} example={step.example} gloss={step.gloss} {env} />{/key}
		{:else if step?.kind === 'ex' && env}
			{#key `${run.pos}-${step.ch.id}`}
				{#if step.role === 'review'}<span class="pill">Review</span>{:else if step.role === 'retry'}<span class="pill warn">Try again</span>{/if}
				<div class="ex">
					{#if step.ch.type === 'cards' || step.ch.type === 'options'}
						<Choice bind:this={exRef} ch={step.ch} {env} locked={!!fb} onready={(r) => (ready = r)} />
					{:else if step.ch.type === 'shortInput' || step.ch.type === 'listeningExercise'}
						<Typed bind:this={exRef} ch={step.ch} {env} locked={!!fb} onready={(r) => (ready = r)} onhint={() => (hinted = true)} />
					{:else if step.ch.type === 'chips'}
						<Chips bind:this={exRef} ch={step.ch} {env} locked={!!fb} onready={(r) => (ready = r)} onhint={() => (hinted = true)} />
					{/if}
				</div>
			{/key}
		{/if}
	</main>

	{#if run && !finished && step && (env || step.kind === 'notes' || step.kind === 'mistakes')}
		<footer class="dock" class:ok={fb?.ok} class:bad={fb && !fb.ok}>
			{#if fb && env}
				<FeedbackSheet {fb} {env} notes={!!notesHtml} onnotes={() => (notesOpen = true)} />
			{/if}
			<div class="wrap actions">
				{#if step?.kind === 'ex' && !fb}
					<button type="button" class="btn ghost" onclick={() => submit(true)}>I don't know</button>
					{#if step.x === 'listen'}
						<button type="button" class="btn ghost" onclick={noListening}>Can't listen now</button>
					{/if}
					<button type="button" class="btn primary big push" disabled={!ready} onclick={() => submit()} data-test="check">Check</button>
				{:else}
					{#if notesHtml && step?.kind !== 'notes' && !fb}
						<button type="button" class="btn ghost" onclick={() => (notesOpen = true)}><Icon name="book" size={18} /> Notes</button>
					{/if}
					<button type="button" class="btn big push" class:primary={!fb} class:ok={fb?.ok} class:bad={fb && !fb.ok} onclick={advance} data-test="continue">
						{step?.kind === 'notes' ? 'Start the lesson' : step?.kind === 'teach' ? 'Got it' : 'Continue'}
					</button>
				{/if}
			</div>
		</footer>
	{/if}
</div>

{#if notesOpen}
	<div class="modal" role="dialog" aria-modal="true" aria-label="Lesson notes">
		<div class="modal-card card">
			<div class="modal-head">
				<strong>Notes: {skillTitle}</strong>
				<button type="button" class="icon-btn" onclick={() => (notesOpen = false)} aria-label="Close notes"><Icon name="close" /></button>
			</div>
			<div class="prose">{@html notesHtml}</div>
		</div>
	</div>
{/if}

<style>
	.session {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		padding-bottom: 260px;
	}
	.bar-row {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 60px;
		max-width: 760px;
	}
	.grow {
		flex: 1;
		height: 12px;
	}
	.mode {
		max-width: 30%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.stage {
		max-width: 760px;
		padding-top: 12px;
		padding-bottom: 24px;
	}
	.ex {
		margin-top: 8px;
	}
	.notes .prose {
		margin-top: 10px;
	}
	.empty {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		padding: 24px;
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
	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		padding-top: 12px;
		padding-bottom: 12px;
		max-width: 720px;
	}
	.dock.ok {
		background: var(--ok-soft);
	}
	.dock.bad {
		background: var(--bad-soft);
	}
	.dock.ok .actions,
	.dock.bad .actions {
		padding-top: 4px;
	}
	.push {
		margin-left: auto;
		min-width: 140px;
	}
	@media (max-width: 480px) {
		.push {
			width: 100%;
			margin-left: 0;
		}
	}
	.summary h1 {
		margin-top: 8px;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
		margin: 16px 0;
	}
	@media (min-width: 640px) {
		.stats {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 2px;
	}
	.stat strong {
		font-size: 1.8rem;
	}
	.stat span {
		color: var(--muted);
		font-size: 0.9rem;
	}
	.mistakes {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.mistakes li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		padding: 10px 14px;
	}
	.actions-row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 20px;
	}
	.modal {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: rgba(10, 8, 20, 0.55);
		display: grid;
		place-items: center;
		padding: 16px;
	}
	.modal-card {
		width: min(720px, 100%);
		max-height: 85vh;
		overflow: auto;
	}
	.modal-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: sticky;
		top: -16px;
		background: var(--surface);
		margin: -16px -16px 8px;
		padding: 8px 8px 8px 16px;
		border-bottom: 1px solid var(--line);
	}
</style>
