<script lang="ts">
  import { page } from '$app/state';
  import NavBar from 'components/DeprecatedNavBar/NavBar.svelte';
  import NavBarButton from 'components/DeprecatedNavBar/NavBarButton.svelte';
  import NavBarButtonSet from 'components/DeprecatedNavBar/NavBarButtonSet.svelte';
  import Logo from 'components/Logo.svelte';

  export let hasAuth = false;
  export let repositoryURL = null;

  let courseName = page.params?.courseName || '';
  const homepageLink = `/course/${courseName}`;
</script>

<NavBar>
  <div slot="left">
    <Logo src="/images/logo.svg" alt="LibreLingo" link={homepageLink} />
  </div>

  <div slot="right">
    <NavBarButtonSet>
      {#if repositoryURL}
        <NavBarButton href={repositoryURL} target="_blank">Course Feedback</NavBarButton>
      {/if}
      <!-- Links zu Imprint und Privacy (ohne .md) -->
      <NavBarButton href="/imprint">Imprint</NavBarButton>
      <NavBarButton href="/privacy">Privacy</NavBarButton>
    </NavBarButtonSet>
  </div>
</NavBar>

<style>
  div {
    height: 100%;
  }
</style>
