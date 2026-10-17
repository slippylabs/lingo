<script lang="ts">
	import Card from 'components/Card.svelte';
	import Stack from 'components/Stack.svelte';

	let {
		active,
		inactive,
		correct,
		number,
		picture,
		formInTargetLanguage
	}: {
		active: boolean;
		inactive: boolean;
		correct: boolean;
		number: number;
		picture: string | null;
		formInTargetLanguage: string;
	} = $props();
</script>

<!-- slippylabs: courses without images export cards with pictures: null; show
     those as text-only cards instead of a broken /images/null. -->
{#snippet pictureMedia()}
	<div>
		<img src={`/images/${picture}`} alt="" data-test={`card-img-${number}`} />
	</div>
{/snippet}

{#snippet wordFooter()}
	<div class:text-only={!picture}>
		<Stack justify="center">
			<div data-test={`card-text-${number}`}>
				{formInTargetLanguage}
			</div>
		</Stack>
	</div>
{/snippet}

<li class:active class:inactive>
	<Card
		data-test={active ? 'active' : inactive ? 'inactive' : 'neutral'}
		data-test-correct={correct}
		media={picture ? pictureMedia : undefined}
		footer={wordFooter}
	/>
</li>

<style type="text/scss">
	.text-only {
		padding: 2em 0.5em;
		font-size: 1.4em;
		font-weight: 600;
		text-align: center;
	}

	li {
		border: 3px solid transparent;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 20em;
		margin: 0;
		transition:
			opacity 0.15s,
			border-color 0.2s;
		cursor: pointer;
		transition: transform 0.1s;
		background: white;
		overflow: hidden;
	}

	.lluis-card-image img {
		object-fit: cover;
		border-radius: 0;
		left: 8px;
		right: 8px;
		top: 8px;
		width: calc(100% - 16px);
	}

	li.inactive {
		opacity: 0.65;
		border-color: rgba(0, 0, 0, 0);
		transform: scale(0.95);
	}

	li:hover {
		border-color: $link-active-border;
	}

	li.active {
		border-color: $info;
		box-sizing: content-box;
		transform: scale(1.05);
	}
</style>
