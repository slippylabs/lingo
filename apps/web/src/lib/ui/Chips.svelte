<script lang="ts">
	// slippylabs: build the translation from word tiles. Tap a tile to add it,
	// tap it again in the answer to take it back. Words in the prompt can be
	// tapped for their meaning (counts as a hint).
	import { onMount } from 'svelte';
	import { checkChips } from '../../learn/check';
	import { glossPhrase, glossText } from '../../learn/dictionary';
	import { shuffle } from '../../learn/session';
	import Gloss from './Gloss.svelte';
	import type { Challenge } from '../../learn/types';
	import type { Env, Feedback } from './types';

	let {
		ch,
		env,
		locked,
		onready,
		onhint
	}: {
		ch: Challenge;
		env: Env;
		locked: boolean;
		onready: (r: boolean) => void;
		onhint: () => void;
	} = $props();

	const toSource = Boolean(ch.translatesToSourceLanguage);
	// A dash in a phrase ("Любовь — сильная эмоция") exports as an empty chip; never show a blank tile.
	const tiles = shuffle(
		(ch.chips ?? []).map((text, id) => ({ id, text })).filter((t) => t.text.trim())
	);
	let answer: number[] = $state([]);
	let bank = $derived(tiles.filter((t) => !answer.includes(t.id)));
	$effect(() => onready(answer.length > 0));

	const add = (id: number) => !locked && (answer = [...answer, id]);
	const remove = (id: number) => !locked && (answer = answer.filter((a) => a !== id));
	const text = (id: number) => tiles.find((t) => t.id === id)!.text;

	export function check(): Feedback {
		const words = answer.map(text);
		const ok = checkChips(words, ch.solutions ?? []);
		const expected = ch.formattedSolution ?? '';
		return {
			ok,
			kind: ok ? 'exact' : 'wrong',
			expected,
			given: words.join(' '),
			meaning: undefined, // the prompt already is the meaning
			gloss: toSource ? glossPhrase(ch.phrase) : glossText(expected, env.dict),
			targetAnswer: !toSource
		};
	}

	onMount(() => {
		const onKey = (e: KeyboardEvent) => {
			if (!locked && e.key === 'Backspace' && answer.length) answer = answer.slice(0, -1);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<div class="prompt">
	<p class="kicker">
		{toSource ? `Translate into ${env.source}` : `Say this in ${env.languageName}`}
		{#if env.hints}<span class="muted small">· tap a word to see its meaning</span>{/if}
	</p>
	<h2 class="ask">
		{#if env.hints}
			<Gloss words={glossPhrase(ch.phrase)} lang={toSource ? env.lang : 'en'} onpeek={onhint} big />
		{:else}
			<span lang={toSource ? env.lang : 'en'}>{(ch.phrase ?? []).map((p) => p.word).join(' ')}</span>
		{/if}
	</h2>
</div>

<div class="answer" aria-label="Your answer" lang={toSource ? 'en' : env.lang}>
	{#each answer as id (id)}
		<button type="button" class="tile" disabled={locked} onclick={() => remove(id)}>{text(id)}</button>
	{:else}
		<span class="placeholder muted">Tap the words below in order</span>
	{/each}
</div>

<div class="bank" lang={toSource ? 'en' : env.lang}>
	{#each bank as t (t.id)}
		<button type="button" class="tile" disabled={locked} onclick={() => add(t.id)} data-test="chip">{t.text}</button>
	{/each}
</div>

<style>
	.kicker {
		color: var(--muted);
		font-weight: 650;
		margin: 0 0 4px;
	}
	.ask {
		font-size: clamp(1.3rem, 4.5vw, 1.8rem);
		font-weight: 650;
	}
	.answer {
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
		gap: 8px;
		min-height: 112px;
		padding: 10px 0;
		border-bottom: 2px solid var(--line);
		background: repeating-linear-gradient(
			to bottom,
			transparent 0 55px,
			var(--line) 55px 56px
		);
	}
	.placeholder {
		align-self: center;
		padding: 0 4px;
	}
	.bank {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
		margin-top: 18px;
	}
	.tile {
		min-height: 46px;
		padding: 0 14px;
		border-radius: 12px;
		border: 2px solid var(--line);
		border-bottom-width: 4px;
		background: var(--surface);
		color: var(--text);
		font: inherit;
		font-size: 1.05rem;
		font-weight: 600;
		cursor: pointer;
	}
	.tile:disabled {
		cursor: default;
	}
</style>
