import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Sparkles, 
  Droplet, 
  Flame, 
  Check, 
  RefreshCw, 
  Utensils, 
  Clock, 
  ChevronRight, 
  ListFilter,
  CheckCircle2,
  Pencil,
  Plus,
  X,
  Save,
  Calculator,
  RotateCcw
} from 'lucide-react';
import { DayPlan, DayMeal } from '../types';

interface WeeklyPlanViewProps {
  weeklyPlan: DayPlan[];
  onRegeneratePlan: (goal: string, calories: number) => Promise<void>;
  onUpdateWeeklyPlan?: (newPlan: DayPlan[]) => void;
}

type MealKey = 'breakfast' | 'lunch' | 'snack' | 'dinner';

const MEAL_CONFIG: { [key in MealKey]: { label: string; icon: string; defaultTime: string } } = {
  breakfast: { label: 'Café da Manhã', icon: '☀️', defaultTime: '07:30 - 08:30' },
  lunch: { label: 'Almoço Principal', icon: '🥗', defaultTime: '12:00 - 13:30' },
  snack: { label: 'Lanche da Tarde', icon: '🍎', defaultTime: '16:00 - 17:00' },
  dinner: { label: 'Jantar Leve', icon: '🌙', defaultTime: '19:30 - 20:30' },
};

const SUGGESTED_FOODS = [
  'Ovos Mexidos', 'Pão Integral', 'Banana', 'Aveia em Flocos', 
  'Frango Grelhado', 'Arroz Integral', 'Feijão Preto', 'Salada Verde',
  'Azeite de Oliva', 'Iogurte Natural', 'Whey Protein', 'Castanhas',
  'Batata Doce', 'Brócolis', 'Tomate & Manjericão', 'Tapioca com Queijo'
];

