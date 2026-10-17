<script lang="ts">
	let { done, target, size = 64 }: { done: number; target: number; size?: number } = $props();
	const r = 26;
	const c = 2 * Math.PI * r;
	let frac = $derived(target ? Math.min(done / target, 1) : 0);
</script>

<div class="ring" style="width:{size}px;height:{size}px" role="img" aria-label="{done} of {target} exercises today">
	<svg viewBox="0 0 64 64" width={size} height={size}>
		<circle cx="32" cy="32" r={r} class="track" />
		<circle
			cx="32"
			cy="32"
			r={r}
			class="fill"
			class:full={frac >= 1}
			stroke-dasharray={c}
			stroke-dashoffset={c * (1 - frac)}
		/>
	</svg>
	<span>{frac >= 1 ? '✓' : `${Math.round(frac * 100)}%`}</span>
</div>

<style>
	.ring {
		position: relative;
		flex: none;
	}
	svg {
		transform: rotate(-90deg);
	}
	circle {
		fill: none;
		stroke-width: 7;
	}
	.track {
		stroke: var(--surface-2);
	}
	.fill {
		stroke: var(--brand);
		stroke-linecap: round;
		transition: stroke-dashoffset 0.4s ease;
	}
	.fill.full {
		stroke: var(--ok);
	}
	span {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-weight: 800;
		font-size: 0.85rem;
	}
</style>
