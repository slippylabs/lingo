<script lang="ts">
  import { onMount } from 'svelte';

  let content = '';

  onMount(async () => {
    try {
      const response = await fetch('/privacy.md');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      content = await response.text();
    } catch (error) {
      console.error("Error: Could not load privacy site:", error);
      content = "Error: Could not load privacy site";
    }
  });
</script>

<h1>Privacy</h1>
<pre>{content}</pre>
