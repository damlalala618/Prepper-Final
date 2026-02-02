<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { planningPreferences } from '$lib/stores/preferences';
  import { planStore } from '$lib/stores/plan';
  import { getMonday, getWeekRangeString, addDays, getDayName, formatShortDate } from '$lib/utils/date';
  import MealCard from '$lib/components/MealCard.svelte';
  import RecipeModal from '$lib/components/RecipeModal.svelte';

  const BACKEND_URL = 'http://localhost:4000';

  let viewMode = 'view'; // 'view' or 'create'
  let currentStep = 1;
  let periodType = 'week';
  let selectedDays = [];
  let weekStart = getMonday(new Date());
  let currentIngredient = '';
  let selectedIngredients = [];
  let generatedMeals = [];
  let loading = false;
  let showLoadingScreen = false;
  let showNutrition = false;
  let selectedRecipe = null;
  let showRecipeModal = false;

  onMount(() => {
    // If there's a saved plan, show it in view mode
    if ($planStore && $planStore.meals && $planStore.meals.length > 0) {
      viewMode = 'view';
      generatedMeals = $planStore.meals;
    } else {
      viewMode = 'view'; // Still show view mode with empty state
    }
  });

  function startNewPlan() {
    viewMode = 'create';
    currentStep = 1;
    generatedMeals = [];
    selectedIngredients = [];
    selectedDays = [];
  }

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mockSides = ['Steamed Rice', 'Garden Salad', 'Roasted Vegetables', 'Garlic Bread', 'Quinoa', 'Mashed Potatoes'];

  function isPastDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  }

  function nextWeek() {
    weekStart = addDays(weekStart, 7);
  }

  function prevWeek() {
    weekStart = addDays(weekStart, -7);
  }

  function toggleDay(day) {
    const dayIndex = dayNames.indexOf(day);
    const dayDate = addDays(weekStart, dayIndex);
    
    if (isPastDate(dayDate)) {
      return; // Don't allow selecting past dates
    }
    
    if (selectedDays.includes(day)) {
      selectedDays = selectedDays.filter(d => d !== day);
    } else {
      selectedDays = [...selectedDays, day];
    }
  }

  function goToStep(step) {
    if (step === 2 && currentStep === 1) {
      // Validate step 1
      if (periodType === 'days' && selectedDays.length === 0) {
        alert('Please select at least one day');
        return;
      }
    }
    currentStep = step;
  }

  function addIngredient() {
    const ingredient = currentIngredient.trim();
    if (ingredient && !selectedIngredients.includes(ingredient)) {
      selectedIngredients = [...selectedIngredients, ingredient];
      currentIngredient = '';
    }
  }

  function removeIngredient(ingredient) {
    selectedIngredients = selectedIngredients.filter(i => i !== ingredient);
  }

  function addSuggestedIngredient(ingredient) {
    if (!selectedIngredients.includes(ingredient)) {
      selectedIngredients = [...selectedIngredients, ingredient];
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addIngredient();
    }
  }

  async function generatePlan() {
    loading = true;
    showLoadingScreen = true;
    
    const startTime = Date.now();
    
    try {
      const daysToGenerate = periodType === 'week' 
        ? dayNames 
        : selectedDays.sort((a, b) => dayNames.indexOf(a) - dayNames.indexOf(b));

      const meals = [];
      let recipes = [];
      
      // Fetch recipes for each selected ingredient to ensure coverage
      if (selectedIngredients.length > 0) {
        for (const ingredient of selectedIngredients) {
          try {
            const searchRes = await fetch(`${BACKEND_URL}/api/recipes/search?q=${encodeURIComponent(ingredient)}`);
            if (searchRes.ok) {
              const searchData = await searchRes.json();
              if (searchData.recipes && searchData.recipes.length > 0) {
                // Add recipes from this ingredient search
                recipes.push(...searchData.recipes);
              }
            }
          } catch (err) {
            console.error(`Search failed for ${ingredient}:`, err);
          }
        }
        
        // Remove duplicates by recipe ID
        const uniqueRecipes = [];
        const seenIds = new Set();
        for (const recipe of recipes) {
          if (!seenIds.has(recipe.id)) {
            seenIds.add(recipe.id);
            uniqueRecipes.push(recipe);
          }
        }
        recipes = uniqueRecipes;
      }

      // Fill with random recipes if we don't have enough
      while (recipes.length < daysToGenerate.length) {
        try {
          const randomRes = await fetch(`${BACKEND_URL}/api/recipes/random`);
          if (randomRes.ok) {
            const randomData = await randomRes.json();
            if (randomData.recipe && !recipes.some(r => r.id === randomData.recipe.id)) {
              recipes.push(randomData.recipe);
            }
          }
        } catch (err) {
          console.error('Random recipe fetch failed:', err);
          break;
        }
      }

      // Build meal plan
      for (let i = 0; i < daysToGenerate.length; i++) {
        const dayName = daysToGenerate[i];
        const dayIndex = dayNames.indexOf(dayName);
        const date = addDays(weekStart, dayIndex);
        const recipe = recipes[i % recipes.length];

        // Pick random sides
        const sides = [
          mockSides[Math.floor(Math.random() * mockSides.length)],
          mockSides[Math.floor(Math.random() * mockSides.length)]
        ];

        meals.push({
          dayName,
          date: formatShortDate(date),
          mainDish: recipe,
          sides,
          portions: 2
        });
      }

      generatedMeals = meals;
      
      // Ensure minimum 3 seconds loading time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      showLoadingScreen = false;
      currentStep = 3;
    } catch (error) {
      console.error('Error generating plan:', error);
      showLoadingScreen = false;
      alert('Failed to generate plan. Please ensure the backend is running.');
    } finally {
      loading = false;
    }
  }

  function viewRecipe(recipe) {
    selectedRecipe = recipe;
    showRecipeModal = true;
  }

  function handleViewIngredients() {
    showRecipeModal = false;
    goto('/ingredients');
  }

  async function swapSides(meal) {
    const newSides = [
      mockSides[Math.floor(Math.random() * mockSides.length)],
      mockSides[Math.floor(Math.random() * mockSides.length)]
    ];
    
    generatedMeals = generatedMeals.map(m => 
      m === meal ? { ...m, sides: newSides } : m
    );
  }

  async function regenerate(meal) {
    try {
      const randomRes = await fetch(`${BACKEND_URL}/api/recipes/random`);
      if (randomRes.ok) {
        const randomData = await randomRes.json();
        if (randomData.recipe) {
          generatedMeals = generatedMeals.map(m => 
            m === meal ? { ...m, mainDish: randomData.recipe } : m
          );
        }
      }
    } catch (error) {
      console.error('Regenerate failed:', error);
    }
  }

  function savePlan() {
    planStore.set({
      meals: generatedMeals,
      createdAt: new Date().toISOString()
    });
    viewMode = 'view';
    currentStep = 1;
  }
