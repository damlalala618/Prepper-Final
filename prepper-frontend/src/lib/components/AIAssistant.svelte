<script>
  import { onMount } from 'svelte';
  import { getItem } from '$lib/utils/storage';

  export let show = false;
  export let recipe = null; // Current recipe context

  const BACKEND_URL = 'http://localhost:4000';

  let messages = [];
  let inputMessage = '';
  let loading = false;
  let messagesContainer;

  onMount(() => {
    // Add welcome message
    messages = [{
      role: 'assistant',
      content: "Hi! I'm Pep, your cooking assistant. Ask me about recipes, ingredient substitutions, or get recommendations!",
      timestamp: new Date().toISOString()
    }];
  });

  async function sendMessage() {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    inputMessage = '';

    // Add user message
    messages = [...messages, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }];

    scrollToBottom();
    loading = true;

    try {
      // Get user preferences and avoid ingredients for context
      const preferences = getItem('user_preferences') || {};
      const avoidIngredients = getItem('avoid_ingredients') || [];

      const context = {
        preferences,
        avoidIngredients
      };

      // Add recipe context if viewing a recipe
      if (recipe) {
        context.recipe = recipe;
      }

      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context
        })
      });

      if (response.ok) {
        const data = await response.json();
        messages = [...messages, {
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp
        }];
      } else {
        messages = [...messages, {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now. Please try again.",
          timestamp: new Date().toISOString()
        }];
      }
    } catch (error) {
      console.error('AI chat error:', error);
      messages = [...messages, {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      }];
    } finally {
      loading = false;
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function close() {
    show = false;
  }

  $: if (show) {
    scrollToBottom();
  }
</script>

{#if show}
  <div class="ai-overlay" on:click={close} role="presentation">
    <div class="ai-modal" on:click|stopPropagation role="dialog" aria-modal="true">
      <div class="ai-header">
        <div class="ai-header-content">
          <div class="ai-icon">🌶️</div>
          <div>
            <h2>Pep</h2>
            {#if recipe}
              <p class="context-info">Helping with: {recipe.title}</p>
            {/if}
          </div>
        </div>
        <button class="close-btn" on:click={close} aria-label="Close">×</button>
      </div>

      <div class="messages-container" bind:this={messagesContainer}>
        {#each messages as message}
          <div class="message {message.role}">
            <div class="message-content">
              {message.content}
            </div>
            <div class="message-time">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        {/each}
        
        {#if loading}
          <div class="message assistant">
            <div class="message-content typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        {/if}
      </div>

      <div class="input-container">
        <input
          type="text"
          class="message-input"
          placeholder="Ask about recipes, substitutions, or get recommendations..."
          bind:value={inputMessage}
          on:keypress={handleKeyPress}
          disabled={loading}
        />
        <button 
          class="send-btn" 
          on:click={sendMessage}
          disabled={!inputMessage.trim() || loading}
          aria-label="Send message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .ai-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
    padding: var(--spacing-md);
  }

  .ai-modal {
    background: white;
    border-radius: var(--border-radius-lg);
    width: 100%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg);
  }

  .ai-header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .ai-header-content {
    display: flex;
    gap: var(--spacing-md);
    align-items: center;
  }

  .ai-icon {
    font-size: 2rem;
  }

  .ai-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--color-text);
  }

  .context-info {
    font-size: 0.75rem;
    color: var(--color-text-light);
    margin: var(--spacing-xs) 0 0 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: var(--color-text-light);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .close-btn:hover {
    color: var(--color-text);
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .message {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    max-width: 80%;
  }

  .message.user {
    align-self: flex-end;
  }

  .message.assistant {
    align-self: flex-start;
  }

  .message-content {
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
    white-space: pre-wrap;
    line-height: 1.5;
  }

  .message.user .message-content {
    background: var(--color-green);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message.assistant .message-content {
    background: var(--color-bg-light);
    color: var(--color-text);
    border-bottom-left-radius: 4px;
  }

  .message-time {
    font-size: 0.625rem;
    color: var(--color-text-light);
    padding: 0 var(--spacing-sm);
  }

  .message.user .message-time {
    text-align: right;
  }

  .typing {
    display: flex;
    gap: 4px;
    padding: var(--spacing-sm) var(--spacing-md) !important;
  }

  .typing span {
    width: 8px;
    height: 8px;
    background: var(--color-text-light);
    border-radius: 50%;
    animation: typing 1.4s infinite;
  }

  .typing span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      opacity: 0.3;
      transform: translateY(0);
    }
    30% {
      opacity: 1;
      transform: translateY(-8px);
    }
  }

  .input-container {
    padding: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
    display: flex;
    gap: var(--spacing-sm);
  }

  .message-input {
    flex: 1;
    padding: var(--spacing-md);
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius);
    font-size: 0.9375rem;
    min-height: 44px;
  }

  .message-input:focus {
    outline: none;
    border-color: var(--color-green);
  }

  .message-input:disabled {
    background: var(--color-bg-light);
    cursor: not-allowed;
  }

  .send-btn {
    background: var(--color-green);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    transition: background 0.2s;
  }

  .send-btn:hover:not(:disabled) {
    background: var(--color-green-dark);
  }

  .send-btn:disabled {
    background: var(--color-text-light);
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .ai-modal {
      max-height: 90vh;
    }
  }
</style>
