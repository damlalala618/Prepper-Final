<script>
  import '../app.css';
  import SplashScreen from '$lib/components/SplashScreen.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
</script>

<SplashScreen />

<main>
  <slot />
</main>

<BottomNav />

<style>
  main {
    min-height: 100vh;
    /* Ensure content isn't hidden behind bottom nav */
    padding-bottom: var(--bottom-nav-height);
  }
</style>
