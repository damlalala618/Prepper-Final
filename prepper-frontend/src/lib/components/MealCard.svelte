<script>
  export let meal;
  export let onViewRecipe = null;
  export let onSwapSides = null;
  export let onRegenerate = null;
</script>

<div class="meal-card">
  <div class="card-header">
    <h3>{meal.dayName}, {meal.date}</h3>
  </div>

  <div class="card-body">
    <div class="meal-info">
      <p class="main-dish"><strong>Main:</strong> {meal.mainDish.title}</p>
      <p class="sides"><strong>Sides:</strong> {meal.sides.join(', ')}</p>
    </div>

    <div class="meal-meta">
      <span class="portions">{meal.portions} portions</span>
      <span class="calories">{meal.mainDish.calories} cal</span>
      <span class="time">{meal.mainDish.prepMinutes + meal.mainDish.cookMinutes}min</span>
    </div>

    <div class="card-actions">
      {#if onViewRecipe}
        <button class="btn-secondary" on:click={() => onViewRecipe(meal.mainDish)}>
          View Recipe
        </button>
      {/if}
      {#if onSwapSides}
        <button class="btn-secondary" on:click={() => onSwapSides(meal)}>
          Swap Sides
        </button>
      {/if}
      {#if onRegenerate}
        <button class="btn-secondary" on:click={() => onRegenerate(meal)}>
          Regenerate
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .meal-card {
    background: white;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    min-width: 280px;
    max-width: 320px;
    flex-shrink: 0;
    box-shadow: var(--shadow-sm);
  }

  @media (min-width: 640px) {
    .meal-card {
      min-width: 320px;
      max-width: 360px;
    }
  }

  .card-header {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
  }

  .card-header h3 {
    font-size: 0.9375rem;
    margin: 0;
    color: var(--color-text);
    font-weight: 600;
  }

  @media (min-width: 640px) {
    .card-header h3 {
      font-size: 1rem;
    }
  }

  .card-body {
    padding: var(--spacing-md);
  }

  .meal-info {
    margin-bottom: var(--spacing-md);
  }

  .meal-info p {
    margin-bottom: var(--spacing-xs);
    line-height: 1.5;
  }

  .main-dish {
    font-size: 0.9375rem;
  }

  .sides {
    font-size: 0.875rem;
    color: var(--color-text-light);
  }

  .meal-meta {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    font-size: 0.8125rem;
    color: var(--color-text-light);
    flex-wrap: wrap;
  }

  @media (min-width: 640px) {
    .meal-meta {
      font-size: 0.875rem;
    }
  }

  .card-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .card-actions button {
    font-size: 0.875rem;
    padding: var(--spacing-sm);
    min-height: var(--min-touch-target);
  }
</style>
