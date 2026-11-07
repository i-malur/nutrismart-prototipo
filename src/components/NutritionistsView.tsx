import React, { useState } from 'react';
import { 
  Apple, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Award, 
  Clock, 
  ShieldCheck, 
  Send, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  ExternalLink,
  BookOpen,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { Nutritionist, UserProfile } from '../types';

interface NutritionistsViewProps {
  nutritionists: Nutritionist[];
  user: UserProfile;
}

export const NutritionistsView: React.FC<NutritionistsViewProps> = ({
  nutritionists,
  user,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Todas');
  const [selectedNutriModal, setSelectedNutriModal] = useState<Nutritionist | null>(null);
  
  // AI Recommendation Assistant State
  const [isAiTriageOpen, setIsAiTriageOpen] = useState<boolean>(false);
  const [triageGoal, setTriageGoal] = useState<string>('');
  const [triageSuggestion, setTriageSuggestion] = useState<string | null>(null);
  const [isTriageLoading, setIsTriageLoading] = useState<boolean>(false);

  // Filter approved and pending review
  const approvedNutris = nutritionists.filter(n => n.status !== 'in_review');
  const pendingNutris = nutritionists.filter(n => n.status === 'in_review');

  const specialties = [
    'Todas',
    'Nutrição Esportiva',
    'Emagrecimento',
    'Saúde Intestinal',
    'Vegetariana & Vegana'
  ];

  const filteredApprovedNutris = approvedNutris.filter(n => {
    const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase()) ||
                          n.crn.toLowerCase().includes(search.toLowerCase()) ||
                          n.specialty.toLowerCase().includes(search.toLowerCase()) ||
                          n.bio.toLowerCase().includes(search.toLowerCase()) ||
                          (n.tags && n.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
    const matchesSpec = selectedSpecialty === 'Todas' || n.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    return matchesSearch && matchesSpec;
  });

  const handleRunAiTriage = async () => {
    if (!triageGoal.trim()) return;
    setIsTriageLoading(true);
    try {
      const res = await fetch('/api/ai/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `O usuário busca recomendação de nutricionista para o seguinte objetivo: "${triageGoal}". Qual perfil de especialista (Esportiva, Comportamental/Emagrecimento, Funcional/Intestinal ou Vegetariana) é o mais recomendado? Responda de forma sucinta e acolhedora em 2 parágrafos.`,
          userContext: user
        })
      });
      const data = await res.json();
      setTriageSuggestion(data.reply);
    } catch (err) {
      console.error(err);
      setTriageSuggestion('Recomendamos selecionar um nutricionista com foco em Emagrecimento Saudável e Reeducação Alimentar para orientar sua dieta inicial.');
    } finally {
      setIsTriageLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner with Recommendations Focus */}
      <div className="bg-gradient-to-br from-[#0C6816] via-[#147a22] to-[#0C6816] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D0F4A4]/20 border border-[#D0F4A4]/30 text-[#D0F4A4] text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#D0F4A4]" />
              <span>Diretório de Profissionais Recomendados</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Recomendações de Nutricionistas
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
              Consulte os perfis de nutricionistas recomendados pelo NutriSmart para você entrar em contato diretamente. Profissionais certificados com registro no CRN e especialidades diversas para acelerar seus resultados.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsAiTriageOpen(!isAiTriageOpen)}
              id="btn-ai-triage-nutri"
              className="flex items-center justify-center gap-2 bg-[#D0F4A4] hover:bg-[#bde88c] text-[#0C6816] font-bold px-4 py-3 rounded-2xl shadow-xs transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4 text-[#0C6816]" />
              <span>Orientador com IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Recommendation Assistant Accordion */}
      {isAiTriageOpen && (
        <div className="bg-white border-2 border-[#63D753] rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE6D1]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D0F4A4] flex items-center justify-center text-[#0C6816]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0C6816]">
                  Orientador de Especialidades Recomendadas
                </h3>
                <p className="text-xs text-[#5E6B52]">
                  Diga o que você procura na sua alimentação para receber o perfil de especialista mais indicado
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsAiTriageOpen(false)} 
              className="text-xs font-bold text-[#5E6B52] hover:text-[#0C6816] px-2 py-1 rounded-lg hover:bg-[#FAF7EE]"
            >
              Fechar
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={triageGoal}
              onChange={(e) => setTriageGoal(e.target.value)}
              placeholder="Ex: Quero ganhar massa muscular sem suplementos ou tenho sensibilidade a lactose..."
              className="flex-1 px-4 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-sm text-[#0C6816] outline-hidden placeholder:text-[#9AA68E]"
            />
            <button
              onClick={handleRunAiTriage}
              disabled={isTriageLoading || !triageGoal.trim()}
              className="bg-[#0C6816] hover:bg-[#095011] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
            >
              {isTriageLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Analisar</span>
                </>
              )}
            </button>
          </div>

          {triageSuggestion && (
            <div className="bg-[#FAF7EE] p-4 rounded-2xl border border-[#EFE6D1] space-y-2">
              <h4 className="text-xs font-bold text-[#0C6816] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#63D753]" />
                Parecer do Orientador NutriSmart IA
              </h4>
              <p className="text-xs sm:text-sm text-[#1F2E1E] leading-relaxed whitespace-pre-line">
                {triageSuggestion}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pending Submissions Alert Banner (if any registered nutritionist is waiting for analysis) */}
      {pendingNutris.length > 0 && (
        <div className="bg-[#FAF7EE] border border-[#EFE6D1] rounded-2xl p-4.5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0C6816]">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Cadastros de Especialistas Recentes ({pendingNutris.length})</span>
          </div>
          <div className="space-y-2">
            {pendingNutris.map((p) => (
              <div 
                key={p.id} 
                className="bg-white p-3.5 rounded-xl border border-[#EFE6D1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-400" />
                  <div>
                    <span className="font-bold text-[#0C6816]">{p.name}</span>
                    <span className="text-[#5E6B52] ml-2 font-medium">CRN: {p.crn} ({p.crnState || 'BR'})</span>
                    <p className="text-[11px] text-[#5E6B52] line-clamp-1">{p.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Em Análise pela Equipe
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Specialty Filter Bar */}
      <div className="bg-white border border-[#EFE6D1] rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-nutritionists"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, CRN, biografia ou especialidade..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-2xl text-xs sm:text-sm text-[#0C6816] outline-hidden placeholder:text-[#9AA68E]"
            />
          </div>

          <div className="text-xs text-[#5E6B52] font-semibold self-end sm:self-center">
            {filteredApprovedNutris.length} nutricionista(s) recomendado(s)
          </div>
        </div>

        {/* Specialty Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSpecialty === spec
                  ? 'bg-[#0C6816] text-white shadow-2xs'
                  : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1] hover:text-[#0C6816]'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Nutritionists Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredApprovedNutris.map((nutri) => (
          <div
            key={nutri.id}
            id={`recommended-nutri-${nutri.id}`}
            className="bg-white border border-[#EFE6D1] hover:border-[#63D753] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            {/* Top Identity Block: Foto, Nome, CRN e Selo */}
            <div>
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={nutri.avatar}
                    alt={nutri.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#63D753] shadow-xs"
                  />
                  {nutri.verified && (
                    <span 
                      className="absolute -bottom-1 -right-1 bg-[#63D753] text-[#0C6816] p-1 rounded-full ring-2 ring-white shadow-2xs" 
                      title="CRN e Diplomas Validados pela Equipe"
                    >
                      <CheckCircle2 className="w-4 h-4 fill-[#0C6816] text-white" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-[#0C6816] leading-tight">
                      {nutri.name}
                    </h3>
                  </div>

                  {/* CRN Badge */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FAF7EE] text-[#0C6816] px-2.5 py-0.5 rounded-lg border border-[#EFE6D1]">
                      <ShieldCheck className="w-3 h-3 text-[#63D753]" />
                      {nutri.crn} {nutri.crnState ? `(${nutri.crnState})` : ''}
                    </span>
                    <span className="text-[11px] text-[#5E6B52] font-semibold">
                      {nutri.education}
                    </span>
                  </div>

                  {/* Specialty Highlighting */}
                  <p className="text-xs font-bold text-[#63D753] mt-1.5">
                    {nutri.specialty}
                  </p>
                </div>
              </div>

              {/* Titulações Badges */}
              {nutri.titles && nutri.titles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {nutri.titles.map((title, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] font-bold bg-[#D0F4A4]/40 text-[#0C6816] px-2 py-0.5 rounded-md border border-[#D0F4A4]"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              )}

              {/* Biografia Requisito */}
              <div className="mt-3.5 bg-[#FAF7EE] p-4 rounded-2xl border border-[#EFE6D1]/80">
                <h4 className="text-[11px] font-bold text-[#5E6B52] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0C6816]" />
                  Biografia Profissional
                </h4>
                <p className="text-xs sm:text-sm text-[#1F2E1E] leading-relaxed line-clamp-3">
                  {nutri.bio}
                </p>
              </div>

              {/* Tags / Especialidades */}
              {nutri.tags && nutri.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {nutri.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] font-semibold bg-[#FAF7EE] text-[#5E6B52] px-2.5 py-1 rounded-lg border border-[#EFE6D1]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Card Footer with Direct Recommendations Actions */}
            <div className="pt-3 border-t border-[#EFE6D1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-[#5E6B52]">
                {nutri.contactEmail && (
                  <span className="flex items-center gap-1 truncate max-w-[180px]" title={nutri.contactEmail}>
                    <Mail className="w-3.5 h-3.5 text-[#0C6816]" />
                    {nutri.contactEmail}
                  </span>
                )}
                {nutri.contactPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#0C6816]" />
                    {nutri.contactPhone}
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedNutriModal(nutri)}
                id={`btn-view-profile-${nutri.id}`}
                className="w-full sm:w-auto bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Ver Biografia Completa</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {filteredApprovedNutris.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#EFE6D1] space-y-3">
          <Apple className="w-12 h-12 text-[#5E6B52] mx-auto opacity-50" />
          <h3 className="font-display font-bold text-base text-[#0C6816]">Nenhum nutricionista encontrado</h3>
          <p className="text-xs text-[#5E6B52] max-w-sm mx-auto">
            Tente buscar com outros termos ou selecione uma especialidade diferente no filtro acima.
          </p>
        </div>
      )}

      {/* Modal: Full Profile & Bio Details */}
      {selectedNutriModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EFE6D1] relative animate-in fade-in zoom-in-95 duration-200 space-y-5">
            
            <div className="flex items-start justify-between pb-4 border-b border-[#EFE6D1]">
              <div className="flex items-center gap-4">
                <img
                  src={selectedNutriModal.avatar}
                  alt={selectedNutriModal.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#63D753]"
                />
                <div>
                  <h3 className="font-display font-black text-xl text-[#0C6816]">
                    {selectedNutriModal.name}
                  </h3>
                  <p className="text-xs font-bold text-[#63D753]">
                    {selectedNutriModal.specialty}
                  </p>
                  <p className="text-xs text-[#5E6B52]">
                    CRN: {selectedNutriModal.crn} {selectedNutriModal.crnState ? `(${selectedNutriModal.crnState})` : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNutriModal(null)}
                className="text-[#5E6B52] hover:text-[#0C6816] font-bold text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FAF7EE] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Full Bio */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#0C6816] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#63D753]" />
                Biografia & Abordagem Nutricional
              </h4>
              <div className="bg-[#FAF7EE] p-4 rounded-2xl border border-[#EFE6D1] text-xs sm:text-sm text-[#1F2E1E] leading-relaxed whitespace-pre-line">
                {selectedNutriModal.bio}
              </div>
            </div>

            {/* Titulações & Formação */}
            {selectedNutriModal.titles && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#0C6816] uppercase tracking-wider">
                  Titulações Cadastradas
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNutriModal.titles.map((t, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#D0F4A4]/40 text-[#0C6816] rounded-xl text-xs font-bold border border-[#D0F4A4]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contato & Informações Recomendadas */}
            <div className="bg-white p-4 rounded-2xl border border-[#EFE6D1] space-y-2 text-xs">
              <h4 className="font-bold text-[#0C6816]">Canais Profissionais de Contato:</h4>
              {selectedNutriModal.contactEmail && (
                <p className="flex items-center gap-2 text-[#5E6B52]">
                  <Mail className="w-4 h-4 text-[#0C6816]" />
                  <span>E-mail: <strong>{selectedNutriModal.contactEmail}</strong></span>
                </p>
              )}
              {selectedNutriModal.contactPhone && (
                <p className="flex items-center gap-2 text-[#5E6B52]">
                  <Phone className="w-4 h-4 text-[#0C6816]" />
                  <span>Telefone/WhatsApp: <strong>{selectedNutriModal.contactPhone}</strong></span>
                </p>
              )}
              <p className="flex items-center gap-2 text-[#5E6B52]">
                <ShieldCheck className="w-4 h-4 text-[#63D753]" />
                <span>Cadastro e documentação avaliados e aprovados pela curadoria NutriSmart.</span>
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedNutriModal(null)}
                className="bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
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