export const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({
  weeklyPlan,
  onRegeneratePlan,
  onUpdateWeeklyPlan,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [goal, setGoal] = useState<string>('Equilíbrio & Vitalidade');
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);

  // Meal customization modal states
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState<boolean>(false);
  const [activeMealKey, setActiveMealKey] = useState<MealKey>('breakfast');
  const [repeatScope, setRepeatScope] = useState<'today' | 'weekdays' | 'all'>('today');
  
  // Active form data
  const [mealName, setMealName] = useState('');
  const [mealPrepTime, setMealPrepTime] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [mealIngredients, setMealIngredients] = useState<string[]>([]);
  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [mealCalories, setMealCalories] = useState<number>(400);
  const [mealProtein, setMealProtein] = useState<number>(25);
  const [mealCarbs, setMealCarbs] = useState<number>(45);
  const [mealFat, setMealFat] = useState<number>(12);
  
  // Water tracker local states (glasses consumed per day)
  const [waterGlasses, setWaterGlasses] = useState<{ [dayIndex: number]: number }>({
    0: 8,
    1: 7,
    2: 6,
    3: 5,
    4: 4,
    5: 3,
    6: 2
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentDay = weeklyPlan[selectedDayIndex] || weeklyPlan[0];

  // Load meal values when opening customization or changing active meal tab
  const loadMealIntoForm = (key: MealKey, day: DayPlan) => {
    const meal = day[key];
    if (meal) {
      setMealName(meal.name || '');
      setMealPrepTime(meal.prepTime || '15 min');
      setMealDescription(meal.description || '');
      setMealIngredients(meal.ingredients ? [...meal.ingredients] : []);
      setMealCalories(meal.calories || 400);
      setMealProtein(meal.protein || 20);
      setMealCarbs(meal.carbs || 40);
      setMealFat(meal.fat || 10);
    }
  };

  const handleOpenCustomize = (key: MealKey) => {
    setActiveMealKey(key);
    loadMealIntoForm(key, currentDay);
    setIsCustomizeModalOpen(true);
  };

  const handleChangeActiveMealInModal = (key: MealKey) => {
    setActiveMealKey(key);
    loadMealIntoForm(key, currentDay);
  };

  const handleAddIngredient = () => {
    const trimmed = newIngredientInput.trim();
    if (trimmed && !mealIngredients.includes(trimmed)) {
      setMealIngredients(prev => [...prev, trimmed]);
      setNewIngredientInput('');
    }
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    setMealIngredients(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleAddSuggestedFood = (food: string) => {
    if (!mealIngredients.includes(food)) {
      setMealIngredients(prev => [...prev, food]);
    }
  };

  const handleCalculateCaloriesFromMacros = () => {
    // 4 kcal/g protein, 4 kcal/g carbs, 9 kcal/g fat
    const calculated = (Number(mealProtein) || 0) * 4 + (Number(mealCarbs) || 0) * 4 + (Number(mealFat) || 0) * 9;
    setMealCalories(Math.round(calculated));
  };

  const handleSaveMealPlan = () => {
    if (!mealName.trim()) {
      alert('Por favor, informe o nome ou prato da refeição.');
      return;
    }

    const newPlan = weeklyPlan.map(d => ({
      ...d,
      breakfast: { ...d.breakfast },
      lunch: { ...d.lunch },
      snack: { ...d.snack },
      dinner: { ...d.dinner }
    }));

    const targetIndices = repeatScope === 'today'
      ? [selectedDayIndex]
      : repeatScope === 'weekdays'
        ? [0, 1, 2, 3, 4]
        : [0, 1, 2, 3, 4, 5, 6];

    targetIndices.forEach(idx => {
      if (!newPlan[idx]) return;
      const targetDay = newPlan[idx];
      const existingMeal = targetDay[activeMealKey];

      const updatedMeal: DayMeal = {
        ...existingMeal,
        name: mealName.trim(),
        prepTime: mealPrepTime.trim() || '15 min',
        description: mealDescription.trim() || 'Refeição personalizada pelo usuário.',
        ingredients: mealIngredients.length > 0 ? mealIngredients : [mealName.trim()],
        calories: Number(mealCalories) || 0,
        protein: Number(mealProtein) || 0,
        carbs: Number(mealCarbs) || 0,
        fat: Number(mealFat) || 0,
      };

      targetDay[activeMealKey] = updatedMeal;

      // Recalculate totals for this day
      targetDay.totalCalories = 
        (targetDay.breakfast?.calories || 0) +
        (targetDay.lunch?.calories || 0) +
        (targetDay.snack?.calories || 0) +
        (targetDay.dinner?.calories || 0);

      targetDay.totalProtein = 
        (targetDay.breakfast?.protein || 0) +
        (targetDay.lunch?.protein || 0) +
        (targetDay.snack?.protein || 0) +
        (targetDay.dinner?.protein || 0);

      targetDay.totalCarbs = 
        (targetDay.breakfast?.carbs || 0) +
        (targetDay.lunch?.carbs || 0) +
        (targetDay.snack?.carbs || 0) +
        (targetDay.dinner?.carbs || 0);

      targetDay.totalFat = 
        (targetDay.breakfast?.fat || 0) +
        (targetDay.lunch?.fat || 0) +
        (targetDay.snack?.fat || 0) +
        (targetDay.dinner?.fat || 0);
    });

    if (onUpdateWeeklyPlan) {
      onUpdateWeeklyPlan(newPlan);
    }

    setIsCustomizeModalOpen(false);
    setToastMessage('✅ Seu plano alimentar foi atualizado com o que você come!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddWater = () => {
    setWaterGlasses(prev => ({
      ...prev,
      [selectedDayIndex]: (prev[selectedDayIndex] || 0) + 1
    }));
  };

  const handleRemoveWater = () => {
    setWaterGlasses(prev => ({
      ...prev,
      [selectedDayIndex]: Math.max(0, (prev[selectedDayIndex] || 0) - 1)
    }));
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      await onRegeneratePlan(goal, calorieGoal);
      setIsModalOpen(false);
      setToastMessage('🎉 Novo cardápio semanal personalizado montado com IA!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const glassesDrank = waterGlasses[selectedDayIndex] || 0;
  const currentLiters = (glassesDrank * 0.25).toFixed(2);
  const targetLiters = currentDay?.waterGoalLiters || 2.5;
  const waterPercent = Math.min(100, Math.round(((glassesDrank * 0.25) / targetLiters) * 100));

  if (!currentDay) {
    return null;
  }

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0C6816] via-[#147a22] to-[#0C6816] rounded-2xl p-4 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#D0F4A4]/20 border border-[#D0F4A4]/30 text-[#D0F4A4] text-[11px] sm:text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plano Alimentar & Dieta Sob Medida</span>
            </div>
            <h1 className="font-display font-extrabold text-xl sm:text-3xl text-white tracking-tight">
              Meu Cardápio & Plano Alimentar
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Personalize o que você come dia a dia, defina seus alimentos habituais ou use a IA para sugerir receitas balanceadas com itens da sua dispensa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => handleOpenCustomize('breakfast')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-[#FAF7EE] text-[#0C6816] font-extrabold px-4 py-2.5 min-h-[44px] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
            >
              <Pencil className="w-4 h-4 text-[#0C6816]" />
              <span>Personalizar Meu Plano do Dia</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              id="weekly-plan-regenerate-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#63D753] hover:bg-[#52c244] text-[#0C6816] font-extrabold px-4 py-2.5 min-h-[44px] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4 text-[#0C6816]" />
              <span>Sugerir com IA</span>
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="mt-4 p-3 bg-white/20 backdrop-blur-xs rounded-xl text-xs sm:text-sm font-bold text-[#D0F4A4] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#63D753]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Days Tabs (SEG to DOM) - Optimized for mobile viewports */}
      <div className="bg-white border border-[#EFE6D1] rounded-2xl p-1.5 sm:p-3 shadow-2xs">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weeklyPlan.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={idx}
                id={`day-tab-${idx}`}
                onClick={() => setSelectedDayIndex(idx)}
                className={`py-2 sm:py-3 px-0.5 sm:px-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-[#0C6816] text-white shadow-md ring-2 ring-[#0C6816]'
                    : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1] hover:text-[#0C6816]'
                }`}
              >
                <span className={`text-[11px] sm:text-xs font-black uppercase tracking-tight ${isSelected ? 'text-[#D0F4A4]' : 'text-[#0C6816]'}`}>
                  {day.dayShort}
                </span>
                <span className="font-display font-bold text-xs sm:text-sm mt-0.5 hidden sm:block">
                  {day.dayName.split('-')[0]}
                </span>
                <span className={`text-[9px] sm:text-[10px] mt-0.5 font-semibold leading-none ${isSelected ? 'text-white/90' : 'text-[#5E6B52]'}`}>
                  <span className="sm:hidden">{Math.round(day.totalCalories / 100) / 10}k</span>
                  <span className="hidden sm:inline">{day.totalCalories} kcal</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Overview: Calories, Macros, and Hydration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Daily Macros Card */}
        <div className="bg-white border border-[#EFE6D1] rounded-2xl p-5 shadow-2xs space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#63D753] uppercase tracking-wider">Metas Nutricionais do Dia</span>
                <span className="text-[10px] bg-[#FAF7EE] text-[#0C6816] font-bold px-2 py-0.5 rounded-full border border-[#EFE6D1]">
                  Personalizável
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-[#0C6816]">{currentDay.dayName}</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenCustomize('breakfast')}
                className="px-3 py-1.5 bg-[#FAF7EE] hover:bg-[#EFE6D1] text-[#0C6816] rounded-xl text-xs font-bold border border-[#EFE6D1] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-[#0C6816]" />
                <span>Personalizar Dia</span>
              </button>
              <div className="text-right">
                <span className="text-xs text-[#5E6B52] font-semibold">Total Diário</span>
                <p className="font-display font-black text-xl text-[#0C6816]">{currentDay.totalCalories} <span className="text-xs font-normal">kcal</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#FAF7EE] p-3 rounded-xl border border-[#EFE6D1] text-center">
              <p className="text-xs text-[#5E6B52] font-semibold">Proteínas</p>
              <p className="font-display font-extrabold text-base text-[#0C6816]">{currentDay.totalProtein}g</p>
              <span className="text-[10px] text-[#63D753] font-bold">~{Math.round((currentDay.totalProtein * 4 / (currentDay.totalCalories || 1)) * 100)}% das kcal</span>
            </div>
            <div className="bg-[#FAF7EE] p-3 rounded-xl border border-[#EFE6D1] text-center">
              <p className="text-xs text-[#5E6B52] font-semibold">Carboidratos</p>
              <p className="font-display font-extrabold text-base text-[#0C6816]">{currentDay.totalCarbs}g</p>
              <span className="text-[10px] text-[#63D753] font-bold">~{Math.round((currentDay.totalCarbs * 4 / (currentDay.totalCalories || 1)) * 100)}% das kcal</span>
            </div>
            <div className="bg-[#FAF7EE] p-3 rounded-xl border border-[#EFE6D1] text-center">
              <p className="text-xs text-[#5E6B52] font-semibold">Gorduras Boas</p>
              <p className="font-display font-extrabold text-base text-[#0C6816]">{currentDay.totalFat}g</p>
              <span className="text-[10px] text-[#63D753] font-bold">~{Math.round((currentDay.totalFat * 9 / (currentDay.totalCalories || 1)) * 100)}% das kcal</span>
            </div>
          </div>
        </div>

        {/* Interactive Hydration Tracker Card */}
        <div className="bg-gradient-to-br from-[#FAF7EE] to-white border border-[#EFE6D1] rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Droplet className="w-4 h-4 fill-blue-500" />
                </div>
                <h4 className="font-display font-bold text-sm text-[#0C6816]">Hidratação Diária</h4>
              </div>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {waterPercent}%
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between text-xs text-[#5E6B52] mb-1">
                <span>Consumido: <strong className="text-[#0C6816]">{currentLiters}L</strong></span>
                <span>Meta: <strong>{targetLiters}L</strong></span>
              </div>
              <div className="w-full h-2.5 bg-[#EFE6D1] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Glasses logger buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#EFE6D1]">
            <span className="text-xs font-semibold text-[#5E6B52]">{glassesDrank} copos (250ml)</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRemoveWater}
                className="w-7 h-7 rounded-lg bg-[#FAF7EE] hover:bg-[#EFE6D1] border border-[#EFE6D1] text-[#0C6816] font-bold flex items-center justify-center cursor-pointer active:scale-95 text-xs"
              >
                -
              </button>
              <button
                onClick={handleAddWater}
                className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              >
                <Droplet className="w-3 h-3 fill-white" />
                +1 Copo
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 4 Daily Meals with individual Customize buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Café da Manhã */}
        <MealCard
          mealType="Café da Manhã"
          time="07:30 - 08:30"
          icon="☀️"
          meal={currentDay.breakfast}
          onEdit={() => handleOpenCustomize('breakfast')}
        />

        {/* Almoço */}
        <MealCard
          mealType="Almoço Principal"
          time="12:00 - 13:30"
          icon="🥗"
          meal={currentDay.lunch}
          isHighlight
          onEdit={() => handleOpenCustomize('lunch')}
        />

        {/* Lanche da Tarde */}
        <MealCard
          mealType="Lanche da Tarde"
          time="16:00 - 17:00"
          icon="🍎"
          meal={currentDay.snack}
          onEdit={() => handleOpenCustomize('snack')}
        />

        {/* Jantar */}
        <MealCard
          mealType="Jantar Leve"
          time="19:30 - 20:30"
          icon="🌙"
          meal={currentDay.dinner}
          onEdit={() => handleOpenCustomize('dinner')}
        />

      </div>

      {/* ================= MODAL: PERSONALIZAR O QUE VOCÊ COME ================= */}
      {isCustomizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EFE6D1] relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE6D1]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#D0F4A4] flex items-center justify-center text-[#0C6816] text-xl font-bold">
                  {MEAL_CONFIG[activeMealKey].icon}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-[#0C6816]">
                    Personalizar Minha Refeição
                  </h3>
                  <p className="text-xs text-[#5E6B52]">
                    Ajustando: <strong className="text-[#0C6816]">{currentDay.dayName}</strong> ({MEAL_CONFIG[activeMealKey].label})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCustomizeModalOpen(false)}
                className="text-[#5E6B52] hover:text-[#0C6816] font-bold text-lg w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#FAF7EE] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Meal Selector Pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {(['breakfast', 'lunch', 'snack', 'dinner'] as MealKey[]).map(key => {
                const cfg = MEAL_CONFIG[key];
                const isActive = activeMealKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleChangeActiveMealInModal(key)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#0C6816] text-white shadow-sm'
                        : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1] hover:text-[#0C6816] border border-[#EFE6D1]'
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Meal Form */}
            <div className="space-y-4 mt-5">
              
              {/* Nome do Prato */}
              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">
                  O que você come nesta refeição? (Nome do prato ou itens) *
                </label>
                <input
                  type="text"
                  required
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="Ex: 2 ovos mexidos com pão integral e café com leite"
                  className="w-full px-4 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] focus:ring-2 focus:ring-[#63D753]/30 rounded-xl text-sm text-[#1F2E1E] outline-hidden font-medium"
                />
              </div>

              {/* Tempo de Preparo e Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0C6816] mb-1">
                    Horário habitual
                  </label>
                  <input
                    type="text"
                    value={MEAL_CONFIG[activeMealKey].defaultTime}
                    disabled
                    className="w-full px-3.5 py-2 bg-[#FAF7EE]/60 border border-[#EFE6D1] rounded-xl text-xs text-[#5E6B52] outline-hidden cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0C6816] mb-1">
                    Tempo de preparo
                  </label>
                  <input
                    type="text"
                    value={mealPrepTime}
                    onChange={(e) => setMealPrepTime(e.target.value)}
                    placeholder="Ex: 10 min"
                    className="w-full px-3.5 py-2 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                  />
                </div>
              </div>

              {/* Descrição / Como consome */}
              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">
                  Descrição detalhada ou modo de preparo
                </label>
                <textarea
                  rows={2}
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  placeholder="Ex: Ovos fritos na ponta da faca de azeite, com pitada de sal rosa e orégano. Café coado sem açúcar com leite de amêndoas."
                  className="w-full px-4 py-2 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs sm:text-sm text-[#1F2E1E] outline-hidden resize-none"
                />
              </div>

              {/* Alimentos e Ingredientes Tags */}
              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">
                  Alimentos individuais / Ingredientes da refeição
                </label>
                
                {/* Current tags */}
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[32px] p-2 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl">
                  {mealIngredients.length === 0 ? (
                    <span className="text-xs text-[#5E6B52]/60 italic">Nenhum ingrediente adicionado ainda.</span>
                  ) : (
                    mealIngredients.map((ing, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 bg-white text-[#0C6816] border border-[#EFE6D1] px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs">
                        <span>{ing}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(i)}
                          className="hover:text-red-500 cursor-pointer p-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add new ingredient input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIngredientInput}
                    onChange={(e) => setNewIngredientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddIngredient();
                      }
                    }}
                    placeholder="Adicionar alimento (ex: 2 Ovos, 1 Maçã...)"
                    className="flex-1 px-3 py-2 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-4 py-2 bg-[#0C6816] hover:bg-[#095011] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {/* Quick Food Suggestions */}
                <div className="mt-2.5">
                  <span className="text-[11px] font-semibold text-[#5E6B52] block mb-1">Sugestões rápidas para adicionar:</span>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_FOODS.slice(0, 8).map(food => (
                      <button
                        key={food}
                        type="button"
                        onClick={() => handleAddSuggestedFood(food)}
                        className="text-[10px] font-medium bg-white hover:bg-[#EFE6D1] text-[#0C6816] border border-[#EFE6D1] px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                      >
                        + {food}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Informações Nutricionais Estimadas */}
              <div className="p-4 bg-[#FAF7EE] border border-[#EFE6D1] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0C6816] uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#63D753]" />
                    <span>Estimativa Nutricional</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCalculateCaloriesFromMacros}
                    className="text-[11px] font-bold text-[#0C6816] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Calculator className="w-3 h-3 text-[#63D753]" />
                    <span>Calcular calorias pelos macros</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5E6B52] mb-1">Calorias (kcal)</label>
                    <input
                      type="number"
                      value={mealCalories}
                      onChange={(e) => setMealCalories(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-[#EFE6D1] rounded-xl text-xs font-bold text-[#0C6816] outline-hidden focus:border-[#63D753]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5E6B52] mb-1">Proteínas (g)</label>
                    <input
                      type="number"
                      value={mealProtein}
                      onChange={(e) => setMealProtein(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-[#EFE6D1] rounded-xl text-xs font-bold text-[#0C6816] outline-hidden focus:border-[#63D753]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5E6B52] mb-1">Carboidratos (g)</label>
                    <input
                      type="number"
                      value={mealCarbs}
                      onChange={(e) => setMealCarbs(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-[#EFE6D1] rounded-xl text-xs font-bold text-[#0C6816] outline-hidden focus:border-[#63D753]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5E6B52] mb-1">Gorduras (g)</label>
                    <input
                      type="number"
                      value={mealFat}
                      onChange={(e) => setMealFat(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-[#EFE6D1] rounded-xl text-xs font-bold text-[#0C6816] outline-hidden focus:border-[#63D753]"
                    />
                  </div>
                </div>
              </div>

              {/* Repetição no Plano Semanal */}
              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1.5">
                  Onde deseja aplicar esta personalização?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    repeatScope === 'today'
                      ? 'border-[#0C6816] bg-[#D0F4A4]/20 ring-1 ring-[#0C6816]'
                      : 'border-[#EFE6D1] bg-[#FAF7EE]'
                  }`}>
                    <input
                      type="radio"
                      name="repeatScope"
                      checked={repeatScope === 'today'}
                      onChange={() => setRepeatScope('today')}
                      className="text-[#0C6816]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#0C6816]">Apenas Hoje</p>
                      <p className="text-[10px] text-[#5E6B52]">{currentDay.dayName}</p>
                    </div>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    repeatScope === 'weekdays'
                      ? 'border-[#0C6816] bg-[#D0F4A4]/20 ring-1 ring-[#0C6816]'
                      : 'border-[#EFE6D1] bg-[#FAF7EE]'
                  }`}>
                    <input
                      type="radio"
                      name="repeatScope"
                      checked={repeatScope === 'weekdays'}
                      onChange={() => setRepeatScope('weekdays')}
                      className="text-[#0C6816]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#0C6816]">Seg a Sex</p>
                      <p className="text-[10px] text-[#5E6B52]">Dias úteis</p>
                    </div>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    repeatScope === 'all'
                      ? 'border-[#0C6816] bg-[#D0F4A4]/20 ring-1 ring-[#0C6816]'
                      : 'border-[#EFE6D1] bg-[#FAF7EE]'
                  }`}>
                    <input
                      type="radio"
                      name="repeatScope"
                      checked={repeatScope === 'all'}
                      onChange={() => setRepeatScope('all')}
                      className="text-[#0C6816]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#0C6816]">Semana Toda</p>
                      <p className="text-[10px] text-[#5E6B52]">Todos os 7 dias</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="pt-4 border-t border-[#EFE6D1] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCustomizeModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#5E6B52] hover:text-[#0C6816] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveMealPlan}
                  className="flex items-center gap-2 bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#D0F4A4]" />
                  <span>Salvar no Meu Plano Alimentar</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* AI Regenerate Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EFE6D1] relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE6D1]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#D0F4A4] flex items-center justify-center text-[#0C6816]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#0C6816]">Regerar Cardápio com IA</h3>
                  <p className="text-xs text-[#5E6B52]">Personalize seus objetivos para os 7 dias</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#5E6B52] hover:text-[#0C6816] font-bold text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FAF7EE]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Objetivo Nutricional Principal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-sm text-[#0C6816] outline-hidden cursor-pointer"
                >
                  <option value="Equilíbrio & Vitalidade">Equilíbrio & Vitalidade (Saúde Geral)</option>
                  <option value="Emagrecimento Saudável">Emagrecimento Saudável (Déficit Leve)</option>
                  <option value="Ganho de Massa Muscular">Ganho de Massa Muscular (Alto Teor Proteico)</option>
                  <option value="Vegetariano Balanceado">Vegetariano Balanceado (Plant-Based)</option>
                  <option value="Low Carb & Anti-inflamatório">Low Carb & Anti-inflamatório</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Meta Calórica Diária Estimada</label>
                <select
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-sm text-[#0C6816] outline-hidden cursor-pointer"
                >
                  <option value={1500}>1.500 kcal / dia (Déficit para perda de gordura)</option>
                  <option value={1800}>1.800 kcal / dia (Manutenção leve)</option>
                  <option value={2000}>2.000 kcal / dia (Padrão recomendado)</option>
                  <option value={2400}>2.400 kcal / dia (Hipertrofia ou atletas)</option>
                </select>
              </div>

              <div className="bg-[#FAF7EE] p-3.5 rounded-xl border border-[#EFE6D1] text-xs text-[#5E6B52] space-y-1">
                <p className="font-bold text-[#0C6816] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#63D753]" />
                  Aproveitamento Inteligente da Dispensa:
                </p>
                <p>A IA priorizará receitas que utilizem os ingredientes já cadastrados na sua dispensa virtual.</p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#5E6B52] hover:text-[#0C6816] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-[#0C6816] hover:bg-[#095011] disabled:opacity-50 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Montando Cardápio...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D0F4A4]" />
                      <span>Gerar com Gemini IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

interface MealCardProps {
  mealType: string;
  time: string;
  icon: string;
  meal: DayMeal;
  isHighlight?: boolean;
  onEdit?: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ mealType, time, icon, meal, isHighlight, onEdit }) => {
  if (!meal) return null;

  return (
    <div className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between space-y-3 ${
      isHighlight ? 'border-[#63D753] ring-1 ring-[#63D753]/30' : 'border-[#EFE6D1]'
    }`}>
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-[#EFE6D1]">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <h4 className="font-display font-bold text-sm text-[#0C6816]">{mealType}</h4>
              <p className="text-[10px] text-[#5E6B52]">{time} • {meal.prepTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-[#FAF7EE] text-[#0C6816] px-2.5 py-1 rounded-lg border border-[#EFE6D1]">
              {meal.calories} kcal
            </span>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                title="Personalizar o que você come nesta refeição"
                className="p-1.5 text-[#5E6B52] hover:text-[#0C6816] hover:bg-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between gap-2 mt-3">
          <h3 className="font-display font-bold text-base text-[#0C6816] leading-snug">
            {meal.name}
          </h3>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-[11px] font-bold text-[#0C6816] hover:underline shrink-0 cursor-pointer"
            >
              Editar
            </button>
          )}
        </div>

        <p className="text-xs text-[#5E6B52] mt-1.5 leading-relaxed">
          {meal.description}
        </p>

        {/* Ingredients pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {meal.ingredients?.map((ing, i) => (
            <span key={i} className="text-[11px] font-medium bg-[#FAF7EE] text-[#0C6816] px-2 py-0.5 rounded-md border border-[#EFE6D1]">
              {ing}
            </span>
          ))}
        </div>
      </div>

      {/* Macros Footer */}
      <div className="pt-3 border-t border-[#EFE6D1] flex items-center justify-between text-[11px] text-[#5E6B52]">
        <span>Prot: <strong className="text-[#0C6816]">{meal.protein}g</strong></span>
        <span>Carb: <strong className="text-[#0C6816]">{meal.carbs}g</strong></span>
        <span>Gord: <strong className="text-[#0C6816]">{meal.fat}g</strong></span>
      </div>
    </div>
  );
};
