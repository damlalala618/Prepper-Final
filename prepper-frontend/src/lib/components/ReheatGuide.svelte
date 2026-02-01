<script>
  export let recipe = null;
</script>

<div class="reheat-guide card">
  <h3>Reheat Guide</h3>
  <ul>
    <li><strong>Microwave:</strong> 2-3 minutes on high, stirring halfway</li>
    <li><strong>Stovetop:</strong> 5-7 minutes over medium heat</li>
    <li><strong>Oven:</strong> 15-20 minutes at 350°F (175°C)</li>
    <li>Add a splash of water or broth if the food seems dry</li>
    <li>Ensure food reaches 165°F (74°C) internal temperature</li>
  </ul>
</div>

<style>
  .reheat-guide {
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

  strong {
    color: var(--color-text);
  }
</style>
