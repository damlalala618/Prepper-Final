<script>
  export let days = [];
  export let selectedDay = null;
  export let onSelectDay = null;

  function handleSelect(day) {
    if (onSelectDay) {
      onSelectDay(day);
    }
  }
</script>

<div class="day-selector">
  {#each days as day}
    <button
      class="day-btn"
      class:active={selectedDay === day}
      on:click={() => handleSelect(day)}
    >
      {day}
    </button>
  {/each}
</div>

<style>
  .day-selector {
    display: flex;
    gap: var(--spacing-xs);
    overflow-x: auto;
    padding: var(--spacing-sm) 0;
    -webkit-overflow-scrolling: touch;
  }

  .day-btn {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-bg-light);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .day-btn:hover {
    background: #e8e8e8;
  }

  .day-btn.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
</style>
