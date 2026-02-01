<script>
  import { onMount } from 'svelte';
  import { getItem, setItem } from '../utils/storage';

  export let days = [];

  let consumed = {};

  onMount(() => {
    consumed = getItem('prepper_week_tracker', {});
  });

  function toggleDay(day) {
    consumed[day] = !consumed[day];
    consumed = consumed; // Trigger reactivity
    setItem('prepper_week_tracker', consumed);
  }
</script>

<div class="week-tracker card">
  <h3>Week Tracker</h3>
  <p class="description">Mark the days you've consumed your meal prep:</p>
  
  <div class="days-grid">
    {#each days as day}
      <label class="day-checkbox">
        <input
          type="checkbox"
          checked={consumed[day] || false}
          on:change={() => toggleDay(day)}
        />
        <span>{day}</span>
      </label>
    {/each}
  </div>
</div>

<style>
  .week-tracker {
    margin-bottom: var(--spacing-lg);
  }

  h3 {
    font-size: 1.125rem;
    margin-bottom: var(--spacing-xs);
  }

  .description {
    font-size: 0.875rem;
    color: var(--color-text-light);
    margin-bottom: var(--spacing-md);
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .day-checkbox {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    cursor: pointer;
    padding: var(--spacing-xs);
  }

  .day-checkbox input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .day-checkbox span {
    font-size: 0.9375rem;
  }
</style>
