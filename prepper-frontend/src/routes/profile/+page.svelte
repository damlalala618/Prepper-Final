<script>
  import { goto } from '$app/navigation';
  import { getItem, setItem } from '$lib/utils/storage';
  import { markedRecipes } from '$lib/stores/markedRecipes';
  import { planStore } from '$lib/stores/plan';

  let userName = '';
  let preferences = {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    pescetarian: false,
    nutFree: false
  };

  let currentIngredient = '';
  let avoidIngredients = [];
  let showEditModal = false;
  let editName = '';
  let editPreferences = {};

  // Load saved data
  if (typeof window !== 'undefined') {
    const profile = getItem('user_profile');
    if (profile) userName = profile.name;

    const savedPrefs = getItem('user_preferences');
    if (savedPrefs) preferences = savedPrefs;
    
    const savedAvoid = getItem('avoid_ingredients');
    if (savedAvoid) avoidIngredients = savedAvoid;
  }

  function openEditModal() {
    editName = userName;
    editPreferences = { ...preferences };
    showEditModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
  }

  function saveProfileEdit() {
    if (!editName.trim()) {
      alert('Please enter your name');
      return;
    }

    userName = editName.trim();
    preferences = { ...editPreferences };

    setItem('user_profile', {
      name: userName,
      createdAt: getItem('user_profile')?.createdAt || new Date().toISOString()
    });
    setItem('user_preferences', preferences);

    showEditModal = false;
  }

  function toggleEditPreference(key) {
    editPreferences[key] = !editPreferences[key];
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

  function logout() {
    if (confirm('Are you sure you want to log out? This will clear all your data.')) {
      // Clear stores first
      planStore.clear();
      markedRecipes.clear();
      
      // Clear all user data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_profile');
        localStorage.removeItem('user_preferences');
        localStorage.removeItem('avoid_ingredients');
      }
      
      // Reload the page to show profile setup
      window.location.reload();
    }
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
    <div class="greeting">
      <h2 class="greeting-text">Hello {userName || '---'}</h2>
      <button class="edit-profile-btn" on:click={openEditModal} aria-label="Edit profile">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
    </div>

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
        <button 
          class="preference-card" 
          class:active={preferences.pescetarian}
          on:click={() => togglePreference('pescetarian')}
        >
          <span class="preference-icon">🐟</span>
          <span class="preference-label">Pescetarian</span>
        </button>
        <button 
          class="preference-card" 
          class:active={preferences.nutFree}
          on:click={() => togglePreference('nutFree')}
        >
          <span class="preference-icon">🥜</span>
          <span class="preference-label">Nut Free</span>
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
        <div class="marked-recipes-scroll">
          {#each $markedRecipes as recipe}
            <div class="marked-recipe-card">
              <div class="marked-recipe-image">
                {#if recipe.image}
                  <img src={recipe.image} alt={recipe.title} />
                {:else}
                  <div class="placeholder-image">
                    <span class="placeholder-text">No Image</span>
                  </div>
                {/if}
              </div>
              <p class="marked-recipe-name">{recipe.title}</p>
              <button 
                class="star-btn-marked" 
                on:click={() => removeMarkedRecipe(recipe)}
                aria-label="Unmark recipe"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
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

    <!-- Logout Section -->
    <section class="logout-section">
      <button class="btn-logout" on:click={logout}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Log Out
      </button>
    </section>
  </div>
</div>

<!-- Edit Profile Modal -->
{#if showEditModal}
  <div class="modal-overlay" role="presentation">
    <div class="edit-modal" role="dialog" aria-modal="true">
      <div class="edit-header">
        <h2>Edit Profile</h2>
        <button class="close-btn" on:click={closeEditModal} aria-label="Close">×</button>
      </div>

      <div class="edit-content">
        <!-- Name Input -->
        <div class="form-section">
          <label for="editUserName" class="form-label">Name</label>
          <input
            id="editUserName"
            type="text"
            bind:value={editName}
            placeholder="Enter your name"
            class="name-input"
            maxlength="50"
          />
        </div>

        <!-- Dietary Preferences -->
        <div class="form-section">
          <h3 class="section-title">Dietary Preferences</h3>
          <div class="preferences-grid">
            <button 
              class="preference-card" 
              class:active={editPreferences.vegetarian}
              on:click={() => toggleEditPreference('vegetarian')}
            >
              <span class="preference-icon">🥗</span>
              <span class="preference-label">Vegetarian</span>
            </button>
            <button 
              class="preference-card" 
              class:active={editPreferences.vegan}
              on:click={() => toggleEditPreference('vegan')}
            >
              <span class="preference-icon">🌱</span>
              <span class="preference-label">Vegan</span>
            </button>
            <button 
              class="preference-card" 
              class:active={editPreferences.glutenFree}
              on:click={() => toggleEditPreference('glutenFree')}
            >
              <span class="preference-icon">🌾</span>
              <span class="preference-label">Gluten Free</span>
            </button>
            <button 
              class="preference-card" 
              class:active={editPreferences.dairyFree}
              on:click={() => toggleEditPreference('dairyFree')}
            >
              <span class="preference-icon">🥛</span>
              <span class="preference-label">Dairy Free</span>
            </button>
            <button 
              class="preference-card" 
              class:active={editPreferences.pescetarian}
              on:click={() => toggleEditPreference('pescetarian')}
            >
              <span class="preference-icon">🐟</span>
              <span class="preference-label">Pescetarian</span>
            </button>
            <button 
              class="preference-card" 
              class:active={editPreferences.nutFree}
              on:click={() => toggleEditPreference('nutFree')}
            >
              <span class="preference-icon">🥜</span>
              <span class="preference-label">Nut Free</span>
            </button>
          </div>
        </div>
      </div>

      <div class="edit-footer">
        <button class="btn-cancel" on:click={closeEditModal}>Cancel</button>
        <button class="btn-save" on:click={saveProfileEdit}>Save Changes</button>
      </div>
    </div>
  </div>
{/if}

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
    font-family: 'Otomanopee One', sans-serif;
    font-weight: 400;
    font-size: clamp(1.5rem, 5vw, 1.875rem);
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
    padding: var(--spacing-sm);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    cursor: pointer;
    transition: all 0.2s;
    min-height: 60px;
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

  .marked-recipes-scroll {
    display: flex;
    gap: var(--spacing-md);
    overflow-x: auto;
    padding-bottom: var(--spacing-md);
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
  }

  .marked-recipe-card {
    flex-shrink: 0;
    width: 120px;
    scroll-snap-align: start;
    position: relative;
  }

  @media (min-width: 640px) {
    .marked-recipe-card {
      width: 140px;
    }
  }

  .marked-recipe-image {
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

  .marked-recipe-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .marked-recipe-name {
    font-size: 0.875rem;
    color: var(--color-text);
    margin: 0;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.3;
  }

  .star-btn-marked {
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

  .star-btn-marked:hover {
    transform: scale(1.15);
  }

  .greeting {
    padding: var(--spacing-lg) 0;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .greeting-text {
    font-family: 'Otomanopee One', sans-serif;
    font-size: 1.5rem;
    color: var(--color-text);
    margin: 0;
  }

  .edit-profile-btn {
    background: none;
    border: none;
    color: var(--color-red);
    cursor: pointer;
    padding: var(--spacing-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border-radius: 50%;
  }

  .edit-profile-btn:hover {
    background: rgba(195, 60, 68, 0.1);
    transform: scale(1.1);
  }

  .logout-section {
    margin-top: var(--spacing-xl);
    padding-bottom: var(--spacing-xl);
  }

  .btn-logout {
    width: 100%;
    padding: var(--spacing-md);
    background: white;
    color: var(--color-red);
    border: 2px solid var(--color-red);
    border-radius: var(--border-radius);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }

  .btn-logout:hover {
    background: var(--color-red);
    color: white;
  }

  .btn-logout svg {
    stroke: currentColor;
  }

  /* Edit Profile Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: var(--spacing-md);
  }

  .edit-modal {
    background: white;
    border-radius: var(--border-radius-lg);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--color-border);
  }

  .edit-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--color-text);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: var(--color-text-light);
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: var(--color-red);
  }

  .edit-content {
    padding: var(--spacing-lg);
    overflow-y: auto;
    flex: 1;
  }

  .form-section {
    margin-bottom: var(--spacing-lg);
  }

  .form-section:last-child {
    margin-bottom: 0;
  }

  .form-label {
    display: block;
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
    color: var(--color-text);
  }

  .name-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .name-input:focus {
    outline: none;
    border-color: var(--color-red);
  }

  .edit-footer {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
  }

  .btn-cancel,
  .btn-save {
    flex: 1;
    padding: var(--spacing-md);
    border: none;
    border-radius: var(--border-radius);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cancel {
    background: white;
    color: var(--color-text);
    border: 2px solid var(--color-border);
  }

  .btn-cancel:hover {
    background: var(--color-bg-secondary);
  }

  .btn-save {
    background: var(--color-red);
    color: white;
  }

  .btn-save:hover {
    background: #b33339;
  }
</style>
