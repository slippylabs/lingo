<script lang="ts">
  import NavBar from 'components/NavBar.svelte';
  import Content from 'components/Content.svelte';

  export let readmeHTML: string;
  export let title: string | null;
  export let description: string | null = null;
</script>

<svelte:head>
  <title>{title}</title>
  {#if description}
    <meta name="description" content={description} />
  {/if}
</svelte:head>

<NavBar />

<!-- Flexibler Container mit voller Höhe -->
<section class="hero is-primary md-page" style="min-height: 100vh; display: flex; flex-direction: column;">
  <div class="hero-body" style="flex: 1; display: flex; flex-direction: column;">
    <div class="container" style="flex: 1; display: flex; flex-direction: column;">
      <h1 class="title">{title}</h1>
      <div class="section box" style="flex: 1; display: flex; flex-direction: column;">
        <!-- Markdown-Inhalt wird nur hier gerendert -->
        <Content style="flex: 1;">
          {@html readmeHTML}
        </Content>
        <!-- Buttons kommen über den Slot -->
        <slot />
      </div>
    </div>
  </div>
</section>
