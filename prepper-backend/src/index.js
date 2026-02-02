import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = 4000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174']
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

// AI Assistant endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build system prompt based on context
    let systemPrompt = `You are a helpful cooking assistant for the Prepper meal planning app. You help users with:
- Answering questions about recipes
- Suggesting ingredient substitutions
- Providing recipe recommendations based on preferences (sweet, savory, quick, healthy, etc.)
- Offering cooking tips and techniques

Be concise, friendly, and practical. Focus on actionable advice.`;

    if (context?.recipe) {
      systemPrompt += `\n\nThe user is currently viewing this recipe:
Title: ${context.recipe.title}
Ingredients: ${context.recipe.ingredients?.map(i => `${i.amount} ${i.name}`).join(', ')}
Calories: ${context.recipe.calories} kcal
Prep time: ${context.recipe.prepMinutes} min
Cook time: ${context.recipe.cookMinutes} min`;
    }

    if (context?.preferences) {
      systemPrompt += `\n\nUser's dietary preferences:
${context.preferences.vegetarian ? '- Vegetarian\n' : ''}${context.preferences.vegan ? '- Vegan\n' : ''}${context.preferences.glutenFree ? '- Gluten Free\n' : ''}${context.preferences.dairyFree ? '- Dairy Free\n' : ''}${context.preferences.pescetarian ? '- Pescetarian\n' : ''}${context.preferences.nutFree ? '- Nut Free\n' : ''}`;
    }

    if (context?.avoidIngredients?.length > 0) {
      systemPrompt += `\n\nIngredients to avoid: ${context.avoidIngredients.join(', ')}`;
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      // Fallback to demo responses if no API key
      const response = generateAssistantResponse(message, systemPrompt, context);
      return res.json({ 
        response,
        timestamp: new Date().toISOString(),
        mode: 'demo'
      });
    }

    // Use OpenAI GPT for real AI responses
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    
    res.json({ 
      response,
      timestamp: new Date().toISOString(),
      mode: 'ai'
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

// Demo AI response generator (replace with actual AI API in production)
function generateAssistantResponse(message, systemPrompt, context) {
  const lowerMessage = message.toLowerCase();
  
  // Recipe-specific questions
  if (context?.recipe) {
    if (lowerMessage.includes('substitute') || lowerMessage.includes('replace') || lowerMessage.includes('instead')) {
      const ingredients = context.recipe.ingredients?.map(i => i.name).join(', ') || 'ingredients';
      return `For this ${context.recipe.title}, here are some common substitutions:\n\n• If avoiding dairy: Use coconut milk, almond milk, or oat milk\n• For eggs: Try flax eggs (1 tbsp ground flaxseed + 3 tbsp water)\n• Gluten-free: Use rice flour, almond flour, or gluten-free all-purpose flour\n\nWhich specific ingredient would you like to substitute?`;
    }
    
    if (lowerMessage.includes('calorie') || lowerMessage.includes('healthier')) {
      return `To make ${context.recipe.title} healthier:\n\n• Use less oil or butter (or substitute with applesauce in baking)\n• Add more vegetables to increase fiber and nutrients\n• Choose lean protein options\n• Bake or grill instead of frying\n\nThis recipe is currently ${context.recipe.calories} kcal. These changes could reduce it by 20-30%.`;
    }
    
    if (lowerMessage.includes('how') || lowerMessage.includes('cook') || lowerMessage.includes('make')) {
      return `For ${context.recipe.title}:\n\nPrep time: ${context.recipe.prepMinutes} min\nCook time: ${context.recipe.cookMinutes} min\n\nThe recipe includes these ingredients: ${context.recipe.ingredients?.slice(0, 5).map(i => i.name).join(', ')}${context.recipe.ingredients?.length > 5 ? '...' : ''}.\n\nWould you like tips for a specific step or technique?`;
    }
  }
  
  // General recommendations
  if (lowerMessage.includes('sweet') || lowerMessage.includes('dessert')) {
    return `🍰 Sweet recipe ideas:\n\n• Chocolate chip cookies\n• Fruit parfait with yogurt\n• Banana bread\n• Apple crisp\n• Brownies\n\nWould you like me to search for any of these? I can find recipes that match your dietary preferences.`;
  }
  
  if (lowerMessage.includes('savory') || lowerMessage.includes('dinner') || lowerMessage.includes('meal')) {
    let suggestions = `🍽️ Savory meal ideas:\n\n• Grilled chicken with vegetables\n• Pasta primavera\n• Stir-fry with rice\n• Tacos or burritos\n• Curry dishes`;
    
    if (context?.preferences?.vegetarian || context?.preferences?.vegan) {
      suggestions = `🍽️ Savory vegetarian meal ideas:\n\n• Vegetable stir-fry\n• Lentil curry\n• Chickpea pasta\n• Veggie tacos\n• Buddha bowls`;
    }
    
    return suggestions + `\n\nWould you like me to help you find recipes for any of these?`;
  }
  
  if (lowerMessage.includes('quick') || lowerMessage.includes('easy') || lowerMessage.includes('fast')) {
    return `⚡ Quick meal suggestions (under 30 min):\n\n• Scrambled eggs with toast\n• Grilled cheese sandwich\n• Pasta with marinara sauce\n• Quesadillas\n• Stir-fry noodles\n\nThese are perfect for busy weeknights! Want me to search for specific quick recipes?`;
  }
  
  if (lowerMessage.includes('healthy') || lowerMessage.includes('low calorie') || lowerMessage.includes('diet')) {
    return `🥗 Healthy eating tips:\n\n• Fill half your plate with vegetables\n• Choose lean proteins (chicken, fish, tofu)\n• Opt for whole grains over refined carbs\n• Limit added sugars and processed foods\n• Stay hydrated!\n\nI can help you find low-calorie recipes or modify existing ones. What type of healthy meal are you interested in?`;
  }
  
  // Default helpful response
  return `I'm here to help you with:\n\n✨ **Recipe questions** - Ask about ingredients, cooking methods, or nutritional info\n🔄 **Substitutions** - Find alternatives for ingredients you don't have or want to avoid\n💡 **Recommendations** - Get suggestions based on your mood (sweet, savory, quick, healthy)\n\nWhat would you like to know?`;
}

app.listen(PORT, () => {
  console.log(`🚀 Prepper Backend running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for http://localhost:5173`);
});
