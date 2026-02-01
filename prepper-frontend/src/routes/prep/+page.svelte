<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { planStore } from '$lib/stores/plan';
  import DaySelector from '$lib/components/DaySelector.svelte';

  let plan = null;
  let selectedDayIndex = 0;
  let portions = 2;
  let activeStepIndex = 0;
  let observer;

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
      activeStepIndex = 0;
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

  onMount(() => {
    // Set up IntersectionObserver for active step detection
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.stepIndex);
            activeStepIndex = index;
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-100px 0px -100px 0px'
      }
    );

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  });

  function setupObserver(node, index) {
    node.dataset.stepIndex = index;
    if (observer) {
      observer.observe(node);
    }
    return {
      destroy() {
        if (observer) {
          observer.unobserve(node);
        }
      }
    };
  }
</script>

<svelte:head>
  <title>Prep - Prepper</title>
</svelte:head>

<div class="prep-page">
  <div class="container">
    <h1>Cook</h1>

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
      <div class="plan-summary card">
        <h2 class="recipe-title">{selectedMeal.mainDish.title}</h2>
        <p class="sides-info">+ {selectedMeal.sides.length} sides</p>
        
        <div class="portion-adjuster">
          <button 
            class="portion-btn" 
            on:click={() => adjustPortions(-1)}
            disabled={portions <= 1}
          >
            −
          </button>
          <span class="portion-display">{portions} portions</span>
          <button 
            class="portion-btn" 
            on:click={() => adjustPortions(1)}
            disabled={portions >= 10}
          >
            +
          </button>
        </div>
      </div>

      {#if days.length > 1}
        <DaySelector 
          {days} 
          selectedDay={days[selectedDayIndex]}
          onSelectDay={selectDay}
        />
      {/if}

      <div class="steps-container">
        <h2>Instructions</h2>
        
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
            <div 
              class="step-item" 
              class:active={i === activeStepIndex}
              class:completed={i < activeStepIndex}
              class:upcoming={i > activeStepIndex}
              use:setupObserver={i}
            >
              <div class="step-number">{i + 1}</div>
              <div class="step-content">
                <p>{step}</p>
              </div>
            </div>
          {/each}
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

  .sides-info {
    font-size: 0.875rem;
    color: var(--color-text-light);
    margin-bottom: var(--spacing-lg);
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
    gap: var(--spacing-lg);
    padding-bottom: var(--spacing-xl);
  }

  .step-item {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: white;
    border-radius: var(--border-radius);
    border: 2px solid transparent;
    transition: all 0.3s ease;
  }

  @media (min-width: 640px) {
    .step-item {
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
    }
  }

  .step-item.active {
    opacity: 1;
    border-color: var(--color-orange);
    box-shadow: var(--shadow-md);
  }

  .step-item.upcoming {
    opacity: 0.6;
    filter: blur(0.5px);
  }

  .step-item.completed {
    opacity: 0.8;
  }

  .step-number {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--color-bg-light);
    border: 2px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: var(--color-text);
    font-size: 0.875rem;
  }

  @media (min-width: 640px) {
    .step-number {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1rem;
    }
  }

  .step-item.active .step-number {
    background: var(--color-orange);
    color: white;
    border-color: var(--color-orange);
  }

  .step-content {
    flex: 1;
  }

  .step-content p {
    line-height: 1.6;
    font-size: 0.9375rem;
  }

  @media (min-width: 640px) {
    .step-content p {
      font-size: 1rem;
    }
  }
</style>
