<script>
  import { onMount } from 'svelte';
  import { setItem } from '$lib/utils/storage';

  export let show = false;

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

  function togglePreference(key) {
    preferences[key] = !preferences[key];
  }

  function addIngredient() {
    const ingredient = currentIngredient.trim();
    if (ingredient && !avoidIngredients.includes(ingredient)) {
      avoidIngredients = [...avoidIngredients, ingredient];
      currentIngredient = '';
    }
  }

  function removeIngredient(ingredient) {
    avoidIngredients = avoidIngredients.filter(i => i !== ingredient);
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addIngredient();
    }
  }

  function createProfile() {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    // Save profile data
    setItem('user_profile', {
      name: userName.trim(),
      createdAt: new Date().toISOString()
    });
    setItem('user_preferences', preferences);
    setItem('avoid_ingredients', avoidIngredients);

    show = false;
  }
</script>

{#if show}
  <div class="overlay" role="dialog" aria-modal="true">
    <div class="setup-modal" role="dialog" aria-modal="true">
      <div class="setup-header">
        <h1>Welcome to Prepper! 🍳</h1>
        <p class="subtitle">Let's set up your profile</p>
      </div>

      <div class="setup-content">
        <!-- Name Input -->
        <div class="form-section">
          <label for="userName" class="form-label">Your Name *</label>
          <input
            id="userName"
            type="text"
            bind:value={userName}
            placeholder="Enter your name"
            class="name-input"
            maxlength="50"
          />
        </div>

        <!-- Dietary Preferences -->
        <div class="form-section">
          <h3 class="section-title">Dietary Preferences (Optional)</h3>
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
        </div>

        <!-- Avoid Ingredients -->
        <div class="form-section">
          <h3 class="section-title">Ingredients to Avoid (Optional)</h3>
          <div class="ingredient-input-group">
            <input
              type="text"
              bind:value={currentIngredient}
              on:keypress={handleKeyPress}
              placeholder="e.g., Peanuts, Shellfish"
              class="ingredient-input"
              maxlength="50"
            />
            <button class="btn-add" on:click={addIngredient}>
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
          {/if}
        </div>
      </div>

      <div class="setup-footer">
        <button class="btn-create" on:click={createProfile}>
          Create Profile
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
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

  .setup-modal {
    background: white;
    border-radius: var(--border-radius-lg);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .setup-header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--color-border);
    text-align: center;
  }

  .setup-header h1 {
    font-family: 'Otomanopee One', sans-serif;
    color: var(--color-red);
    font-size: 1.75rem;
    margin: 0 0 var(--spacing-xs) 0;
    font-weight: 400;
  }

  .subtitle {
    color: var(--color-text-light);
    margin: 0;
    font-size: 0.875rem;
  }

  .setup-content {
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

  .section-title {
    font-weight: 600;
    margin-bottom: var(--spacing-md);
    color: var(--color-text);
    font-size: 1rem;
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

  .preferences-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .preference-card {
    background: white;
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius);
    padding: var(--spacing-sm);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    height: 60px;
    justify-content: center;
  }

  .preference-card:hover {
    border-color: var(--color-red);
  }

  .preference-card.active {
    background: var(--color-red);
    border-color: var(--color-red);
    color: white;
  }

  .preference-icon {
    font-size: 1.5rem;
  }

  .preference-label {
    font-size: 0.75rem;
    text-align: center;
  }

  .ingredient-input-group {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .ingredient-input {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    font-size: 0.875rem;
  }

  .ingredient-input:focus {
    outline: none;
    border-color: var(--color-green);
  }

  .btn-add {
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--color-green);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }

  .btn-add:hover {
    background: #6ba03a;
  }

  .selected-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .selected-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    background: var(--color-bg-secondary);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 20px;
    font-size: 0.875rem;
  }

  .chip-remove {
    background: none;
    border: none;
    color: var(--color-text-light);
    cursor: pointer;
    padding: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .chip-remove:hover {
    background: rgba(0, 0, 0, 0.1);
    color: var(--color-red);
  }

  .setup-footer {
    padding: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
  }

  .btn-create {
    width: 100%;
    padding: var(--spacing-md);
    background: var(--color-red);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-create:hover {
    background: #b33339;
  }
</style>
