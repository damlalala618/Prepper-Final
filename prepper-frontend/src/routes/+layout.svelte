<script>
  import { onMount } from 'svelte';
  import '../app.css';
  import SplashScreen from '$lib/components/SplashScreen.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import AIAssistant from '$lib/components/AIAssistant.svelte';
  import ProfileSetup from '$lib/components/ProfileSetup.svelte';
  import { getItem, getSessionItem } from '$lib/utils/storage';

  let showAI = false;
  let showProfileSetup = false;
  let splashDismissed = false;

  onMount(() => {
    // Check if splash screen has been dismissed
    const dismissed = getSessionItem('prepper_splash_dismissed', false);
    splashDismissed = dismissed;

    // If splash is already dismissed, check for profile immediately
    if (dismissed) {
      checkProfile();
    } else {
      // Wait for splash to be dismissed, then check profile
      const checkInterval = setInterval(() => {
        const nowDismissed = getSessionItem('prepper_splash_dismissed', false);
        if (nowDismissed) {
          splashDismissed = true;
          clearInterval(checkInterval);
          checkProfile();
        }
      }, 100);
    }
  });

  function checkProfile() {
    const profile = getItem('user_profile');
    if (!profile) {
      showProfileSetup = true;
    }
  }

  function toggleAI() {
    showAI = !showAI;
  }
</script>

<SplashScreen />

<main>
  <slot />
</main>

<BottomNav />

<!-- Floating AI Assistant Button -->
<button class="ai-fab" on:click={toggleAI} aria-label="Pep - AI Assistant">
  🌶️
</button>

<AIAssistant bind:show={showAI} />
<ProfileSetup bind:show={showProfileSetup} />

<style>
  main {
    min-height: 100vh;
    /* Ensure content isn't hidden behind bottom nav */
    padding-bottom: var(--bottom-nav-height);
  }

  .ai-fab {
    position: fixed;
    bottom: calc(var(--bottom-nav-height) + var(--spacing-lg));
    right: var(--spacing-lg);
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--color-green);
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ai-fab:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .ai-fab:active {
    transform: scale(0.95);
  }
</style>
