import { writable } from 'svelte/store';
import { getItem, setItem } from '../utils/storage';

function createMarkedRecipesStore() {
  const { subscribe, set, update } = writable<any[]>([]);

  // Load from localStorage on initialization
  if (typeof window !== 'undefined') {
    const saved = getItem('marked_recipes');
    if (saved && Array.isArray(saved)) {
      set(saved);
    }
  }

  return {
    subscribe,
    toggle: (recipe: any) => {
      update(recipes => {
        const index = recipes.findIndex(r => r.id === recipe.id);
        let newRecipes;
        if (index >= 0) {
          // Remove if already marked
          newRecipes = recipes.filter(r => r.id !== recipe.id);
        } else {
          // Add if not marked
          newRecipes = [...recipes, {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image
          }];
        }
        setItem('marked_recipes', newRecipes);
        return newRecipes;
      });
    },
    isMarked: (recipes: any[], recipeId: string) => {
      return recipes.some(r => r.id === recipeId);
    }
  };
}

export const markedRecipes = createMarkedRecipesStore();
