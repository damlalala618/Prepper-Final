<script>
  export let recipe = null;
</script>

<div class="storage-guide card">
  <h3>Storage Guide</h3>
  <ul>
    <li>Store in airtight containers to maintain freshness</li>
    <li>Refrigerate within 2 hours of cooking</li>
    <li>Keep refrigerated for up to 4 days</li>
    <li>Can be frozen for up to 3 months</li>
    {#if recipe?.area === 'Indian' || recipe?.area === 'Thai'}
      <li>Flavors develop more over time - tastes even better the next day!</li>
    {/if}
  </ul>
</div>

<style>
  .storage-guide {
    margin-bottom: var(--spacing-lg);
  }

  h3 {
    font-size: 1.125rem;
    margin-bottom: var(--spacing-md);
  }

  ul {
    padding-left: 1.5rem;
    color: var(--color-text);
  }

  li {
    margin-bottom: var(--spacing-xs);
    line-height: 1.6;
  }
</style>
