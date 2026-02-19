<script lang="ts">
  import { onMount } from 'svelte';
  import { marked } from 'marked';

  let content = '';

  onMount(async () => {
    try {
      const response = await fetch('/imprint.md');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      content = marked(text);
    } catch (error) {
      console.error("Error:Couldn't fetch imprint data:", error);
      content = "<p>Error: Imprint was not loaded.</p>";
    }
  });
</script>

<h1>Imprint</h1>
<div>{@html content}</div>
