<script>
  import { onMount } from 'svelte';
  import { getItem, setItem } from '../utils/storage';

  export let ingredients = [];

  let checkedItems = {};

  $: needed = ingredients.filter(item => !checkedItems[item.key]).length;
  $: have = ingredients.filter(item => checkedItems[item.key]).length;

  onMount(() => {
    checkedItems = getItem('prepper_ingredients_checked', {});
  });

  function toggleItem(key) {
    checkedItems[key] = !checkedItems[key];
    checkedItems = checkedItems; // Trigger reactivity
    setItem('prepper_ingredients_checked', checkedItems);
  }
</script>

<div class="ingredients-checklist">
  <p class="instructions">
    Here's a list of everything you need. Tap items you already have.
  </p>

  <div class="checklist">
    {#each ingredients as item}
      <label class="checklist-item" class:checked={checkedItems[item.key]}>
        <input
          type="checkbox"
          checked={checkedItems[item.key] || false}
          on:change={() => toggleItem(item.key)}
        />
        <span class="item-text">
          {item.name}
          {#if item.amount}
            - {item.amount}
          {/if}
        </span>
      </label>
    {/each}
  </div>

  <div class="shopping-summary card">
    <h3>Shopping Summary</h3>
    <div class="summary-stats">
      <div class="stat">
        <span class="stat-label">Need:</span>
        <span class="stat-value">{needed} items</span>
      </div>
      <div class="stat">
        <span class="stat-label">Already have:</span>
        <span class="stat-value">{have} items</span>
      </div>
    </div>
  </div>
</div>

<style>
  .ingredients-checklist {
    padding-bottom: 2rem;
  }

  .instructions {
    font-size: 0.9375rem;
    color: var(--color-text-light);
    margin-bottom: var(--spacing-lg);
    line-height: 1.6;
  }

  .checklist {
    margin-bottom: var(--spacing-xl);
  }

  .checklist-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .checklist-item:hover {
    background: var(--color-bg-light);
  }

  .checklist-item input {
    width: 20px;
    height: 20px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .item-text {
    flex: 1;
    font-size: 0.9375rem;
  }

  .checklist-item.checked .item-text {
    text-decoration: line-through;
    color: var(--color-text-light);
  }

  .shopping-summary {
    background: var(--color-yellow);
  }

  .shopping-summary h3 {
    font-size: 1.125rem;
    color: var(--color-red);
    margin-bottom: var(--spacing-md);
  }

  .summary-stats {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .stat {
    display: flex;
    justify-content: space-between;
    font-size: 0.9375rem;
  }

  .stat-label {
    color: var(--color-text-light);
  }

  .stat-value {
    font-weight: 600;
    color: var(--color-text);
  }
</style>