</script>

<svelte:head>
  <title>Plan - Prepper</title>
</svelte:head>

<div class="plan-page" class:is-modal={viewMode === 'create' && currentStep < 3} class:is-results={viewMode === 'view' || currentStep === 3}>
  {#if showLoadingScreen}
    <!-- Loading Screen -->
    <div class="loading-screen">
      <div class="loading-content">
        <h1 class="loading-text"><span class="green-p">P</span>repping<br/>your plan...</h1>
      </div>
    </div>
  {:else if viewMode === 'view'}
    <!-- View Mode: Show saved plans or empty state -->
    <div class="container">
      <div class="results-header">
        <h1>Prepper</h1>
      </div>

      {#if generatedMeals.length > 0}
        <p class="results-intro">
          Here's your plan! You can click on recipes to see more details.
        </p>

        <div class="meals-list">
          {#each generatedMeals as meal, i}
            <div class="meal-day-card">
              <div class="day-header">
                <h3 class="day-name">{meal.dayName} <span class="day-date">{meal.date}</span></h3>
              </div>
              <div class="meal-info">
                <h4 class="meal-title">{meal.mainDish.title}</h4>
                <div class="meal-meta-inline">
                  {meal.portions} portions · {meal.mainDish.calories} kcal · {meal.mainDish.prepMinutes + meal.mainDish.cookMinutes} min
                </div>
              </div>
              {#if meal.mainDish.image}
                <button class="meal-image-card" on:click={() => viewRecipe(meal.mainDish)}>
                  <img src={meal.mainDish.image} alt={meal.mainDish.title} />
                </button>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-state-card">
          <div class="pepper-pattern"></div>
          <p class="empty-text">Nothing planned yet.</p>
        </div>
      {/if}

      <button class="btn-primary save-plan-btn" on:click={startNewPlan}>
        Create New Plan
      </button>
    </div>
  {:else if viewMode === 'create' && currentStep === 3}
    <!-- Step 3: Results - Full Page View -->
    <div class="container">
      <div class="results-header">
        <h1>Prepper</h1>
      </div>
      
      <p class="results-intro">
        Here's your plan! You can swipe to change recipe, click on it to see more. You can also adjust the plan and when you like it, save it.
      </p>

      <div class="meals-list">
        {#each generatedMeals as meal, i}
          <div class="meal-day-card">
            <div class="day-header">
              <h3 class="day-name">{meal.dayName} <span class="day-date">{meal.date}</span></h3>
            </div>
            <div class="meal-info">
              <h4 class="meal-title">{meal.mainDish.title}</h4>
              <div class="meal-meta-inline">
                {meal.portions} portions · {meal.mainDish.calories} kcal · {meal.mainDish.prepMinutes + meal.mainDish.cookMinutes} min
              </div>
            </div>
            {#if meal.mainDish.image}
              <button class="meal-image-card" on:click={() => viewRecipe(meal.mainDish)}>
                <img src={meal.mainDish.image} alt={meal.mainDish.title} />
              </button>
            {/if}
          </div>
        {/each}
      </div>

      <button class="btn-primary save-plan-btn" on:click={savePlan}>
        Save This Plan
      </button>
    </div>
  {:else if viewMode === 'create'}
  <div class="plan-overlay">
    <div class="plan-modal">
      <h1 class="modal-title">Plan Your Meals</h1>

      {#if currentStep === 1}
        <!-- Step 1: Period Selection -->
        <div class="step-content">
          <div class="radio-group pill-group">
            <button 
              class="pill-btn" 
              class:active={periodType === 'week'}
              on:click={() => periodType = 'week'}
            >
              Whole Week
            </button>
            <button 
              class="pill-btn" 
              class:active={periodType === 'days'}
              on:click={() => periodType = 'days'}
            >
              Choose Days
            </button>
          </div>

          <div class="date-navigation">
            <button class="nav-btn" on:click={prevWeek}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span class="date-label">{getWeekRangeString(weekStart)}</span>
            <button class="nav-btn" on:click={nextWeek}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {#if periodType === 'days'}
            <div class="days-list">
              {#each dayNames as day, i}
                <button
                  class="day-row"
                  class:selected={selectedDays.includes(day)}
                  class:disabled={isPastDate(addDays(weekStart, i))}
                  disabled={isPastDate(addDays(weekStart, i))}
                  on:click={() => toggleDay(day)}
                >
                  <span>{day}</span>
                  <span class="day-date">{formatShortDate(addDays(weekStart, i)).split(' ')[1]} {formatShortDate(addDays(weekStart, i)).split(' ')[0]}</span>
                </button>
              {/each}
            </div>
          {/if}

          <div class="modal-actions">
            <button class="btn-secondary" on:click={() => goto('/')}>
              Back
            </button>
            <button class="btn-primary" on:click={() => goToStep(2)}>
              Continue
            </button>
          </div>
        </div>
      {/if}

    {#if currentStep === 2}
      <!-- Step 2: Fridge Contents -->
      <div class="step-content">
        <h2>What do you already have in handy?<br/>Or do you have ingredients in mind?</h2>

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

        <div class="ingredient-suggestions">
          <button class="ingredient-chip" on:click={() => addSuggestedIngredient('Pasta')}>
            🍝 Pasta
          </button>
          <button class="ingredient-chip" on:click={() => addSuggestedIngredient('Eggs')}>
            🥚 Eggs
          </button>
          <button class="ingredient-chip" on:click={() => addSuggestedIngredient('Potato')}>
            🥔 Potato
          </button>
          <button class="ingredient-chip" on:click={() => addSuggestedIngredient('Meat')}>
            🥩 Meat
          </button>
        </div>

        {#if selectedIngredients.length > 0}
          <div class="selected-chips">
            {#each selectedIngredients as ingredient}
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

        <div class="modal-actions">
          <button class="btn-secondary" on:click={() => currentStep = 1}>
            Back
          </button>
          <button 
            class="btn-primary" 
            on:click={generatePlan}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Continue'}
          </button>
        </div>
      </div>
    {/if}
    </div>
  </div>
  {/if}
</div>

<RecipeModal 
  bind:show={showRecipeModal}
  recipe={selectedRecipe}
  onViewIngredients={handleViewIngredients}
/>

<style>
  .plan-page {
    min-height: 100vh;
  }

  .plan-page.is-modal {
    background: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: var(--spacing-md);
    overflow-y: auto;
    z-index: 999;
  }

  .plan-page.is-results {
    background: var(--color-bg-secondary);
    padding-bottom: calc(var(--bottom-nav-height) + var(--spacing-md));
  }

  .results-header {
    background: white;
    border-bottom: 1px solid var(--color-border);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .results-header h1 {
    color: var(--color-red);
    margin: 0;
    font-size: 1.5rem;
  }

  .results-intro {
    font-size: 0.875rem;
    color: var(--color-text);
    margin: 0 0 var(--spacing-lg) 0;
    padding: 0 var(--spacing-md);
    line-height: 1.5;
  }

  .meals-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: 0 var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }

  .meal-day-card {
    background: white;
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  .day-header {
    padding: var(--spacing-md);
    background: white;
  }

  .day-name {
    font-size: 1.25rem;
    color: var(--color-green);
    margin: 0;
    font-weight: 600;
  }

  .day-date {
    font-size: 0.875rem;
    color: var(--color-red);
    font-weight: 500;
    margin-left: var(--spacing-xs);
  }

  .meal-info {
    padding: 0 var(--spacing-md) var(--spacing-md);
  }

  .meal-title {
    font-size: 1rem;
    color: var(--color-text);
    margin: 0 0 var(--spacing-xs) 0;
    font-weight: 500;
  }

  .meal-meta-inline {
    font-size: 0.875rem;
    color: var(--color-text-light);
    display: block;
  }

  .meal-image-card {
    width: 100%;
    border: none;
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    display: block;
  }

  .meal-image-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
  }

  @media (min-width: 640px) {
    .meal-image-card img {
      height: 250px;
    }
  }

  .save-plan-btn {
    margin: 0 var(--spacing-md) var(--spacing-xl);
    width: calc(100% - var(--spacing-md) * 2);
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

  .plan-overlay {
    width: 100%;
    max-width: 500px;
    margin: var(--spacing-lg) auto;
  }

  .plan-modal {
    background: white;
    border-radius: var(--border-radius);
    padding: var(--spacing-lg);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  .modal-title {
    font-size: clamp(1.5rem, 5vw, 1.75rem);
    color: var(--color-red);
    margin-bottom: var(--spacing-lg);
    text-align: center;
  }

  .pill-group {
    display: flex;
    gap: var(--spacing-xs);
    background: var(--color-green-light);
    padding: 4px;
    border-radius: 100px;
    margin-bottom: var(--spacing-sm);
  }

  .pill-btn {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    background: transparent;
    border: none;
    border-radius: 100px;
    font-weight: 500;
    color: var(--color-text);
    min-height: var(--min-touch-target);
  }

  .pill-btn.active {
    background: var(--color-green);
    color: white;
  }

  .days-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-lg);
  }

  .day-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-yellow);
    border: none;
    border-radius: var(--border-radius);
    font-size: 1rem;
    font-weight: 500;
    min-height: 40px;
    cursor: pointer;
  }

  .day-row.selected {
    background: var(--color-orange);
    color: white;
  }

  .day-row.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .day-date {
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .modal-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-lg);
  }

  .modal-actions button {
    flex: 1;
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

  .ingredient-suggestions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
    margin: var(--spacing-lg) 0;
  }

  .ingredient-chip {
    background: var(--color-yellow);
    border: none;
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    font-size: 0.9375rem;
    text-align: center;
    min-height: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
  }

  .selected-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
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

  h2 {
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: var(--spacing-md);
    line-height: 1.5;
  }

  .date-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 var(--spacing-sm);
    background: transparent;
    border-radius: var(--border-radius);
    margin-bottom: var(--spacing-lg);
    gap: var(--spacing-xs);
  }

  .nav-btn {
    background: none;
    border: none;
    padding: var(--spacing-xs);
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .date-label {
    font-weight: 500;
    font-size: 0.875rem;
    text-align: center;
    flex: 1;
  }

  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .loading-content {
    text-align: center;
    padding: var(--spacing-xl);
  }

  .loading-text {
    font-size: clamp(2rem, 8vw, 3rem);
    color: var(--color-red);
    margin: 0;
    font-weight: 600;
    line-height: 1.3;
  }

  .green-p {
    color: var(--color-green);
  }
</style>
