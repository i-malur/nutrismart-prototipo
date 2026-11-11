import React, { useState } from 'react';
import {
  Plus,
  Search,
  Sparkles,
  Trash2,
  AlertTriangle,
  PackagePlus,
  RefreshCw,
  ChefHat,
  Tag,
  Pencil,
  BellRing,
  Calendar
} from 'lucide-react';
import { PantryItem, FoodCategory, UserProfile } from '../types';

interface PantryViewProps {
  pantryItems: PantryItem[];
  user?: UserProfile;
  onAddItem: (item: Omit<PantryItem, 'id' | 'daysLeft' | 'addedAt'>) => void;
  onEditItem?: (item: PantryItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onGenerateRecipesWithPantry: (selectedItems: PantryItem[]) => void;
  onNavigateToRecipes?: () => void;
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

export const PantryView: React.FC<PantryViewProps> = ({
  pantryItems = [],
  user,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onUpdateQuantity,
  onGenerateRecipesWithPantry,
  onNavigateToRecipes,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [isAIAnalysisOpen, setIsAIAnalysisOpen] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<FoodCategory>('Hortifruti (Frutas & Vegetais)');
  const [newItemBrand, setNewItemBrand] = useState('N/A');
  const [newItemBatch, setNewItemBatch] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('unid');
  const [newItemExpiry, setNewItemExpiry] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setNewItemName('');
    setNewItemCategory('Hortifruti (Frutas & Vegetais)');
    setNewItemBrand('N/A');
    setNewItemBatch('');
    setNewItemQty(1);
    setNewItemUnit('unid');
    setNewItemExpiry(''); // Data em branco por padrão
    setNewItemNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: PantryItem) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemCategory(item.category);
    setNewItemBrand(item.brand && item.brand.trim() ? item.brand : 'N/A');
    setNewItemBatch(item.batch || '');
    setNewItemQty(item.quantity);
    setNewItemUnit(item.unit || 'unid');
    setNewItemExpiry(item.expirationDate || '');
    setNewItemNotes(item.notes || '');
    setIsModalOpen(true);
  };

  // Filtering
  const filteredItems = pantryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(search.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Metrics
  const expiringSoonCount = pantryItems.filter(item => item.daysLeft <= 3).length;
  const freshCount = pantryItems.filter(item => item.daysLeft > 7).length;

  const handleItemFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    // Se o utilizador não preencher a data, deixamos como undefined ou string vazia
    const expiryValue = newItemExpiry ? newItemExpiry : undefined;

    if (editingItem) {
      if (onEditItem) {
        onEditItem({
          ...editingItem,
          name: newItemName.trim(),
          category: newItemCategory,
          brand: newItemBrand.trim() || 'N/A',
          batch: newItemBatch.trim() || undefined,
          quantity: Number(newItemQty) || 1,
          unit: newItemUnit,
          expirationDate: expiryValue || '',
          notes: newItemNotes.trim() || undefined,
        });
      }
    } else {
      onAddItem({
        name: newItemName.trim(),
        category: newItemCategory,
        brand: newItemBrand.trim() || 'N/A',
        batch: newItemBatch.trim() || undefined,
        quantity: Number(newItemQty) || 1,
        unit: newItemUnit,
        expirationDate: expiryValue || '',
        notes: newItemNotes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleRunAIAnalysis = async () => {
    setIsAIAnalysisOpen(true);
    setAiAnalysisLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pantryItems }),
      });
      const data = await res.json();
      setAiAnalysisResult(data);
    } catch (err) {
      console.error('Error analyzing pantry:', err);
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const formatExpDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="space-y-6">


      {/* Top Banner: Metrics & Quick Actions */}
      <div className="bg-gradient-to-r from-[#0C6816] via-[#147a22] to-[#0C6816] rounded-2xl p-4 sm:p-8 text-white shadow-lg relative">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#63D753]/20 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-[#D0F4A4]/15 blur-xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#D0F4A4]/20 border border-[#D0F4A4]/30 text-[#D0F4A4] text-[11px] sm:text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Controle Inteligente de Desperdício Zero</span>
            </div>
            <h1 className="font-display font-extrabold text-xl sm:text-3xl text-white tracking-tight">
              Sua Dispensa Virtual
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Mantenha seus ingredientes cadastrados. O NutriSmart sugere receitas automáticas para o que você já tem em casa!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleOpenAddModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#63D753] hover:bg-[#52c244] text-[#0C6816] font-bold px-4 py-2.5 min-h-[44px] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Cadastrar Alimento</span>
            </button>

            <button
              onClick={handleRunAIAnalysis}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold px-4 py-2.5 min-h-[44px] rounded-xl transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4 text-[#D0F4A4]" />
              <span>Diagnóstico com IA</span>
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/15">
          <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 backdrop-blur-xs">
            <p className="text-[11px] sm:text-xs text-white/70 font-medium leading-tight">Total Alimentos</p>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-white mt-0.5">{pantryItems.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 backdrop-blur-xs">
            <p className="text-[11px] sm:text-xs text-white/70 font-medium leading-tight">Vence em Breve</p>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-amber-300 flex items-center gap-1.5 mt-0.5">
              {expiringSoonCount}
              {expiringSoonCount > 0 && <AlertTriangle className="w-3.5 h-3.5 text-amber-300 inline" />}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 backdrop-blur-xs">
            <p className="text-[11px] sm:text-xs text-white/70 font-medium leading-tight">Frescos (&gt; 7d)</p>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-[#D0F4A4] mt-0.5">{freshCount}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white border border-[#EFE6D1] rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar alimento ou nota..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] focus:ring-2 focus:ring-[#D0F4A4]/50 rounded-xl text-sm text-[#0C6816] outline-hidden"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5E6B52]"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="text-xs text-[#5E6B52] font-semibold">
            Exibindo <span className="text-[#0C6816] font-bold">{filteredItems.length}</span> de {pantryItems.length} alimentos
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('Todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${selectedCategory === 'Todas'
              ? 'bg-[#0C6816] text-white'
              : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1]'
              }`}
          >
            Todas ({pantryItems.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = pantryItems.filter(i => i.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${selectedCategory === cat
                  ? 'bg-[#0C6816] text-white'
                  : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1]'
                  }`}
              >
                <span>{cat.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75 ml-1">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pantry Grid Cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-[#EFE6D1] rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF7EE] text-[#0C6816] mx-auto flex items-center justify-center text-3xl">
            🧺
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-[#0C6816]">Nenhum alimento encontrado</h3>
            <p className="text-sm text-[#5E6B52] mt-1">
              Tente buscar por outro termo ou cadastre um novo alimento na sua dispensa.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-[#63D753] hover:bg-[#52c244] text-[#0C6816] font-bold px-4 py-2 rounded-xl text-sm shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Alimento Agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            // Se não houver data de validade, não marca urgência
            const hasExpDate = Boolean(item.expirationDate && item.expirationDate.trim());
            const isUrgent = hasExpDate && item.daysLeft <= 2;
            const isWarning = hasExpDate && item.daysLeft > 2 && item.daysLeft <= 5;

            return (
              <div
                key={item.id}
                id={`pantry-card-${item.id}`}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md p-4 flex flex-col justify-between space-y-3 relative group ${isUrgent
                    ? 'border-red-300 ring-1 ring-red-200 bg-red-50/20'
                    : isWarning
                      ? 'border-amber-300 ring-1 ring-amber-100 bg-amber-50/15'
                      : 'border-[#EFE6D1] hover:border-[#63D753]'
                  }`}
              >
                {/* Cabeçalho do Card */}
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    {/* Badge da Inicial */}
                    <span className="w-10 h-10 rounded-xl bg-[#D0F4A4] text-[#0C6816] font-display font-black text-lg flex items-center justify-center border border-[#63D753]/40 shadow-2xs uppercase shrink-0">
                      {item.name ? item.name.charAt(0) : '?'}
                    </span>

                    {/* Informações Principais */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-bold text-[#0C6816] text-sm leading-snug break-words">
                        {item.name}
                      </h4>

                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span className="text-[11px] text-[#5E6B52] font-semibold">
                          {item.category ? item.category.split(' ')[0] : 'Geral'}
                        </span>

                        {item.brand && item.brand.trim() !== '' && item.brand !== 'N/A' && (
                          <span className="text-[10px] font-semibold text-[#0C6816] bg-[#D0F4A4]/60 border border-[#63D753]/30 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            <span>{item.brand}</span>
                          </span>
                        )}

                        {item.batch && (
                          <span className="text-[10px] text-[#5E6B52] bg-white border border-[#EFE6D1] px-1.5 py-0.5 rounded-md">
                            Lote: {item.batch}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vencimento (Exibido apenas se houver data cadastrada) */}
                  <div className="flex items-center pt-1">
                    {hasExpDate ? (
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit ${isUrgent
                            ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                            : isWarning
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-[#FAF7EE] text-[#0C6816] border border-[#EFE6D1]'
                          }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Vence em {formatExpDate(item.expirationDate)}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-[#5E6B52] bg-[#FAF7EE] border border-[#EFE6D1] px-2.5 py-1 rounded-lg w-fit">
                        Sem validade definida
                      </span>
                    )}
                  </div>
                </div>

                {/* Nota do Alimento */}
                {item.notes && (
                  <p className="text-xs text-[#5E6B52] bg-[#FAF7EE] px-3 py-2 rounded-xl italic border border-[#EFE6D1]/60 leading-tight">
                    💡 {item.notes}
                  </p>
                )}

                {/* Controlo de Quantidade e Ações */}
                <div className="pt-3 border-t border-[#EFE6D1] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-[#FAF7EE] rounded-xl p-1 border border-[#EFE6D1]">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[#0C6816] hover:bg-[#EFE6D1] transition-colors text-sm"
                      title="Diminuir"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-[#0C6816] px-2 min-w-12 text-center whitespace-nowrap">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[#0C6816] hover:bg-[#EFE6D1] transition-colors text-sm"
                      title="Aumentar"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-2 text-[#5E6B52] hover:text-[#0C6816] hover:bg-[#FAF7EE] rounded-xl transition-colors"
                      title="Editar Alimento"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Remover da Dispensa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#EFE6D1] relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE6D1] bg-[#FAF7EE]/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D0F4A4] flex items-center justify-center text-[#0C6816]">
                  {editingItem ? <Pencil className="w-5 h-5" /> : <PackagePlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#0C6816]">
                    {editingItem ? 'Editar Alimento' : 'Cadastrar Alimento na Dispensa'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-[#5E6B52] hover:text-[#0C6816] text-xl font-bold w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#FAF7EE]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleItemFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-7">
                  <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Nome do Alimento *</label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Ex: Espinafre, Frango..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm text-[#0C6816]"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Categoria *</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as FoodCategory)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm text-[#0C6816]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Marca</label>
                  <input
                    type="text"
                    value={newItemBrand}
                    onChange={(e) => setNewItemBrand(e.target.value)}
                    placeholder="Ex: N/A ou Camil"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm text-[#0C6816]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Lote (Opcional)</label>
                  <input
                    type="text"
                    value={newItemBatch}
                    onChange={(e) => setNewItemBatch(e.target.value)}
                    placeholder="Ex: L-2026/08"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm text-[#0C6816]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Quantidade *</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm text-[#0C6816]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Unidade</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm text-[#0C6816]"
                  >
                    <option value="unid">unidades (unid)</option>
                    <option value="kg">quilogramas (kg)</option>
                    <option value="g">gramas (g)</option>
                    <option value="ml">mililitros (ml)</option>
                    <option value="L">litros (L)</option>
                    <option value="maço">maço / pacote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Data de Validade (Opicional)</label>
                  <input
                    type="date"
                    value={newItemExpiry}
                    onChange={(e) => setNewItemExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm text-[#0C6816]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Notas</label>
                  <input
                    type="text"
                    value={newItemNotes}
                    onChange={(e) => setNewItemNotes(e.target.value)}
                    placeholder="Ex: Congelador"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm text-[#0C6816]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#EFE6D1] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-[#5E6B52]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-sm rounded-xl shadow-md"
                >
                  {editingItem ? 'Salvar Alterações' : 'Salvar na Dispensa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {isAIAnalysisOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#EFE6D1] relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE6D1]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#63D753] to-[#0C6816] flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5 text-[#D0F4A4]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#0C6816]">Diagnóstico Inteligente</h3>
                </div>
              </div>
              <button
                onClick={() => setIsAIAnalysisOpen(false)}
                className="text-[#5E6B52] hover:text-[#0C6816] text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg"
              >
                ✕
              </button>
            </div>

            {aiAnalysisLoading ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#0C6816] border-t-[#63D753] rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-[#0C6816]">Analisando dispensa...</p>
              </div>
            ) : aiAnalysisResult ? (
              <div className="space-y-5 mt-4">
                <p className="text-sm text-[#1F2E1E] bg-[#FAF7EE] p-3 rounded-xl border border-[#EFE6D1]">
                  {aiAnalysisResult.summary}
                </p>
                <div className="pt-3 border-t border-[#EFE6D1] flex justify-between items-center">
                  <button
                    onClick={handleRunAIAnalysis}
                    className="flex items-center gap-1.5 text-xs text-[#5E6B52] hover:text-[#0C6816] font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reanalisar
                  </button>
                  <button
                    onClick={() => {
                      setIsAIAnalysisOpen(false);
                      onGenerateRecipesWithPantry(pantryItems);
                    }}
                    className="bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md"
                  >
                    Gerar Receitas
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};