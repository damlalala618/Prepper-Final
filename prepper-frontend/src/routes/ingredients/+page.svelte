<script>
  import { goto } from '$app/navigation';
  import { planStore } from '$lib/stores/plan';
  import IngredientsChecklist from '$lib/components/IngredientsChecklist.svelte';

  let plan = null;
  let aggregatedIngredients = [];

  $: if ($planStore) {
    plan = $planStore;
    aggregatedIngredients = aggregateIngredients(plan);
  }

  function aggregateIngredients(plan) {
    if (!plan || !plan.meals) return [];

    const ingredientsMap = new Map();

    plan.meals.forEach(meal => {
      if (meal.mainDish && meal.mainDish.ingredients) {
        meal.mainDish.ingredients.forEach(ingredient => {
          const key = ingredient.name.toLowerCase();
          
          if (ingredientsMap.has(key)) {
            const existing = ingredientsMap.get(key);
            // Combine amounts if both are numeric
            const existingNum = parseFloat(existing.amount);
            const newNum = parseFloat(ingredient.amount);
            
            if (!isNaN(existingNum) && !isNaN(newNum)) {
              existing.amount = `${existingNum + newNum} ${existing.amount.replace(/[\d.]+\s*/, '')}`.trim();
            } else {
              existing.amount = `${existing.amount}, ${ingredient.amount}`;
            }
          } else {
            ingredientsMap.set(key, {
              key,
              name: ingredient.name,
              amount: ingredient.amount || ''
            });
          }
        });
      }
    });

    return Array.from(ingredientsMap.values());
  }

  function goBack() {
    goto('/plan');
  }
</script>

<svelte:head>
  <title>Ingredients - Prepper</title>
</svelte:head>

<div class="ingredients-page">
  <header class="page-header">
    <button class="back-btn" on:click={goBack}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      <span>Back</span>
    </button>
    <h1>All You Need</h1>
  </header>

  <div class="container">
    {#if !plan || !plan.meals || plan.meals.length === 0}
      <!-- Empty State -->
      <div class="empty-state">
        <h2>No Meal Plan Found</h2>
        <p>Please create a meal plan first to see ingredients.</p>
        <button class="btn-primary" on:click={() => goto('/plan')}>
          Back to Plan
        </button>
      </div>
    {:else}
      <IngredientsChecklist ingredients={aggregatedIngredients} />
    {/if}
  </div>
</div>

<style>
  .ingredients-page {
    min-height: 100vh;
    background: var(--color-bg-secondary);
  }

  .page-header {
    background: white;
    border-bottom: 1px solid var(--color-border);
    padding: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  @media (min-width: 640px) {
    .page-header {
      padding: var(--spacing-md) var(--spacing-lg);
      gap: var(--spacing-md);
    }
  }

  .back-btn {
    background: none;
    border: none;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-text);
    font-weight: 500;
    padding: var(--spacing-xs);
    min-height: var(--min-touch-target);
    min-width: var(--min-touch-target);
  }

  .back-btn:hover {
    color: var(--color-primary);
  }

  h1 {
    font-size: clamp(1.25rem, 5vw, 1.75rem);
    margin: 0;
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    background: white;
    border-radius: var(--border-radius);
    margin-top: var(--spacing-lg);
  }

  .empty-state h2 {
    margin-bottom: var(--spacing-md);
  }

  .empty-state p {
    color: var(--color-text-light);
    margin-bottom: var(--spacing-xl);
  }
</style>
