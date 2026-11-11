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
  BookOpen
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
  onDeleteUserRecipe?: (id: string) => void;
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  user,
  pantryItems = [],
  items = [],
  userRecipes = [],
  onDeleteItem,
  onAddUserRecipe,
  onDeleteUserRecipe,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'caderno' | 'salvos_ia'>('caderno');
  const [activeFilter, setActiveFilter] = useState<'all' | 'weekly_plan' | 'shopping_list'>('all');
  const [selectedItemModal, setSelectedItemModal] = useState<SavedItem | null>(null);

  // 1. Caderno de Receitas concentra: receitas criadas + receitas salvas da IA/pesquisa
  const savedRecipesFromIa = items.filter(item => item.type === 'recipe');
  const totalRecipesCount = userRecipes.length + savedRecipesFromIa.length;

  // 2. Sugestões & Salvos da IA concentra APENAS: Cardápios semanais e Listas de compras
  const filteredIaItems = items.filter(item => {
    if (item.type === 'recipe') return false;
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const getTypeBadge = (type: SavedItem['type']) => {
    switch (type) {
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
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">

      {/* Banner Superior Limpo (Sem o botão de cadastro, pois agora fica no acervo) */}
      <div className="bg-gradient-to-r from-[#0C6816] via-[#147a22] to-[#0C6816] rounded-3xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#63D753]/20 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D0F4A4]/20 border border-[#D0F4A4]/30 text-[#D0F4A4] text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Biblioteca NutriSmart</span>
          </div>

          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Caderno de Receitas & Salvos
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1 leading-relaxed">
              Consulte todas as suas receitas em um só lugar e os planejamentos gerados pela IA.
            </p>
          </div>
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
          <span>📖 Caderno de Receitas ({totalRecipesCount})</span>
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
          <span>📌 Listas & Cardápios da IA ({filteredIaItems.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: CADERNO DE RECEITAS                                                */}
      {/* ========================================================================= */}
      {activeMainTab === 'caderno' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#EFE6D1]">
            <h2 className="font-display font-bold text-base text-[#0C6816]">
              Caderno de Receitas Pessoal
            </h2>
            <p className="text-xs text-[#5E6B52]">Receitas criadas por você, salvas da pesquisa e sugestões da IA.</p>
          </div>

          {totalRecipesCount === 0 ? (
            <div className="bg-white border border-[#EFE6D1] rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FAF7EE] text-[#0C6816] mx-auto flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-[#0C6816]">Seu caderno está vazio</h3>
              <p className="text-xs text-[#5E6B52]">
                Cadastre suas próprias receitas na aba de Acervo ou salve receitas para consultá-las aqui!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Receitas Criadas pelo Usuário */}
              {userRecipes.map(recipe => (
                <div key={recipe.id} className="bg-white rounded-3xl border border-[#EFE6D1] p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold bg-[#D0F4A4] text-[#0C6816] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      ✍️ Cadastrada por você
                    </span>
                    <h3 className="font-display font-bold text-base text-[#0C6816]">{recipe.title}</h3>
                    <p className="text-xs text-[#5E6B52] leading-relaxed line-clamp-2">{recipe.description}</p>
                  </div>
                  
                  <div className="pt-3 border-t border-[#EFE6D1] flex items-center justify-between text-xs">
                    <span className="text-[#5E6B52]">
                      {recipe.prepTimeMinutes} min • <b>{recipe.calories}</b> kcal
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedItemModal({
                            id: recipe.id,
                            type: 'recipe',
                            title: recipe.title,
                            description: recipe.description,
                            createdAt: 'Autoral',
                            content: {
                              ingredients: recipe.ingredients?.map((i: any) => typeof i === 'string' ? i : `${i.amount || ''} ${i.name || ''}`),
                              instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : recipe.instructions
                            }
                          });
                        }}
                        className="px-3 py-1.5 bg-[#0C6816] hover:bg-[#095011] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#63D753]" />
                        Ver
                      </button>

                      {onDeleteUserRecipe && (
                        <button
                          onClick={() => onDeleteUserRecipe(recipe.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Excluir Receita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* 2. Receitas Salvas (Pesquisa / IA) */}
              {savedRecipesFromIa.map(item => (
                <div key={item.id} className="bg-white rounded-3xl border border-[#EFE6D1] p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      🔖 Receita Salva
                    </span>
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
                      <button onClick={() => onDeleteItem(item.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer">
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
      {/* ABA 2: LISTAS DE COMPRAS E CARDÁPIOS DA IA                                */}
      {/* ========================================================================= */}
      {activeMainTab === 'salvos_ia' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#EFE6D1] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#0C6816]" />
              <h2 className="font-display font-bold text-base text-[#0C6816]">
                Listas & Cardápios Salvos ({filteredIaItems.length})
              </h2>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#0C6816] text-white'
                    : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveFilter('weekly_plan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'weekly_plan'
                    ? 'bg-[#0C6816] text-white'
                    : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1]'
                }`}
              >
                Cardápios Semanais
              </button>
              <button
                onClick={() => setActiveFilter('shopping_list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'shopping_list'
                    ? 'bg-[#0C6816] text-white'
                    : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1]'
                }`}
              >
                Listas de Compras
              </button>
            </div>
          </div>

          {filteredIaItems.length === 0 ? (
            <div className="bg-white border border-[#EFE6D1] rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FAF7EE] text-[#0C6816] mx-auto flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-[#0C6816]">Nenhum planejamento salvo</h3>
              <p className="text-xs text-[#5E6B52]">
                Guarde listas de compras ou cardápios gerados pelo Assistente IA para consultar nesta aba!
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
                className="text-[#5E6B52] hover:text-[#0C6816] p-1.5 rounded-xl hover:bg-[#FAF7EE] cursor-pointer"
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
                  {selectedItemModal.content?.ingredients ? (
                    <>
                      <p className="text-xs font-bold text-[#0C6816]">Ingredientes:</p>
                      <ul className="list-disc list-inside text-xs text-[#1F2E1E] space-y-1">
                        {selectedItemModal.content.ingredients.map((ing: string, i: number) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                      <p className="text-xs font-bold text-[#0C6816] pt-2">Modo de Preparo:</p>
                      <p className="text-xs text-[#1F2E1E] leading-relaxed whitespace-pre-line">
                        {selectedItemModal.content.instructions}
                      </p>
                    </>
                  ) : (
                    <div className="text-xs text-[#1F2E1E] leading-relaxed whitespace-pre-line">
                      {selectedItemModal.content?.summary || selectedItemModal.description || 'Nenhum detalhe adicional registado.'}
                    </div>
                  )}
                </>
              )}

              {selectedItemModal.type === 'shopping_list' && (
                <ul className="list-disc list-inside text-xs text-[#1F2E1E] space-y-1">
                  {selectedItemModal.content?.items?.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {selectedItemModal.type === 'weekly_plan' && (
                <div className="text-xs text-[#1F2E1E] leading-relaxed whitespace-pre-line space-y-2">
                  {selectedItemModal.content?.summary || 'Plano armazenado com sucesso.'}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedItemModal(null)}
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