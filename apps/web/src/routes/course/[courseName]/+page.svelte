<script lang="ts">
	// slippylabs: the course dashboard. Top: today's plan (review what's due,
	// the next lesson, weak spots) with the daily goal and streak. Then the week
	// ahead, then the course as a path of units and lessons.
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { loadIndex, loadMeta, moduleTitle, type CourseMeta } from '$lib/data';
	import TopBar from '$lib/ui/TopBar.svelte';
	import GoalRing from '$lib/ui/GoalRing.svelte';
	import Icon from '$lib/ui/Icon.svelte';
	import { Learner } from '../../../learn/learner';
	import {
		GOALS,
		finishDay,
		uniqueItems,
		projectWeek,
		skillProgress,
		today as todayPlan,
		type SkillProgress,
		type Today,
		type PlanDay
	} from '../../../learn/plan';
	import { migrateV1, saveItems } from '../../../learn/store';
	import { formatDay, weekdayShort } from '../../../learn/dates';
	import type { CourseIndex } from '../../../learn/types';

	let { data } = $props();
	const course: string = data.course;

	let meta: CourseMeta | undefined = $state();
	let index: CourseIndex | undefined = $state();
	let learner: Learner | undefined = $state();
	let plan: Today | undefined = $state();
	let skills: SkillProgress[] = $state([]);
	let week: PlanDay[] = $state([]);
	let finish: number | null = $state(null);
	let migrated = $state(0);

	onMount(async () => {
		const l = new Learner(course);
		if (!l.profile) {
			goto(`/course/${course}/setup`, { replaceState: true });
			return;
		}
		[meta, index] = await Promise.all([loadMeta(course), loadIndex(course)]);
		if (Object.keys(l.items).length === 0) {
			const bySkill = new Map<string, string[]>();
			for (const it of index.items) bySkill.set(it.s, [...(bySkill.get(it.s) ?? []), it.id]);
			const skillsMeta = meta.modules.flatMap((m) =>
				m.skills.map((s) => ({ id: s.id, slug: s.practiceHref, levels: s.levels }))
			);
			migrated = migrateV1(l.p, skillsMeta, bySkill, l.today);
			if (migrated) saveItems(l.p);
		}
		learner = l;
		plan = todayPlan(index, l.items, l.p.days, l.profile!, l.today);
		skills = skillProgress(index, l.items, l.today);
		week = projectWeek(index, l.items, l.profile!, l.today, plan.newToday);
		finish = finishDay(index, l.items, l.profile!, l.today);
	});

	const lessonHref = (slug: string) => `/course/${course}/learn?mode=lesson&skill=${slug}`;
	let units = $derived(
		(index?.modules ?? []).map((title, i) => ({
			title: moduleTitle(title),
			skills: skills.filter((s) => s.module === i)
		}))
	);
	let unique = $derived(index ? uniqueItems(index) : []);
	let learnedTotal = $derived(learner ? unique.filter((i) => learner!.items[i.id]).length : 0);
	let itemTotal = $derived(unique.length);
	const statusLabel = (s: SkillProgress) =>
		s.status === 'new'
			? 'Not started'
			: s.status === 'learning'
				? `${s.seen} of ${s.total} learned`
				: s.status === 'mastered'
					? 'Mastered'
					: `Learned · ${s.mastered}/${s.total} mastered`;
</script>

<svelte:head><title>{meta ? `${meta.languageName} · LibreLingo` : 'LibreLingo'}</title></svelte:head>

<TopBar {course} title={meta?.languageName ?? ''} />

