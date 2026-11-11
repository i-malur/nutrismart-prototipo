import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  Flame, 
  ChefHat, 
  Check, 
  Plus, 
  Share2, 
  Filter, 
  Search, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Utensils,
  Lightbulb,
  Heart,
  BookOpen,
  User,
  ShieldCheck,
  ShoppingCart
} from 'lucide-react';
import { Recipe, PantryItem, DietaryPreference, FoodCategory } from '../types';
import { RecipeRegisterForm } from './RecipeRegisterForm';

interface RecipesViewProps {
  recipes: Recipe[];
  pantryItems: PantryItem[];
  userName?: string;
  onAddRecipe: (recipe: Recipe) => void;
  onShareToCommunity: (recipe: Recipe) => void;
  onAddMissingToShoppingList?: (ingredients: string[]) => void;
}

const PREFERENCES: DietaryPreference[] = [
  'Todas',
  'Equilibrada',
  'Low Carb',
  'Vegetariana',
  'Vegana',
  'Sem Glúten',
  'Ganho de Massa',
  'Rápida (15 min)',
  'Econômica'
];

export const RecipesView: React.FC<RecipesViewProps> = ({
  recipes,
  pantryItems,
  userName = 'Você',
  onAddRecipe,
  onShareToCommunity,
  onAddMissingToShoppingList,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'register_recipe'>('list');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'my_recipes' | 'acervo'>('all');
  const [selectedPreference, setSelectedPreference] = useState<DietaryPreference>('Todas');
  const [search, setSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>([]);

  // AI Generator Form State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorPreference, setGeneratorPreference] = useState<DietaryPreference>('Equilibrada');
  const [generatorMaxTime, setGeneratorMaxTime] = useState<number>(25);
  const [generatorServings, setGeneratorServings] = useState<number>(2);
  const [generatorCustomNote, setGeneratorCustomNote] = useState<string>('');
  const [selectedPantryIds, setSelectedPantryIds] = useState<string[]>(pantryItems.slice(0, 6).map(i => i.id));
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);

  // Cooking Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteRecipeIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setGenerationFeedback(null);

    const chosenItems = pantryItems.filter(p => selectedPantryIds.includes(p.id));

    try {
      const response = await fetch('/api/ai/suggest-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pantryItems: chosenItems,
          preference: generatorPreference,
          maxTime: generatorMaxTime,
          servings: generatorServings,
          customNotes: generatorCustomNote
        })
      });

      const data = await response.json();
      if (data.recipes && data.recipes.length > 0) {
        data.recipes.forEach((newRec: Recipe) => {
          onAddRecipe({
            ...newRec,
            id: newRec.id || `rec-${Date.now()}-${Math.random()}`
          });
        });
        setGenerationFeedback(`✨ ${data.recipes.length} novas receitas geradas com sucesso a partir da sua dispensa!`);
        setIsGeneratorOpen(false);
      }
    } catch (err) {
      console.error('Error generating recipes:', err);
      setGenerationFeedback('Não foi possível gerar no momento. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredRecipes = recipes.filter(r => {
    // Scope filter
    if (scopeFilter === 'my_recipes' && !r.isUserCreated) return false;
    if (scopeFilter === 'acervo' && r.isUserCreated && r.contributionStatus !== 'approved') return false;

    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                          r.description.toLowerCase().includes(search.toLowerCase()) ||
                          r.ingredients.some(i => i.name.toLowerCase().includes(search.toLowerCase()));
    const matchesPref = selectedPreference === 'Todas' || r.tags.includes(selectedPreference);
    return matchesSearch && matchesPref;
  });

  const myRecipesCount = recipes.filter(r => r.isUserCreated).length;

  if (viewMode === 'register_recipe') {
    return (
      <RecipeRegisterForm
        pantryItems={pantryItems}
        userName={userName}
        onBack={() => setViewMode('list')}
        onSubmit={(newRecipe) => {
          onAddRecipe(newRecipe);
          setViewMode('list');
          setScopeFilter('my_recipes');
        }}
      />
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startStepTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0C6816] via-[#147a22] to-[#0C6816] rounded-2xl p-4 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#D0F4A4]/20 border border-[#D0F4A4]/30 text-[#D0F4A4] text-[11px] sm:text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Receitas Inteligentes Baseadas na sua Dispensa</span>
            </div>
            <h1 className="font-display font-extrabold text-xl sm:text-3xl text-white tracking-tight">
              Sugestões Culinárias com IA
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Descubra pratos nutritivos preparados especificamente com os ingredientes que você tem em casa, reduzindo desperdícios e compras desnecessárias.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setViewMode('register_recipe')}
              id="open-register-recipe-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FAF7EE] hover:bg-white text-[#0C6816] font-bold px-4 py-2.5 min-h-[44px] rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 text-[#0C6816]" />
              <span>Cadastre sua receita</span>
            </button>

          </div>
        </div>

        {generationFeedback && (
          <div className="mt-4 p-3 bg-white/20 backdrop-blur-xs rounded-xl text-xs font-bold text-[#D0F4A4] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#63D753]" />
            <span>{generationFeedback}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EFE6D1] rounded-2xl p-4 shadow-2xs space-y-4">
        
        {/* Scope Tabs: Todas as Receitas | Meu Caderno de Receitas | Acervo NutriSmart */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE6D1]">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF7EE] rounded-xl border border-[#EFE6D1]">
            <button
              onClick={() => setScopeFilter('all')}
              id="scope-all-recipes-btn"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                scopeFilter === 'all'
                  ? 'bg-[#0C6816] text-white shadow-2xs'
                  : 'text-[#5E6B52] hover:text-[#0C6816]'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Todas ({recipes.length})</span>
            </button>

            <button
              onClick={() => setScopeFilter('my_recipes')}
              id="scope-my-recipes-btn"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                scopeFilter === 'my_recipes'
                  ? 'bg-[#0C6816] text-white shadow-2xs'
                  : 'text-[#5E6B52] hover:text-[#0C6816]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Meu Caderno ({myRecipesCount})</span>
            </button>

            <button
              onClick={() => setScopeFilter('acervo')}
              id="scope-acervo-recipes-btn"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                scopeFilter === 'acervo'
                  ? 'bg-[#0C6816] text-white shadow-2xs'
                  : 'text-[#5E6B52] hover:text-[#0C6816]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acervo NutriSmart</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="recipes-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar receita ou ingrediente..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-sm text-[#0C6816] outline-hidden"
            />
          </div>

          <div className="text-xs text-[#5E6B52] font-semibold">
            {filteredRecipes.length} receitas exibidas
          </div>
        </div>

        {/* Dietary Preference Chips - Edge scroll on mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-none">
          {PREFERENCES.map(pref => (
            <button
              key={pref}
              onClick={() => setSelectedPreference(pref)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedPreference === pref
                  ? 'bg-[#0C6816] text-white'
                  : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1] hover:text-[#0C6816]'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Cards Grid - 1 col on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredRecipes.map((recipe) => {
          const isFav = favoriteRecipeIds.includes(recipe.id);
          const hasMissing = recipe.ingredients.some(i => !i.isInPantry);

          return (
            <div
              key={recipe.id}
              onClick={() => {
                setSelectedRecipe(recipe);
                setActiveStepIndex(0);
              }}
              id={`recipe-card-${recipe.id}`}
              className="bg-white border border-[#EFE6D1] hover:border-[#63D753] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              {/* Image & Badges */}
              <div className="relative h-44 w-full bg-[#FAF7EE] overflow-hidden">
                <img
                  src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                
                {/* Badges on Top */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black shadow-xs flex items-center gap-1 ${
                    recipe.pantryMatchPercent >= 90
                      ? 'bg-[#63D753] text-[#0C6816]'
                      : 'bg-[#FAF7EE] text-[#0C6816] border border-[#EFE6D1]'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {recipe.pantryMatchPercent}% na Dispensa
                  </span>

                  {recipe.isUserCreated && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#52634C] border border-[#D9D3C1] shadow-2xs">
                      {recipe.contributionStatus === 'in_review' ? '⏳ Em análise no Acervo' : recipe.contributionStatus === 'approved' ? '✓ No Acervo NutriSmart' : '📖 Receita Pessoal'}
                    </span>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(recipe.id, e)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#0C6816] hover:text-rose-500 shadow-xs transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
                </button>

                {/* Prep time badge */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D0F4A4]" />
                  <span>{recipe.prepTimeMinutes} min</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {recipe.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[10px] font-bold bg-[#FAF7EE] text-[#5E6B52] px-2 py-0.5 rounded-md border border-[#EFE6D1]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-display font-bold text-base text-[#0C6816] group-hover:text-[#63D753] transition-colors leading-snug line-clamp-2">
                    {recipe.title}
                  </h3>

                  <p className="text-xs text-[#5E6B52] line-clamp-2 mt-1.5 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                {/* Nutritional & Action Footer */}
                <div className="pt-3 border-t border-[#EFE6D1] space-y-2">
                  <div className="grid grid-cols-4 gap-1 text-center bg-[#FAF7EE] p-2 rounded-xl text-[11px]">
                    <div>
                      <p className="text-[#5E6B52] text-[9px] font-semibold">Calorias</p>
                      <p className="font-bold text-[#0C6816]">{recipe.calories} kcal</p>
                    </div>
                    <div>
                      <p className="text-[#5E6B52] text-[9px] font-semibold">Proteínas</p>
                      <p className="font-bold text-[#0C6816]">{recipe.proteinGrams}g</p>
                    </div>
                    <div>
                      <p className="text-[#5E6B52] text-[9px] font-semibold">Carbos</p>
                      <p className="font-bold text-[#0C6816]">{recipe.carbsGrams}g</p>
                    </div>
                    <div>
                      <p className="text-[#5E6B52] text-[9px] font-semibold">Gorduras</p>
                      <p className="font-bold text-[#0C6816]">{recipe.fatGrams}g</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#5E6B52] font-semibold flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5" />
                      {recipe.servings} porções
                    </span>
                    <span className="font-bold text-[#0C6816] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Ver modo de preparo &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EFE6D1] relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header Image */}
            <div className="relative h-56 sm:h-64 w-full bg-[#FAF7EE]">
              <img
                src={selectedRecipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                alt={selectedRecipe.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-[#63D753] text-[#0C6816] text-xs font-black px-2.5 py-0.5 rounded-full">
                    {selectedRecipe.pantryMatchPercent}% na Dispensa
                  </span>
                  <span className="bg-white/20 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {selectedRecipe.difficulty}
                  </span>
                </div>
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                  {selectedRecipe.title}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Description & Macros */}
              <div className="space-y-3">
                <p className="text-sm text-[#1F2E1E] leading-relaxed">
                  {selectedRecipe.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7EE] p-3.5 rounded-2xl border border-[#EFE6D1]">
                  <div className="text-center">
                    <p className="text-xs text-[#5E6B52]">Calorias</p>
                    <p className="font-display font-extrabold text-lg text-[#0C6816]">{selectedRecipe.calories} kcal</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#5E6B52]">Proteínas</p>
                    <p className="font-display font-extrabold text-lg text-[#0C6816]">{selectedRecipe.proteinGrams}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#5E6B52]">Carboidratos</p>
                    <p className="font-display font-extrabold text-lg text-[#0C6816]">{selectedRecipe.carbsGrams}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#5E6B52]">Gorduras Boas</p>
                    <p className="font-display font-extrabold text-lg text-[#0C6816]">{selectedRecipe.fatGrams}g</p>
                  </div>
                </div>
              </div>

              {/* Interactive Cooking Timer */}
              <div className="bg-[#0C6816] text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#63D753] text-[#0C6816] flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#D0F4A4] font-semibold">Timer de Cozinha Integrado</p>
                    <p className="font-display font-black text-2xl tracking-wider">{formatTime(timerSeconds)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startStepTimer(selectedRecipe.prepTimeMinutes)}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Definir {selectedRecipe.prepTimeMinutes} min
                  </button>
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-2 bg-[#63D753] hover:bg-[#52c244] text-[#0C6816] rounded-xl font-bold cursor-pointer"
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(0);
                    }}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Ingredients Checklist */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-base text-[#0C6816] flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#63D753]" />
                    Ingredientes ({selectedRecipe.ingredients.length})
                  </h3>

                  {onAddMissingToShoppingList && (
                    (() => {
                      const missing = selectedRecipe.ingredients
                        .filter(i => !i.isInPantry)
                        .map(i => `${i.name} (${i.amount})`);
                      if (missing.length === 0) return null;

                      return (
                        <button
                          type="button"
                          onClick={() => onAddMissingToShoppingList(missing)}
                          className="inline-flex items-center gap-1.5 bg-[#0C6816] hover:bg-[#095011] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-[#D0F4A4]" />
                          <span>Adicionar {missing.length} Faltante(s) à Lista de Compras</span>
                        </button>
                      );
                    })()
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        ing.isInPantry
                          ? 'bg-[#FAF7EE] border-[#EFE6D1] text-[#0C6816]'
                          : 'bg-amber-50/50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{ing.name}</p>
                        <p className="text-[#5E6B52] text-[11px]">{ing.amount}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ing.isInPantry 
                          ? 'bg-[#D0F4A4] text-[#0C6816]' 
                          : 'bg-amber-200 text-amber-900'
                      }`}>
                        {ing.isInPantry ? 'Na Dispensa' : 'Comprar'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions Step-by-Step */}
              <div className="space-y-3">
                <h3 className="font-display font-bold text-base text-[#0C6816] flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-[#63D753]" />
                  Modo de Preparo Passo a Passo
                </h3>

                <div className="space-y-2.5">
                  {selectedRecipe.instructions.map((step, idx) => {
                    const isDone = activeStepIndex > idx;
                    const isCurrent = activeStepIndex === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveStepIndex(idx + 1)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isDone 
                            ? 'bg-[#FAF7EE] border-[#EFE6D1] opacity-75'
                            : isCurrent
                              ? 'bg-white border-2 border-[#63D753] shadow-xs'
                              : 'bg-[#FAF7EE]/50 border-[#EFE6D1]'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                          isDone 
                            ? 'bg-[#63D753] text-[#0C6816]' 
                            : isCurrent 
                              ? 'bg-[#0C6816] text-white' 
                              : 'bg-[#EFE6D1] text-[#5E6B52]'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <p className={`text-xs sm:text-sm leading-relaxed ${isDone ? 'line-through text-[#5E6B52]' : 'text-[#1F2E1E]'}`}>
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chef Tips */}
              {selectedRecipe.chefTips && (
                <div className="bg-[#FAF7EE] border border-[#EFE6D1] p-4 rounded-2xl flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-[#0C6816]">Dica de Aproveitamento do Nutricionista</h4>
                    <p className="text-xs text-[#5E6B52] mt-0.5 leading-relaxed">{selectedRecipe.chefTips}</p>
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-[#EFE6D1] flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    onShareToCommunity(selectedRecipe);
                    setSelectedRecipe(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#0C6816] bg-[#FAF7EE] hover:bg-[#EFE6D1] px-4 py-2.5 rounded-xl border border-[#EFE6D1] transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar na Comunidade
                </button>

                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Concluir Preparo
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
