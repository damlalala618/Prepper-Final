# Prepper - Meal Prepping Made Simple

A full-stack meal planning application that helps you plan, prep, and track your weekly meals.

## Features

- 📋 **Plan**: Create meal plans for the week based on available ingredients
- 👨‍🍳 **Prep**: Follow step-by-step cooking instructions with portion adjustment
- 🍽️ **Plate**: Storage and reheating guides with weekly consumption tracker
- 🛒 **Ingredients**: Smart shopping checklist that aggregates all required ingredients

## Architecture

This is a monorepo containing two separate services:

- **Backend** (Node.js + Express) - API service running on port 4000
- **Frontend** (SvelteKit) - Web application running on port 5173

### External API Integration

The application integrates with [TheMealDB](https://www.themealdb.com/) public API to fetch real recipe data including:
- Recipe search by ingredients
- Random recipe generation
- Detailed recipe information (ingredients, instructions, images)

## Prerequisites

- Node.js 18+ (for native fetch support)
- npm or yarn package manager

## Project Structure

```
Prepper-final/
├── docs/
│   ├── flowchart.md        # User flow diagram (Mermaid)
│   └── wireframes.md       # Low-fidelity screen wireframes
├── prepper-backend/
│   ├── src/
│   │   └── index.js        # Express server with API endpoints
│   └── package.json
├── prepper-frontend/
│   ├── src/
│   │   ├── routes/         # SvelteKit pages
│   │   │   ├── +layout.svelte
│   │   │   ├── +page.svelte        (Home)
│   │   │   ├── plan/+page.svelte   (Plan)
│   │   │   ├── prep/+page.svelte   (Prep)
│   │   │   ├── plate/+page.svelte  (Plate)
│   │   │   └── ingredients/+page.svelte
│   │   ├── lib/
│   │   │   ├── components/ # Reusable Svelte components
│   │   │   ├── stores/     # State management
│   │   │   └── utils/      # Helper functions
│   │   └── app.css         # Global styles
│   └── package.json
└── README.md
```

## How to Run

### 1. Start the Backend Service

Open a terminal and navigate to the backend directory:

```bash
cd prepper-backend
npm install
npm run dev
```

The backend server will start on **http://localhost:4000**

You should see:
```
🚀 Prepper Backend running on http://localhost:4000
📡 CORS enabled for http://localhost:5173
```

### 2. Start the Frontend Service

Open a **new terminal** and navigate to the frontend directory:

```bash
cd prepper-frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**

You should see:
```
  VITE ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### 3. Access the Application

Open your browser and navigate to **http://localhost:5173**

## Usage Guide

### First Time Use

1. **Splash Screen**: Click anywhere to dismiss the welcome screen
2. **Home Page**: Browse the interface and click "Start Planning"
3. **Plan Your Week**:
   - **Step 1**: Choose whole week or specific days
   - **Step 2**: Enter ingredients you have (e.g., "chicken, pasta, tomatoes")
   - **Step 3**: Review generated recipes, swap sides, regenerate meals
   - Click "Save This Plan" when satisfied
4. **Prep**: Follow cooking instructions with adjustable portions
5. **Plate**: View storage/reheat guides and track consumption
6. **Ingredients**: Access shopping checklist (available from Plan page)

### Navigation

The bottom navigation bar is always visible with quick access to:
- **Home**: Overview and date selection
- **Plan**: Meal planning interface
- **Prep**: Cooking mode
- **Plate**: Storage and tracking

## API Endpoints

### Backend (http://localhost:4000)

- `GET /api/recipes/search?q=<query>` - Search recipes by ingredient/name
- `GET /api/recipes/byId?id=<id>` - Get recipe by ID
- `GET /api/recipes/random` - Get random recipe
- `GET /health` - Health check

All endpoints return normalized recipe data with estimated calories, prep/cook times.

## Data Persistence

The application uses browser storage:

- **localStorage**: Saved meal plans, ingredient checklist, consumption tracker
- **sessionStorage**: Splash screen dismissal state

## Technologies Used

### Backend
- Node.js
- Express.js
- CORS middleware
- TheMealDB API

### Frontend
- SvelteKit (SSG/SPA)
- Svelte 4
- Vite
- Plain CSS (no frameworks)
- Native browser APIs (localStorage, IntersectionObserver)

## Key Features Implemented

✅ **Documentation First**: Flowchart and wireframes created before implementation  
✅ **Two Services**: Separate backend and frontend services  
✅ **External API**: Real recipe data from TheMealDB  
✅ **Svelte Components**: 10+ reusable components  
✅ **Multiple Pages**: 5 distinct routes with different functionality  
✅ **Runnable**: Clear setup and run instructions  

## Development Notes

- Backend uses Node.js native `fetch` (Node 18+)
- Frontend fetches recipes **only** through the backend (never directly from TheMealDB)
- All recipe data is normalized to a consistent schema
- Estimates provided for calories, prep time, and cook time (TheMealDB doesn't provide these)
- UI language is English throughout
- Mobile-friendly responsive design

## Troubleshooting

**Problem**: Frontend can't connect to backend  
**Solution**: Ensure backend is running on port 4000 before starting frontend

**Problem**: No recipes found  
**Solution**: Backend requires internet connection to fetch from TheMealDB API

**Problem**: Port already in use  
**Solution**: Change port in `vite.config.js` (frontend) or `src/index.js` (backend)

## License

MIT

## Author

Built for meal prep enthusiasts who want to simplify weekly planning and cooking.
