<script lang="ts">
	// slippylabs: what the learner sees after every answer. A miss shows the
	// right answer with the words they got wrong marked, what they wrote, the
	// meaning, and a word-by-word breakdown; a near miss says what was off.
	import { diffWords } from '../../learn/check';
	import { voice } from '../sound';
	import Gloss from './Gloss.svelte';
	import Icon from './Icon.svelte';
	import type { Env, Feedback } from './types';

	let {
		fb,
		env,
		notes,
		onnotes
	}: { fb: Feedback; env: Env; notes: boolean; onnotes: () => void } = $props();

	const title =
		fb.kind === 'exact'
			? 'Correct!'
			: fb.kind === 'accent'
				? 'Correct — mind the accents'
				: fb.kind === 'typo'
					? 'Correct — small typo'
					: 'Not quite';
	const diff = !fb.ok && fb.given ? diffWords(fb.given, fb.expected) : null;
	const breakdown = (fb.gloss ?? []).filter((g) => g.defs.length);
</script>

<div class="sheet" class:ok={fb.ok} class:bad={!fb.ok} role="status" aria-live="polite" data-test="feedback">
	<div class="wrap inner">
		<p class="title">
			<Icon name={fb.ok ? 'check' : 'x'} size={26} />
			{title}
		</p>
		{#if !fb.ok || fb.kind !== 'exact'}
			<p class="line">
				<span class="lbl">{fb.ok ? 'Spelled' : 'Correct answer'}:</span>
				<span class="answer" lang={fb.targetAnswer ? env.lang : 'en'}>
					{#if diff}
						{#each diff as part}<span class:miss={!part.ok}>{part.text}</span>{' '}{/each}
					{:else}
						{fb.expected}
					{/if}
				</span>
				{#if fb.audio && env.audio}
					<button type="button" class="icon-btn" onclick={() => voice(fb.audio)} aria-label="Listen"
						><Icon name="speaker" size={20} /></button
					>
				{/if}
			</p>
		{/if}
		{#if !fb.ok && fb.given}
			<p class="line small"><span class="lbl">You wrote:</span> <s>{fb.given}</s></p>
		{/if}
		{#if fb.meaning}
			<p class="line small"><span class="lbl">Meaning:</span> <span lang="en">{fb.meaning}</span></p>
		{/if}
		{#if !fb.ok && breakdown.length > 1}
			<p class="line small">
				<span class="lbl">Word by word:</span>
				<Gloss words={fb.gloss ?? []} lang={fb.targetAnswer ? env.lang : 'en'} />
			</p>
		{/if}
		{#if !fb.ok && notes}
			<button type="button" class="linkish" onclick={onnotes}><Icon name="book" size={18} /> Read the notes for this lesson</button>
		{/if}
	</div>
</div>

<style>
	.sheet {
		border-top: 2px solid;
		padding: 14px 0 6px;
	}
	.ok {
		background: var(--ok-soft);
		border-color: var(--ok);
		color: var(--text);
	}
	.bad {
		background: var(--bad-soft);
		border-color: var(--bad);
	}
	.inner {
		max-width: 720px;
	}
	.title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 1.25rem;
		font-weight: 800;
		margin: 0 0 4px;
	}
	.ok .title {
		color: var(--ok);
	}
	.bad .title {
		color: var(--bad);
	}
	.line {
		margin: 0 0 4px;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 4px 6px;
	}
	.lbl {
		font-weight: 700;
	}
	.answer {
		font-size: 1.15rem;
		font-weight: 700;
	}
	.miss {
		color: var(--bad);
		text-decoration: underline wavy;
		text-underline-offset: 4px;
	}
	.linkish {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		background: none;
		border: 0;
		padding: 0;
		color: var(--brand);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}
</style>
