<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import InfoModal from '$lib/components/InfoModal.svelte';
  import RecipeModal from '$lib/components/RecipeModal.svelte';
  import { planStore } from '$lib/stores/plan';
  import { markedRecipes } from '$lib/stores/markedRecipes';
  import { getMonday, getWeekRangeString, formatLongDate, addDays, getDayName } from '$lib/utils/date';

  const BACKEND_URL = 'http://localhost:4000';

  let showInfoModal = false;
  let viewMode = 'week'; // 'today' or 'week'
  let currentDate = new Date();
  let monday = getMonday(currentDate);
  let favorites = [];
  let loadingFavorites = true;
  let selectedRecipe = null;
  let showRecipeModal = false;

  $: dateDisplay = viewMode === 'today' 
    ? formatLongDate(currentDate)
    : getWeekRangeString(monday);

  $: displayedMeals = getDisplayedMeals($planStore, viewMode, currentDate, monday);

  function getDisplayedMeals(plan, mode, todayDate, weekMonday) {
    if (!plan || !plan.meals) return [];
    
    if (mode === 'today') {
      const todayStr = formatLongDate(todayDate);
      return plan.meals.filter(meal => {
        const mealDateStr = formatLongDate(parseMealDate(meal.date));
        return mealDateStr === todayStr;
      });
    } else {
      // For week view, show meals that fall within the selected week
      const weekEnd = addDays(weekMonday, 6);
      return plan.meals.filter(meal => {
        const mealDate = parseMealDate(meal.date);
        return mealDate >= weekMonday && mealDate <= weekEnd;
      });
    }
  }

  function parseMealDate(dateStr) {
    // dateStr format is like "Feb 3" or "Jan 27"
    const parts = dateStr.split(' ');
    const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const month = monthMap[parts[0]];
    const day = parseInt(parts[1]);
    const year = new Date().getFullYear();
    return new Date(year, month, day);
  }

  function viewRecipe(recipe) {
    selectedRecipe = recipe;
    showRecipeModal = true;
  }

  onMount(async () => {
    await loadFavorites();
  });

  async function loadFavorites() {
    loadingFavorites = true;
    try {
      const favs = [];
      // Fetch 6 random recipes for favorites
      for (let i = 0; i < 6; i++) {
        const res = await fetch(`${BACKEND_URL}/api/recipes/random`);
        if (res.ok) {
          const data = await res.json();
          if (data.recipe) {
            favs.push(data.recipe);
          }
        }
      }
      favorites = favs;
    } catch (error) {
      console.error('Failed to load favorites:', error);
      favorites = [];
    } finally {
      loadingFavorites = false;
    }
  }

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
    if (mode === 'today') {
      currentDate = new Date();
    }
  }
</script>

<svelte:head>
  <title>Prepper - Home</title>
</svelte:head>

