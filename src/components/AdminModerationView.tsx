import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock, ChefHat, Eye, X } from 'lucide-react';
import { fetchAllPendingRecipes, updateRecipeStatusFirestore } from '../services/firestoreService';

interface AdminModerationViewProps {
  onShowToast: (msg: string) => void;
}

export const AdminModerationView: React.FC<AdminModerationViewProps> = ({ onShowToast }) => {
  const [pendingRecipes, setPendingRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<any | null>(null);

  const loadPending = async () => {
    setLoading(true);
    const recipes = await fetchAllPendingRecipes();
    setPendingRecipes(recipes);
    setLoading(false);
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (path: string, title: string) => {
    await updateRecipeStatusFirestore(path, 'aprovado');
    setPendingRecipes(prev => prev.filter(r => r.path !== path));
    setSelectedRecipeModal(null);
    onShowToast(`✅ Receita "${title}" aprovada e publicada no acervo público!`);
  };

  const handleReject = async (path: string, title: string) => {
    await updateRecipeStatusFirestore(path, 'privado');
    setPendingRecipes(prev => prev.filter(r => r.path !== path));
    setSelectedRecipeModal(null);
    onShowToast(`❌ Receita "${title}" rejeitada.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-[#0C6816] to-[#147a22] rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D0F4A4]/20 text-[#D0F4A4] text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Painel Restrito da Equipe</span>
          </div>
          <h1 className="font-display font-black text-2xl text-white">Moderação de Receitas</h1>
          <p className="text-white/80 text-xs">Analise as contribuições enviadas pelos usuários antes de irem para o Acervo Público.</p>
        </div>
        <button
          onClick={loadPending}
          className="px-4 py-2 bg-[#63D753] hover:bg-[#52c443] text-[#0C6816] text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Atualizar Lista
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-[#5E6B52]">A carregar receitas pendentes...</div>
      ) : pendingRecipes.length === 0 ? (
        <div className="bg-white border border-[#EFE6D1] rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <ChefHat className="w-8 h-8 text-[#0C6816] mx-auto" />
          <h3 className="font-display font-bold text-base text-[#0C6816]">Nenhuma receita pendente</h3>
          <p className="text-xs text-[#5E6B52]">Todas as submissões já foram moderadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingRecipes.map(recipe => (
            <div key={recipe.path} className="bg-white rounded-3xl border border-[#EFE6D1] p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md uppercase">
                  ⏳ Aguardando Aprovação
                </span>
                <h3 className="font-display font-bold text-base text-[#0C6816]">{recipe.title}</h3>
                <p className="text-xs text-[#5E6B52] leading-relaxed line-clamp-2">{recipe.description}</p>
                <p className="text-[11px] text-[#5E6B52]"><b>Autor:</b> {recipe.authorName || 'Usuário'}</p>
                <div className="text-xs text-[#5E6B52] flex items-center gap-2 pt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {recipe.prepTimeMinutes} min</span>
                  <span>•</span>
                  <span><b>{recipe.calories}</b> kcal</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFE6D1] flex items-center justify-between">
                <button
                  onClick={() => setSelectedRecipeModal(recipe)}
                  className="px-3 py-2 bg-[#FAF7EE] text-[#0C6816] border border-[#EFE6D1] hover:bg-[#EFE6D1] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Ver Detalhes
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReject(recipe.path, recipe.title)}
                    className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
                    title="Rejeitar"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleApprove(recipe.path, recipe.title)}
                    className="p-2 bg-[#0C6816] text-white hover:bg-[#095011] rounded-xl transition-all cursor-pointer"
                    title="Aprovar"
                  >
                    <CheckCircle className="w-4 h-4 text-[#63D753]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes da Receita para o Admin */}
      {selectedRecipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EFE6D1] relative space-y-4 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#EFE6D1]">
              <div>
                <span className="text-[10px] font-bold bg-[#D0F4A4] text-[#0C6816] px-2.5 py-0.5 rounded-lg">
                  {selectedRecipeModal.difficulty || 'Fácil'} • {selectedRecipeModal.prepTimeMinutes} min • {selectedRecipeModal.calories} kcal
                </span>
                <h3 className="font-display font-bold text-lg text-[#0C6816] mt-2">
                  {selectedRecipeModal.title}
                </h3>
                <p className="text-xs text-[#5E6B52] mt-1"><b>Autor:</b> {selectedRecipeModal.authorName || 'Usuário'}</p>
                <p className="text-xs text-[#5E6B52] mt-1">{selectedRecipeModal.description}</p>
              </div>
              <button
                onClick={() => setSelectedRecipeModal(null)}
                className="text-[#5E6B52] hover:text-[#0C6816] p-1.5 rounded-xl hover:bg-[#FAF7EE] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF7EE] p-4 rounded-2xl border border-[#EFE6D1] space-y-4 text-xs text-[#1F2E1E]">
              <div>
                <p className="font-bold text-[#0C6816] mb-2 uppercase tracking-wide text-[11px]">Ingredientes:</p>
                <ul className="space-y-1.5 bg-white p-3 rounded-xl border border-[#EFE6D1]">
                  {selectedRecipeModal.ingredients?.map((ing: any, i: number) => (
                    <li key={i} className="py-1 border-b border-[#FAF7EE] last:border-0 flex justify-between">
                      <span className="font-medium">{typeof ing === 'string' ? ing : ing.name}</span>
                      <span className="text-[#5E6B52]">{typeof ing === 'object' ? ing.amount : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-bold text-[#0C6816] mb-2 uppercase tracking-wide text-[11px]">Modo de Preparo:</p>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed bg-white p-3 rounded-xl border border-[#EFE6D1]">
                  {selectedRecipeModal.instructions?.map((inst: string, i: number) => (
                    <li key={i} className="pl-1">{inst}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleReject(selectedRecipeModal.path, selectedRecipeModal.title)}
                className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Rejeitar
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRecipeModal(null)}
                  className="px-4 py-2 bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={() => handleApprove(selectedRecipeModal.path, selectedRecipeModal.title)}
                  className="px-5 py-2 bg-[#0C6816] hover:bg-[#095011] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4 text-[#63D753]" /> Aprovar Receita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};