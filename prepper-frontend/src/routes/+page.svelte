<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import InfoModal from '$lib/components/InfoModal.svelte';
  import { getMonday, getWeekRangeString, formatLongDate, addDays, getDayName } from '$lib/utils/date';

  let showInfoModal = false;
  let viewMode = 'week'; // 'today' or 'week'
  let currentDate = new Date();
  let monday = getMonday(currentDate);

  $: dateDisplay = viewMode === 'today' 
    ? formatLongDate(currentDate)
    : getWeekRangeString(monday);

  function navigatePrev() {
    if (viewMode === 'today') {
      currentDate = addDays(currentDate, -1);
    } else {
      monday = addDays(monday, -7);
    }
  }

  function navigateNext() {
    if (viewMode === 'today') {
      currentDate = addDays(currentDate, 1);
    } else {
      monday = addDays(monday, 7);
    }
  }

  function setViewMode(mode) {
    viewMode = mode;
  }

  // Mock favorites data
  const favorites = [
    { id: 1, name: 'Chicken Tikka', image: '' },
    { id: 2, name: 'Pasta Primavera', image: '' },
    { id: 3, name: 'Beef Stir Fry', image: '' },
    { id: 4, name: 'Greek Salad', image: '' },
    { id: 5, name: 'Fish Tacos', image: '' },
    { id: 6, name: 'Veggie Curry', image: '' }
  ];
</script>

<svelte:head>
  <title>Prepper - Home</title>
</svelte:head>

<div class="home-page">
  <header class="header">
    <h1 class="logo">Prepper</h1>
    <div class="header-actions">
      <button class="icon-btn" aria-label="Search">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
      <button class="icon-btn" aria-label="Profile">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </button>
    </div>
  </header>

  <div class="container">
    <div class="view-toggle">
      <button 
        class="toggle-btn" 
        class:active={viewMode === 'today'}
        on:click={() => setViewMode('today')}
      >
        Today
      </button>
      <button 
        class="toggle-btn" 
        class:active={viewMode === 'week'}
        on:click={() => setViewMode('week')}
      >
        Week
      </button>
    </div>

    <div class="date-navigation">
      <button class="nav-btn" on:click={navigatePrev} aria-label="Previous">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <span class="date-label">{dateDisplay}</span>
      <button class="nav-btn" on:click={navigateNext} aria-label="Next">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

    <button class="info-card" on:click={() => showInfoModal = true}>
      <span>How does Prepper work?</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>

    <button class="btn-primary cta-button" on:click={() => goto('/plan')}>
      Start Planning
    </button>

    <section class="favorites-section">
      <h2>Prepper Favorites</h2>
      <div class="favorites-scroll">
        {#each favorites as favorite}
          <div class="favorite-card">
            <div class="favorite-image">
              {#if favorite.image}
                <img src={favorite.image} alt={favorite.name} />
              {:else}
                <div class="placeholder-image"></div>
              {/if}
            </div>
            <p class="favorite-name">{favorite.name}</p>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>

<InfoModal bind:show={showInfoModal} />

<style>
  .home-page {
    background: var(--color-bg-secondary);
    min-height: 100vh;
  }

  .header {
    background: white;
    border-bottom: 1px solid var(--color-border);
    padding: var(--spacing-md) var(--spacing-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  @media (min-width: 640px) {
    .header {
      padding: var(--spacing-md) var(--spacing-lg);
    }
  }

  .logo {
    font-size: clamp(1.25rem, 4vw, 1.5rem);
    font-weight: 700;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-xs);
  }

  @media (min-width: 640px) {
    .header-actions {
      gap: var(--spacing-sm);
    }
  }

  .icon-btn {
    background: none;
    border: none;
    padding: var(--spacing-xs);
    color: var(--color-text);
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .view-toggle {
    display: flex;
    gap: var(--spacing-xs);
    margin: var(--spacing-lg) 0;
    background: var(--color-bg-light);
    padding: 4px;
    border-radius: var(--border-radius);
  }

  .toggle-btn {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    background: transparent;
    border: none;
    border-radius: calc(var(--border-radius) - 2px);
    font-weight: 500;
    color: var(--color-text-light);
  }

  .toggle-btn.active {
    background: white;
    color: var(--color-text);
    box-shadow: var(--shadow-sm);
  }

  .date-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 0;
    margin-bottom: var(--spacing-lg);
  }

  .nav-btn {
    background: none;
    border: none;
    padding: var(--spacing-xs);
    color: var(--color-text);
  }

  .date-label {
    font-weight: 500;
    font-size: 1rem;
  }

  .info-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background: white;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    text-align: left;
    color: var(--color-text);
    box-shadow: var(--shadow-sm);
    min-height: var(--min-touch-target);
    font-size: 0.9375rem;
  }

  @media (min-width: 640px) {
    .info-card {
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: 1rem;
    }
  }

  .info-card:hover {
    background: var(--color-bg-light);
  }

  .cta-button {
    margin-bottom: var(--spacing-xl);
    font-size: 1rem;
  }

  @media (min-width: 640px) {
    .cta-button {
      font-size: 1.125rem;
    }
  }

  .favorites-section h2 {
    font-size: clamp(1.125rem, 4vw, 1.5rem);
    margin-bottom: var(--spacing-md);
  }

  .favorites-scroll {
    display: flex;
    gap: var(--spacing-md);
    overflow-x: auto;
    padding-bottom: var(--spacing-md);
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
  }

  .favorite-card {
    flex-shrink: 0;
    width: 120px;
    scroll-snap-align: start;
  }

  @media (min-width: 640px) {
    .favorite-card {
      width: 140px;
    }
  }

  .favorite-image {
    width: 100%;
    aspect-ratio: 1;
    border-radius: var(--border-radius);
    overflow: hidden;
    margin-bottom: var(--spacing-xs);
  }

  .placeholder-image {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
  }

  .favorite-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .favorite-name {
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
  }
</style>
