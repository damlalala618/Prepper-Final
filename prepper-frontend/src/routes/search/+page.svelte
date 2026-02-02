<script>
  import { goto } from '$app/navigation';
  import RecipeModal from '$lib/components/RecipeModal.svelte';
  import { markedRecipes } from '$lib/stores/markedRecipes';

  const BACKEND_URL = 'http://localhost:4000';

  let searchQuery = '';
  let searchResults = [];
  let loading = false;
  let hasSearched = false;
  let selectedRecipe = null;
  let showRecipeModal = false;

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    loading = true;
    hasSearched = true;
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/recipes/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        searchResults = data.recipes || [];
      } else {
        searchResults = [];
      }
    } catch (error) {
      console.error('Search failed:', error);
      searchResults = [];
    } finally {
      loading = false;
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  function viewRecipe(recipe) {
    selectedRecipe = recipe;
    showRecipeModal = true;
  }

  function goBack() {
    goto('/');
  }
</script>

<svelte:head>
  <title>Search - Prepper</title>
</svelte:head>

<div class="search-page">
  <header class="search-header">
    <button class="back-btn" on:click={goBack}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <h1>Search Recipes</h1>
  </header>

  <div class="container">
    <div class="search-bar">
      <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        class="search-input"
        placeholder="Search by ingredient or recipe name..."
        bind:value={searchQuery}
        on:keypress={handleKeyPress}
      />
      {#if searchQuery}
        <button class="clear-btn" on:click={() => { searchQuery = ''; searchResults = []; hasSearched = false; }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      {/if}
    </div>

    <button class="btn-primary search-btn" on:click={handleSearch} disabled={!searchQuery.trim() || loading}>
      {loading ? 'Searching...' : 'Search'}
    </button>

    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Searching for recipes...</p>
      </div>
    {:else if hasSearched}
      {#if searchResults.length > 0}
        <div class="results-section">
          <p class="results-count">{searchResults.length} recipe{searchResults.length !== 1 ? 's' : ''} found</p>
          <div class="results-grid">
            {#each searchResults as recipe}
              <div class="recipe-card">
                <button class="recipe-card-btn" on:click={() => viewRecipe(recipe)}>
                  <div class="recipe-image">
                    {#if recipe.image}
                      <img src={recipe.image} alt={recipe.title} />
                    {:else}
                      <div class="placeholder-image">
                        <span>No Image</span>
                      </div>
                    {/if}
                  </div>
                  <div class="recipe-info">
                    <h3 class="recipe-title">{recipe.title}</h3>
                    <div class="recipe-meta">
                      {#if recipe.calories}
                        <span>{recipe.calories} kcal</span>
                      {/if}
                      {#if recipe.prepMinutes && recipe.cookMinutes}
                        <span>·</span>
                        <span>{recipe.prepMinutes + recipe.cookMinutes} min</span>
                      {/if}
                    </div>
                  </div>
                </button>
                <button 
                  class="star-btn-overlay" 
                  on:click={() => markedRecipes.toggle(recipe)}
                  aria-label={markedRecipes.isMarked($markedRecipes, recipe.id) ? 'Unmark recipe' : 'Mark recipe'}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={markedRecipes.isMarked($markedRecipes, recipe.id) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="empty-results">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h2>No recipes found</h2>
          <p>Try searching with different ingredients or recipe names</p>
        </div>
      {/if}
    {:else}
      <div class="search-suggestions">
        <h2>Popular Searches</h2>
        <div class="suggestion-chips">
          <button class="suggestion-chip" on:click={() => { searchQuery = 'chicken'; handleSearch(); }}>
            🐔 Chicken
          </button>
          <button class="suggestion-chip" on:click={() => { searchQuery = 'pasta'; handleSearch(); }}>
            🍝 Pasta
          </button>
          <button class="suggestion-chip" on:click={() => { searchQuery = 'beef'; handleSearch(); }}>
            🥩 Beef
          </button>
          <button class="suggestion-chip" on:click={() => { searchQuery = 'vegetarian'; handleSearch(); }}>
            🥗 Vegetarian
          </button>
          <button class="suggestion-chip" on:click={() => { searchQuery = 'seafood'; handleSearch(); }}>
            🦐 Seafood
          </button>
          <button class="suggestion-chip" on:click={() => { searchQuery = 'dessert'; handleSearch(); }}>
            🍰 Dessert
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<RecipeModal 
  bind:show={showRecipeModal}
  recipe={selectedRecipe}
/>

<style>
  .search-page {
    min-height: 100vh;
    background: var(--color-bg-secondary);
    padding-bottom: calc(var(--bottom-nav-height) + var(--spacing-md));
  }

  .search-header {
    background: white;
    border-bottom: 1px solid var(--color-border);
    padding: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .back-btn {
    background: none;
    border: none;
    padding: var(--spacing-xs);
    color: var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
  }

  .search-header h1 {
    color: var(--color-red);
    margin: 0;
    font-size: 1.5rem;
  }

  .search-bar {
    position: relative;
    margin: var(--spacing-lg) 0 var(--spacing-md);
  }

  .search-icon {
    position: absolute;
    left: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-light);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 3rem;
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius);
    font-size: 1rem;
    background: white;
    min-height: var(--min-touch-target);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-green);
  }

  .clear-btn {
    position: absolute;
    right: var(--spacing-xs);
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: var(--spacing-xs);
    color: var(--color-text-light);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
  }

  .search-btn {
    width: 100%;
    margin-bottom: var(--spacing-xl);
  }

  .loading-state {
    text-align: center;
    padding: var(--spacing-xl);
  }

  .spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto var(--spacing-md);
    border: 3px solid var(--color-border);
    border-top-color: var(--color-green);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-state p {
    color: var(--color-text-light);
  }

  .results-section {
    margin-top: var(--spacing-lg);
  }

  .results-count {
    font-size: 0.875rem;
    color: var(--color-text-light);
    margin-bottom: var(--spacing-md);
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }

  @media (min-width: 640px) {
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
  }

  .recipe-card {
    background: white;
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
  }

  .recipe-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .recipe-card-btn {
    width: 100%;
    border: none;
    padding: 0;
    text-align: left;
    cursor: pointer;
    background: none;
    display: block;
  }

  .star-btn-overlay {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
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

  .star-btn-overlay:hover {
    transform: scale(1.15);
  }

  .recipe-image {
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
  }

  .recipe-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder-image {
    width: 100%;
    height: 100%;
    background: var(--color-yellow);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-light);
    font-size: 0.875rem;
  }

  .recipe-info {
    padding: var(--spacing-sm);
  }

  .recipe-title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .recipe-meta {
    font-size: 0.75rem;
    color: var(--color-text-light);
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
  }

  .empty-results {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--color-text-light);
  }

  .empty-results svg {
    margin-bottom: var(--spacing-md);
    opacity: 0.3;
  }

  .empty-results h2 {
    color: var(--color-text);
    margin-bottom: var(--spacing-xs);
  }

  .empty-results p {
    font-size: 0.875rem;
  }

  .search-suggestions {
    margin-top: var(--spacing-xl);
  }

  .search-suggestions h2 {
    font-size: 1.125rem;
    margin-bottom: var(--spacing-md);
    color: var(--color-text);
  }

  .suggestion-chips {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  @media (min-width: 640px) {
    .suggestion-chips {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .suggestion-chip {
    background: var(--color-yellow);
    border: none;
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    font-size: 0.9375rem;
    text-align: center;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    cursor: pointer;
    transition: background 0.2s;
  }

  .suggestion-chip:hover {
    background: var(--color-orange);
    color: white;
  }
</style>
