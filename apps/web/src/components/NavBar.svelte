<script lang="ts">
  import { page } from '$app/state';
  import settings from '../settings';
  import authStore from '../auth';
  import NavBar from 'components/DeprecatedNavBar/NavBar.svelte';
  import Icon from 'components/Icon.svelte';
  import NavBarButton from 'components/DeprecatedNavBar/NavBarButton.svelte';
  import Logo from 'components/Logo.svelte';
  import NavBarItem from 'components/DeprecatedNavBar/NavBarItem.svelte';
  import NavBarButtonSet from 'components/DeprecatedNavBar/NavBarButtonSet.svelte';

  export let hasAuth = false;
  export let repositoryURL = null;

  type WindowWithLogout = Window & {
    _Logout: () => void;
  };
  const _Logout = () => (window as unknown as WindowWithLogout)._Logout();
  let gistId = page.url.searchParams.get('gistId');
  const homepageLink = `/course/${page.params?.courseName}/`;
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
      <!-- Korrigierte Links zu den Routen /imprint und /privacy -->
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
