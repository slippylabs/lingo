<script lang="ts">
  import { onMount } from 'svelte';

  let content = '';

  onMount(async () => {
    try {
      const response = await fetch('/imprint.md');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      content = await response.text();
    } catch (error) {
      console.error("Error couldn't load imprint:", error);
      content = "Error: Imprint was not loaded.";
    }
  });
</script>

<h1>Imprint</h1>
<pre>{content}</pre>
