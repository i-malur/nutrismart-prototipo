import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Utensils, 
  Coffee, 
  Sun, 
  Cookie, 
  Moon, 
  CheckCircle2, 
  Flame, 
  Clock, 
  ChefHat, 
  ShoppingCart, 
  ArrowRight, 
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  HeartHandshake,
  Quote
} from 'lucide-react';
import { DayPlan, PantryItem, UserProfile, DayMeal } from '../types';

interface DailyMenuCardProps {
  dayPlan: DayPlan;
  pantryItems: PantryItem[];
  user: UserProfile;
  onRegenerateDaily: () => Promise<void>;
  onViewWeeklyPlan: () => void;
  onAddMissingToShoppingList?: (ingredients: string[]) => void;
}

const MOTIVATIONAL_QUOTES = [
  { text: "Cuidar do seu corpo é uma forma de gratidão pela vida. Alimente sua energia hoje!", author: "NutriSmart" },
  { text: "Pequenas escolhas conscientes no prato geram grandes transformações na sua saúde.", author: "Saúde & Longevidade" },
  { text: "Comida de verdade nutre não só o corpo, mas também a sua mente e disposição.", author: "Vida Equilibrada" },
  { text: "Desperdice menos, saboreie mais. Cozinhar com amor é nutrir o futuro.", author: "Consumo Consciente" },
  { text: "Você não precisa ser perfeito em todas as refeições, apenas constante no seu bem-estar.", author: "Foco Diário" },
  { text: "Cada refeição colorida é um arco-íris de vitaminas e vitalidade para suas células!", author: "Nutrição Positiva" },
];

