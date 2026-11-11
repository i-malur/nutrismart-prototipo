import React, { useState } from 'react';
import { 
  Sparkles, 
  ChefHat, 
  ShoppingCart, 
  CalendarDays, 
  Bookmark, 
  Trash2, 
  Eye, 
  Clock, 
  X,
  BookOpen,
  Plus
} from 'lucide-react';
import { UserProfile, PantryItem, Recipe } from '../types';

export interface SavedItem {
  id: string;
  type: 'recipe' | 'weekly_plan' | 'shopping_list';
  title: string;
  description: string;
  createdAt: string;
  content: any;
  isUserCreated?: boolean;
}

interface SavedItemsViewProps {
  user?: UserProfile;
  pantryItems?: PantryItem[];
  items?: SavedItem[];
  userRecipes?: Recipe[];
  onDeleteItem?: (id: string) => void;
  onAddUserRecipe?: (recipe: Recipe) => void;
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  user,
  pantryItems = [],
  items = [],
  userRecipes = [],
  onDeleteItem,
  onAddUserRecipe,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'caderno' | 'salvos_ia'>('caderno');
  const [activeFilter, setActiveFilter] = useState<'all' | 'recipe' | 'weekly_plan' | 'shopping_list'>('all');
  const [selectedItemModal, setSelectedItemModal] = useState<SavedItem | null>(null);
  
  // Estado do Modal de Cadastro de Nova Receita Manual
  const [isCreateRecipeModalOpen, setIsCreateRecipeModalOpen] = useState(false);
  const [newRecipeTitle, setNewRecipeTitle] = useState('');
  const [newRecipeDesc, setNewRecipeDesc] = useState('');
  const [newRecipePrepTime, setNewRecipePrepTime] = useState(20);
  const [newRecipeCalories, setNewRecipeCalories] = useState(300);
  const [newRecipeIngredients, setNewRecipeIngredients] = useState('');
  const [newRecipeInstructions, setNewRecipeInstructions] = useState('');

  // Filtra itens da IA
  const filteredIaItems = items.filter(item => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  // Receitas do Caderno (Salvas do tipo 'recipe' + Cadastradas pelo usuário)
  const savedRecipes = items.filter(item => item.type === 'recipe');

  const handleCreateRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeTitle.trim() || !onAddUserRecipe) return;

    const recipePayload: Recipe = {
      id: `rec-${Date.now()}`,
      title: newRecipeTitle.trim(),
      description: newRecipeDesc.trim() || 'Receita autoral cadastrada no caderno.',
      prepTimeMinutes: Number(newRecipePrepTime) || 20,
      calories: Number(newRecipeCalories) || 300,
      ingredients: newRecipeIngredients.split('\n').filter(i => i.trim() !== ''),
      instructions: newRecipeInstructions.trim(),
      isUserCreated: true,
      matchPercentage: 100
    };

    onAddUserRecipe(recipePayload);
    setIsCreateRecipeModalOpen(false);
    setActiveMainTab('caderno'); // Redireciona para o caderno após cadastrar

