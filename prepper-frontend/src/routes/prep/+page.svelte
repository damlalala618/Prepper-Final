<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { planStore } from '$lib/stores/plan';
  import DaySelector from '$lib/components/DaySelector.svelte';

  let plan = null;
  let selectedDayIndex = 0;
  let portions = 2;

  $: if ($planStore) {
    plan = $planStore;
    if (plan.meals && plan.meals.length > 0) {
      portions = plan.meals[0].portions || 2;
    }
  }

  $: selectedMeal = plan?.meals?.[selectedDayIndex];
  $: days = plan?.meals?.map(m => m.dayName.substring(0, 3)) || [];

  function adjustPortions(delta) {
    portions = Math.max(1, Math.min(10, portions + delta));
  }

  function selectDay(day) {
    const index = days.indexOf(day);
    if (index !== -1) {
      selectedDayIndex = index;
    }
  }

  function getScaledAmount(amount, originalPortions = 2) {
    if (!amount) return '';
    
    const scaleFactor = portions / originalPortions;
    
    // Try to extract number from amount
    const match = amount.match(/^([\d.\/]+)\s*(.*)$/);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num)) {
        const scaled = num * scaleFactor;
        return `${scaled.toFixed(1).replace(/\.0$/, '')} ${match[2]}`.trim();
      }
    }
    
    // If no number found, append multiplier
    if (scaleFactor !== 1) {
      return `${amount} (x${scaleFactor.toFixed(1)})`;
    }
    
    return amount;
  }
</script>

<svelte:head>
  <title>Prep - Prepper</title>
</svelte:head>

