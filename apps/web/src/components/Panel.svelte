<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		background = 'default',
		left,
		right
	}: {
		background: 'default' | 'success' | 'failure' | 'info';
		left: Snippet;
		right: Snippet;
	} = $props();
</script>

<div class="panel" data-background={background}>
	<div class="content">
		<div class="left">{@render left()}</div>
		<div class="right">{@render right()}</div>
	</div>
</div>

<style>
	.panel {
		position: fixed;
		/* slippylabs: above the sitewide .sl-legal privacy bar (z-index 3),
		   which otherwise sat over Skip/Continue on short lesson screens */
		z-index: 10;
		display: block;
		left: 0;
		bottom: 0;
		right: 0;
		padding: var(--deprecated-spacing-medium);

		&[data-background='default'] {
			background: var(--deprecated-panel-background);
		}

		&[data-background='success'] {
			background: var(--deprecated-panel-background-success);
			color: var(--deprecated-panel-background);
		}

		&[data-background='failure'] {
			background: var(--deprecated-panel-background-failure);
			color: var(--deprecated-panel-background);
		}

		&[data-background='info'] {
			background: var(--deprecated-panel-background-info);
			color: var(--deprecated-panel-background);
		}

		.content {
			display: flex;
			max-width: 960px;
			margin: auto;

			.left {
				flex-grow: 1;
			}

			.right {
				flex-grow: 0;
			}
		}
	}
</style>
