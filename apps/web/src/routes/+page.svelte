<script lang="ts">
	// slippylabs: home. Courses in progress first (from this browser), then all.
	import { onMount } from 'svelte';
	import TopBar from '$lib/ui/TopBar.svelte';
	import Icon from '$lib/ui/Icon.svelte';
	import { recentCourses, loadProgress } from '../learn/store';
	import { dayNumber } from '../learn/dates';
	import { streak } from '../learn/plan';

	let { data } = $props();
	const FEATURED = [
		'spanish-from-english',
		'french-from-english',
		'german-from-english',
		'dutch-from-english',
		'brazilian-portuguese-from-english'
	];
	let mine: { path: string; language: string; due: number; streak: number; learned: number; total: number }[] =
		$state([]);

	onMount(() => {
		const today = dayNumber();
		mine = recentCourses()
			.map((path) => {
				const c = data.courses.find((x) => x.path === path);
				if (!c) return null;
				const p = loadProgress(path);
				if (!p.profile) return null;
				const states = Object.values(p.items);
				return {
					path,
					language: c.language,
					due: states.filter((s) => s.due <= today).length,
					streak: streak(p.days, today),
					learned: states.length,
					total: c.items
				};
			})
			.filter((x) => x !== null);
	});

	let featured = $derived(FEATURED.map((p) => data.courses.find((c) => c.path === p)).filter(Boolean));
	let others = $derived(data.courses.filter((c) => !FEATURED.includes(c.path)));
</script>

<svelte:head>
	<title>LibreLingo — learn a language for free · Slippy Labs</title>
</svelte:head>

<TopBar />

<main class="wrap home">
	<section class="hero">
		<img src="/images/mascot-jetpack-noshadow.svg" alt="" width="120" height="120" />
		<div>
			<h1>Learn a language, a few minutes a day</h1>
			<p class="lead">Short lessons that <strong>teach each word before testing it</strong>, explain your mistakes, and bring words back <strong>just before you'd forget them</strong>. Tell it your goal and how much time you have, and it plans your week.</p>
			<p class="muted small">Free and open source. No account — your progress stays in this browser.</p>
		</div>
	</section>

	{#if mine.length}
		<section>
			<h2>Continue</h2>
			<div class="grid">
				{#each mine as c (c.path)}
					<a class="card course mine" href={`/course/${c.path}`}>
						<strong class="lang">{c.language}</strong>
						<span class="muted small">{c.learned} of {c.total} learned</span>
						<div class="bar"><span style="width:{(c.learned / Math.max(c.total, 1)) * 100}%"></span></div>
						<span class="row small">
							<span class="streak"><Icon name="flame" size={16} /> {c.streak}</span>
							{#if c.due}<span class="pill warn">{c.due} to review</span>{:else}<span class="pill ok">Up to date</span>{/if}
						</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<section>
		<h2>{mine.length ? 'All courses' : 'Choose a course'}</h2>
		<div class="grid">
			{#each featured as c (c!.path)}
				<a class="card course" href={`/course/${c!.path}`} data-test="course">
					<strong class="lang">{c!.language}</strong>
					<span class="muted small">{c!.items} words &amp; phrases · {c!.skills} lessons</span>
					<span class="tags">
						{#if c!.audio}<span class="pill">Audio</span>{/if}
						{#if c!.notes}<span class="pill brand">Grammar notes</span>{/if}
					</span>
				</a>
			{/each}
		</div>
		<h3 class="more">More languages</h3>
		<div class="grid small-grid">
			{#each others as c (c.path)}
				<a class="card course" href={`/course/${c.path}`} data-test="course">
					<strong class="lang">{c.language}</strong>
					<span class="muted small">{c.from ? `from ${c.from} · ` : ''}{c.items} words &amp; phrases</span>
					<span class="tags">
						{#if c.audio}<span class="pill">Audio</span>{/if}
						{#if c.notes}<span class="pill brand">Notes</span>{/if}
					</span>
				</a>
			{/each}
		</div>
	</section>

	<section class="how">
		<h2>How it works</h2>
		<ol class="steps">
			<li class="card"><strong>1. Learn</strong><span class="muted">Each lesson shows you a few new words — picture, sound and meaning — before asking anything.</span></li>
			<li class="card"><strong>2. Practise</strong><span class="muted">Then you recognise them, type them, hear them and build sentences, getting harder as you go.</span></li>
			<li class="card"><strong>3. Review</strong><span class="muted">Each word comes back after 1, 3, 7, 16 days… Miss it and it comes back sooner.</span></li>
		</ol>
	</section>

	<footer class="muted small foot">
		Courses by the <a href="https://codeberg.org/LibreLingoRelive">LibreLingo community</a>. App based on LibreLingoRelive (AGPL-3.0); voices are made on our server with Piper. <a href="/imprint">About</a> · <a href="/privacy">Privacy</a>
	</footer>
</main>

<style>
	.home {
		padding-top: 24px;
		padding-bottom: 40px;
	}
	section {
		margin-bottom: 30px;
	}
	.hero {
		display: flex;
		align-items: center;
		gap: 20px;
	}
	.hero img {
		flex: none;
	}
	.lead {
		font-size: 1.1rem;
	}
	@media (max-width: 640px) {
		.hero {
			flex-direction: column;
			align-items: flex-start;
		}
		.hero img {
			width: 84px;
			height: 84px;
		}
	}
	.grid {
		display: grid;
		gap: 10px;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr));
	}
	.course {
		display: flex;
		flex-direction: column;
		gap: 4px;
		color: var(--text);
		text-decoration: none;
		min-height: 44px;
		transition: transform 0.1s ease;
	}
	.course:hover {
		border-color: var(--brand);
	}
	.lang {
		font-size: 1.15rem;
	}
	.tags {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
		margin-top: 2px;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
	}
	.streak {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		color: #e8590c;
		font-weight: 700;
	}
	.more {
		margin-top: 20px;
	}
	.steps {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 10px;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
	}
	.steps li {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.foot {
		border-top: 1px solid var(--line);
		padding-top: 12px;
	}
</style>
