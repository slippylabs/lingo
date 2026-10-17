<script lang="ts">
	// slippylabs: the two pick-one exercises. "cards": pictures with the word
	// under them; "options": text answers. Wrong options come from words the
	// learner has met where possible, so the choice tests memory, not luck.
	import { onMount } from 'svelte';
	import { shuffle } from '../../learn/session';
	import { glossText } from '../../learn/dictionary';
	import type { Challenge } from '../../learn/types';
	import type { Env, Feedback } from './types';

	let {
		ch,
		env,
		locked,
		onready
	}: { ch: Challenge; env: Env; locked: boolean; onready: (r: boolean) => void } = $props();

	const isCards = ch.type === 'cards';
	const target = (c: Challenge) => String(c.formInTargetLanguage ?? '');

	function build(): Challenge[] {
		const want = isCards ? 3 : 2;
		const seen = new Set([target(ch).toLowerCase()]);
		const cands = shuffle(env.pool.filter((c) => c.type === ch.type && c.group !== ch.group));
		const met = cands.filter((c) => env.met.has(c.group));
		const rest = cands.filter((c) => !env.met.has(c.group));
		const out: Challenge[] = [];
		for (const c of [...met, ...rest]) {
			const t = target(c).toLowerCase();
			if (seen.has(t)) continue;
			seen.add(t);
			out.push(c);
			if (out.length === want) break;
		}
		return shuffle([ch, ...out]);
	}
	const options = build();
	const pictureOf = (c: Challenge) => (c.pictures?.length ? shuffle(c.pictures)[0] : null);
	const pictures = options.map(pictureOf);
	const hasPictures = isCards && pictures.some(Boolean);

	let picked = $state(-1);
	$effect(() => onready(picked >= 0));

	export function check(): Feedback {
		const ok = options[picked]?.group === ch.group;
		return {
			ok,
			kind: ok ? 'exact' : 'wrong',
			expected: target(ch),
			given: options[picked] ? target(options[picked]) : '',
			meaning: ch.meaningInSourceLanguage,
			gloss: glossText(target(ch), env.dict),
			targetAnswer: true
		};
	}

	onMount(() => {
		const onKey = (e: KeyboardEvent) => {
			if (locked || e.target instanceof HTMLInputElement) return;
			const n = Number(e.key);
			if (n >= 1 && n <= options.length) picked = n - 1;
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<div class="prompt">
	<p class="kicker">{isCards ? 'Pick the right one' : `How do you say this in ${env.languageName}?`}</p>
	<h2 class="ask" lang="en">
		{#if isCards}Which one is <strong>“{ch.meaningInSourceLanguage}”</strong>?{:else}“{ch.meaningInSourceLanguage}”{/if}
	</h2>
</div>

<div class="grid" class:cards={hasPictures} role="radiogroup" aria-label="Answers">
	{#each options as o, i (o.id)}
		<button
			type="button"
			role="radio"
			aria-checked={picked === i}
			class="opt"
			class:picked={picked === i}
			class:right={locked && o.group === ch.group}
			class:wrong={locked && picked === i && o.group !== ch.group}
			disabled={locked}
			data-test="option"
			onclick={() => (picked = i)}
		>
			{#if hasPictures}
				{#if pictures[i]}
					<img src={`/images/${pictures[i]}`} alt="" loading="eager" data-test="card-img" />
				{:else}
					<span class="noimg"></span>
				{/if}
			{/if}
			<span class="label" lang={env.lang}><kbd>{i + 1}</kbd>{target(o)}</span>
		</button>
	{/each}
</div>

<style>
	.prompt {
		margin-bottom: 16px;
	}
	.kicker {
		color: var(--muted);
		font-weight: 650;
		margin: 0 0 4px;
	}
	.ask {
		font-size: clamp(1.3rem, 4.5vw, 1.8rem);
		font-weight: 650;
	}
	.grid {
		display: grid;
		gap: 10px;
		grid-template-columns: 1fr;
	}
	.grid.cards {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	@media (min-width: 720px) {
		.grid.cards {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
	.opt {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 8px;
		min-height: 56px;
		padding: 10px 14px;
		border-radius: var(--radius);
		border: 2px solid var(--line);
		border-bottom-width: 4px;
		background: var(--surface);
		color: var(--text);
		font: inherit;
		font-size: 1.1rem;
		text-align: left;
		cursor: pointer;
	}
	.cards .opt {
		padding: 8px;
		text-align: center;
	}
	.opt img,
	.noimg {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: var(--radius-s);
		background: var(--surface-2);
	}
	.label {
		display: flex;
		align-items: center;
		gap: 10px;
		font-weight: 600;
	}
	.cards .label {
		justify-content: center;
	}
	kbd {
		font: inherit;
		font-size: 0.75rem;
		color: var(--muted);
		border: 1px solid var(--line);
		border-radius: 6px;
		padding: 0 6px;
	}
	.opt.picked {
		border-color: var(--brand);
		background: var(--brand-soft);
	}
	.opt.right {
		border-color: var(--ok);
		background: var(--ok-soft);
	}
	.opt.wrong {
		border-color: var(--bad);
		background: var(--bad-soft);
	}
	.opt:disabled {
		cursor: default;
	}
	@media (pointer: coarse) {
		kbd {
			display: none;
		}
	}
</style>
