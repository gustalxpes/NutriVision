
export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  timestamp: string; // ISO string
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion?: string;
  imageUrl?: string;
  ingredients?: string[];
}

export interface AnalysisResult {
  foodName: string;
  description: string; // Mantido para compatibilidade, mas pode ser ignorado na UI
  portion: string; // Novo campo
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
}

export interface Recipe {
  name: string;
  description: string;
  timeToCook: string;
  difficulty: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[]; // Novo campo para o modo de preparo
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SCAN_FOOD = 'SCAN_FOOD',
  RECIPES = 'RECIPES',
  SAVED_RECIPES = 'SAVED_RECIPES',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS'
}
