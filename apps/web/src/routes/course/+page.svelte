<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/');
	});
</script>

<p>Redirecting to the homepage…</p>