<div class="home-page">
  <header class="header">
    <h1 class="logo">🌶️ P<span class="green-r">r</span>epper</h1>
    <div class="header-actions">
      <button class="icon-btn" aria-label="Search" on:click={() => goto('/search')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
      <button class="icon-btn" aria-label="Profile" on:click={() => goto('/profile')}>
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

    <!-- Meal Plan Display -->
    {#if displayedMeals.length > 0}
      {#if viewMode === 'today'}
        <div class="meal-plan-container">
          {#each displayedMeals as meal}
            <button class="meal-plan-card" on:click={() => viewRecipe(meal.mainDish)}>
              {#if meal.mainDish.image}
                <div class="meal-plan-image">
                  <img src={meal.mainDish.image} alt={meal.mainDish.title} />
                </div>
              {/if}
              <div class="meal-plan-info">
                <h3 class="meal-plan-title">{meal.mainDish.title}</h3>
              </div>
            </button>
          {/each}
        </div>
      {:else}
        <!-- Week View: Compact List -->
        <div class="week-plan-container">
          {#each displayedMeals as meal}
            <button class="week-plan-row" on:click={() => viewRecipe(meal.mainDish)}>
              <span class="week-day-name">{meal.dayName}</span>
              <span class="week-recipe-name">{meal.mainDish.title}</span>
            </button>
          {/each}
        </div>
      {/if}
    {:else}
      <!-- Empty State Card -->
      <div class="empty-state-card">
        <div class="pepper-pattern"></div>
        <p class="empty-text">Nothing planned yet.</p>
      </div>
    {/if}

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
        {#if loadingFavorites}
          {#each Array(6) as _, i}
            <div class="favorite-card">
              <div class="favorite-image loading-shimmer"></div>
              <p class="favorite-name loading-shimmer-text">Loading...</p>
            </div>
          {/each}
        {:else if favorites.length > 0}
          {#each favorites as favorite}
            <div class="favorite-card">
              <button class="favorite-card-btn" on:click={() => viewRecipe(favorite)}>
                <div class="favorite-image">
                  {#if favorite.image}
                    <img src={favorite.image} alt={favorite.title} />
                  {:else}
                    <div class="placeholder-image">
                      <span class="placeholder-text">No Image</span>
                    </div>
                  {/if}
                </div>
                <p class="favorite-name">{favorite.title}</p>
              </button>
              <button 
                class="star-btn-favorite" 
                on:click={() => markedRecipes.toggle(favorite)}
                aria-label={markedRecipes.isMarked($markedRecipes, favorite.id) ? 'Unmark recipe' : 'Mark recipe'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={markedRecipes.isMarked($markedRecipes, favorite.id) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            </div>
          {/each}
        {:else}
          <p class="empty-favorites">Unable to load favorites. Please check your connection.</p>
        {/if}
      </div>
    </section>
  </div>
</div>

<InfoModal bind:show={showInfoModal} />
{#if selectedRecipe}
  <RecipeModal recipe={selectedRecipe} bind:show={showRecipeModal} />
{/if}

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
    font-size: clamp(1.5rem, 5vw, 1.875rem);
    font-family: 'Otomanopee One', sans-serif;
    font-weight: 400;
    margin: 0;
    color: #C33C44;
  }

  .green-r {
    color: #7CB342;
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
    margin: var(--spacing-sm) 0 var(--spacing-sm) 0;
    background: var(--color-green-light);
    padding: 4px;
    border-radius: 100px;
  }

  .toggle-btn {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    background: transparent;
    border: none;
    border-radius: 100px;
    font-weight: 500;
    color: var(--color-text);
    min-height: var(--min-touch-target);
  }

  .toggle-btn.active {
    background: var(--color-green);
    color: white;
    box-shadow: var(--shadow-sm);
  }

  .date-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
    margin-bottom: var(--spacing-sm);
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
    background: var(--color-yellow);
    border: none;
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    text-align: left;
    color: var(--color-text);
    box-shadow: none;
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
    background: #f0d995;
  }

  .empty-state-card {
    background: var(--color-pink);
    border-radius: var(--border-radius);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-lg);
    position: relative;
    overflow: hidden;
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pepper-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.3;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 35px,
      rgba(200, 100, 100, 0.1) 35px,
      rgba(200, 100, 100, 0.1) 70px
    );
  }

  .empty-text {
    position: relative;
    z-index: 1;
    font-weight: 500;
    color: var(--color-text);
    font-size: 1rem;
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

  .meal-plan-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
  }

  .meal-plan-card {
    background: var(--color-pink);
    border: none;
    border-radius: var(--border-radius);
    overflow: hidden;
    text-align: left;
    cursor: pointer;
    padding: 0;
    transition: transform 0.2s;
  }

  .meal-plan-card:hover {
    transform: translateY(-2px);
  }

  .meal-plan-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
  }

  .meal-plan-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .meal-plan-info {
    padding: var(--spacing-md);
  }

  .meal-plan-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .week-plan-container {
    background: var(--color-pink);
    border-radius: var(--border-radius);
    overflow: hidden;
    margin-bottom: var(--spacing-lg);
  }

  .week-plan-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
  }

  .week-plan-row:last-child {
    border-bottom: none;
  }

  .week-plan-row:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .week-day-name {
    font-weight: 600;
    color: var(--color-red);
    font-size: 0.9375rem;
    min-width: 100px;
  }

  .week-recipe-name {
    font-size: 0.9375rem;
    color: var(--color-text);
    flex: 1;
    text-align: right;
  }

  .favorites-section {
    margin-bottom: var(--spacing-xl);
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
    position: relative;
  }

  @media (min-width: 640px) {
    .favorite-card {
      width: 140px;
    }
  }

  .favorite-card-btn {
    width: 100%;
    border: none;
    padding: 0;
    background: none;
    cursor: pointer;
    text-align: center;
  }

  .star-btn-favorite {
    position: absolute;
    top: var(--spacing-xs);
    right: var(--spacing-xs);
    background: none;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-orange);
    cursor: pointer;
    z-index: 1;
    transition: transform 0.2s;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  .star-btn-favorite:hover {
    transform: scale(1.15);
  }

  .favorite-image {
    width: 100%;
    aspect-ratio: 1;
    border-radius: var(--border-radius);
    overflow: hidden;
    margin-bottom: var(--spacing-xs);
    background: var(--color-yellow);
    border: 2px solid var(--color-border);
  }

  .placeholder-image {
    width: 100%;
    height: 100%;
    background: var(--color-yellow);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-text {
    font-size: 0.75rem;
    color: var(--color-text-light);
    text-align: center;
    line-height: 1.3;
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
    color: var(--color-text);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty-favorites {
    color: var(--color-text-light);
    font-size: 0.875rem;
    padding: var(--spacing-md);
  }

  .loading-shimmer {
    animation: shimmer 1.5s infinite;
    background: linear-gradient(
      90deg,
      var(--color-yellow) 0%,
      #f0dda5 50%,
      var(--color-yellow) 100%
    );
    background-size: 200% 100%;
  }

  .loading-shimmer-text {
    height: 1rem;
    background: var(--color-bg-light);
    border-radius: 4px;
    animation: shimmer 1.5s infinite;
    background: linear-gradient(
      90deg,
      var(--color-bg-light) 0%,
      #e8e8e8 50%,
      var(--color-bg-light) 100%
    );
    background-size: 200% 100%;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
