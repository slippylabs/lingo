<script lang="ts">
	// slippylabs: the two typing exercises. "shortInput": see the English word
	// (and its picture), type it in the target language. "listeningExercise":
	// hear it, type it. A hint is always one tap away, and using it is honest:
	// the word then stays in its review box instead of moving up.
	import { onMount, tick } from 'svelte';
	import { checkTyped } from '../../learn/check';
	import { glossText } from '../../learn/dictionary';
	import { voice } from '../sound';
	import Icon from './Icon.svelte';
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

	const listening = ch.type === 'listeningExercise';
	const valid = listening
		? [String(ch.answer ?? '')]
		: Array.isArray(ch.formInTargetLanguage)
			? ch.formInTargetLanguage
			: [String(ch.formInTargetLanguage ?? '')];
	const english = listening ? (ch.meaning ?? '') : (ch.phrase ?? []).map((p) => p.word).join(' ');
	const picture = !listening && ch.pictures?.length ? ch.pictures[Math.floor(Math.random() * ch.pictures.length)] : null;

	let value = $state('');
	let hint = $state('');
	let input: HTMLInputElement | undefined = $state();
	$effect(() => onready(value.trim().length > 0));

	/** "perro" -> "p _ _ _ _", spaces and punctuation kept */
	const pattern = (s: string) =>
		[...s].map((c, i) => (i === 0 || !/\p{L}/u.test(c) ? c : '_')).join(' ');

	function showHint() {
		hint = listening ? `It means “${english}”` : `Starts like: ${pattern(valid[0])}`;
		onhint();
		input?.focus();
	}

	function insert(c: string) {
		if (!input || locked) return;
		const a = input.selectionStart ?? value.length;
		const b = input.selectionEnd ?? value.length;
		value = value.slice(0, a) + c + value.slice(b);
		tick().then(() => {
			input?.focus();
			input?.setSelectionRange(a + c.length, a + c.length);
		});
	}

	export function check(): Feedback {
		const v = checkTyped(value, valid, env.known);
		return {
			ok: v.ok,
			kind: v.kind,
			expected: v.expected,
			given: value,
			meaning: english,
			gloss: glossText(v.expected, env.dict),
			targetAnswer: true,
			audio: ch.audio
		};
	}

	const play = (rate = 1) => voice(ch.audio, rate);

	onMount(() => {
		if (listening) play();
		setTimeout(() => input?.focus(), 50);
	});
</script>

<div class="prompt">
	{#if listening}
		<p class="kicker">Type what you hear in {env.languageName}</p>
		<div class="listen">
			<button type="button" class="play" onclick={() => play()} aria-label="Play again" data-audio={ch.audio}>
				<Icon name="speaker" size={34} />
			</button>
			<button type="button" class="btn ghost" onclick={() => play(0.7)} aria-label="Play slowly">
				<Icon name="slow" /> Slower
			</button>
		</div>
	{:else}
		<p class="kicker">Write this in {env.languageName}</p>
		<div class="ask-row">
			{#if picture}<img class="pic" src={`/images/${picture}`} alt="" />{/if}
			<h2 class="ask" lang="en">“{english}”</h2>
		</div>
	{/if}
</div>

<input
	bind:this={input}
	bind:value
	type="text"
	lang={env.lang}
	disabled={locked}
	placeholder={`Type in ${env.languageName}…`}
	autocomplete="off"
	autocapitalize="none"
	spellcheck="false"
	enterkeyhint="done"
	data-test="answer"
/>

{#if !locked && env.special.length}
	<div class="keys" aria-label="Special letters">
		{#each env.special.filter((c) => c === c.toLowerCase() || !env.special.includes(c.toLowerCase())) as c}
			<button type="button" class="key" tabindex="-1" onmousedown={(e) => e.preventDefault()} onclick={() => insert(c)}>{c}</button>
		{/each}
	</div>
{/if}

<div class="hint-row">
	{#if hint}
		<p class="hint" lang={listening ? 'en' : env.lang}><Icon name="bulb" size={18} /> {hint}</p>
	{:else if !locked && env.hints}
		<button type="button" class="btn ghost small-btn" onclick={showHint}><Icon name="bulb" size={18} /> Hint</button>
	{/if}
</div>

<style>
	.kicker {
		color: var(--muted);
		font-weight: 650;
		margin: 0 0 6px;
	}
	.ask-row {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 14px;
	}
	.pic {
		width: 96px;
		height: 96px;
		object-fit: cover;
		border-radius: var(--radius-s);
		flex: none;
	}
	.ask {
		font-size: clamp(1.4rem, 5vw, 2rem);
		margin: 0;
	}
	.listen {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 6px 0 16px;
	}
	.play {
		width: 76px;
		height: 76px;
		border-radius: 20px;
		border: 0;
		border-bottom: 4px solid rgba(0, 0, 0, 0.2);
		background: var(--brand);
		color: var(--brand-ink);
		display: grid;
		place-items: center;
		cursor: pointer;
	}
	.keys {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 10px;
	}
	.key {
		min-width: 44px;
		min-height: 44px;
		border-radius: 10px;
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--text);
		font: inherit;
		font-size: 1.1rem;
		cursor: pointer;
	}
	.hint-row {
		margin-top: 12px;
		min-height: 44px;
	}
	.hint {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--warn);
		background: var(--warn-soft);
		border-radius: var(--radius-s);
		padding: 8px 12px;
		font-weight: 650;
		margin: 0;
		letter-spacing: 0.02em;
	}
	.small-btn {
		min-height: 44px;
		font-size: 0.95rem;
	}
</style>