export const DailyMenuCard: React.FC<DailyMenuCardProps> = ({
  dayPlan,
  pantryItems,
  user,
  onRegenerateDaily,
  onViewWeeklyPlan,
  onAddMissingToShoppingList,
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedMealDetail, setSelectedMealDetail] = useState<DayMeal | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));

  const motivationalQuote = useMemo(() => {
    return MOTIVATIONAL_QUOTES[quoteIndex % MOTIVATIONAL_QUOTES.length];
  }, [quoteIndex]);

  if (!dayPlan || !dayPlan.breakfast) {
    return null;
  }

  const handleNextQuote = () => {
    setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateDaily();
    } finally {
      setIsRegenerating(false);
    }
  };

  const meals: { title: string; meal: DayMeal; icon: React.ComponentType<{ className?: string }>; period: string }[] = [
    { title: 'Café da Manhã', meal: dayPlan.breakfast, icon: Coffee, period: '07:30' },
    { title: 'Almoço', meal: dayPlan.lunch, icon: Sun, period: '12:30' },
    { title: 'Lanche', meal: dayPlan.snack, icon: Cookie, period: '16:30' },
    { title: 'Jantar', meal: dayPlan.dinner, icon: Moon, period: '19:45' },
  ];

  // Calculate ingredients in pantry for all meals
  const allIngredients = [
    ...dayPlan.breakfast.ingredients,
    ...dayPlan.lunch.ingredients,
    ...dayPlan.snack.ingredients,
    ...dayPlan.dinner.ingredients,
  ];

  const missingIngredients = allIngredients.filter(ing => {
    const lower = ing.toLowerCase();
    return !pantryItems.some(p => lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lower));
  });

  return (
    <div className="bg-white border border-[#EFE6D1] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs relative overflow-hidden space-y-4 sm:space-y-5">
      
      {/* Motivational Daily Banner (Solicitado pelo usuário) */}
      <div 
        onClick={handleNextQuote}
        className="bg-gradient-to-r from-[#FAF7EE] via-[#F5EEDC] to-[#FAF7EE] border border-[#EFE6D1] hover:border-[#63D753] rounded-2xl p-3.5 sm:p-4.5 flex items-start justify-between gap-3 shadow-2xs transition-all cursor-pointer group"
        title="Clique para ver outra mensagem motivacional"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#D0F4A4] text-[#0C6816] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform shadow-2xs">
            <Quote className="w-4 h-4 text-[#0C6816]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0C6816] bg-[#D0F4A4]/50 px-2 py-0.2 rounded-md">
                Pílula de Motivação do Dia
              </span>
              <span className="text-[10px] text-[#5E6B52] hidden sm:inline">• Toque para trocar</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#1F2E1E] italic mt-1 leading-snug">
              "{motivationalQuote.text}"
            </p>
            <p className="text-[11px] font-bold text-[#0C6816] mt-0.5">
              — {motivationalQuote.author}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Trocar mensagem"
          className="text-[#5E6B52] group-hover:text-[#0C6816] p-1 rounded-lg shrink-0 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-[#63D753]" />
        </button>
      </div>

      {/* Header with Title and AI Regeneration */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[#EFE6D1]">
        <div className="space-y-0.5 sm:space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D0F4A4]/50 border border-[#D0F4A4] text-[#0C6816] text-[10px] sm:text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-[#0C6816]" />
            <span>Cardápio de Hoje • {dayPlan.dayName}</span>
          </div>
          <h2 className="font-display font-black text-lg sm:text-2xl text-[#0C6816] tracking-tight">
            Menu Saudável do Dia
          </h2>
          <p className="text-[11px] sm:text-xs text-[#5E6B52] leading-tight">
            Personalizado para <strong>{user.diet}</strong>
            {user.dietaryRestrictions.length > 0 && ` (${user.dietaryRestrictions.join(', ')})`} e sua dispensa.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            id="btn-regenerate-daily-menu"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#FAF7EE] hover:bg-[#EFE6D1] text-[#0C6816] font-bold text-xs px-3 py-2.5 min-h-[42px] rounded-xl border border-[#EFE6D1] transition-all active:scale-95 cursor-pointer disabled:opacity-60"
            title="Recalcular cardápio diário com IA"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-[#0C6816]' : ''}`} />
            <span>{isRegenerating ? 'Gerando...' : 'Regenerar'}</span>
          </button>

          <button
            onClick={onViewWeeklyPlan}
            id="btn-view-full-weekly-plan"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs px-3.5 sm:px-4 py-2.5 min-h-[42px] rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <span>Semana Completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Daily Meals Grid - Mobile Optimized (1 col on small phone, 2 on tablet, 4 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {meals.map(({ title, meal, icon: Icon, period }, idx) => {
          // Check how many ingredients match pantry
          const inPantryMatches = meal.ingredients.filter(ing => {
            const lower = ing.toLowerCase();
            return pantryItems.some(p => lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lower));
          });

          return (
            <div
              key={idx}
              className="bg-[#FAF7EE]/70 hover:bg-[#FAF7EE] border border-[#EFE6D1] hover:border-[#63D753] rounded-2xl p-3.5 sm:p-4 transition-all flex flex-col justify-between space-y-2.5 group shadow-2xs"
            >
              <div>
                {/* Meal Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#D0F4A4] text-[#0C6816] flex items-center justify-center font-bold shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-bold text-[#0C6816] uppercase tracking-wider">{title}</p>
                      <p className="text-[9px] sm:text-[10px] text-[#5E6B52]">{period}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#0C6816] flex items-center gap-0.5 bg-white px-2 py-0.5 rounded-md border border-[#EFE6D1]">
                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {meal.calories} kcal
                  </span>
                </div>

                {/* Meal Title & Description */}
                <h3 className="font-display font-bold text-sm text-[#1F2E1E] mt-2 leading-snug line-clamp-1 sm:line-clamp-2">
                  {meal.name}
                </h3>
                <p className="text-xs text-[#5E6B52] mt-0.5 line-clamp-2 leading-relaxed">
                  {meal.description}
                </p>

                {/* Pantry badge & Prep time */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] font-bold bg-white text-[#0C6816] px-2 py-0.5 rounded-md border border-[#EFE6D1] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#5E6B52]" />
                    {meal.prepTime}
                  </span>
                  <span className="text-[10px] font-bold bg-[#D0F4A4]/60 text-[#0C6816] px-2 py-0.5 rounded-md border border-[#D0F4A4] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#0C6816]" />
                    {inPantryMatches.length}/{meal.ingredients.length} dispensa
                  </span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => setSelectedMealDetail(meal)}
                className="w-full text-center text-xs font-bold text-[#0C6816] bg-white hover:bg-[#D0F4A4]/40 py-2 rounded-xl border border-[#EFE6D1] transition-colors cursor-pointer active:scale-98"
              >
                Ver Ingredientes
              </button>
            </div>
          );
        })}
      </div>

      {/* Daily Footer Summary */}
      <div className="pt-3 border-t border-[#EFE6D1] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] sm:text-xs text-[#5E6B52]">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="bg-[#FAF7EE] px-2.5 py-1 rounded-lg border border-[#EFE6D1]">
            Total: <strong className="text-[#0C6816]">{dayPlan.totalCalories} kcal</strong>
          </span>
          <span className="bg-[#FAF7EE] px-2 py-1 rounded-lg border border-[#EFE6D1]">
            Prot: <strong className="text-[#0C6816]">{dayPlan.totalProtein}g</strong>
          </span>
          <span className="bg-[#FAF7EE] px-2 py-1 rounded-lg border border-[#EFE6D1]">
            Carb: <strong className="text-[#0C6816]">{dayPlan.totalCarbs}g</strong>
          </span>
          <span className="bg-[#FAF7EE] px-2 py-1 rounded-lg border border-[#EFE6D1]">
            Gord: <strong className="text-[#0C6816]">{dayPlan.totalFat}g</strong>
          </span>
        </div>

        {missingIngredients.length > 0 && onAddMissingToShoppingList && (
          <button
            onClick={() => onAddMissingToShoppingList(missingIngredients)}
            className="inline-flex items-center justify-center gap-1.5 font-bold text-[#0C6816] bg-[#D0F4A4]/50 hover:bg-[#D0F4A4] px-3 py-1.5 rounded-xl border border-[#D0F4A4] transition-colors cursor-pointer w-full sm:w-auto active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Adicionar {missingIngredients.length} faltante(s) às Compras</span>
          </button>
        )}
      </div>

      {/* Meal Detail Modal */}
      {selectedMealDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#EFE6D1] relative space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#EFE6D1]">
              <div>
                <span className="text-[11px] font-bold text-[#0C6816] uppercase tracking-wider">
                  Detalhes da Refeição
                </span>
                <h3 className="font-display font-black text-lg text-[#0C6816]">
                  {selectedMealDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMealDetail(null)}
                className="text-[#5E6B52] hover:text-[#0C6816] font-bold text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FAF7EE] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5E6B52] leading-relaxed">
              {selectedMealDetail.description}
            </p>

            <div className="grid grid-cols-4 gap-2 bg-[#FAF7EE] p-3 rounded-2xl border border-[#EFE6D1] text-center">
              <div>
                <p className="text-[10px] text-[#5E6B52]">Calorias</p>
                <p className="text-xs font-bold text-[#0C6816]">{selectedMealDetail.calories} kcal</p>
              </div>
              <div>
                <p className="text-[10px] text-[#5E6B52]">Proteínas</p>
                <p className="text-xs font-bold text-[#0C6816]">{selectedMealDetail.protein}g</p>
              </div>
              <div>
                <p className="text-[10px] text-[#5E6B52]">Carboidratos</p>
                <p className="text-xs font-bold text-[#0C6816]">{selectedMealDetail.carbs}g</p>
              </div>
              <div>
                <p className="text-[10px] text-[#5E6B52]">Gorduras</p>
                <p className="text-xs font-bold text-[#0C6816]">{selectedMealDetail.fat}g</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#0C6816] uppercase tracking-wider">
                Ingredientes Necessários ({selectedMealDetail.ingredients.length})
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedMealDetail.ingredients.map((ing, i) => {
                  const lower = ing.toLowerCase();
                  const inPantry = pantryItems.some(p => lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lower));
                  return (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#FAF7EE] border border-[#EFE6D1]">
                      <span className="text-[#1F2E1E] font-medium">{ing}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inPantry ? 'bg-[#D0F4A4] text-[#0C6816]' : 'bg-amber-100 text-amber-800'}`}>
                        {inPantry ? 'Na Dispensa' : 'Comprar'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setSelectedMealDetail(null)}
              className="w-full bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
