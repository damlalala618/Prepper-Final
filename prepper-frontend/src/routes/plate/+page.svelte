<script>
  import { goto } from '$app/navigation';
  import { planStore } from '$lib/stores/plan';
  import DaySelector from '$lib/components/DaySelector.svelte';
  import StorageGuide from '$lib/components/StorageGuide.svelte';
  import ReheatGuide from '$lib/components/ReheatGuide.svelte';
  import WeekTracker from '$lib/components/WeekTracker.svelte';

  let plan = null;
  let selectedDayIndex = 0;

  $: if ($planStore) {
    plan = $planStore;
  }

  $: selectedMeal = plan?.meals?.[selectedDayIndex];
  $: days = plan?.meals?.map(m => m.dayName) || [];

  function selectDay(dayShort) {
    const index = days.findIndex(d => d.substring(0, 3) === dayShort);
    if (index !== -1) {
      selectedDayIndex = index;
    }
  }
</script>

<svelte:head>
  <title>Plate - Prepper</title>
</svelte:head>

<div class="plate-page">
  <div class="container">
    <h1>Store & Reheat</h1>

    {#if !plan || !plan.meals || plan.meals.length === 0}
      <!-- Empty State -->
      <div class="empty-state">
        <h2>No Meal Plan Found</h2>
        <p>Start by creating a meal plan first.</p>
        <button class="btn-primary" on:click={() => goto('/plan')}>
          Back to Plan
        </button>
      </div>
    {:else}
      <!-- Plan exists -->
      {#if days.length > 1}
        <DaySelector 
          days={days.map(d => d.substring(0, 3))} 
          selectedDay={days[selectedDayIndex].substring(0, 3)}
          onSelectDay={selectDay}
        />
      {/if}

      <div class="meal-info card">
        <h3>{selectedMeal.mainDish.title}</h3>
        <p class="meal-meta">
          {selectedMeal.portions} portions | {selectedMeal.mainDish.calories} cal
        </p>
      </div>

      <StorageGuide recipe={selectedMeal.mainDish} />

      <ReheatGuide recipe={selectedMeal.mainDish} />

      <WeekTracker {days} />
    {/if}
  </div>
</div>

<style>
  .plate-page {
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

  .meal-info {
    margin-bottom: var(--spacing-lg);
  }

  .meal-info h3 {
    font-size: 1.25rem;
    margin-bottom: var(--spacing-xs);
  }

  .meal-meta {
    font-size: 0.875rem;
    color: var(--color-text-light);
  }
</style>