{#if learner && plan && index && meta}
	<main class="wrap dash">
		{#if migrated}
			<p class="card notice">We moved your earlier progress over: {migrated} words and phrases from lessons you'd finished are now in your reviews.</p>
		{/if}

		<section class="hello">
			<div>
				<h1>{meta.languageName}</h1>
				<p class="muted">
					Goal: <strong>{GOALS[learner.profile!.goal].label}</strong> · {learner.profile!.minutes} min a day ·
					<a href={`/course/${course}/setup`}>change</a>
				</p>
			</div>
			<div class="badges">
				<div class="streak" title="Days in a row you've practised">
					<Icon name="flame" size={26} />
					<strong>{plan.streak}</strong>
					<span class="muted small">day{plan.streak === 1 ? '' : 's'}</span>
				</div>
				<div class="goal" title="Today's goal">
					<GoalRing done={plan.done} target={plan.target} />
					<span class="muted small">{plan.done}/{plan.target}<br />today</span>
				</div>
			</div>
		</section>

		<section class="today" aria-label="Today">
			<h2>Today</h2>
			{#if plan.paused}
				<p class="card notice warn">You have <strong>{plan.due}</strong> reviews waiting — more than three days' worth. New words are paused until you catch up, so the old ones don't slip away.</p>
			{/if}
			<div class="actions-grid">
				<a
					class="action card"
					class:primary={plan.due > 0}
					class:disabled={plan.due === 0}
					href={plan.due > 0 ? `/course/${course}/learn?mode=review` : undefined}
					aria-disabled={plan.due === 0}
					data-test="review"
				>
					<span class="a-icon"><Icon name="repeat" /></span>
					<span class="a-text">
						<strong>{plan.due > 0 ? `Review ${Math.min(plan.due, 20)}` : 'All caught up'}</strong>
						<span class="muted small">{plan.due > 0 ? `${plan.due} word${plan.due === 1 ? '' : 's'} due for review` : 'Nothing to review right now'}</span>
					</span>
				</a>
				{#if plan.next}
					<a class="action card" class:primary={plan.due === 0} href={lessonHref(plan.next.slug)} data-test="next-lesson">
						<span class="a-icon"><Icon name="play" /></span>
						<span class="a-text">
							<strong>{plan.next.seen ? 'Continue' : 'Start'}: {plan.next.title}</strong>
							<span class="muted small">
								{plan.newLeft > 0
									? `${plan.newLeft} new word${plan.newLeft === 1 ? '' : 's'} left in today's plan`
									: plan.paused
										? 'Paused while you catch up on reviews'
										: "Today's new words done — extra lessons are fine"}
							</span>
						</span>
					</a>
				{:else}
					<div class="action card">
						<span class="a-icon"><Icon name="check" /></span>
						<span class="a-text"><strong>Course complete</strong><span class="muted small">Keep reviewing to master every word.</span></span>
					</div>
				{/if}
				{#if plan.weak >= 5}
					<a class="action card" href={`/course/${course}/learn?mode=weak`} data-test="weak">
						<span class="a-icon"><Icon name="target" /></span>
						<span class="a-text"><strong>Weak spots</strong><span class="muted small">{plan.weak} words you often miss</span></span>
					</a>
				{/if}
			</div>
		</section>

		<section class="week" aria-label="This week">
			<div class="row-head">
				<h2>Your week</h2>
				<span class="muted small">{learnedTotal} of {itemTotal} learned{finish !== null ? ` · at this pace you'll finish around ${formatDay(finish)}` : ''}</span>
			</div>
			<ol class="days">
				{#each week as d, i}
					<li class="day card" class:today={i === 0}>
						<strong>{i === 0 ? 'Today' : weekdayShort(d.day)}</strong>
						<span class="small">{d.reviews ? `~${d.reviews} reviews` : 'No reviews'}</span>
						{#each d.learn as l}<span class="small learn">+{l.n} {l.title}</span>{/each}
						{#if d.paused}<span class="small warn-text">catch-up day</span>{/if}
					</li>
				{/each}
			</ol>
			<p class="muted small">An estimate, if you keep to {learner.profile!.minutes} minutes a day and get your reviews right. Missed words come back sooner.</p>
		</section>

		<section class="path" aria-label="Course">
			<h2>The course</h2>
			{#each units as u, ui}
				{@const learned = u.skills.reduce((a, s) => a + s.seen, 0)}
				{@const total = u.skills.reduce((a, s) => a + s.total, 0)}
				<div class="unit">
					<div class="unit-head">
						<span class="unit-no">Unit {ui + 1}</span>
						<h3>{u.title}</h3>
						<div class="bar unit-bar"><span style="width:{total ? (learned / total) * 100 : 0}%"></span></div>
					</div>
					<ol class="skills">
						{#each u.skills as s}
							{@const isNext = plan.next?.slug === s.slug}
							<li class="skill card" class:next={isNext} class:done={s.status === 'mastered' || s.status === 'learned'} data-test="skill">
								<span class="dot {s.status}" aria-hidden="true">
									{#if s.status === 'mastered'}★{:else if s.status === 'learned'}✓{:else}{Math.round((s.seen / Math.max(s.total, 1)) * 100)}%{/if}
								</span>
								<div class="s-text">
									<strong>{s.title}</strong>
									<span class="muted small">
										{statusLabel(s)}{#if s.due}<span class="pill warn">{s.due} due</span>{/if}
									</span>
								</div>
								<div class="s-actions">
									{#if index.skills.find((k) => k.slug === s.slug)?.intro}
										<a class="icon-btn" href={`/course/${course}/notes/${s.slug}`} title="Notes" aria-label={`Notes for ${s.title}`}><Icon name="book" /></a>
									{/if}
									<a class="btn" class:primary={isNext} href={lessonHref(s.slug)}>
										{s.status === 'new' ? 'Start' : s.seen < s.total ? 'Continue' : 'Practise'}
									</a>
								</div>
							</li>
						{/each}
					</ol>
				</div>
			{/each}
		</section>

		<footer class="credit muted small">
			<p>
				Course content: <a href={meta.repositoryURL} target="_blank" rel="noopener">{meta.languageName} course</a> by the LibreLingo community{#if meta.license}, licensed <a href={meta.license.link} target="_blank" rel="noopener">{meta.license.name.short}</a>{/if}.
				App: LibreLingo (<a href="https://codeberg.org/LibreLingoRelive/LibreLingoRelive">LibreLingoRelive</a> fork, AGPL-3.0) · <a href="/imprint">About</a>
			</p>
		</footer>
	</main>
{:else}
	<main class="wrap"><p class="muted">Loading…</p></main>
{/if}

<style>
	.dash {
		padding-top: 20px;
		padding-bottom: 40px;
	}
	section {
		margin-bottom: 28px;
	}
	.notice {
		margin-bottom: 16px;
	}
	.notice.warn {
		background: var(--warn-soft);
		border-color: transparent;
	}
	.hello {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.hello h1 {
		margin: 0;
	}
	.hello p {
		margin: 0;
	}
	.badges {
		display: flex;
		align-items: center;
		gap: 18px;
	}
	.streak,
	.goal {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.streak {
		color: #e8590c;
	}
	.streak strong {
		font-size: 1.5rem;
	}
	.actions-grid {
		display: grid;
		gap: 10px;
		grid-template-columns: 1fr;
	}
	@media (min-width: 760px) {
		.actions-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
	.action {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 76px;
		text-decoration: none;
		color: var(--text);
	}
	.action.primary {
		background: var(--brand);
		border-color: var(--brand);
		color: var(--brand-ink);
	}
	.action.primary .muted {
		color: inherit;
		opacity: 0.85;
	}
	.action.disabled {
		opacity: 0.7;
	}
	.a-icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: var(--brand-soft);
		color: var(--brand);
		flex: none;
	}
	.action.primary .a-icon {
		background: rgba(255, 255, 255, 0.2);
		color: inherit;
	}
	.a-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.row-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 6px;
	}
	.days {
		list-style: none;
		padding: 0;
		margin: 8px 0;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(118px, 1fr);
		gap: 8px;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
	}
	.day {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 10px 12px;
		scroll-snap-align: start;
	}
	.day.today {
		border-color: var(--brand);
		box-shadow: 0 0 0 1px var(--brand);
	}
	.learn {
		color: var(--brand);
		font-weight: 650;
	}
	.warn-text {
		color: var(--warn);
		font-weight: 650;
	}
	.unit {
		margin-bottom: 18px;
	}
	.unit-head {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 4px 12px;
		margin-bottom: 8px;
	}
	.unit-head h3 {
		margin: 0;
	}
	.unit-no {
		font-size: 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--brand);
	}
	.unit-bar {
		flex: 1;
		min-width: 80px;
		max-width: 220px;
	}
	.skills {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 8px;
		grid-template-columns: 1fr;
	}
	@media (min-width: 760px) {
		.skills {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	.skill {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
	}
	.skill.next {
		border-color: var(--brand);
		box-shadow: 0 0 0 1px var(--brand);
	}
	.dot {
		display: grid;
		place-items: center;
		width: 46px;
		height: 46px;
		border-radius: 50%;
		background: var(--surface-2);
		color: var(--muted);
		font-weight: 800;
		font-size: 0.75rem;
		flex: none;
	}
	.dot.learning {
		background: var(--brand-soft);
		color: var(--brand);
	}
	.dot.learned {
		background: var(--ok-soft);
		color: var(--ok);
		font-size: 1.2rem;
	}
	.dot.mastered {
		background: #f6c343;
		color: #5b3d00;
		font-size: 1.2rem;
	}
	.s-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
	}
	.s-text .pill {
		margin-left: 6px;
	}
	.s-actions {
		display: flex;
		align-items: center;
		gap: 4px;
		flex: none;
	}
	.credit {
		border-top: 1px solid var(--line);
		padding-top: 12px;
	}
</style>