<div class="prep-page">
  <div class="container">
    <h1>Prep</h1>

    {#if !plan || !plan.meals || plan.meals.length === 0}
      <!-- Empty State -->
      <div class="empty-state">
        <h2>No Meal Plan Found</h2>
        <p>Please create a meal plan first.</p>
        <button class="btn-primary" on:click={() => goto('/plan')}>
          Back to Plan
        </button>
      </div>
    {:else}
      <!-- Plan exists -->
      {#if days.length > 1}
        <DaySelector 
          {days} 
          selectedDay={days[selectedDayIndex]}
          onSelectDay={selectDay}
        />
      {/if}

      <div class="date-display">{selectedMeal.date}</div>

      <div class="plan-summary card">
        <h2 class="recipe-title">{selectedMeal.mainDish.title}</h2>
        
        {#if selectedMeal.mainDish.image}
          <img src="{selectedMeal.mainDish.image}" alt="{selectedMeal.mainDish.title}" class="recipe-image" />
        {/if}

        <div class="recipe-meta">
          <span>{portions} portions</span>
          <span>·</span>
          <span>{selectedMeal.mainDish.calories} kcal</span>
          <span>·</span>
          <span>{selectedMeal.mainDish.prepMinutes + selectedMeal.mainDish.cookMinutes} min</span>
        </div>
        
        <div class="portion-adjuster">
          <button 
            class="portion-btn" 
            on:click={() => adjustPortions(-1)}
            disabled={portions <= 1}
          >
            −
          </button>
          <span class="portion-display">Adjust portions: {portions}</span>
          <button 
            class="portion-btn" 
            on:click={() => adjustPortions(1)}
            disabled={portions >= 10}
          >
            +
          </button>
        </div>
      </div>

      <div class="steps-container">
        <h2>Recipe Instructions</h2>
        
        {#if selectedMeal.mainDish.ingredients && selectedMeal.mainDish.ingredients.length > 0}
          <div class="ingredients-summary card">
            <h3>Ingredients</h3>
            <ul>
              {#each selectedMeal.mainDish.ingredients as ingredient}
                <li>
                  {ingredient.name}
                  {#if ingredient.amount}
                    - {getScaledAmount(ingredient.amount, selectedMeal.portions)}
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <div class="steps-list">
          {#each selectedMeal.mainDish.steps as step, i}
            <div class="step-wrapper">
              <div class="step-header">
                <div class="step-divider-line"></div>
                <span class="step-title">Step {i + 1} of {selectedMeal.mainDish.steps.length}</span>
                <div class="step-divider-line"></div>
              </div>
              <div class="step-content">
                <p>{step}</p>
              </div>
            </div>
          {/each}
        </div>

        <div class="action-buttons">
          <button class="btn-back" on:click={() => goto('/plan')}>
            Back
          </button>
          <button class="btn-finished" on:click={() => goto('/plan')}>
            Finished!
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .prep-page {
    min-height: 100vh;
    background: var(--color-bg-secondary);
  }

  h1 {
    padding-top: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    font-family: 'Otomanopee One', sans-serif;
    font-weight: 400;
    color: var(--color-red);
    font-size: clamp(1.5rem, 5vw, 1.875rem);
  }

  .date-display {
    font-family: 'Otomanopee One', sans-serif;
    font-size: 1.125rem;
    color: var(--color-red);
    margin-bottom: var(--spacing-md);
    text-align: center;
  }

  .recipe-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: var(--border-radius);
    margin-bottom: var(--spacing-md);
  }

  .recipe-meta {
    display: flex;
    justify-content: center;
    gap: var(--spacing-xs);
    font-size: 0.875rem;
    color: var(--color-text-light);
    margin-bottom: var(--spacing-md);
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    background: white;
    border-radius: var(--border-radius);
  }

  .empty-state h2 {
    margin-bottom: var(--spacing-md);
  }

  .empty-state p {
    color: var(--color-text-light);
    margin-bottom: var(--spacing-xl);
  }

  .plan-summary {
    margin-bottom: var(--spacing-lg);
  }

  .recipe-title {
    font-size: clamp(1.5rem, 5vw, 1.75rem);
    color: var(--color-red);
    margin-bottom: var(--spacing-xs);
  }

  .portion-adjuster {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-bg-light);
    border-radius: var(--border-radius);
  }

  .portion-btn {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: white;
    border: 1px solid var(--color-border);
    font-size: 1.5rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    /* Ensure touch target */
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
  }

  @media (min-width: 640px) {
    .portion-btn {
      width: 3rem;
      height: 3rem;
    }
  }

  .portion-btn:hover:not(:disabled) {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  .portion-display {
    font-weight: 600;
    min-width: 100px;
    text-align: center;
    font-size: 0.9375rem;
  }

  @media (min-width: 640px) {
    .portion-display {
      font-size: 1rem;
    }
  }

  .steps-container {
    margin-top: var(--spacing-lg);
  }

  .steps-container h2 {
    font-size: 1.25rem;
    margin-bottom: var(--spacing-lg);
  }

  .ingredients-summary {
    margin-bottom: var(--spacing-lg);
    background: var(--color-bg-light);
  }

  .ingredients-summary h3 {
    font-size: 1.125rem;
    margin-bottom: var(--spacing-md);
  }

  .ingredients-summary ul {
    list-style: none;
    padding: 0;
  }

  .ingredients-summary li {
    padding: var(--spacing-xs) 0;
    font-size: 0.9375rem;
  }

  .steps-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
    padding-bottom: var(--spacing-xl);
  }

  .step-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .step-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    width: 100%;
  }

  .step-divider-line {
    flex: 1;
    height: 2px;
    background: var(--color-orange);
  }

  .step-title {
    font-family: 'Otomanopee One', sans-serif;
    font-size: 1rem;
    color: var(--color-text);
    white-space: nowrap;
    padding: 0 var(--spacing-sm);
  }

  @media (min-width: 640px) {
    .step-title {
      font-size: 1.125rem;
    }
  }

  .step-content {
    padding: var(--spacing-md);
    background: white;
    border-radius: var(--border-radius);
  }

  @media (min-width: 640px) {
    .step-content {
      padding: var(--spacing-lg);
    }
  }

  .step-content p {
    line-height: 1.6;
    font-size: 0.9375rem;
    margin: 0;
  }

  @media (min-width: 640px) {
    .step-content p {
      font-size: 1rem;
    }
  }

  .action-buttons {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    margin-top: var(--spacing-lg);
    padding-bottom: var(--spacing-xl);
  }

  .btn-back,
  .btn-finished {
    padding: var(--spacing-sm) var(--spacing-xl);
    border-radius: var(--border-radius);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;
  }

  .btn-back {
    background: white;
    color: var(--color-red);
    border: 2px solid var(--color-red);
  }

  .btn-back:hover {
    background: var(--color-red);
    color: white;
  }

  .btn-finished {
    background: var(--color-green);
    color: white;
    border: 2px solid var(--color-green);
  }

  .btn-finished:hover {
    background: #6fa138;
    border-color: #6fa138;
  }

  @media (min-width: 640px) {
    .btn-back,
    .btn-finished {
      padding: var(--spacing-md) var(--spacing-xl);
      font-size: 1.125rem;
      min-width: 140px;
    }
  }
</style>
