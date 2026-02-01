import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

// Helper function to normalize TheMealDB recipe data
function normalizeRecipe(meal) {
  if (!meal) return null;

  // Parse ingredients
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        name: ingredient.trim(),
        amount: measure ? measure.trim() : ''
      });
    }
  }

  // Parse instructions into steps
  const instructions = meal.strInstructions || '';
  const steps = instructions
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.match(/^STEP \d+$/i))
    .map(s => s.replace(/^\d+\.\s*/, '').replace(/^\d+\)\s*/, ''));

  // Estimate cooking metrics (TheMealDB doesn't provide these)
  const estimatedPrepMinutes = 15 + Math.floor(Math.random() * 20);
  const estimatedCookMinutes = 20 + Math.floor(Math.random() * 40);
  const estimatedCalories = 400 + Math.floor(Math.random() * 400);

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    ingredients,
    steps,
    calories: estimatedCalories,
    prepMinutes: estimatedPrepMinutes,
    cookMinutes: estimatedCookMinutes,
    labels: ['estimated', 'api'],
    category: meal.strCategory || '',
    area: meal.strArea || ''
  };
}

// API Routes

// Search recipes by name
app.get('/api/recipes/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.meals) {
      return res.status(404).json({ error: 'No recipes found' });
    }

    const recipes = data.meals.map(normalizeRecipe).filter(r => r !== null);
    res.json({ recipes });
  } catch (error) {
    console.error('Search error:', error);
    res.status(502).json({ error: 'Recipe service unavailable' });
  }
});

// Get recipe by ID
app.get('/api/recipes/byId', async (req, res) => {
  try {
    const id = req.query.id;
    
    if (!id) {
      return res.status(400).json({ error: 'Recipe ID required' });
    }

    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.meals || data.meals.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = normalizeRecipe(data.meals[0]);
    res.json({ recipe });
  } catch (error) {
    console.error('Lookup error:', error);
    res.status(502).json({ error: 'Recipe service unavailable' });
  }
});

// Get random recipe
app.get('/api/recipes/random', async (req, res) => {
  try {
    const url = 'https://www.themealdb.com/api/json/v1/1/random.php';
    const response = await fetch(url);
    const data = await response.json();

    if (!data.meals || data.meals.length === 0) {
      return res.status(404).json({ error: 'No recipe found' });
    }

    const recipe = normalizeRecipe(data.meals[0]);
    res.json({ recipe });
  } catch (error) {
    console.error('Random recipe error:', error);
    res.status(502).json({ error: 'Recipe service unavailable' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'prepper-backend' });
});

app.listen(PORT, () => {
  console.log(`🚀 Prepper Backend running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for http://localhost:5173`);
});
