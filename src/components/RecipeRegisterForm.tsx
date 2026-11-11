import React, { useState } from 'react';
import { X, Plus, Trash2, ChefHat, Sparkles, Clock, Flame, Utensils, Share2, Info } from 'lucide-react';
import { Recipe, RecipeIngredient, PantryItem } from '../types';

interface RecipeRegisterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecipe: (recipe: Recipe) => void;
  pantryItems?: PantryItem[];
  authorName?: string;
}

export const RecipeRegisterForm: React.FC<RecipeRegisterFormProps> = ({
  isOpen,
  onClose,
  onAddRecipe,
  pantryItems = [],
  authorName = 'Usuário NutriSmart',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(20);
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Médio' | 'Avançado'>('Fácil');
  const [calories, setCalories] = useState(250);
  const [servings, setServings] = useState(2);
  const [tagsText, setTagsText] = useState('Sem Glúten, Zero Desperdício');
  const [contributeToAcervo, setContributeToAcervo] = useState(false);

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { name: '', amount: '100g', isInPantry: false },
    { name: '', amount: '1 unidade', isInPantry: false }
  ]);

  const [instructionsText, setInstructionsText] = useState('');

  if (!isOpen) return null;

  const handleAddIngredientRow = () => {
    setIngredients(prev => [...prev, { name: '', amount: '1 unidade', isInPantry: false }]);
  };

  const handleRemoveIngredientRow = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: any) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === 'name') {
        const inPantry = pantryItems.some(item => 
          item.name.toLowerCase().includes(String(value).toLowerCase())
        );
        updated[index].isInPantry = inPantry;
      }

      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const instructionsArray = instructionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const tagsArray = tagsText
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newRecipe: Recipe = {
      id: `user-rec-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      prepTimeMinutes: Number(prepTimeMinutes) || 15,
      difficulty,
      calories: Number(calories) || 200,
      proteinGrams: 15,
      carbsGrams: 20,
      fatGrams: 8,
      servings: Number(servings) || 2,
      tags: tagsArray.length > 0 ? tagsArray : ['Autoral'],
      ingredients: ingredients.filter(i => i.name.trim().length > 0),
      instructions: instructionsArray.length > 0 ? instructionsArray : ['Misture os ingredientes e sirva.'],
      pantryMatchPercent: 100,
      isUserCreated: true,
      contributeToAcervo,
      contributionStatus: contributeToAcervo ? 'in_review' : 'private',
      authorName
    };

    onAddRecipe(newRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-[#EFE6D1] relative my-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header Fixo */}
        <div className="flex items-start justify-between pb-4 border-b border-[#EFE6D1] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#D0F4A4] border-2 border-[#63D753] flex items-center justify-center text-[#0C6816] shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-2xl text-[#0C6816]">
                Cadastre sua receita
              </h2>
              <p className="text-xs sm:text-sm text-[#5E6B52]">
                Adicione sua criação ao seu caderno particular e contribua com a comunidade.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#5E6B52] hover:text-[#0C6816] hover:bg-[#FAF7EE] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Formulário com Scroll Suave */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          
          {/* Título da Receita */}
          <div>
            <label className="block text-xs font-bold text-[#0C6816] mb-1">Título da Receita *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Salmão Grelhado com Legumes ao Vapor e Ervas Finas"
              className="w-full px-4 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
            />
          </div>

          {/* Descrição Curta */}
          <div>
            <label className="block text-xs font-bold text-[#0C6816] mb-1">Descrição Curta *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Uma breve apresentação sobre a refeição..."
              className="w-full p-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden leading-relaxed resize-none"
            />
          </div>

          {/* Atributos da Receita */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7EE] p-3 rounded-2xl border border-[#EFE6D1]">
            <div>
              <label className="block text-[11px] font-bold text-[#0C6816] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#63D753]" /> Preparo (min)
              </label>
              <input
                type="number"
                value={prepTimeMinutes}
                onChange={e => setPrepTimeMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#EFE6D1] rounded-xl text-xs text-[#1F2E1E]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#0C6816] mb-1">Dificuldade</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-[#EFE6D1] rounded-xl text-xs text-[#1F2E1E]"
              >
                <option value="Fácil">Fácil</option>
                <option value="Médio">Médio</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#0C6816] mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Calorias (kcal)
              </label>
              <input
                type="number"
                value={calories}
                onChange={e => setCalories(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#EFE6D1] rounded-xl text-xs text-[#1F2E1E]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#0C6816] mb-1 flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-[#63D753]" /> Porções
              </label>
              <input
                type="number"
                value={servings}
                onChange={e => setServings(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#EFE6D1] rounded-xl text-xs text-[#1F2E1E]"
              />
            </div>
          </div>

          {/* Colunas Duplas: Ingredientes e Modo de Preparo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            
            {/* Ingredientes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#0C6816]">Ingredientes *</label>
                <button
                  type="button"
                  onClick={handleAddIngredientRow}
                  className="text-[11px] font-bold text-[#0C6816] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#63D753]" /> Adicionar
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ex: 200g de frango"
                      value={ing.name}
                      onChange={e => handleIngredientChange(i, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Qtd"
                      value={ing.amount}
                      onChange={e => handleIngredientChange(i, 'amount', e.target.value)}
                      className="w-24 px-2.5 py-2 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs"
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientRow(i)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modo de Preparo */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0C6816]">Modo de Preparo * (passo a passo)</label>
              <textarea
                rows={5}
                required
                value={instructionsText}
                onChange={e => setInstructionsText(e.target.value)}
                placeholder="1. Em uma frigideira antiaderente aquecida, adicione...&#10;2. Tempere a gosto e deixe dourar..."
                className="w-full p-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] leading-relaxed resize-none h-[140px]"
              />
            </div>

          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[#0C6816] mb-1">Tags da Receita (separadas por vírgula)</label>
            <input
              type="text"
              value={tagsText}
              onChange={e => setTagsText(e.target.value)}
              placeholder="Sem Glúten, Zero Desperdício, Low Carb"
              className="w-full px-4 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
            />
          </div>

          {/* BLOCCO: Acervo de Receitas NutriSmart */}
          <div className="bg-[#FAF7EE] border border-[#EFE6D1] rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#0C6816] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#0C6816]">
                  Acervo de receitas NutriSmart
                </h4>
                <p className="text-[11px] text-[#5E6B52] leading-relaxed">
                  Você pode enviar suas receitas para o nosso acervo digital e contribuir com o aplicativo. Basta marcar a caixa abaixo para solicitar a inclusão. A solicitação será analisada por um moderador. Todas as suas receitas estarão disponíveis em seu caderno pessoal e as aprovadas ficarão públicas para outros usuários.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#EFE6D1] cursor-pointer hover:border-[#63D753] transition-colors">
              <input
                type="checkbox"
                checked={contributeToAcervo}
                onChange={e => setContributeToAcervo(e.target.checked)}
                className="w-4 h-4 accent-[#0C6816] rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-[#0C6816] flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#63D753]" />
                Contribuir com o acervo de receitas NutriSmart
              </span>
            </label>
          </div>

          {/* Footer de Ações Fixo */}
          <div className="pt-3 border-t border-[#EFE6D1] flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-[#5E6B52] hover:text-[#0C6816] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#0C6816] hover:bg-[#095011] text-white text-xs font-bold rounded-2xl shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#D0F4A4]" />
              <span>{contributeToAcervo ? 'Enviar para Análise & Salvar' : 'Finalizar & Salvar Receita'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};