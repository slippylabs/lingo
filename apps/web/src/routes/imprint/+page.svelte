<script lang="ts">
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  let content = '';

  onMount(async () => {
    const response = await fetch('/imprint.md');
    const text = await response.text();
    content = marked(text);
  });
</script>

<h1>Imprint</h1>
<div>{@html content}</div>
