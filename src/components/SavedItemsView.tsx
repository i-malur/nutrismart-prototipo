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
  X
} from 'lucide-react';
import { UserProfile, PantryItem } from '../types';

export interface SavedItem {
  id: string;
  type: 'recipe' | 'weekly_plan' | 'shopping_list';
  title: string;
  description: string;
  createdAt: string;
  content: any;
}

interface SavedItemsViewProps {
  user?: UserProfile;
  pantryItems?: PantryItem[];
}

const INITIAL_SAVED_ITEMS: SavedItem[] = [
  {
    id: 'save-1',
    type: 'recipe',
    title: 'Omelete Rápida de Espinafre e Ovos Caipiras',
    description: 'Receita focada em utilizar ovos e espinafre prestes a vencer na dispensa.',
    createdAt: '10/11/2026',
    content: {
      prepTime: '15 min',
      ingredients: ['3 Ovos Caipiras', '1 maço de Espinafre', '1 colher de Azeite', 'Sal e Pimenta'],
      instructions: 'Bata os ovos, refogue o espinafre no azeite e despeje a mistura até dourar.'
    }
  },
  {
    id: 'save-2',
    type: 'weekly_plan',
    title: 'Plano Semanal Equilibrado & Económico',
    description: 'Sugestão de 7 dias priorizando grãos, proteínas magras e vegetais frescos.',
    createdAt: '08/11/2026',
    content: {
      daysCount: 7,
      summary: 'Cardápio otimizado para o seu perfil e rotina.'
    }
  },
  {
    id: 'save-3',
    type: 'shopping_list',
    title: 'Lista de Compras Complementar',
    description: 'Itens essenciais que faltavam para completar as refeições sugeridas da semana.',
    createdAt: '05/11/2026',
    content: {
      items: ['Azeite de Oliva Extra Virgem', 'Peito de Frango 1kg', 'Iogurte Natural']
    }
  }
];

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  user,
  pantryItems = [],
}) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>(INITIAL_SAVED_ITEMS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'recipe' | 'weekly_plan' | 'shopping_list'>('all');
  const [selectedItemModal, setSelectedItemModal] = useState<SavedItem | null>(null);

  const filteredItems = savedItems.filter(item => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const handleDeleteItem = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
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

      {/* Banner Superior Limpo sem Botões */}
      <div className="bg-gradient-to-r from-[#0C6816] via-[#147a22] to-[#0C6816] rounded-3xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#63D753]/20 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D0F4A4]/20 border border-[#D0F4A4]/30 text-[#D0F4A4] text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Biblioteca NutriSmart</span>
          </div>

          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Seus Itens Salvos
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Consulte e gira todas as receitas, cardápios e listas de compras que guardou na sua conta.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros da Biblioteca de Salvos */}
      <div className="bg-white border border-[#EFE6D1] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[#0C6816]" />
          <h2 className="font-display font-bold text-base text-[#0C6816]">
            Meus Salvos ({savedItems.length})
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
            Todos ({savedItems.length})
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

      {/* Grid de Cards Salvos */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-[#EFE6D1] rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#FAF7EE] text-[#0C6816] mx-auto flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-[#0C6816]">Nenhum item salvo encontrado</h3>
          <p className="text-xs text-[#5E6B52]">
            Guarde receitas e listas no aplicativo para consultar nesta tela sempre que precisar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
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

              {/* Ações do Card */}
              <div className="pt-3 border-t border-[#EFE6D1] flex items-center justify-between">
                <button
                  onClick={() => setSelectedItemModal(item)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#0C6816] hover:underline cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#63D753]" />
                  <span>Visualizar Detalhes</span>
                </button>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Remover dos Salvos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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

            {/* Conteúdo Dinâmico */}
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
                <p className="text-xs text-[#1F2E1E]">
                  {selectedItemModal.content.summary || 'Plano de 7 dias armazenado com sucesso no seu perfil.'}
                </p>
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