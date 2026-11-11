import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Award, 
  Search,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { Nutritionist, UserProfile } from '../types';

interface NutritionistsViewProps {
  nutritionists: Nutritionist[];
  user: UserProfile;
}

export const NutritionistsView: React.FC<NutritionistsViewProps> = ({
  nutritionists = [],
  user
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');

  const filteredNutritionists = nutritionists.filter(nutri => {
    const matchesSearch = nutri.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          nutri.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          nutri.bio.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'Todas' || nutri.specialty.includes(selectedSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  const getWhatsAppLink = (nutri: Nutritionist) => {
    const cleanPhone = (nutri.contactPhone || '').replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${nutri.name}! Encontrei seu perfil no aplicativo NutriSmart e gostaria de informações sobre agendamento de consultas.`);
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`;
  };

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0C6816] via-[#147a22] to-[#0C6816] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D0F4A4]/20 border border-[#D0F4A4]/30 text-[#D0F4A4] text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#63D753]" />
            <span>Profissionais Credenciados com CRN Ativo</span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Nutricionistas Parceiros
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Agende consultas e acompanhamento individualizado diretamente pelo WhatsApp com especialistas certificados.
          </p>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white border border-[#EFE6D1] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou especialidade..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['Todas', 'Esportiva', 'Emagrecimento', 'Vegetariana'].map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSpecialty === spec
                  ? 'bg-[#0C6816] text-white'
                  : 'bg-[#FAF7EE] text-[#5E6B52] hover:bg-[#EFE6D1]'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="space-y-4">
        {filteredNutritionists.map(nutri => (
          <div
            key={nutri.id}
            className="bg-white rounded-3xl border border-[#EFE6D1] hover:border-[#63D753] transition-all p-5 sm:p-6 shadow-2xs hover:shadow-md space-y-4"
          >
            {/* Header do Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={nutri.avatar}
                    alt={nutri.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#63D753]"
                  />
                  {nutri.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-[#0C6816] text-[#63D753] p-1 rounded-full border-2 border-white" title="CRN Verificado">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-black text-base sm:text-lg text-[#0C6816]">
                      {nutri.name}
                    </h3>
                    <span className="text-[11px] font-bold bg-[#FAF7EE] text-[#0C6816] border border-[#EFE6D1] px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#63D753]" />
                      {nutri.crn}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#63D753] bg-[#0C6816]/5 px-2 py-0.5 rounded-md w-fit">
                    {nutri.specialty}
                  </p>
                  
                  <p className="text-xs text-[#5E6B52]">
                    {nutri.education}
                  </p>
                </div>
              </div>

              {/* Títulos / Formação */}
              <div className="flex flex-wrap gap-1.5">
                {nutri.titles?.map(title => (
                  <span
                    key={title}
                    className="text-[10px] font-bold bg-[#D0F4A4] text-[#0C6816] border border-[#63D753]/30 px-2 py-0.5 rounded-md"
                  >
                    {title}
                  </span>
                ))}
              </div>
            </div>

            {/* Biografia Profissional */}
            <div className="bg-[#FAF7EE] p-4 rounded-2xl border border-[#EFE6D1] space-y-1.5">
              <p className="text-xs font-bold text-[#0C6816] flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#63D753]" />
                Biografia Profissional
              </p>
              <p className="text-xs text-[#1F2E1E] leading-relaxed">
                {nutri.bio}
              </p>
            </div>

            {/* Tags de atuação */}
            <div className="flex flex-wrap gap-1.5">
              {nutri.tags?.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold bg-[#FAF7EE] text-[#5E6B52] border border-[#EFE6D1] px-2.5 py-1 rounded-lg"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Rodapé do Card com Contatos & Ação do WhatsApp */}
            <div className="pt-3 border-t border-[#EFE6D1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#5E6B52]">
                {nutri.contactEmail && (
                  <a 
                    href={`mailto:${nutri.contactEmail}`}
                    className="flex items-center gap-1.5 hover:text-[#0C6816] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#0C6816]" />
                    <span>{nutri.contactEmail}</span>
                  </a>
                )}

                {nutri.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0C6816]" />
                    {nutri.location}
                  </span>
                )}
              </div>

              {/* Botão de WhatsApp */}
              <a
                href={getWhatsAppLink(nutri)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                <span>Chamar no WhatsApp</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};