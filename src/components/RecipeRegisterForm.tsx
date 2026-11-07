import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  HelpCircle, 
  Upload, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  AlertCircle,
  Clock,
  Flame,
  ChefHat,
  Share2
} from 'lucide-react';
import { Recipe, RecipeIngredient, PantryItem } from '../types';

interface RecipeRegisterFormProps {
  pantryItems: PantryItem[];
  userName?: string;
  onBack: () => void;
  onSubmit: (recipe: Recipe) => void;
}

export const RecipeRegisterForm: React.FC<RecipeRegisterFormProps> = ({
  pantryItems,
  userName = 'Você',
  onBack,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructionsText, setInstructionsText] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [contributeToAcervo, setContributeToAcervo] = useState(true);
  
  // Optional extra metadata to make the recipe fully rich
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Médio' | 'Avançado'>('Fácil');
  const [servings, setServings] = useState(4);
  const [category, setCategory] = useState('Prato Principal');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdRecipe, setCreatedRecipe] = useState<Recipe | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Por favor, informe o título da receita.');
      return;
    }
    if (!ingredientsText.trim()) {
      setErrorMessage('Por favor, adicione os ingredientes da receita (um por linha).');
      return;
    }
    if (!instructionsText.trim()) {
      setErrorMessage('Por favor, descreva o modo de preparo passo a passo.');
      return;
    }

    setIsSubmitting(true);

    // Parse ingredients
    const rawLines = ingredientsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const pantryNamesLower = pantryItems.map(p => p.name.toLowerCase());

    const parsedIngredients: RecipeIngredient[] = rawLines.map(line => {
      // Check if pantry contains any word from this line
      const lineLower = line.toLowerCase();
      const inPantry = pantryNamesLower.some(pName => lineLower.includes(pName));

      // Separate possible amount / name if format like "200g de frango" or "2 colheres de azeite"
      return {
        name: line,
        amount: '1 porção',
        isInPantry: inPantry
      };
    });

    const parsedInstructions = instructionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Match percentage against user's pantry
    const inPantryCount = parsedIngredients.filter(i => i.isInPantry).length;
    const matchPercent = parsedIngredients.length > 0 
      ? Math.round((inPantryCount / parsedIngredients.length) * 100) 
      : 50;

    // Fallback image if not provided
    const fallbackImage = imagePreview || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

    const newRecipe: Recipe = {
      id: `recipe-user-${Date.now()}`,
      title: title.trim(),
      description: `Receita caseira cadastrada por ${userName}.`,
      prepTimeMinutes: prepTimeMinutes || 25,
      difficulty: difficulty,
      calories: Math.floor(Math.random() * 250) + 280, // Estimated nutritional baseline
      proteinGrams: Math.floor(Math.random() * 20) + 18,
      carbsGrams: Math.floor(Math.random() * 30) + 25,
      fatGrams: Math.floor(Math.random() * 10) + 8,
      servings: servings || 2,
      tags: [category, 'Receita Pessoal', contributeToAcervo ? 'Acervo NutriSmart' : 'Particular'],
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      pantryMatchPercent: matchPercent,
      imageUrl: fallbackImage,
      category: category,
      isUserCreated: true,
      contributeToAcervo: contributeToAcervo,
      contributionStatus: contributeToAcervo ? 'in_review' : 'private',
      authorName: userName,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      onSubmit(newRecipe);
      setCreatedRecipe(newRecipe);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  if (isSuccess && createdRecipe) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-[#FAF7EE] border-2 border-[#63D753] rounded-[32px] p-6 sm:p-8 shadow-lg text-center space-y-6">
          <div className="w-18 h-18 bg-[#D0F4A4] text-[#0C6816] rounded-full mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#D0F4A4]/70 text-[#0C6816] rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Receita Salva no seu Caderno!</span>
            </div>
            <h2 className="font-display font-black text-2xl text-[#0C6816]">
              {createdRecipe.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#5E6B52] max-w-md mx-auto leading-relaxed">
              Sua receita já está disponível no seu caderno culinário pessoal do NutriSmart.
            </p>
          </div>

          {contributeToAcervo && (
            <div className="bg-white p-4.5 rounded-2xl border border-[#EFE6D1] text-left text-xs text-[#1F2E1E] space-y-2 shadow-2xs">
              <h4 className="font-bold text-[#0C6816] flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-[#63D753]" />
                Status no Acervo de Receitas NutriSmart:
              </h4>
              <p className="text-[#5E6B52] leading-relaxed">
                Sua receita foi enviada para o <strong>Acervo Digital</strong>. Um moderador analisará a composição e, após aprovada, ela ficará pública para toda a comunidade se inspirar!
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onBack}
              id="btn-return-recipes"
              className="w-full sm:w-auto bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Ver no Caderno de Receitas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-3 sm:px-6 space-y-6">
      
      {/* Top Header Bar matching the screen design: NUTRISMART with Settings & Help */}
      <div className="flex items-center justify-between bg-white border border-[#EFE6D1] rounded-2xl px-5 py-3.5 shadow-2xs">
        <button
          onClick={onBack}
          id="btn-back-from-register-recipe"
          className="flex items-center gap-2 text-[#5E6B52] hover:text-[#0C6816] font-bold text-sm transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-[#EFE6D1]/50"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-[#5E6B52]" />
          <span className="hidden sm:inline">Voltar para Receitas</span>
        </button>

        <span className="font-display font-extrabold text-xl sm:text-2xl tracking-widest text-[#5E6B52] uppercase">
          NUTRISMART
        </span>

        <div className="flex items-center gap-2 text-[#5E6B52]">
          <button 
            type="button" 
            className="p-2 hover:text-[#0C6816] rounded-xl hover:bg-[#FAF7EE] transition-colors cursor-pointer"
            title="Configurações do Caderno"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            type="button" 
            className="p-2 hover:text-[#0C6816] rounded-xl hover:bg-[#FAF7EE] transition-colors cursor-pointer"
            title="Ajuda sobre o Acervo"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Form Container styled cleanly with balanced proportions */}
      <div className="bg-[#FAF7EE] border border-[#EFE6D1] rounded-[32px] p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Screen Title */}
        <div className="text-center space-y-2 border-b border-[#EFE6D1] pb-6">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#52634C] tracking-tight">
            Cadastre sua receita
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6B52] max-w-xl mx-auto">
            Adicione sua criação ao seu caderno particular de receitas e contribua para o acervo gastronômico saudável do NutriSmart.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

          {/* Field 1: Título da receita */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#52634C]">
              Título da receita *
            </label>
            <input
              type="text"
              id="input-recipe-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Salmão Grelhado com Legumes ao Vapor e Ervas Finas"
              className="w-full px-4 py-3.5 bg-white border border-[#D9D3C1] focus:border-[#63D753] rounded-xl text-base text-[#1F2E1E] placeholder:text-[#9AA68E] outline-hidden shadow-2xs transition-colors font-medium"
            />
          </div>

          {/* Field 2 & 3: Ingredientes e Modo de Preparo (Responsive 2-Column on Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Field 2: Ingredientes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-display font-bold text-lg sm:text-xl text-[#52634C] flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-[#0C6816]" />
                  Ingredientes *
                </label>
                <span className="text-[11px] font-semibold text-[#0C6816] bg-[#D0F4A4]/50 px-2.5 py-0.5 rounded-full">
                  1 por linha
                </span>
              </div>
              <textarea
                id="textarea-recipe-ingredients"
                rows={7}
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                placeholder="200g de peito de frango em cubos&#10;1 xícara de brócolis frescos&#10;2 dentes de alho picados&#10;1 colher de sopa de azeite de oliva extra virgem&#10;Sal marinho e pimenta-do-reino a gosto"
                className="w-full px-4 py-3.5 bg-white border border-[#D9D3C1] focus:border-[#63D753] rounded-2xl text-sm text-[#1F2E1E] placeholder:text-[#9AA68E] outline-hidden shadow-2xs transition-colors resize-y leading-relaxed font-mono sm:font-sans"
              />
              <p className="text-[11px] text-[#8A967E]">
                Dica: O NutriSmart cruza os ingredientes com sua Dispensa Virtual automaticamente.
              </p>
            </div>

            {/* Field 3: Modo de preparo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-display font-bold text-lg sm:text-xl text-[#52634C] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#0C6816]" />
                  Modo de preparo *
                </label>
                <span className="text-[11px] font-semibold text-[#5E6B52] bg-white border border-[#EFE6D1] px-2.5 py-0.5 rounded-full">
                  Passo a passo
                </span>
              </div>
              <textarea
                id="textarea-recipe-instructions"
                rows={7}
                value={instructionsText}
                onChange={(e) => setInstructionsText(e.target.value)}
                placeholder="1. Em uma frigideira antiaderente aquecida, adicione o azeite e doure o alho.&#10;2. Adicione os cubos de frango e sele por 5 a 7 minutos até dourar.&#10;3. Acrescente os floretes de brócolis e tampe para cozinhar no vapor residual por 4 minutos.&#10;4. Tempere com sal e pimenta e sirva em seguida ainda quente."
                className="w-full px-4 py-3.5 bg-white border border-[#D9D3C1] focus:border-[#63D753] rounded-2xl text-sm text-[#1F2E1E] placeholder:text-[#9AA68E] outline-hidden shadow-2xs transition-colors resize-y leading-relaxed"
              />
              <p className="text-[11px] text-[#8A967E]">
                Dica: Numere os passos para facilitar a leitura durante o preparo.
              </p>
            </div>

          </div>

          {/* Field 4: Imagem do prato */}
          <div className="space-y-2 bg-white p-5 rounded-2xl border border-[#EFE6D1] shadow-2xs">
            <label className="block font-display font-bold text-base sm:text-lg text-[#52634C]">
              Imagem do prato
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex border border-[#D9D3C1] rounded-xl bg-[#FAF7EE] overflow-hidden shadow-2xs flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-3.5 bg-[#EFE6D1] hover:bg-[#E2D6BB] text-[#5E6B52] font-semibold text-sm transition-colors cursor-pointer border-r border-[#D9D3C1]"
                >
                  Arquivos
                </button>
                <div className="px-4 py-3.5 text-sm text-[#5E6B52] flex-1 truncate flex items-center justify-between">
                  <span className={imageFileName ? 'text-[#0C6816] font-semibold' : 'text-[#8A967E]'}>
                    {imageFileName || 'Nenhum arquivo selecionado'}
                  </span>
                </div>
              </div>

              {imagePreview ? (
                <div className="flex items-center gap-3 p-2 bg-[#FAF7EE] rounded-xl border border-[#63D753]">
                  <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover ring-1 ring-[#63D753]" />
                  <div className="text-xs text-[#0C6816] font-semibold pr-2">
                    Foto selecionada!
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-3.5 border border-dashed border-[#D9D3C1] hover:border-[#63D753] rounded-xl text-xs font-semibold text-[#5E6B52] hover:text-[#0C6816] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-[#0C6816]" />
                  <span>Escolher foto do prato</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#8A967E]">
              Formatos aceitos: JPG, PNG ou WEBP. Imagens horizontais proporcionam melhor visualização.
            </p>
          </div>

          {/* Extra quick metadata tag options */}
          <div className="bg-white p-5 rounded-2xl border border-[#EFE6D1] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shadow-2xs">
            <div>
              <label className="block text-[#5E6B52] font-bold mb-1.5">Tempo de Preparo:</label>
              <select
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                className="w-full bg-[#FAF7EE] border border-[#D9D3C1] rounded-xl p-2.5 text-[#0C6816] font-semibold outline-hidden cursor-pointer"
              >
                <option value={15}>15 minutos (Rápida)</option>
                <option value={25}>25 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos ou mais</option>
              </select>
            </div>

            <div>
              <label className="block text-[#5E6B52] font-bold mb-1.5">Dificuldade:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[#FAF7EE] border border-[#D9D3C1] rounded-xl p-2.5 text-[#0C6816] font-semibold outline-hidden cursor-pointer"
              >
                <option value="Fácil">Fácil</option>
                <option value="Médio">Médio</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>

            <div>
              <label className="block text-[#5E6B52] font-bold mb-1.5">Rendimento:</label>
              <select
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full bg-[#FAF7EE] border border-[#D9D3C1] rounded-xl p-2.5 text-[#0C6816] font-semibold outline-hidden cursor-pointer"
              >
                <option value={1}>1 porção individual</option>
                <option value={2}>2 porções</option>
                <option value={4}>4 porções</option>
                <option value={6}>6 porções</option>
                <option value={8}>8 porções ou mais</option>
              </select>
            </div>

            <div>
              <label className="block text-[#5E6B52] font-bold mb-1.5">Categoria:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAF7EE] border border-[#D9D3C1] rounded-xl p-2.5 text-[#0C6816] font-semibold outline-hidden cursor-pointer"
              >
                <option value="Prato Principal">Prato Principal</option>
                <option value="Café da Manhã">Café da Manhã</option>
                <option value="Lanche Saudável">Lanche Saudável</option>
                <option value="Saladas & Bowls">Saladas & Bowls</option>
                <option value="Sopas & Cremes">Sopas & Cremes</option>
                <option value="Sobremesa Fit">Sobremesa Fit</option>
              </select>
            </div>
          </div>

          {/* Field 5: Informational Box - Acervo de receitas NutriSmart */}
          <div className="bg-[#D9D9D9]/50 p-5 sm:p-6 rounded-2xl text-left space-y-2 border border-black/5">
            <h3 className="font-bold text-sm sm:text-base text-[#1F2E1E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0C6816]" />
              Acervo de receitas NutriSmart
            </h3>
            <p className="text-xs sm:text-sm text-[#4A573F] leading-relaxed">
              Você pode enviar suas receitas para o nosso acervo digital e contribuir com o aplicativo. Basta marcar a caixa abaixo para solicitar a inclusão da sua receita. A solicitação será analisada por um moderador. Todas as suas receitas estarão disponíveis em seu caderno de receitas e, as receitas aprovadas no acervo ficarão públicas para outros usuários.
            </p>
          </div>

          {/* Field 6: Checkbox - Contribuir com o acervo de receitas */}
          <div className="bg-white p-4 rounded-2xl border border-[#EFE6D1]">
            <label className="flex items-center gap-3 cursor-pointer select-none text-sm text-[#1F2E1E] font-medium">
              <input
                type="checkbox"
                id="checkbox-contribute-acervo"
                checked={contributeToAcervo}
                onChange={(e) => setContributeToAcervo(e.target.checked)}
                className="w-5 h-5 rounded border-gray-400 text-[#52634C] focus:ring-[#52634C] accent-[#52634C] cursor-pointer"
              />
              <span className="font-semibold text-[#52634C]">
                Contribuir com o acervo de receitas NutriSmart
              </span>
            </label>
          </div>

          {/* Submit Button: Enviar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-submit-recipe"
              className="w-full bg-[#52634C] hover:bg-[#43523E] active:bg-[#344030] text-white font-bold text-base py-4 px-8 rounded-2xl shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando receita...</span>
                </>
              ) : (
                <span>Enviar Receita</span>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
