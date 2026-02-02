<script>
  import { goto } from '$app/navigation';
  import { getItem, setItem } from '$lib/utils/storage';
  import { markedRecipes } from '$lib/stores/markedRecipes';

  let preferences = {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false
  };

  let currentIngredient = '';
  let avoidIngredients = [];

  // Load saved data
  if (typeof window !== 'undefined') {
    const savedPrefs = getItem('user_preferences');
    if (savedPrefs) preferences = savedPrefs;
    
    const savedAvoid = getItem('avoid_ingredients');
    if (savedAvoid) avoidIngredients = savedAvoid;
  }

  function togglePreference(key) {
    preferences[key] = !preferences[key];
    setItem('user_preferences', preferences);
  }

  function addIngredient() {
    const ingredient = currentIngredient.trim();
    if (ingredient && !avoidIngredients.includes(ingredient)) {
      avoidIngredients = [...avoidIngredients, ingredient];
      setItem('avoid_ingredients', avoidIngredients);
      currentIngredient = '';
    }
  }

  function removeIngredient(ingredient) {
    avoidIngredients = avoidIngredients.filter(i => i !== ingredient);
    setItem('avoid_ingredients', avoidIngredients);
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addIngredient();
    }
  }

  function removeMarkedRecipe(recipe) {
    markedRecipes.toggle(recipe);
  }
</script>

<svelte:head>
  <title>Profile - Prepper</title>
</svelte:head>

<div class="profile-page">
  <header class="header">
    <button class="back-btn" on:click={() => goto('/')}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <h1 class="page-title">Profile</h1>
    <div class="header-spacer"></div>
  </header>

  <div class="container">
    <!-- Preferences Section -->
    <section class="profile-section">
      <h2 class="section-title">Dietary Preferences</h2>
      <div class="preferences-grid">
        <button 
          class="preference-card" 
          class:active={preferences.vegetarian}
          on:click={() => togglePreference('vegetarian')}
        >
          <span class="preference-icon">🥗</span>
          <span class="preference-label">Vegetarian</span>
        </button>
        <button 
          class="preference-card" 
          class:active={preferences.vegan}
          on:click={() => togglePreference('vegan')}
        >
          <span class="preference-icon">🌱</span>
          <span class="preference-label">Vegan</span>
        </button>
        <button 
          class="preference-card" 
          class:active={preferences.glutenFree}
          on:click={() => togglePreference('glutenFree')}
        >
          <span class="preference-icon">🌾</span>
          <span class="preference-label">Gluten Free</span>
        </button>
        <button 
          class="preference-card" 
          class:active={preferences.dairyFree}
          on:click={() => togglePreference('dairyFree')}
        >
          <span class="preference-icon">🥛</span>
          <span class="preference-label">Dairy Free</span>
        </button>
      </div>
    </section>

    <!-- Ingredients to Avoid Section -->
    <section class="profile-section">
      <h2 class="section-title">Ingredients to Avoid</h2>
      <div class="ingredient-input-group">
        <input
          type="text"
          class="input-field ingredient-input"
          placeholder="Type one ingredient"
          bind:value={currentIngredient}
          on:keypress={handleKeyPress}
        />
        <button 
          class="btn-add" 
          on:click={addIngredient}
          disabled={!currentIngredient.trim()}
        >
          Add
        </button>
      </div>

      {#if avoidIngredients.length > 0}
        <div class="selected-chips">
          {#each avoidIngredients as ingredient}
            <span class="selected-chip">
              {ingredient}
              <button 
                class="chip-remove" 
                on:click={() => removeIngredient(ingredient)}
              >
                ✕
              </button>
            </span>
          {/each}
        </div>
      {:else}
        <p class="empty-state-text">No ingredients added yet.</p>
      {/if}
    </section>

    <!-- Marked Recipes Section -->
    <section class="profile-section">
      <h2 class="section-title">Marked Recipes</h2>
      {#if $markedRecipes.length > 0}
        <div class="marked-recipes-list">
          {#each $markedRecipes as recipe}
            <div class="marked-recipe-card">
              {#if recipe.image}
                <img src={recipe.image} alt={recipe.title} class="recipe-thumbnail" />
              {/if}
              <div class="recipe-info">
                <h3 class="recipe-title">{recipe.title}</h3>
              </div>
              <button 
                class="remove-btn" 
                on:click={() => removeMarkedRecipe(recipe)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-state-card">
          <div class="pepper-pattern"></div>
          <p class="empty-text">No marked recipes yet.</p>
        </div>
      {/if}
    </section>
  </div>
</div>

<style>
  .profile-page {
    background: var(--color-bg-secondary);
    min-height: 100vh;
  }

  .header {
    background: white;
    border-bottom: 1px solid var(--color-border);
    padding: var(--spacing-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .back-btn {
    background: none;
    border: none;
    padding: var(--spacing-xs);
    color: var(--color-text);
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .page-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-red);
  }

  .header-spacer {
    width: var(--min-touch-target);
  }

  .profile-section {
    background: white;
    border-radius: var(--border-radius);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-red);
    margin: 0 0 var(--spacing-md) 0;
  }

  .preferences-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .preference-card {
    background: var(--color-yellow);
    border: 2px solid transparent;
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    cursor: pointer;
    transition: all 0.2s;
    min-height: 80px;
  }

  .preference-card:hover {
    background: var(--color-orange);
  }

  .preference-card.active {
    background: var(--color-green);
    color: white;
    border-color: var(--color-green-dark);
  }

  .preference-icon {
    font-size: 1.5rem;
  }

  .preference-label {
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
  }

  .ingredient-input-group {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .ingredient-input {
    flex: 1;
    min-height: var(--min-touch-target);
    padding: var(--spacing-sm) var(--spacing-md);
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius);
    font-size: 1rem;
    background: white;
  }

  .ingredient-input:focus {
    outline: none;
    border-color: var(--color-green);
  }

  .btn-add {
    background: var(--color-green);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    padding: 0 var(--spacing-lg);
    font-size: 0.9375rem;
    font-weight: 600;
    min-height: var(--min-touch-target);
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
  }

  .btn-add:hover:not(:disabled) {
    background: var(--color-green-dark);
  }

  .btn-add:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .selected-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .selected-chip {
    background: var(--color-orange);
    color: white;
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: 100px;
    font-size: 0.875rem;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .chip-remove {
    background: none;
    border: none;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    padding: 0;
    min-width: auto;
    min-height: auto;
  }

  .empty-state-text {
    color: var(--color-text-light);
    font-size: 0.875rem;
    margin: 0;
  }

  .empty-state-card {
    background: var(--color-pink);
    border-radius: var(--border-radius);
    padding: var(--spacing-xl);
    position: relative;
    overflow: hidden;
    min-height: 100px;
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
    margin: 0;
  }

  .marked-recipes-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .marked-recipe-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    background: var(--color-bg-light);
    border-radius: var(--border-radius);
    padding: var(--spacing-sm);
  }

  .recipe-thumbnail {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: var(--border-radius);
    flex-shrink: 0;
  }

  .recipe-info {
    flex: 1;
    min-width: 0;
  }

  .recipe-title {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--color-text);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--color-text-light);
    padding: var(--spacing-xs);
    cursor: pointer;
    flex-shrink: 0;
  }

  .remove-btn:hover {
    color: var(--color-red);
  }
</style>
