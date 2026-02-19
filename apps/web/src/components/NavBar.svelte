<script lang="ts">
  import NavBar from 'components/DeprecatedNavBar/NavBar.svelte';
  import NavBarButton from 'components/DeprecatedNavBar/NavBarButton.svelte';
  import Logo from 'components/Logo.svelte';
  import NavBarButtonSet from 'components/DeprecatedNavBar/NavBarButtonSet.svelte';
</script>

<NavBar>
  <div slot="left">
    <Logo src="/images/logo.svg" alt="LibreLingo" link="/" />
  </div>
  <div slot="right">
    <NavBarButtonSet>
      <!-- Temporär keine Links zu Imprint/Privacy -->
    </NavBarButtonSet>
  </div>
</NavBar>
