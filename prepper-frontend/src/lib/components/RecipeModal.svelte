<script>
  export let recipe = null;
  export let show = false;
  export let onViewIngredients = null;

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
        <h2>{recipe.title}</h2>
        <button class="close-btn" on:click={close} aria-label="Close">×</button>
      </div>

      {#if recipe.image}
        <img src={recipe.image} alt={recipe.title} class="recipe-image" />
      {/if}

      <div class="modal-body">
        <div class="section">
          <h3>Ingredients</h3>
          <ul class="ingredients-list">
            {#each recipe.ingredients as ingredient}
              <li>
                {ingredient.name}
                {#if ingredient.amount}
                  - {ingredient.amount}
                {/if}
              </li>
            {/each}
          </ul>
        </div>

        <div class="section">
          <h3>Instructions</h3>
          <ol class="steps-list">
            {#each recipe.steps as step, i}
              <li>{step}</li>
            {/each}
          </ol>
        </div>

        {#if onViewIngredients}
          <button class="btn-primary" on:click={handleViewIngredients}>
            View Ingredients
          </button>
        {/if}
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
    align-items: flex-start;
    padding: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
  }

  @media (min-width: 640px) {
    .modal-header {
      padding: var(--spacing-lg);
      padding-bottom: var(--spacing-md);
    }
  }

  .modal-header h2 {
    margin: 0;
    flex: 1;
    padding-right: var(--spacing-md);
    font-size: clamp(1.125rem, 4vw, 1.5rem);
    color: var(--color-red);
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

  .section {
    margin-bottom: var(--spacing-xl);
  }

  .section h3 {
    font-size: 1.125rem;
    margin-bottom: var(--spacing-md);
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
