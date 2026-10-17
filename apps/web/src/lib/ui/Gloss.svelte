<script lang="ts" module>
	// only one bubble open at a time, across every Gloss on the page
	let closeOpen: (() => void) | null = null;
</script>

<script lang="ts">
	import type { Glossed } from '../../learn/dictionary';
	let {
		words,
		lang = '',
		onpeek,
		big = false
	}: { words: Glossed[]; lang?: string; onpeek?: () => void; big?: boolean } = $props();

	let open = $state(-1);
	function toggle(i: number) {
		if (open === i) {
			open = -1;
			return;
		}
		closeOpen?.();
		open = i;
		closeOpen = () => (open = -1);
		onpeek?.();
	}
	/** keep the bubble on screen when the word is near an edge */
	function fit(el: HTMLElement) {
		const r = el.getBoundingClientRect();
		const vw = document.documentElement.clientWidth;
		if (r.left < 8) el.style.transform = `translateX(calc(-50% + ${8 - r.left}px))`;
		else if (r.right > vw - 8) el.style.transform = `translateX(calc(-50% - ${r.right - vw + 8}px))`;
	}
	function onWindow(e: MouseEvent) {
		if (open >= 0 && !(e.target as HTMLElement).closest?.('.g-word')) open = -1;
	}
</script>

<svelte:window onclick={onWindow} onkeydown={(e) => e.key === 'Escape' && (open = -1)} />

<span class="gloss" class:big {lang}>
	{#each words as w, i}
		{#if w.defs.length}
			<span class="g-word">
				<button
					type="button"
					class="has"
					aria-expanded={open === i}
					onclick={() => toggle(i)}>{w.word}</button
				>{#if open === i}<span class="bubble" role="tooltip" use:fit lang="en">{w.defs.join(' · ')}</span>{/if}
			</span>
		{:else}
			<span class="plain">{w.word}</span>
		{/if}{' '}
	{/each}
</span>

<style>
	.gloss {
		line-height: 1.9;
	}
	.g-word {
		position: relative;
		display: inline-block;
	}
	.has {
		font: inherit;
		color: inherit;
		background: none;
		border: 0;
		padding: 2px 1px;
		min-height: 36px;
		cursor: pointer;
		text-decoration: underline dotted;
		text-decoration-color: var(--brand);
		text-underline-offset: 5px;
		text-decoration-thickness: 2px;
	}
	.big .has {
		min-height: 44px;
	}
	.has[aria-expanded='true'] {
		color: var(--brand);
	}
	.bubble {
		position: absolute;
		top: calc(100% + 2px);
		left: 50%;
		transform: translateX(-50%);
		z-index: 30;
		background: var(--text);
		color: var(--bg);
		font-size: 0.9rem;
		font-weight: 600;
		line-height: 1.3;
		padding: 6px 10px;
		border-radius: 8px;
		white-space: nowrap;
		max-width: 70vw;
		overflow: hidden;
		text-overflow: ellipsis;
		box-shadow: var(--shadow);
	}
</style>
