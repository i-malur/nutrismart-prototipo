import React, { useState, useMemo } from 'react';
import {
  Search,
  ChefHat,
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  FilterX,
  Bookmark,
  Check,
  Plus,
  Sparkles
} from 'lucide-react';
import { Recipe, PantryItem, UserProfile } from '../types';
import { RecipeRegisterForm } from './RecipeRegisterForm';

interface RecipesViewProps {
  recipes: Recipe[];
  pantryItems: PantryItem[];
  user?: UserProfile;
  userName?: string;
  onAddRecipe?: (newRecipe: Recipe) => void;
  onSaveToLibrary?: (item: any) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  recipes = [],
  pantryItems = [],
  user,
  userName = 'Usuário',
  onAddRecipe,
  onSaveToLibrary,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [excludedIngredientsText, setExcludedIngredientsText] = useState('');
  const [selectedTag, setSelectedTag] = useState('Todas');
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<Recipe | null>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const checkIsIngredientInPantry = (ingredientName: string) => {
    if (!pantryItems || pantryItems.length === 0) return false;
    const normIng = ingredientName.toLowerCase();
    return pantryItems.some(item =>
      normIng.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(normIng)
    );
  };

  const excludedTerms = useMemo(() => {
    if (!excludedIngredientsText.trim()) return [];
    return excludedIngredientsText
      .split(';')
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);
  }, [excludedIngredientsText]);

  const normalizeText = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Filtra apenas receitas globais ou as aprovadas para o acervo público
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const isUserAuthored = (recipe as any).isUserCreated;
      const approvalStatus = (recipe as any).status;
      
      // Se for receita autoral e não estiver aprovada, esconde do acervo público geral
      if (isUserAuthored && approvalStatus !== 'aprovado') {
        return false;
      }

      const fullText = normalizeText(
        `${recipe.title} ${recipe.description} ${recipe.ingredients.map(i => i.name).join(' ')} ${recipe.tags.join(' ')}`
      );

      if (user) {
        const userRestrictions = user.dietaryRestrictions || [];
        const isGlutenFreeRequired = userRestrictions.includes('Sem Glúten');
        const isLactoseFreeRequired = userRestrictions.includes('Sem Lactose');
        const isVegetarianRequired = userRestrictions.includes('Vegetariano');
        const isVeganRequired = userRestrictions.includes('Vegano');

        if (isGlutenFreeRequired && !recipe.tags.includes('Sem Glúten')) return false;
        if (isLactoseFreeRequired && !recipe.tags.includes('Sem Lactose')) return false;
        if (isVegetarianRequired && !recipe.tags.some(t => ['Vegetariano', 'Vegano'].includes(t))) return false;
        if (isVeganRequired && !recipe.tags.includes('Vegano')) return false;

        if (user.customRestrictions) {
          const profileExcludedTerms = user.customRestrictions
            .split(',')
            .concat(user.customRestrictions.split(';'))
            .map(t => normalizeText(t.trim()))
            .filter(t => t.length > 0);

          const hasForbiddenItem = profileExcludedTerms.some(term => fullText.includes(term));
          if (hasForbiddenItem) return false;
        }
      }

      if (excludedTerms.length > 0) {
        const containsExcludedTerm = excludedTerms.some(term => fullText.includes(normalizeText(term)));
        if (containsExcludedTerm) return false;
      }

      if (searchTerm.trim()) {
        const searchNorm = normalizeText(searchTerm.trim());
        if (!fullText.includes(searchNorm)) return false;
      }

      if (selectedTag !== 'Todas') {
        if (!recipe.tags.includes(selectedTag)) return false;
      }

      return true;
    });
  }, [recipes, user, searchTerm, excludedTerms, selectedTag]);

  const handleSaveRecipe = (recipe: Recipe) => {
    if (savedRecipeIds.includes(recipe.id)) return;

    setSavedRecipeIds(prev => [...prev, recipe.id]);

    if (onSaveToLibrary) {
      onSaveToLibrary({
        type: 'recipe',
        title: recipe.title,
        description: recipe.description,
        content: {
          prepTime: `${recipe.prepTimeMinutes} min`,
          ingredients: recipe.ingredients.map(i => `${i.amount} ${i.name}`),
          instructions: recipe.instructions.join(' ')
        }
      });
    }
  };

  const handleCreateSubmit = (newRecipe: Recipe) => {
    if (onAddRecipe) {
      onAddRecipe(newRecipe);
    }
    setIsRegisterModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* Header Banner com Botão de Cadastro */}
      <div className="bg-gradient-to-r from-[#0C6816] via-[#147a22] to-[#0C6816] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D0F4A4]/20 border border-[#D0F4A4]/30 text-[#D0F4A4] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#63D753]" />
            <span>Acervo Público Inteligente</span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Acervo de Receitas
          </h1>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
            Explore receitas compatíveis com as suas restrições alimentares e adicione novas criações.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="relative z-10 w-full sm:w-auto px-5 py-3.5 bg-[#63D753] hover:bg-[#52c443] text-[#0C6816] font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Nova Receita</span>
        </button>
      </div>

      {/* Caixa de Busca e Filtro de Exclusão */}
      <div className="bg-white border border-[#EFE6D1] rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar receita por nome, ingrediente..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-2xl text-xs text-[#1F2E1E] outline-hidden"
            />
          </div>

          <div className="relative">
            <FilterX className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={excludedIngredientsText}
              onChange={e => setExcludedIngredientsText(e.target.value)}
              placeholder="Excluir alimentos (ex: cebola; pimenta; carne de porco)"
              className="w-full pl-10 pr-4 py-2.5 bg-rose-50/50 border border-rose-200 focus:border-rose-400 rounded-2xl text-xs text-rose-900 outline-hidden placeholder:text-rose-400/80"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#EFE6D1] flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['Todas', 'Zero Desperdício', 'Sem Glúten', 'Sem Lactose', 'Vegetariana', 'Proteica'].map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-[#0C6816] text-white'
                    : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#5E6B52] font-semibold">
            Exibindo <strong className="text-[#0C6816]">{filteredRecipes.length}</strong> receitas
          </span>
        </div>
      </div>

      {/* Grid de Receitas */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white border border-[#EFE6D1] rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#FAF7EE] text-[#0C6816] mx-auto flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-[#0C6816]">Nenhuma receita encontrada</h3>
          <p className="text-xs text-[#5E6B52]">
            Tente ajustar os filtros de busca ou cadastre uma nova receita.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map(recipe => {
            const isSaved = savedRecipeIds.includes(recipe.id);
            const isUserCreated = (recipe as any).isUserCreated;
            const status = (recipe as any).status;

            return (
              <div
                key={recipe.id}
                className="bg-white rounded-3xl border border-[#EFE6D1] hover:border-[#63D753] transition-all p-5 shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4 relative"
              >
                {isUserCreated && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg border border-amber-300">
                      ✏️ CADASTRADA POR VOCÊ
                    </span>
                    {status && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        status === 'aprovado' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {status === 'aprovado' ? 'Aprovado' : 'Em Análise'}
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold bg-[#D0F4A4] text-[#0C6816] px-2.5 py-0.5 rounded-lg border border-[#63D753]/40">
                      {recipe.difficulty}
                    </span>
                    <span className="text-xs text-[#5E6B52] flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {recipe.prepTimeMinutes} min
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-[#0C6816] leading-snug">
                    {recipe.title}
                  </h3>

                  <p className="text-xs text-[#5E6B52] leading-relaxed line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {recipe.tags?.map(t => (
                      <span key={t} className="text-[10px] font-semibold bg-[#FAF7EE] text-[#5E6B52] px-2.5 py-1 rounded-lg border border-[#EFE6D1]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EFE6D1] flex items-center justify-between">
                  <span className="text-xs text-[#5E6B52] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <b>{recipe.calories}</b> kcal
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveRecipe(recipe)}
                      disabled={isSaved}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#FAF7EE] text-[#0C6816] hover:bg-[#EFE6D1] border border-[#EFE6D1]'
                      }`}
                      title={isSaved ? 'Salvo' : 'Salvar no Caderno'}
                    >
                      {isSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setSelectedRecipeModal(recipe)}
                      className="px-4 py-2 bg-[#0C6816] hover:bg-[#095011] text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      Ver Receita
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Cadastro de Nova Receita */}
      {isRegisterModalOpen && (
        <RecipeRegisterForm
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onAddRecipe={handleCreateSubmit}
          pantryItems={pantryItems}
          authorName={userName}
        />
      )}

      {/* Modal de Detalhes / Leitura Completa da Receita */}
      {selectedRecipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EFE6D1] relative space-y-4 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#EFE6D1]">
              <div>
                <span className="text-[10px] font-bold bg-[#D0F4A4] text-[#0C6816] px-2.5 py-0.5 rounded-lg">
                  {selectedRecipeModal.difficulty} • {selectedRecipeModal.prepTimeMinutes} min • {selectedRecipeModal.calories} kcal
                </span>
                <h3 className="font-display font-bold text-lg text-[#0C6816] mt-2">
                  {selectedRecipeModal.title}
                </h3>
                <p className="text-xs text-[#5E6B52] mt-1">{selectedRecipeModal.description}</p>
              </div>
              <button
                onClick={() => setSelectedRecipeModal(null)}
                className="text-[#5E6B52] hover:text-[#0C6816] p-1.5 rounded-xl hover:bg-[#FAF7EE] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#FAF7EE] p-4 rounded-2xl border border-[#EFE6D1] space-y-4 text-xs text-[#1F2E1E]">
              <div>
                <p className="font-bold text-[#0C6816] mb-2 uppercase tracking-wide text-[11px]">Ingredientes necessários:</p>
                <ul className="space-y-1.5">
                  {selectedRecipeModal.ingredients.map((ing, i) => {
                    const inPantry = checkIsIngredientInPantry(ing.name);

                    return (
                      <li key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#EFE6D1]">
                        <span className="font-medium">{ing.name} <span className="text-[#5E6B52]">({ing.amount})</span></span>
                        {inPantry ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Na dispensa
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Comprar
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <p className="font-bold text-[#0C6816] mb-2 uppercase tracking-wide text-[11px]">Modo de Preparo:</p>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed bg-white p-3 rounded-xl border border-[#EFE6D1]">
                  {selectedRecipeModal.instructions.map((inst, i) => (
                    <li key={i} className="pl-1">{inst}</li>
                  ))}
                </ol>
              </div>

              {selectedRecipeModal.chefTips && (
                <div className="bg-[#D0F4A4]/30 border border-[#63D753]/40 p-3 rounded-xl text-[#0C6816]">
                  <p className="font-bold text-[11px] mb-1">Dica do Chef:</p>
                  <p className="italic text-xs">{selectedRecipeModal.chefTips}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleSaveRecipe(selectedRecipeModal)}
                disabled={savedRecipeIds.includes(selectedRecipeModal.id)}
                className="px-4 py-2 bg-[#FAF7EE] text-[#0C6816] border border-[#EFE6D1] hover:bg-[#EFE6D1] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {savedRecipeIds.includes(selectedRecipeModal.id) ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Salva no Caderno</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-[#0C6816]" />
                    <span>Salvar Receita</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedRecipeModal(null)}
                className="px-5 py-2 bg-[#0C6816] hover:bg-[#095011] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};