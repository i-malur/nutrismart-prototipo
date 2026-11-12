import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock, ChefHat, Eye, X, ShieldAlert, CheckCircle2, Copy, History, Trash2, LayoutDashboard, Info } from 'lucide-react';
import { 
  updateRecipeStatusFirestore, 
  fetchDeletionRequests, 
  resolveDeletionRequest,
  deleteUserAccount,
  fetchAllRecipesAdmin
} from '../services/firestoreService';

interface AdminModerationViewProps {
  onShowToast: (msg: string) => void;
}

export const AdminModerationView: React.FC<AdminModerationViewProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'pendentes' | 'historico'>('pendentes');
  
  const [pendingRecipes, setPendingRecipes] = useState<any[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  
  // Históricos
  const [completedRequests, setCompletedRequests] = useState<any[]>([]);
  const [approvedRecipes, setApprovedRecipes] = useState<any[]>([]);
  const [rejectedRecipes, setRejectedRecipes] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recipes, requests] = await Promise.all([
        fetchAllRecipesAdmin(),
        fetchDeletionRequests()
      ]);
      
      setPendingRecipes(recipes.filter((r: any) => r.status === 'em analise'));
      setApprovedRecipes(recipes.filter((r: any) => r.status === 'aprovado'));
      setRejectedRecipes(recipes.filter((r: any) => r.status === 'privado'));

      setDeletionRequests(requests.filter((r: any) => r.status === 'pendente'));
      setCompletedRequests(requests.filter((r: any) => r.status === 'concluido'));
    } catch (err) {
      console.error("Erro ao carregar dados do admin:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (recipe: any) => {
    await updateRecipeStatusFirestore(recipe.path, 'aprovado');
    setPendingRecipes(prev => prev.filter(r => r.path !== recipe.path));
    setApprovedRecipes(prev => [{ ...recipe, status: 'aprovado' }, ...prev]);
    setSelectedRecipeModal(null);
    onShowToast(`✅ Receita "${recipe.title}" aprovada e adicionada ao histórico!`);
  };

  const handleReject = async (recipe: any) => {
    await updateRecipeStatusFirestore(recipe.path, 'privado');
    setPendingRecipes(prev => prev.filter(r => r.path !== recipe.path));
    setRejectedRecipes(prev => [{ ...recipe, status: 'privado' }, ...prev]);
    setSelectedRecipeModal(null);
    onShowToast(`❌ Receita "${recipe.title}" rejeitada e arquivada.`);
  };

  const handleResolveDeletion = async (req: any) => {
    const confirmDelete = window.confirm(
      `Deseja limpar todos os dados do banco para (${req.email}) e arquivar a solicitação?\n\nNota: Para bloquear o acesso no login, remova o utilizador na aba Authentication da consola Firebase.`
    );
    if (!confirmDelete) return;

    try {
      if (req.userId && req.userId !== 'demo') {
        await deleteUserAccount(req.userId);
      }
      
      await resolveDeletionRequest(req.id);
      
      setDeletionRequests(prev => prev.filter(r => r.id !== req.id));
      setCompletedRequests(prev => [{ ...req, status: 'concluido', resolvedAt: new Date().toISOString() }, ...prev]);
      
      onShowToast(`✅ Dados de "${req.email}" limpos do banco e pedido arquivado!`);
    } catch (err) {
      console.error(err);
      onShowToast(`❌ Erro ao processar exclusão dos dados.`);
    }
  };

  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    onShowToast(`📋 E-mail ${email} copiado para a área de transferência!`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Header do Painel */}
      <div className="bg-gradient-to-r from-[#0C6816] to-[#147a22] rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D0F4A4]/20 text-[#D0F4A4] text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Painel Restrito da Equipe</span>
          </div>
          <h1 className="font-display font-black text-2xl text-white">Moderação & Gestão</h1>
          <p className="text-white/80 text-xs">Controlo centralizado de submissões e solicitações de dados.</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-[#63D753] hover:bg-[#52c443] text-[#0C6816] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
        >
          Atualizar Dados
        </button>
      </div>

      {/* Navegação por Abas */}
      <div className="bg-[#FAF7EE] p-1.5 rounded-2xl border border-[#EFE6D1] flex items-center gap-2">
        <button
          onClick={() => setActiveTab('pendentes')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'pendentes'
              ? 'bg-[#0C6816] text-white shadow-xs'
              : 'text-[#5E6B52] hover:text-[#0C6816] hover:bg-white/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Fila de Moderação & Exclusões ({pendingRecipes.length + deletionRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'historico'
              ? 'bg-[#0C6816] text-white shadow-xs'
              : 'text-[#5E6B52] hover:text-[#0C6816] hover:bg-white/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico & Registos ({completedRequests.length + approvedRecipes.length + rejectedRecipes.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-[#5E6B52]">A carregar registos do painel...</div>
      ) : (
        <div>
          {/* ABA 1: PENDENTES & EXCLUSÕES */}
          {activeTab === 'pendentes' && (
            <div className="space-y-10 animate-in fade-in duration-200">
              
              {/* Solicitações de Exclusão */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-[#0C6816] flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  Solicitações Pendentes de Exclusão de Conta ({deletionRequests.length})
                </h3>

                {deletionRequests.length === 0 ? (
                  <div className="bg-white border border-[#EFE6D1] rounded-2xl p-4 text-xs text-[#5E6B52] shadow-2xs">
                    Não há solicitações de exclusão de conta pendentes no momento.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {deletionRequests.map(req => (
                      <div key={req.id} className="bg-white p-5 rounded-2xl border border-[#EFE6D1] space-y-3 shadow-2xs">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-gray-900">{req.email}</p>
                              <button
                                onClick={() => copyToClipboard(req.email)}
                                className="text-[#5E6B52] hover:text-[#0C6816] p-1 rounded-md hover:bg-[#FAF7EE] transition-colors cursor-pointer"
                                title="Copiar E-mail para resposta"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[11px] text-[#5E6B52]">ID do Utilizador: <span className="font-mono">{req.userId}</span></p>
                            <p className="text-[10px] text-gray-400">Solicitado em: {new Date(req.requestedAt).toLocaleString()}</p>
                          </div>

                          <button
                            onClick={() => handleResolveDeletion(req)}
                            className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <Trash2 className="w-4 h-4 text-rose-200" />
                            <span>Limpar Dados & Arquivar</span>
                          </button>
                        </div>

                        {/* Aviso explicativo para a equipa */}
                        <div className="bg-[#FAF7EE] border border-[#EFE6D1] p-2.5 rounded-xl flex items-start gap-2 text-[11px] text-[#5E6B52]">
                          <Info className="w-4 h-4 text-[#0C6816] shrink-0 mt-0.5" />
                          <span>
                            <b>Nota operacional:</b> Este botão limpa todos os dados da base de dados e arquiva o pedido. Para revogar o acesso ao login, remova o utilizador na aba <i>Authentication</i> do painel Firebase.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-[#EFE6D1]" />

              {/* Receitas Pendentes */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-[#0C6816] flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-[#63D753]" />
                  Moderação de Receitas Pendentes ({pendingRecipes.length})
                </h3>

                {pendingRecipes.length === 0 ? (
                  <div className="bg-white border border-[#EFE6D1] rounded-3xl p-8 text-center max-w-md mx-auto space-y-2 shadow-2xs">
                    <ChefHat className="w-7 h-7 text-[#0C6816] mx-auto" />
                    <h4 className="font-display font-bold text-sm text-[#0C6816]">Nenhuma receita pendente</h4>
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
                          <h4 className="font-display font-bold text-base text-[#0C6816]">{recipe.title}</h4>
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
                              onClick={() => handleReject(recipe)}
                              className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
                              title="Rejeitar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApprove(recipe)}
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
              </div>

            </div>
          )}

          {/* ABA 2: HISTÓRICO & REGISTOS */}
          {activeTab === 'historico' && (
            <div className="space-y-10 animate-in fade-in duration-200">
              
              {/* Histórico de Contas Excluídas */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-[#0C6816] flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  Contas Excluídas & Arquivadas ({completedRequests.length})
                </h3>

                {completedRequests.length === 0 ? (
                  <div className="bg-white border border-[#EFE6D1] rounded-2xl p-4 text-xs text-[#5E6B52] shadow-2xs">
                    Nenhum registo de exclusão concluído no histórico.
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-[#EFE6D1] overflow-hidden shadow-2xs">
                    <div className="divide-y divide-[#EFE6D1]">
                      {completedRequests.map(req => (
                        <div key={req.id} className="p-4 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-gray-900">{req.email}</span>
                            <p className="text-[11px] text-[#5E6B52]">ID: {req.userId}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Concluído
                            </span>
                            <p className="text-[10px] text-gray-400 mt-0.5">Resolvido em: {req.resolvedAt ? new Date(req.resolvedAt).toLocaleString() : 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-[#EFE6D1]" />

              {/* Histórico de Receitas Aprovadas */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-[#0C6816] flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Receitas Aprovadas para o Acervo Público ({approvedRecipes.length})
                </h3>

                {approvedRecipes.length === 0 ? (
                  <div className="bg-white border border-[#EFE6D1] rounded-2xl p-4 text-xs text-[#5E6B52] shadow-2xs">
                    Nenhuma receita aprovada registada no histórico.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {approvedRecipes.map(recipe => (
                      <div key={recipe.path} className="bg-white p-4 rounded-2xl border border-[#EFE6D1] space-y-1 shadow-2xs">
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          ✓ Publicada
                        </span>
                        <h4 className="font-display font-bold text-sm text-[#0C6816]">{recipe.title}</h4>
                        <p className="text-[11px] text-[#5E6B52]"><b>Autor:</b> {recipe.authorName || 'Usuário'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-[#EFE6D1]" />

              {/* Histórico de Receitas Rejeitadas */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-[#0C6816] flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  Receitas Rejeitadas / Privadas ({rejectedRecipes.length})
                </h3>

                {rejectedRecipes.length === 0 ? (
                  <div className="bg-white border border-[#EFE6D1] rounded-2xl p-4 text-xs text-[#5E6B52] shadow-2xs">
                    Nenhuma receita rejeitada registada no histórico.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rejectedRecipes.map(recipe => (
                      <div key={recipe.path} className="bg-white p-4 rounded-2xl border border-[#EFE6D1] space-y-1 shadow-2xs">
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                          ✕ Rejeitada
                        </span>
                        <h4 className="font-display font-bold text-sm text-gray-800">{recipe.title}</h4>
                        <p className="text-[11px] text-[#5E6B52]"><b>Autor:</b> {recipe.authorName || 'Usuário'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

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
                onClick={() => handleReject(selectedRecipeModal)}
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
                  onClick={() => handleApprove(selectedRecipeModal)}
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