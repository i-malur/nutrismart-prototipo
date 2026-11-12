export type DietaryPreference = 
  | 'Todas' 
  | 'Equilibrada' 
  | 'Low Carb' 
  | 'Vegetariana' 
  | 'Vegana' 
  | 'Sem Glúten' 
  | 'Sem Lactose' 
  | 'Ganho de Massa' 
  | 'Rápida (15 min)'
  | 'Econômica';

export type FoodCategory = 
  | 'Hortifruti (Frutas & Vegetais)'
  | 'Proteínas & Carnes'
  | 'Grãos, Cereais & Massas'
  | 'Laticínios & Derivados'
  | 'Temperos & Condimentos'
  | 'Molhos & Conservas'
  | 'Padaria & Farinhas'
  | 'Bebidas'
  | 'Outros';

export type TabType = 
  | 'dispensa' 
  | 'receitas' 
  | 'cardapio' 
  | 'nutricionistas';

  export const AVAILABLE_RESTRICTIONS = [
  'Sem Glúten',
  'Sem Lactose',
  'Sem Açúcar / Diabético',
  'Vegetariano',
  'Vegano',
  'Alergia a Amendoim',
  'Alergia a Frutos do Mar',
  'Alergia a Soja',
  'Alergia a Ovo',
  'Intolerância a Fructose',
  'Hipertenso (Baixo Sódio)',
  'Baixo Colesterol (Low Fat)',
  'SÍNDROME DO INTESTINO IRRITÁVEL (FODMAP)',
  'Religiosa / Halal / Kosher'
];
export interface PantryItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  brand?: string; // Brand name or "N/A"
  batch?: string; // Lote
  expirationDate: string; // YYYY-MM-DD
  daysLeft: number;
  addedAt: string;
  icon?: string;
  isLowStock?: boolean;
  notes?: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  isInPantry: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  difficulty: 'Fácil' | 'Médio' | 'Avançado';
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  servings: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  chefTips?: string;
  pantryMatchPercent: number; // 0 to 100
  imageUrl?: string;
  category?: string;
  isUserCreated?: boolean;
  contributeToAcervo?: boolean;
  contributionStatus?: 'approved' | 'in_review' | 'private';
  authorName?: string;
  createdAt?: string;
}

export interface DayMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  description: string;
  recipeId?: string;
  ingredients: string[];
}

export interface DayPlan {
  dayName: string; // 'Segunda-feira', etc.
  dayShort: string; // 'SEG', 'TER', etc.
  date: string;
  breakfast: DayMeal;
  lunch: DayMeal;
  snack: DayMeal;
  dinner: DayMeal;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterGoalLiters: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  estimatedPrice: number; // in BRL
  isChecked: boolean;
  source: 'Receita' | 'Dispensa Baixa' | 'Manual' | 'Cardápio Semanal';
  addedAt: string;
}

export type ShoppingListItem = ShoppingItem;

export interface Nutritionist {
  id: string;
  name: string;
  crn: string;
  crnState?: string;
  avatar: string;
  bio: string;
  specialty: string;
  titles?: string[];
  education?: string;
  rating?: number;
  reviewsCount?: number;
  priceBRL?: number;
  type?: 'Online' | 'Presencial' | 'Híbrido';
  tags?: string[];
  location?: string;
  availableDays?: string[];
  nextSlot?: string;
  verified: boolean;
  status?: 'approved' | 'in_review';
  contactEmail?: string;
  contactPhone?: string;
  diplomaFileName?: string;
  submittedAt?: string;
}

export interface CommunityComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorBadge?: string;
  text: string;
  timeAgo: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorBadge?: string;
  timeAgo: string;
  content: string;
  recipeTitle?: string;
  recipeId?: string;
  imageUrl?: string;
  likesCount: number;
  hasLiked: boolean;
  comments: CommunityComment[];
  tags: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  progress: number;
  target: number;
  pointsReward: number;
  daysRemaining: number;
  isCompleted?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  birthDate?: string; // Data de nascimento
  password?: string;
  avatar: string;
  level: number;
  levelTitle: string;
  points: number;
  streakDays: number;
  calorieTarget: number;
  diet: string; // Ex: 'Equilibrada', 'Low Carb', 'Vegetariana', 'Vegana', 'Ganho de Massa'
  dietaryGoals: string[];
  dietaryRestrictions: string[]; // Ex: 'Sem Glúten', 'Sem Lactose', 'Sem Açúcar', 'Alergia a Amendoim'
  customRestrictions?: string; // Texto livre para restrições específicas (ex: "Não como carne de porco", "evito coentro")
  allergies: string[];
  pantryUsageType: 'residencial' | 'comercial'; // Gestão de alimentos residencial ou negócio
  businessName?: string;
}

export interface RewardCoupon {
  id: string;
  title: string;
  sponsor: string;
  description: string;
  pointsCost: number;
  code: string;
  icon: string;
  isClaimed?: boolean;
  category?: string;
}