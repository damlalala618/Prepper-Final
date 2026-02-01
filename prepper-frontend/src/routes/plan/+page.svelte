<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { planningPreferences } from '$lib/stores/preferences';
  import { planStore } from '$lib/stores/plan';
  import { getMonday, getWeekRangeString, addDays, getDayName, formatShortDate } from '$lib/utils/date';
  import MealCard from '$lib/components/MealCard.svelte';
  import RecipeModal from '$lib/components/RecipeModal.svelte';

  const BACKEND_URL = 'http://localhost:4000';

  let currentStep = 1;
  let periodType = 'week';
  let selectedDays = [];
  let weekStart = getMonday(new Date());
  let fridgeContents = '';
  let generatedMeals = [];
  let loading = false;
  let showNutrition = false;
  let selectedRecipe = null;
  let showRecipeModal = false;

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mockSides = ['Steamed Rice', 'Garden Salad', 'Roasted Vegetables', 'Garlic Bread', 'Quinoa', 'Mashed Potatoes'];

  function nextWeek() {
    weekStart = addDays(weekStart, 7);
  }

  function prevWeek() {
    weekStart = addDays(weekStart, -7);
  }

  function toggleDay(day) {
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

  async function generatePlan() {
    loading = true;
    
    try {
      const daysToGenerate = periodType === 'week' 
        ? dayNames 
        : selectedDays.sort((a, b) => dayNames.indexOf(a) - dayNames.indexOf(b));

      const meals = [];
      
      // Extract keywords from fridge contents
      const keywords = fridgeContents.trim().split(/[,\s]+/).filter(k => k.length > 2);
      const searchQuery = keywords.length > 0 ? keywords[0] : 'chicken';

      // Fetch recipes
      let recipes = [];
      
      // Try to fetch from search
      try {
        const searchRes = await fetch(`${BACKEND_URL}/api/recipes/search?q=${encodeURIComponent(searchQuery)}`);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          recipes = searchData.recipes || [];
        }
      } catch (err) {
        console.error('Search failed:', err);
      }

      // Fill with random recipes if needed
      while (recipes.length < daysToGenerate.length) {
        try {
          const randomRes = await fetch(`${BACKEND_URL}/api/recipes/random`);
          if (randomRes.ok) {
            const randomData = await randomRes.json();
            if (randomData.recipe) {
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
      currentStep = 3;
    } catch (error) {
      console.error('Error generating plan:', error);
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
    goto('/prep');
  }
</script>

<svelte:head>
  <title>Plan - Prepper</title>
</svelte:head>

<div class="plan-page">
  <div class="container">
    <h1>Plan Your Week</h1>

    <!-- Stepper -->
    <div class="stepper">
      <div class="step" class:active={currentStep >= 1}>
        <div class="step-dot" class:filled={currentStep >= 1}>1</div>
        <div class="step-line" class:filled={currentStep >= 2}></div>
      </div>
      <div class="step" class:active={currentStep >= 2}>
        <div class="step-dot" class:filled={currentStep >= 2}>2</div>
        <div class="step-line" class:filled={currentStep >= 3}></div>
      </div>
      <div class="step" class:active={currentStep >= 3}>
        <div class="step-dot" class:filled={currentStep >= 3}>3</div>
      </div>
    </div>

    {#if currentStep === 1}
      <!-- Step 1: Period Selection -->
      <div class="step-content">
        <h2>Choose Your Period</h2>

        <div class="radio-group">
          <label class="radio-option">
            <input 
              type="radio" 
              value="week" 
              bind:group={periodType}
            />
            <span>Whole Week</span>
          </label>
          <label class="radio-option">
            <input 
              type="radio" 
              value="days" 
              bind:group={periodType}
            />
            <span>Individual Days</span>
          </label>
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
          <div class="days-checkboxes">
            {#each dayNames as day}
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  checked={selectedDays.includes(day)}
                  on:change={() => toggleDay(day)}
                />
                <span>{day}</span>
              </label>
            {/each}
          </div>
        {/if}

        <button class="btn-primary" on:click={() => goToStep(2)}>
          Next
        </button>
      </div>
    {/if}

    {#if currentStep === 2}
      <!-- Step 2: Fridge Contents -->
      <div class="step-content">
        <h2>What's in your fridge?</h2>

        <textarea 
          class="input-field"
          placeholder="Enter ingredients you have..."
          bind:value={fridgeContents}
        ></textarea>

        <p class="hint">
          <strong>Recommended:</strong> chicken, pasta, tomatoes, onions, garlic, etc.
        </p>

        <button 
          class="btn-primary" 
          on:click={generatePlan}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Plan'}
        </button>

        <button class="btn-secondary" on:click={() => currentStep = 1} style="margin-top: 0.5rem; width: 100%;">
          Back
        </button>
      </div>
    {/if}

    {#if currentStep === 3}
      <!-- Step 3: Results -->
      <div class="step-content">
        <h2>Your Meal Plan</h2>

        <button 
          class="nutrition-toggle btn-secondary" 
          on:click={() => showNutrition = !showNutrition}
        >
          {showNutrition ? 'Hide' : 'Show'} Nutrition Panel
        </button>

        {#if showNutrition}
          <div class="nutrition-panel card">
            <h3>Nutrition Summary</h3>
            <p class="nutrition-note">Estimated values based on selected recipes</p>
            <div class="nutrition-stats">
              <div class="stat">
                <span class="stat-label">Total Calories:</span>
                <span class="stat-value">~{generatedMeals.reduce((sum, m) => sum + m.mainDish.calories, 0)} cal</span>
              </div>
              <div class="stat">
                <span class="stat-label">Avg per meal:</span>
                <span class="stat-value">~{Math.round(generatedMeals.reduce((sum, m) => sum + m.mainDish.calories, 0) / generatedMeals.length)} cal</span>
              </div>
            </div>
          </div>
        {/if}

        <div class="meals-scroll scroll-snap-x hide-scrollbar">
          {#each generatedMeals as meal}
            <MealCard 
              {meal}
              onViewRecipe={viewRecipe}
              onSwapSides={swapSides}
              onRegenerate={regenerate}
            />
          {/each}
        </div>

        <button class="btn-primary" on:click={savePlan}>
          Save This Plan
        </button>

        <button class="btn-secondary" on:click={() => currentStep = 2} style="margin-top: 0.5rem; width: 100%;">
          Back
        </button>
      </div>
    {/if}
  </div>
</div>

<RecipeModal 
  bind:show={showRecipeModal}
  recipe={selectedRecipe}
  onViewIngredients={handleViewIngredients}
/>

<style>
  .plan-page {
    min-height: 100vh;
    background: var(--color-bg-secondary);
  }

  h1 {
    padding-top: var(--spacing-lg);
  }

  .stepper {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: var(--spacing-lg) 0;
    gap: var(--spacing-sm);
  }

  @media (min-width: 640px) {
    .stepper {
      gap: var(--spacing-md);
    }
  }

  .step {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  @media (min-width: 640px) {
    .step {
      gap: var(--spacing-md);
    }
  }

  .step:last-child .step-line {
    display: none;
  }

  .step-dot {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--color-bg-light);
    border: 2px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: var(--color-text-light);
    font-size: 0.875rem;
    flex-shrink: 0;
  }

  @media (min-width: 640px) {
    .step-dot {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1rem;
    }
  }

  .step-dot.filled {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }

  .step-line {
    width: 2rem;
    height: 2px;
    background: var(--color-border);
  }

  @media (min-width: 640px) {
    .step-line {
      width: 3rem;
    }
  }

  .step-line.filled {
    background: var(--color-primary);
  }

  .step-content {
    background: white;
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  @media (min-width: 640px) {
    .step-content {
      padding: var(--spacing-lg);
    }
  }

  @media (min-width: 1024px) {
    .step-content {
      padding: var(--spacing-xl);
    }
  }

  h2 {
    font-size: 1.25rem;
    margin-bottom: var(--spacing-lg);
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
    padding: var(--spacing-xs);
    min-height: var(--min-touch-target);
  }

  .radio-option input {
    width: 20px;
    height: 20px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .date-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm);
    background: var(--color-bg-light);
    border-radius: var(--border-radius);
    margin-bottom: var(--spacing-lg);
    gap: var(--spacing-xs);
  }

  @media (min-width: 640px) {
    .date-navigation {
      padding: var(--spacing-md);
    }
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
  }

  .date-label {
    font-weight: 500;
    font-size: 0.875rem;
    text-align: center;
    flex: 1;
  }

  @media (min-width: 640px) {
    .date-label {
      font-size: 1rem;
    }
  }

  .days-checkboxes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
  }

  @media (min-width: 640px) {
    .days-checkboxes {
      gap: var(--spacing-md);
    }
  }

  .checkbox-option {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
    padding: var(--spacing-xs);
    min-height: var(--min-touch-target);
  }

  .checkbox-option input {
    width: 20px;
    height: 20px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .hint {
    font-size: 0.875rem;
    color: var(--color-text-light);
    margin: var(--spacing-md) 0;
  }

  .nutrition-toggle {
    width: 100%;
    margin-bottom: var(--spacing-md);
  }

  .nutrition-panel {
    margin-bottom: var(--spacing-lg);
    background: var(--color-bg-light);
  }

  .nutrition-panel h3 {
    font-size: 1.125rem;
    margin-bottom: var(--spacing-xs);
  }

  .nutrition-note {
    font-size: 0.875rem;
    color: var(--color-text-light);
    margin-bottom: var(--spacing-md);
  }

  .nutrition-stats {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .stat {
    display: flex;
    justify-content: space-between;
  }

  .stat-label {
    color: var(--color-text-light);
  }

  .stat-value {
    font-weight: 600;
  }

  .meals-scroll {
    display: flex;
    gap: var(--spacing-md);
    overflow-x: auto;
    padding: var(--spacing-sm) 0;
    margin-bottom: var(--spacing-lg);
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    /* Negative margin to extend to edges on mobile */
    margin-left: calc(-1 * var(--spacing-md));
    margin-right: calc(-1 * var(--spacing-md));
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }

  @media (min-width: 640px) {
    .meals-scroll {
      margin-left: 0;
      margin-right: 0;
    }
  }
</style>
