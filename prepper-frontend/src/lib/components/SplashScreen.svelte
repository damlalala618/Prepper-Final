<script>
  import { onMount } from 'svelte';
  import { getSessionItem, setSessionItem } from '../utils/storage';

  let show = false;

  onMount(() => {
    const dismissed = getSessionItem('prepper_splash_dismissed', false);
    if (!dismissed) {
      show = true;
    }
  });

  function dismiss() {
    setSessionItem('prepper_splash_dismissed', true);
    show = false;
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dismiss();
    }
  }
</script>

{#if show}
  <div 
    class="splash" 
    on:click={dismiss}
    on:keydown={handleKeydown}
    role="button"
    tabindex="0"
    aria-label="Dismiss splash screen"
  >
    <div class="content">
      <h1 class="brand">Prepper</h1>
      <p class="tagline-main">Plan. Prep. Plate.</p>
      <p class="tagline-sub">Meal Prepping made simple</p>
      <p class="hint">Tap anywhere to continue</p>
    </div>
  </div>
{/if}

<style>
  .splash {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    cursor: pointer;
    padding: var(--spacing-md);
  }

  .content {
    text-align: center;
    padding: var(--spacing-lg);
    max-width: 90%;
  }

  @media (min-width: 640px) {
    .content {
      padding: var(--spacing-xl);
    }
  }

  .brand {
    font-size: clamp(2.5rem, 10vw, 3.5rem);
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: var(--spacing-lg);
  }

  @media (min-width: 640px) {
    .brand {
      margin-bottom: 1.5rem;
    }
  }

  .tagline-main {
    font-size: clamp(1.125rem, 4vw, 1.5rem);
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .tagline-sub {
    font-size: clamp(1rem, 3vw, 1.125rem);
    color: var(--color-text-light);
    margin-bottom: 2rem;
  }

  @media (min-width: 640px) {
    .tagline-sub {
      margin-bottom: 3rem;
    }
  }

  .hint {
    font-size: 0.875rem;
    color: var(--color-text-light);
    opacity: 0.7;
  }
</style>
