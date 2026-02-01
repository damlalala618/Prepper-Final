<script>
  export let show = false;

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
</script>

{#if show}
  <div 
    class="modal-backdrop" 
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="presentation"
  >
    <div class="modal-content" role="dialog" aria-modal="true">
      <h2>How Prepper Works</h2>
      
      <div class="info-section">
        <h3>Plan</h3>
        <p>Choose recipes for your week based on what you have in your fridge.</p>
      </div>

      <div class="info-section">
        <h3>Prep</h3>
        <p>Follow step-by-step cooking instructions to prepare your meals.</p>
      </div>

      <div class="info-section">
        <h3>Plate</h3>
        <p>Store and track your meals throughout the week with helpful guides.</p>
      </div>

      <button class="btn-primary" on:click={close}>Close</button>
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
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-md);
  }

  .modal-content {
    background: white;
    border-radius: var(--border-radius);
    padding: var(--spacing-lg);
    width: 100%;
    max-width: 500px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-height: 90vh;
    overflow-y: auto;
  }

  @media (min-width: 640px) {
    .modal-content {
      padding: var(--spacing-xl);
    }
  }

  h2 {
    margin-bottom: var(--spacing-lg);
  }

  .info-section {
    margin-bottom: var(--spacing-lg);
  }

  .info-section h3 {
    font-size: 1.125rem;
    margin-bottom: var(--spacing-xs);
  }

  .info-section p {
    color: var(--color-text-light);
    line-height: 1.6;
  }

  button {
    margin-top: var(--spacing-md);
  }
</style>