    // Limpa campos
    setNewRecipeTitle('');
    setNewRecipeDesc('');
    setNewRecipeIngredients('');
    setNewRecipeInstructions('');
  };

  const getTypeBadge = (type: SavedItem['type']) => {
    switch (type) {
      case 'recipe':
        return (
          <span className="text-[11px] font-bold bg-[#D0F4A4] text-[#0C6816] px-2.5 py-1 rounded-lg border border-[#63D753]/40 flex items-center gap-1.5">
            <ChefHat className="w-3.5 h-3.5" />
            Receita Salva
          </span>
        );
      case 'weekly_plan':
        return (
          <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            Cardápio Semanal
          </span>
        );
      case 'shopping_list':
        return (
          <span className="text-[11px] font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-300 flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5" />
            Lista de Compras
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">

      {/* Banner Superior Limpo com Botão de Cadastro de Receitas */}
      <div className="bg-gradient-to-r from-[#0C6816] via-[#147a22] to-[#0C6816] rounded-3xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#63D753]/20 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D0F4A4]/20 border border-[#D0F4A4]/30 text-[#D0F4A4] text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Biblioteca NutriSmart</span>
          </div>

          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Caderno de Receitas & Itens Salvos
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1 leading-relaxed">
              Consulte suas receitas autorais, receitas salvas e os planejamentos gerados pela IA.
            </p>
          </div>
        </div>

        {/* Botão de Cadastro no Banner Verde */}
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => setIsCreateRecipeModalOpen(true)}
            className="w-full sm:w-auto px-5 py-3 bg-[#63D753] hover:bg-[#52c244] text-[#0C6816] font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Cadastrar Nova Receita</span>
          </button>
        </div>
      </div>

      {/* NAVEGAÇÃO PRINCIPAL DAS DUAS SEÇÕES */}
      <div className="bg-white border border-[#EFE6D1] rounded-2xl p-2 shadow-2xs flex items-center gap-2">
        <button
          onClick={() => setActiveMainTab('caderno')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMainTab === 'caderno'
              ? 'bg-[#0C6816] text-white shadow-xs'
              : 'bg-transparent text-[#5E6B52] hover:bg-[#FAF7EE] hover:text-[#0C6816]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#63D753]" />
          <span>📖 Caderno de Receitas ({savedRecipes.length + userRecipes.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('salvos_ia')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMainTab === 'salvos_ia'
              ? 'bg-[#0C6816] text-white shadow-xs'
              : 'bg-transparent text-[#5E6B52] hover:bg-[#FAF7EE] hover:text-[#0C6816]'
          }`}
        >
          <Bookmark className="w-4 h-4 text-[#D0F4A4]" />
          <span>📌 Sugestões & Salvos da IA ({items.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: CADERNO DE RECEITAS (RECEITAS CADASTRADAS + RECEITAS SALVAS)       */}
      {/* ========================================================================= */}
      {activeMainTab === 'caderno' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#EFE6D1]">
            <div>
              <h2 className="font-display font-bold text-base text-[#0C6816]">
                Minhas Receitas & Favoritas
              </h2>
              <p className="text-xs text-[#5E6B52]">Receitas autorais e salvas para o seu dia a dia.</p>
            </div>

            <button
              onClick={() => setIsCreateRecipeModalOpen(true)}
              className="px-4 py-2.5 bg-[#0C6816] hover:bg-[#095011] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#63D753]" />
              <span>Nova Receita</span>
            </button>
          </div>

          {savedRecipes.length === 0 && userRecipes.length === 0 ? (
            <div className="bg-white border border-[#EFE6D1] rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FAF7EE] text-[#0C6816] mx-auto flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-[#0C6816]">Seu caderno está vazio</h3>
              <p className="text-xs text-[#5E6B52]">
                Cadastre suas próprias receitas ou salve receitas sugeridas pela IA para consultar aqui!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Receitas Cadastradas pelo Usuário */}
              {userRecipes.map(recipe => (
                <div key={recipe.id} className="bg-white rounded-3xl border border-[#EFE6D1] p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold bg-[#D0F4A4] text-[#0C6816] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      ✍️ Cadastrada por você
                    </span>
                    <h3 className="font-display font-bold text-base text-[#0C6816]">{recipe.title}</h3>
                    <p className="text-xs text-[#5E6B52] leading-relaxed line-clamp-2">{recipe.description}</p>
                  </div>
                  <div className="pt-3 border-t border-[#EFE6D1] flex justify-between items-center text-xs">
                    <span className="text-[#5E6B52]">{recipe.prepTimeMinutes} min</span>
                    <span className="font-bold text-[#0C6816]">{recipe.calories} kcal</span>
                  </div>
                </div>
              ))}

              {/* Receitas Salvas da IA */}
              {savedRecipes.map(item => (
                <div key={item.id} className="bg-white rounded-3xl border border-[#EFE6D1] p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    {getTypeBadge(item.type)}
                    <h3 className="font-display font-bold text-base text-[#0C6816]">{item.title}</h3>
                    <p className="text-xs text-[#5E6B52] leading-relaxed line-clamp-2">{item.description}</p>
                  </div>
                  <div className="pt-3 border-t border-[#EFE6D1] flex items-center justify-between">
                    <button
                      onClick={() => setSelectedItemModal(item)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#0C6816] hover:underline cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-[#63D753]" />
                      <span>Ver Detalhes</span>
                    </button>
                    {onDeleteItem && (
                      <button onClick={() => onDeleteItem(item.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: SUGESTÕES & SALVOS DA IA (CARDÁPIOS, LISTAS E SUGESTÕES)           */}
      {/* ========================================================================= */}
      {activeMainTab === 'salvos_ia' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#EFE6D1] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#0C6816]" />
              <h2 className="font-display font-bold text-base text-[#0C6816]">
                Itens Salvos da IA ({items.length})
              </h2>
            </div>

            {/* Abas de Filtro */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#0C6816] text-white'
                    : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1]'
                }`}
              >
                Todos ({items.length})
              </button>
              <button
                onClick={() => setActiveFilter('recipe')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'recipe'
                    ? 'bg-[#0C6816] text-white'
                    : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1]'
                }`}
              >
                Receitas
              </button>
              <button
                onClick={() => setActiveFilter('weekly_plan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'weekly_plan'
                    ? 'bg-[#0C6816] text-white'
                    : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1]'
                }`}
              >
                Cardápios
              </button>
              <button
                onClick={() => setActiveFilter('shopping_list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'shopping_list'
                    ? 'bg-[#0C6816] text-white'
                    : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1]'
                }`}
              >
                Listas
              </button>
            </div>
          </div>

          {filteredIaItems.length === 0 ? (
            <div className="bg-white border border-[#EFE6D1] rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FAF7EE] text-[#0C6816] mx-auto flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-[#0C6816]">Nenhum item salvo encontrado</h3>
              <p className="text-xs text-[#5E6B52]">
                Guarde sugestões da IA no assistente para consultar nesta tela!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIaItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-[#EFE6D1] hover:border-[#63D753] transition-all p-5 shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {getTypeBadge(item.type)}
                      <span className="text-[10px] text-[#5E6B52] flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {item.createdAt}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-sm sm:text-base text-[#0C6816] leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#5E6B52] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EFE6D1] flex items-center justify-between">
                    <button
                      onClick={() => setSelectedItemModal(item)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#0C6816] hover:underline cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-[#63D753]" />
                      <span>Visualizar Detalhes</span>
                    </button>

                    {onDeleteItem && (
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remover dos Salvos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Cadastro de Nova Receita Manual */}
      {isCreateRecipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EFE6D1] relative space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE6D1]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D0F4A4] text-[#0C6816] flex items-center justify-center font-bold">
                  <ChefHat className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-base text-[#0C6816]">
                  Cadastrar Nova Receita
                </h3>
              </div>
              <button
                onClick={() => setIsCreateRecipeModalOpen(false)}
                className="text-[#5E6B52] hover:text-[#0C6816] p-1.5 rounded-xl hover:bg-[#FAF7EE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Título da Receita *</label>
                <input
                  type="text"
                  required
                  value={newRecipeTitle}
                  onChange={(e) => setNewRecipeTitle(e.target.value)}
                  placeholder="Ex: Panqueca de Aveia Fitness"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs text-[#0C6816] outline-hidden focus:border-[#63D753]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Breve Descrição</label>
                <input
                  type="text"
                  value={newRecipeDesc}
                  onChange={(e) => setNewRecipeDesc(e.target.value)}
                  placeholder="Ex: Ótima opção rica em fibras para o café da manhã."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs text-[#0C6816] outline-hidden focus:border-[#63D753]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0C6816] mb-1">Tempo (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={newRecipePrepTime}
                    onChange={(e) => setNewRecipePrepTime(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs text-[#0C6816] outline-hidden focus:border-[#63D753]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0C6816] mb-1">Calorias (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    value={newRecipeCalories}
                    onChange={(e) => setNewRecipeCalories(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs text-[#0C6816] outline-hidden focus:border-[#63D753]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Ingredientes (um por linha)</label>
                <textarea
                  rows={3}
                  value={newRecipeIngredients}
                  onChange={(e) => setNewRecipeIngredients(e.target.value)}
                  placeholder="1 xícara de aveia&#10;2 ovos&#10;1 banana"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs text-[#0C6816] outline-hidden focus:border-[#63D753]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Modo de Preparo</label>
                <textarea
                  rows={3}
                  value={newRecipeInstructions}
                  onChange={(e) => setNewRecipeInstructions(e.target.value)}
                  placeholder="Amasse a banana, misture com os ovos e a aveia. Frite em frigideira antiaderente."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs text-[#0C6816] outline-hidden focus:border-[#63D753]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRecipeModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF7EE] hover:bg-[#EFE6D1] text-[#5E6B52] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0C6816] hover:bg-[#095011] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Cadastrar Receita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Item Salvo */}
      {selectedItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EFE6D1] relative space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-[#EFE6D1]">
              <div className="space-y-1">
                {getTypeBadge(selectedItemModal.type)}
                <h3 className="font-display font-bold text-base sm:text-lg text-[#0C6816] mt-2">
                  {selectedItemModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemModal(null)}
                className="text-[#5E6B52] hover:text-[#0C6816] p-1.5 rounded-xl hover:bg-[#FAF7EE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5E6B52]">
              {selectedItemModal.description}
            </p>

            <div className="bg-[#FAF7EE] p-4 rounded-2xl border border-[#EFE6D1] space-y-3 max-h-60 overflow-y-auto">
              {selectedItemModal.type === 'recipe' && (
                <>
                  <p className="text-xs font-bold text-[#0C6816]">Ingredientes:</p>
                  <ul className="list-disc list-inside text-xs text-[#1F2E1E] space-y-1">
                    {selectedItemModal.content.ingredients?.map((ing: string, i: number) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                  <p className="text-xs font-bold text-[#0C6816] pt-2">Modo de Preparo:</p>
                  <p className="text-xs text-[#1F2E1E] leading-relaxed">
                    {selectedItemModal.content.instructions}
                  </p>
                </>
              )}

              {selectedItemModal.type === 'shopping_list' && (
                <>
                  <p className="text-xs font-bold text-[#0C6816]">Itens da Lista de Compras:</p>
                  <ul className="list-disc list-inside text-xs text-[#1F2E1E] space-y-1">
                    {selectedItemModal.content.items?.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </>
              )}

              {selectedItemModal.type === 'weekly_plan' && (
                <div className="text-xs text-[#1F2E1E] leading-relaxed whitespace-pre-line space-y-2">
                  {selectedItemModal.content.summary || 'Plano de 7 dias armazenado com sucesso no seu perfil.'}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedItemModal(null)}
                className="px-5 py-2 bg-[#0C6816] hover:bg-[#095011] text-white text-xs font-bold rounded-xl"
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