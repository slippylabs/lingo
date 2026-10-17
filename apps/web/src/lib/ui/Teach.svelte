<script lang="ts">
	// slippylabs: the "new word" card. Nothing is tested before the learner has
	// seen it here: picture, the word, its sound, its meaning, and an example
	// sentence from the same lesson that uses it.
	import { onMount } from 'svelte';
	import { glossPhrase, glossText } from '../../learn/dictionary';
	import { voice } from '../sound';
	import Gloss from './Gloss.svelte';
	import Icon from './Icon.svelte';
	import type { IndexItem, PhraseWord } from '../../learn/types';
	import type { Env } from './types';

	let {
		item,
		example,
		gloss,
		env
	}: { item: IndexItem; example?: IndexItem; gloss?: PhraseWord[]; env: Env } = $props();

	const play = (a?: string, rate = 1) => {
		if (env.audio) voice(a, rate);
	};
	onMount(() => {
		play(item.a);
	});
	const words = gloss?.length ? glossPhrase(gloss) : glossText(item.t, env.dict);
</script>

<div class="teach card">
	<span class="pill brand">{item.k === 'w' ? 'New word' : 'New phrase'}</span>
	{#if item.p}
		<img class="pic" src={`/images/${item.p}`} alt="" />
	{/if}
	<div class="word-row">
		<h2 class="word" lang={env.lang} data-test="teach-word">{item.t}</h2>
		{#if env.audio && item.a}
			<button type="button" class="icon-btn" onclick={() => play(item.a)} aria-label="Listen">
				<Icon name="speaker" />
			</button>
			<button type="button" class="icon-btn" onclick={() => play(item.a, 0.7)} aria-label="Listen slowly">
				<Icon name="slow" />
			</button>
		{/if}
	</div>
	<p class="meaning" lang="en">{item.m}</p>
	{#if item.alt?.length}
		<p class="muted small">Also correct: <span lang={env.lang}>{item.alt.join(', ')}</span></p>
	{/if}

	{#if item.k === 'p' && words.some((w) => w.defs.length)}
		<div class="breakdown">
			<p class="label">Word by word <span class="muted">(tap a word)</span></p>
			<p class="phrase"><Gloss {words} lang={env.lang} big /></p>
		</div>
	{/if}

	{#if example}
		<div class="example">
			<p class="label">In a sentence</p>
			<p class="ex-row">
				<span lang={env.lang}><Gloss words={glossText(example.t, env.dict)} lang={env.lang} /></span>
				{#if env.audio && example.a}
					<button type="button" class="icon-btn" onclick={() => play(example.a)} aria-label="Listen to the sentence">
						<Icon name="speaker" size={20} />
					</button>
				{/if}
			</p>
			<p class="muted" lang="en">{example.m}</p>
		</div>
	{/if}
</div>

<style>
	.teach {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 6px;
		padding: 20px;
	}
	.pic {
		width: min(240px, 60vw);
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: var(--radius);
		margin: 8px 0;
		align-self: center;
	}
	.word-row {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-wrap: wrap;
	}
	.word {
		font-size: clamp(2rem, 8vw, 2.8rem);
		margin: 0 8px 0 0;
		overflow-wrap: anywhere;
	}
	.meaning {
		font-size: 1.3rem;
		font-weight: 600;
		margin: 0;
	}
	.label {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
		margin: 0;
	}
	.breakdown,
	.example {
		width: 100%;
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid var(--line);
	}
	.phrase,
	.ex-row {
		font-size: 1.2rem;
		margin: 0;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 4px;
	}
</style>
