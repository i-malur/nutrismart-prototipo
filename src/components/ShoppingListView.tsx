import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Check, 
  Trash2, 
  PackageCheck, 
  Copy, 
  CheckCircle2, 
  Share2, 
  DollarSign, 
  Layers, 
  Sparkles,
  Tag,
  AlertTriangle,
  Lightbulb,
  ArrowDown
} from 'lucide-react';
import { ShoppingItem, FoodCategory, PantryItem, UserProfile } from '../types';

interface ShoppingListViewProps {
  shoppingList: ShoppingItem[];
  user: UserProfile;
  pantryItems: PantryItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'addedAt'>) => void;
  onMoveBoughtToPantry: (boughtItems: ShoppingItem[]) => void;
  onClearChecked: () => void;
}

const CATEGORIES: FoodCategory[] = [
  'Hortifruti (Frutas & Vegetais)',
  'Proteínas & Carnes',
  'Grãos, Cereais & Massas',
  'Laticínios & Derivados',
  'Temperos & Condimentos',
  'Molhos & Conservas',
  'Padaria & Farinhas',
  'Bebidas',
  'Outros'
];

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  shoppingList,
  user,
  pantryItems,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onMoveBoughtToPantry,
  onClearChecked,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Hortifruti (Frutas & Vegetais)');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('unid');
  const [estimatedPrice, setEstimatedPrice] = useState<number>(10);

  const checkedCount = shoppingList.filter(i => i.isChecked).length;
  const totalEstimated = shoppingList.reduce((acc, curr) => acc + (curr.estimatedPrice || 0), 0);
  const checkedEstimated = shoppingList
    .filter(i => i.isChecked)
    .reduce((acc, curr) => acc + (curr.estimatedPrice || 0), 0);

  // Intelligent Suggestions Engine based on User Profile and Pantry Items
  const generateSuggestions = () => {
    const suggestions: { name: string; category: FoodCategory; quantity: number; unit: string; estimatedPrice: number; reason: string }[] = [];

    // 1. Pantry items expiring soon (need replenishing)
    const expiringSoon = pantryItems.filter(p => p.daysLeft <= 3);
    expiringSoon.forEach(item => {
      const alreadyInList = shoppingList.some(s => s.name.toLowerCase().includes(item.name.toLowerCase()));
      if (!alreadyInList) {
        suggestions.push({
          name: item.name,
          category: item.category,
          quantity: item.quantity > 0 ? item.quantity : 1,
          unit: item.unit || 'unid',
          estimatedPrice: 12.0,
          reason: `Reposição: seu estoque atual vence em ${item.daysLeft} dia(s)`
        });
      }
    });

    // 2. Suggestions based on user dietary restrictions and preferences
    const restrictions = user.dietaryRestrictions || [];
    const isGlutenFree = restrictions.some(r => r.toLowerCase().includes('glúten'));
    const isLactoseFree = restrictions.some(r => r.toLowerCase().includes('lactose'));
    const isVeganOrVeg = restrictions.some(r => r.toLowerCase().includes('vegan') || r.toLowerCase().includes('vegetar')) || user.diet.toLowerCase().includes('vegan');
    const isLowCarb = user.diet.toLowerCase().includes('low carb') || user.diet.toLowerCase().includes('ceto');
    const isHypertrophy = user.diet.toLowerCase().includes('massa') || user.diet.toLowerCase().includes('hipertrofia');

    if (isGlutenFree) {
      const candidates = [
        { name: 'Farinha de Amêndoas Orgânica', category: 'Padaria & Farinhas' as FoodCategory, quantity: 1, unit: 'pct 200g', estimatedPrice: 18.5, reason: 'Ideal para sua dieta Sem Glúten' },
        { name: 'Goma de Tapioca Hidratada', category: 'Padaria & Farinhas' as FoodCategory, quantity: 1, unit: 'pct 500g', estimatedPrice: 7.9, reason: 'Carboidrato natural 100% livre de glúten' }
      ];
      candidates.forEach(c => {
        if (!shoppingList.some(s => s.name.toLowerCase().includes(c.name.toLowerCase()))) {
          suggestions.push(c);
        }
      });
    }

    if (isLactoseFree) {
      const candidates = [
        { name: 'Bebida Vegetal de Amêndoas / Aveia', category: 'Laticínios & Derivados' as FoodCategory, quantity: 1, unit: 'L', estimatedPrice: 14.5, reason: 'Substituto nutritivo sem lactose' },
        { name: 'Queijo Vegano ou Queijo Minas Frescal Sem Lactose', category: 'Laticínios & Derivados' as FoodCategory, quantity: 1, unit: 'peça 300g', estimatedPrice: 19.9, reason: 'Livre de lactose e digestão suave' }
      ];
      candidates.forEach(c => {
        if (!shoppingList.some(s => s.name.toLowerCase().includes(c.name.toLowerCase()))) {
          suggestions.push(c);
        }
      });
    }

    if (isVeganOrVeg) {
      const candidates = [
        { name: 'Tofu Orgânico Firme', category: 'Proteínas & Carnes' as FoodCategory, quantity: 1, unit: 'bloco 400g', estimatedPrice: 16.0, reason: 'Proteína vegetal de alto valor biológico' },
        { name: 'Grão-de-Bico Seco Selecionado', category: 'Grãos, Cereais & Massas' as FoodCategory, quantity: 1, unit: 'pct 500g', estimatedPrice: 9.5, reason: 'Rico em ferro e versátil para saladas e pastas' }
      ];
      candidates.forEach(c => {
        if (!shoppingList.some(s => s.name.toLowerCase().includes(c.name.toLowerCase()))) {
          suggestions.push(c);
        }
      });
    }

    if (isLowCarb) {
      const candidates = [
        { name: 'Azeite de Oliva Extra Virgem 0.2%', category: 'Temperos & Condimentos' as FoodCategory, quantity: 1, unit: 'vidro 500ml', estimatedPrice: 38.0, reason: 'Gordura saudável anti-inflamatória' },
        { name: 'Mix de Castanhas e Nozes Tostadas', category: 'Outros' as FoodCategory, quantity: 1, unit: 'pct 150g', estimatedPrice: 19.0, reason: 'Snack com alta saciedade e baixo carboidrato' }
      ];
      candidates.forEach(c => {
        if (!shoppingList.some(s => s.name.toLowerCase().includes(c.name.toLowerCase()))) {
          suggestions.push(c);
        }
      });
    }

    if (isHypertrophy) {
      const candidates = [
        { name: 'Ovos Caipiras (Cartela com 20 un)', category: 'Proteínas & Carnes' as FoodCategory, quantity: 1, unit: 'cartela', estimatedPrice: 22.0, reason: 'Excelente perfil de aminoácidos para recuperação' },
        { name: 'Iogurte Natural Desnatado ou Grego 0% Açúcar', category: 'Laticínios & Derivados' as FoodCategory, quantity: 2, unit: 'potes 170g', estimatedPrice: 9.8, reason: 'Proteína rápida e probióticos' }
      ];
      candidates.forEach(c => {
        if (!shoppingList.some(s => s.name.toLowerCase().includes(c.name.toLowerCase()))) {
          suggestions.push(c);
        }
      });
    }

    // Default healthy staple if list is still small
    if (suggestions.length < 3) {
      const staples = [
        { name: 'Maçãs Gala Frescas', category: 'Hortifruti (Frutas & Vegetais)' as FoodCategory, quantity: 6, unit: 'unid', estimatedPrice: 8.5, reason: 'Fruta rica em pectina e antioxidantes' },
        { name: 'Espinafre / Rúcula Orgânica', category: 'Hortifruti (Frutas & Vegetais)' as FoodCategory, quantity: 1, unit: 'maço', estimatedPrice: 5.5, reason: 'Folhas verdes escuras com alto teor de ferro' }
      ];
      staples.forEach(st => {
        if (!shoppingList.some(s => s.name.toLowerCase().includes(st.name.toLowerCase()))) {
          suggestions.push(st);
        }
      });
    }

    return suggestions.slice(0, 5);
  };

  const smartSuggestions = generateSuggestions();

  const handleAddSuggestion = (sug: typeof smartSuggestions[0]) => {
    onAddItem({
      name: sug.name,
      category: sug.category,
      quantity: sug.quantity,
      unit: sug.unit,
      estimatedPrice: sug.estimatedPrice,
      isChecked: false,
      source: 'Dispensa Baixa'
    });
  };

  const handleAddAllSuggestions = () => {
    smartSuggestions.forEach(sug => {
      handleAddSuggestion(sug);
    });
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name: name.trim(),
      category,
      quantity: Number(quantity) || 1,
      unit,
      estimatedPrice: Number(estimatedPrice) || 0,
      isChecked: false,
      source: 'Manual'
    });

    setName('');
    setQuantity(1);
    setEstimatedPrice(10);
    setIsAddModalOpen(false);
  };

  const handleMoveBought = () => {
    const bought = shoppingList.filter(i => i.isChecked);
    if (bought.length === 0) return;
    onMoveBoughtToPantry(bought);
  };

  const handleCopyToClipboard = () => {
    const lines = [
      '🛒 *Lista de Compras Inteligente - NutriSmart*',
      `📅 Data: ${new Date().toLocaleDateString('pt-BR')}`,
      `💰 Estimativa Total: R$ ${totalEstimated.toFixed(2)}`,
      '',
      ...shoppingList.map(i => `${i.isChecked ? '✅' : '⬜'} ${i.name} - ${i.quantity} ${i.unit} (~R$ ${i.estimatedPrice.toFixed(2)})`),
      '',
      '_Gerado pelo aplicativo NutriSmart - Nutrição Personalizada_'
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Group by category
  const groupedCategories = CATEGORIES.map(cat => ({
    category: cat,
    items: shoppingList.filter(i => i.category === cat)
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#0C6816] via-[#147a22] to-[#0C6816] rounded-2xl p-4 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#D0F4A4]/20 border border-[#D0F4A4]/30 text-[#D0F4A4] text-[11px] sm:text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Compras Planejadas & Econômicas</span>
            </div>
            <h1 className="font-display font-extrabold text-xl sm:text-3xl text-white tracking-tight">
              Lista de Compras Inteligente
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Itens gerados a partir do seu cardápio semanal e reposição da dispensa. Quando você marca os itens como comprados, pode transferi-los para sua dispensa virtual em 1 clique!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              id="shopping-add-item-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#63D753] hover:bg-[#52c244] text-[#0C6816] font-bold px-4 py-2.5 min-h-[44px] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Adicionar Item</span>
            </button>

            {checkedCount > 0 && (
              <button
                onClick={handleMoveBought}
                id="move-to-pantry-btn"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D0F4A4] hover:bg-[#bce684] text-[#0C6816] font-extrabold px-4 py-2.5 min-h-[44px] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-xs sm:text-sm animate-pulse-subtle"
              >
                <PackageCheck className="w-4 h-4 text-[#0C6816]" />
                <span>Mover {checkedCount} Comprado(s) para a Dispensa</span>
              </button>
            )}

            <button
              onClick={handleCopyToClipboard}
              id="copy-shopping-list-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold px-4 py-2.5 min-h-[44px] rounded-xl transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-[#63D753]" /> : <Copy className="w-4 h-4 text-[#D0F4A4]" />}
              <span>{copied ? 'Copiado para WhatsApp!' : 'Copiar Lista'}</span>
            </button>
          </div>
        </div>

        {/* Totals Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/15">
          <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 backdrop-blur-xs">
            <p className="text-[11px] sm:text-xs text-white/70 font-medium leading-tight">Total de Itens</p>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-white mt-0.5">{shoppingList.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 backdrop-blur-xs">
            <p className="text-[11px] sm:text-xs text-white/70 font-medium leading-tight">No Carrinho</p>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-[#D0F4A4] mt-0.5">{checkedCount} / {shoppingList.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 backdrop-blur-xs">
            <p className="text-[11px] sm:text-xs text-white/70 font-medium leading-tight">Estimativa Total</p>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-white mt-0.5">R$ {totalEstimated.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 backdrop-blur-xs">
            <p className="text-[11px] sm:text-xs text-white/70 font-medium leading-tight">Valor Comprado</p>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-[#63D753] mt-0.5">R$ {checkedEstimated.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Sugestões Inteligentes com base nas preferências, restrições e dispensa */}
      {smartSuggestions.length > 0 && (
        <div className="bg-gradient-to-br from-[#FAF7EE] to-[#F3ECD8] border border-[#EFE6D1] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFE6D1]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#D0F4A4] text-[#0C6816] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-[#0C6816]">
                  Sugestões Inteligentes de Compras
                </h3>
                <p className="text-xs text-[#5E6B52]">
                  Baseado no seu perfil <strong>{user.diet}</strong>
                  {user.dietaryRestrictions.length > 0 && ` (${user.dietaryRestrictions.join(', ')})`} e na validade da sua dispensa
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddAllSuggestions}
                className="inline-flex items-center gap-1.5 bg-[#0C6816] hover:bg-[#095011] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Todas ({smartSuggestions.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-xs font-bold text-[#5E6B52] hover:text-[#0C6816] px-2.5 py-1.5 rounded-lg hover:bg-white/60 transition-colors"
              >
                {showSuggestions ? 'Ocultar' : 'Expandir'}
              </button>
            </div>
          </div>

          {showSuggestions && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {smartSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#EFE6D1] hover:border-[#63D753] rounded-xl p-3.5 flex flex-col justify-between space-y-2.5 shadow-2xs transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6B52]">
                        {sug.category.split(' ')[0]}
                      </span>
                      <span className="text-xs font-bold text-[#0C6816]">
                        ~R$ {sug.estimatedPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#1F2E1E]">
                      {sug.name}
                    </p>
                    <p className="text-[11px] text-[#0C6816] bg-[#D0F4A4]/40 px-2 py-0.5 rounded-md inline-block font-medium">
                      💡 {sug.reason}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSuggestion(sug)}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 bg-[#FAF7EE] hover:bg-[#D0F4A4]/60 text-[#0C6816] text-xs font-bold py-1.5 rounded-lg border border-[#EFE6D1] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar à Lista ({sug.quantity} {sug.unit})</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Checklist Organized by Supermarket Aisles */}
      {shoppingList.length === 0 ? (
        <div className="bg-white border border-[#EFE6D1] rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF7EE] text-[#0C6816] mx-auto flex items-center justify-center text-3xl">
            🛒
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-[#0C6816]">Sua lista de compras está vazia</h3>
            <p className="text-sm text-[#5E6B52] mt-1">
              Adicione itens manualmente ou use o Cardápio Semanal / Receitas para importar ingredientes que faltam na sua dispensa.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#63D753] hover:bg-[#52c244] text-[#0C6816] font-bold px-4 py-2 rounded-xl text-sm shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Primeiro Item</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedCategories.map(({ category: cat, items }) => (
            <div key={cat} className="bg-white border border-[#EFE6D1] rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#EFE6D1]">
                <h3 className="font-display font-bold text-sm text-[#0C6816] flex items-center gap-2">
                  <span className="text-lg">
                    {cat.includes('Hortifruti') ? '🥗' : cat.includes('Proteínas') ? '🥩' : cat.includes('Grãos') ? '🌾' : cat.includes('Laticínios') ? '🧀' : '🌿'}
                  </span>
                  {cat}
                  <span className="text-xs font-normal text-[#5E6B52]">({items.length})</span>
                </h3>
                <span className="text-xs font-bold text-[#5E6B52]">
                  Subtotal: R$ {items.reduce((s, it) => s + (it.estimatedPrice || 0), 0).toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleItem(item.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      item.isChecked
                        ? 'bg-[#FAF7EE] border-[#EFE6D1] opacity-60'
                        : 'bg-white border-[#EFE6D1] hover:border-[#63D753] hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        item.isChecked 
                          ? 'bg-[#0C6816] border-[#0C6816] text-white' 
                          : 'border-[#5E6B52]/40 bg-[#FAF7EE]'
                      }`}>
                        {item.isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div>
                        <p className={`text-sm font-bold ${item.isChecked ? 'line-through text-[#5E6B52]' : 'text-[#0C6816]'}`}>
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#5E6B52]">
                          {item.quantity} {item.unit} • <span className="italic text-[#0C6816]/80">{item.source}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs font-bold text-[#0C6816] bg-[#FAF7EE] px-2 py-0.5 rounded-lg border border-[#EFE6D1]">
                        R$ {item.estimatedPrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Bottom Actions */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={onClearChecked}
              className="text-xs font-semibold text-[#5E6B52] hover:text-rose-600 cursor-pointer"
            >
              Limpar apenas itens marcados ({checkedCount})
            </button>

            {checkedCount > 0 && (
              <button
                onClick={handleMoveBought}
                className="bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
              >
                Mover {checkedCount} Comprados para a Dispensa Virtual
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EFE6D1] relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE6D1]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#D0F4A4] flex items-center justify-center text-[#0C6816]">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#0C6816]">Adicionar à Lista de Compras</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#5E6B52] hover:text-[#0C6816] font-bold text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FAF7EE]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Nome do Item *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Azeite Extra Virgem, Castanhas, Iogurte..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-sm text-[#0C6816] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Corredor / Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FoodCategory)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-sm text-[#0C6816] outline-hidden cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0C6816] mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-sm text-[#0C6816] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0C6816] mb-1">Unidade</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-sm text-[#0C6816] outline-hidden cursor-pointer"
                  >
                    <option value="unid">unidades</option>
                    <option value="kg">kg</option>
                    <option value="g">gramas (g)</option>
                    <option value="L">Litros (L)</option>
                    <option value="pote">pote / caixa</option>
                    <option value="maço">maço</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Preço Estimado (R$)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-sm text-[#0C6816] outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#5E6B52] hover:text-[#0C6816] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-sm rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Salvar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
