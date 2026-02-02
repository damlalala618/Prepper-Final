<script>
  import { goto } from '$app/navigation';
  import { markedRecipes } from '$lib/stores/markedRecipes';

  export let recipe = null;
  export let show = false;
  export let onViewIngredients = null;

  let showIngredients = false;
  let showInstructions = false;
  let portions = 2;

  $: isMarked = recipe ? markedRecipes.isMarked($markedRecipes, recipe.id) : false;

  // Reset accordion state and portions when modal opens
  $: if (show && recipe) {
    showIngredients = false;
    showInstructions = false;
    portions = recipe.portions || 2;
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

  function adjustPortions(delta) {
    portions = Math.max(1, Math.min(10, portions + delta));
  }

  function toggleMark() {
    if (recipe) {
      markedRecipes.toggle(recipe);
    }
  }

  function toggleIngredients() {
    showIngredients = !showIngredients;
  }

  function toggleInstructions() {
    showInstructions = !showInstructions;
  }

  function close() {
    show = false;
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      close();
    }
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  function handleViewIngredients() {
    if (onViewIngredients) {
      onViewIngredients();
    } else {
      // Default behavior: navigate to prep page
      goto('/prep');
    }
  }

</script>

{#if show && recipe}
  <div 
    class="modal-backdrop" 
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="presentation"
  >
    <div class="modal-content" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h2 class="recipe-title">{recipe.title}</h2>
        <div class="header-actions">
          <button class="star-btn" on:click={toggleMark} aria-label={isMarked ? 'Unmark recipe' : 'Mark recipe'}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill={isMarked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          <button class="close-btn" on:click={close} aria-label="Close">×</button>
        </div>
      </div>

      {#if recipe.image}
        <img src={recipe.image} alt={recipe.title} class="recipe-image" />
      {/if}

      <div class="recipe-meta">
        <div class="portion-adjuster">
          <button 
            class="portion-btn" 
            on:click={() => adjustPortions(-1)}
            disabled={portions <= 1}
            aria-label="Decrease portions"
          >
            −
          </button>
          <span class="portion-display">{portions} portions</span>
          <button 
            class="portion-btn" 
            on:click={() => adjustPortions(1)}
            disabled={portions >= 10}
            aria-label="Increase portions"
          >
            +
          </button>
        </div>
        <div class="meta-info">
          <span>{recipe.calories} kcal</span>
          <span>·</span>
          <span>{recipe.prepMinutes + recipe.cookMinutes} min</span>
        </div>
      </div>

      <div class="modal-body">
        <div class="accordion-section">
          <button class="accordion-header" on:click={toggleIngredients}>
            <h3>See Ingredients</h3>
            <span class="accordion-icon">{showIngredients ? '−' : '+'}</span>
          </button>
          {#if showIngredients}
            <div class="accordion-content">
              {#key portions}
                <ul class="ingredients-list">
                  {#each recipe.ingredients as ingredient}
                    <li>
                      {ingredient.name}
                      {#if ingredient.amount}
                        - {getScaledAmount(ingredient.amount, recipe.portions || 2)}
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/key}
            </div>
          {/if}
        </div>

        <div class="accordion-section">
          <button class="accordion-header" on:click={toggleInstructions}>
            <h3>See Instructions</h3>
            <span class="accordion-icon">{showInstructions ? '−' : '+'}</span>
          </button>
          {#if showInstructions}
            <div class="accordion-content">
              <ol class="steps-list">
                {#each recipe.steps as step, i}
                  <li>{step}</li>
                {/each}
              </ol>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-sm);
    overflow-y: auto;
  }

  @media (min-width: 640px) {
    .modal-backdrop {
      padding: var(--spacing-lg);
      align-items: center;
    }
  }

  .modal-content {
    background: white;
    border-radius: var(--border-radius);
    width: 100%;
    max-width: 600px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-height: 95vh;
    overflow-y: auto;
    margin: var(--spacing-sm) 0;
  }

  @media (min-width: 640px) {
    .modal-content {
      max-height: 90vh;
      margin: var(--spacing-xl) 0;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    background: white;
  }

  @media (min-width: 640px) {
    .modal-header {
      padding: var(--spacing-lg);
    }
  }

  .recipe-title {
    font-family: 'Otomanopee One', sans-serif;
    font-weight: 400;
    font-size: clamp(1.125rem, 4vw, 1.5rem);
    color: var(--color-red);
    margin: 0;
    flex: 1;
    padding-right: var(--spacing-md);
  }

  .recipe-meta {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
  }

  .portion-adjuster {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-sm);
    background: var(--color-bg-light);
    border-radius: var(--border-radius);
  }

  .portion-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: white;
    border: 1px solid var(--color-border);
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  .portion-btn:hover:not(:disabled) {
    background: var(--color-green);
    color: white;
    border-color: var(--color-green);
  }

  .portion-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .portion-display {
    font-weight: 600;
    min-width: 100px;
    text-align: center;
    font-size: 0.875rem;
  }

  .meta-info {
    display: flex;
    justify-content: center;
    gap: var(--spacing-xs);
    font-size: 0.875rem;
    color: var(--color-text-light);
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
    flex-shrink: 0;
  }

  .star-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--color-orange);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
  }

  .star-btn:hover {
    transform: scale(1.15);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    line-height: 1;
    color: var(--color-text-light);
    cursor: pointer;
    padding: 0;
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .close-btn:hover {
    color: var(--color-text);
  }

  .recipe-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  @media (min-width: 640px) {
    .recipe-image {
      height: 300px;
    }
  }

  .modal-body {
    padding: var(--spacing-md);
  }

  @media (min-width: 640px) {
    .modal-body {
      padding: var(--spacing-xl);
    }
  }

  .accordion-section {
    margin-bottom: var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  .accordion-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--color-bg-light);
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.2s;
  }

  .accordion-header:hover {
    background: #e8e8e8;
  }

  .accordion-header h3 {
    font-size: 1.125rem;
    margin: 0;
  }

  .accordion-icon {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-light);
    min-width: 30px;
    text-align: center;
  }

  .accordion-content {
    padding: var(--spacing-md);
    background: white;
  }

  .ingredients-list {
    list-style: none;
    padding: 0;
  }

  .ingredients-list li {
    padding: var(--spacing-xs) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .ingredients-list li:last-child {
    border-bottom: none;
  }

  .steps-list {
    padding-left: 1.5rem;
  }

  .steps-list li {
    margin-bottom: var(--spacing-md);
    line-height: 1.6;
  }
</style>
