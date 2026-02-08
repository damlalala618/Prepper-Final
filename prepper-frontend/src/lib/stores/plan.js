import { writable } from 'svelte/store';
import { getItem, setItem } from '../utils/storage';

// Saved meal plan
function createPlanStore() {
  const { subscribe, set, update } = writable(null);

  // Load from localStorage on initialization
  if (typeof window !== 'undefined') {
    const saved = getItem('prepper_plan');
    if (saved) {
      set(saved);
    }
  }

  return {
    subscribe,
    set: (value) => {
      set(value);
      setItem('prepper_plan', value);
    },
    update: (fn) => {
      update((current) => {
        const newValue = fn(current);
        setItem('prepper_plan', newValue);
        return newValue;
      });
    },
    clear: () => {
      set(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('prepper_plan');
      }
    }
  };
}

export const planStore = createPlanStore();
