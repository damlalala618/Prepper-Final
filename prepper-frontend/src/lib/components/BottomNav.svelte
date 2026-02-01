<script>
  import { page } from '$app/stores';

  $: currentPath = $page.url.pathname;
</script>

<nav class="bottom-nav">
  <a href="/" class:active={currentPath === '/'}>
    <span class="label">Home</span>
  </a>
  <a href="/plan" class:active={currentPath === '/plan'}>
    <span class="label">Plan</span>
  </a>
  <a href="/prep" class:active={currentPath === '/prep'}>
    <span class="label">Prep</span>
  </a>
  <a href="/plate" class:active={currentPath === '/plate'}>
    <span class="label">Plate</span>
  </a>
</nav>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid var(--color-border);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0;
    z-index: 100;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    height: var(--bottom-nav-height);
    /* Prevent content from shifting */
    min-height: var(--bottom-nav-height);
  }

  a {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: var(--color-text-light);
    position: relative;
    /* Ensure adequate touch target */
    min-height: var(--min-touch-target);
    padding: var(--spacing-xs) 0;
    transition: color 0.2s ease;
    /* Remove default link styling */
    min-height: auto;
    height: 100%;
  }

  a.active {
    color: var(--color-primary);
  }

  a.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    max-width: 80px;
    height: 3px;
    background: var(--color-primary);
  }

  /* Active state for mobile tap */
  @media (hover: none) {
    a:active {
      background: var(--color-bg-light);
    }
  }

  .label {
    font-size: 0.75rem;
    font-weight: 500;
    margin-top: 2px;
  }

  @media (min-width: 640px) {
    .label {
      font-size: 0.875rem;
    }
  }
</style>
