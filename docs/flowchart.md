# Prepper Application - User Flow Flowchart

This flowchart shows the complete user journey through the Prepper application.

```mermaid
flowchart TD
    Start([App Launch]) --> Splash[Splash Screen]
    Splash -->|Dismiss| Home[Home Page /]
    
    Home -->|Start Planning| Plan[Plan Page /plan]
    Home -->|Bottom Nav| Prep[Prep Page /prep]
    Home -->|Bottom Nav| Plate[Plate Page /plate]
    
    Plan -->|Step 1| PlanPeriod[Select Period: Week/Days]
    PlanPeriod -->|Step 2| PlanFridge[Enter Fridge Contents]
    PlanFridge -->|Generate Plan| PlanAPI[Backend fetches recipes from TheMealDB]
    PlanAPI -->|Step 3| PlanResults[Review Recipe Results]
    
    PlanResults -->|View Ingredients| Ingredients[Ingredients Page /ingredients]
    PlanResults -->|View Recipe| RecipeModal[Recipe Modal]
    PlanResults -->|Swap Sides| PlanResults
    PlanResults -->|Regenerate| PlanAPI
    PlanResults -->|Save This Plan| SavePlan[Save to localStorage]
    
    SavePlan --> Prep
    
    Prep -->|No Plan| EmptyPrep[Empty State: Go to Plan]
    Prep -->|Has Plan| PrepSteps[Step-by-Step Cooking View]
    PrepSteps -->|Adjust Portions| PrepSteps
    PrepSteps -->|Select Day| PrepSteps
    PrepSteps -->|Complete| Plate
    
    Plate -->|No Plan| EmptyPlate[Empty State: Go to Plan]
    Plate -->|Has Plan| PlateView[Storage & Reheat Guide]
    PlateView -->|Mark Consumed| WeekTracker[Week Tracker]
    PlateView -->|Select Day| PlateView
    
    Ingredients -->|Back| Plan
    Ingredients -->|Check Items| IngredientsCheck[Update Shopping Checklist]
    IngredientsCheck --> Ingredients
    
    EmptyPrep --> Plan
    EmptyPlate --> Plan
    
    RecipeModal -->|View Ingredients| Ingredients
    RecipeModal -->|Close| PlanResults
    
    style Splash fill:#f5f5f5
    style Home fill:#e3f2fd
    style Plan fill:#fff3e0
    style Prep fill:#e8f5e9
    style Plate fill:#fce4ec
    style Ingredients fill:#f3e5f5
```

## Flow Summary

1. **Entry Point**: User launches app → Splash Screen
2. **Home Hub**: Splash dismisses → Home page (with date navigation, favorites, CTA)
3. **Planning Journey**:
   - Step 1: Choose period (whole week or specific days)
   - Step 2: Enter fridge contents
   - Backend fetches recipes from TheMealDB API
   - Step 3: Review, swap sides, regenerate, view recipes
   - Save plan to localStorage
4. **Prep Phase**: Access saved plan, adjust portions, follow step-by-step instructions
5. **Plate Phase**: Storage/reheat guidance, consumption tracking
6. **Ingredients**: Dedicated shopping checklist accessible from Plan
7. **Navigation**: Fixed bottom nav (Home | Plan | Prep | Plate) for quick access

## Key Decision Points

- **Has Saved Plan?** → Determines Prep/Plate content vs empty state
- **Period Selection** → Whole Week vs Individual Days → Affects recipe generation
- **Bottom Nav** → Always accessible for page switching
