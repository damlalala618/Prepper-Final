import { writable } from 'svelte/store';

// Planning preferences (used during plan creation flow)
export const planningPreferences = writable({
  periodType: 'week', // 'week' or 'days'
  selectedDays: [], // array of day names if periodType is 'days'
  weekStart: null, // Monday date
  fridgeContents: '',
  currentStep: 1 // 1, 2, or 3
});
