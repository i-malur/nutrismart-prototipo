import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Camera,
  AlertCircle
} from 'lucide-react';
import { Nutritionist } from '../types';

interface NutritionistRegisterFormProps {
  onBack: () => void;
  onSubmit: (data: Omit<Nutritionist, 'id' | 'verified' | 'rating' | 'reviewsCount'> & { diplomaFile?: string }) => void;
}

const AVAILABLE_TITLES = [
  'Graduação',
  'Pós-Graduação',
  'Especialização',
  'Mestrado',
  'Doutorado',
  'Phd',
  'Outros'
];

export const NutritionistRegisterForm: React.FC<NutritionistRegisterFormProps> = ({
  onBack,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [crn, setCrn] = useState('');
  const [crnState, setCrnState] = useState('');
  const [selectedTitles, setSelectedTitles] = useState<string[]>(['Graduação']);
  const [specialties, setSpecialties] = useState('');
  const [bio, setBio] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // File Uploads
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [diplomaFileName, setDiplomaFileName] = useState<string>('');

  // Terms Checkboxes
  const [acceptDataProtection, setAcceptDataProtection] = useState(false);
  const [acceptTruthfulInfo, setAcceptTruthfulInfo] = useState(false);

  // Status & Error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const diplomaInputRef = useRef<HTMLInputElement>(null);

  const toggleTitle = (title: string) => {
    if (selectedTitles.includes(title)) {
      setSelectedTitles(selectedTitles.filter(t => t !== title));
    } else {
      setSelectedTitles([...selectedTitles, title]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiplomaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDiplomaFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!crn.trim()) {
      setErrorMessage('Por favor, informe seu número de CRN.');
      return;
    }
    if (!crnState.trim()) {
      setErrorMessage('Por favor, informe o estado de emissão do seu CRN.');
      return;
    }
    if (selectedTitles.length === 0) {
      setErrorMessage('Selecione ao menos uma titulação acadêmica.');
      return;
    }
    if (!specialties.trim()) {
      setErrorMessage('Informe ao menos uma especialidade.');
      return;
    }
    if (!bio.trim() || bio.trim().length < 20) {
      setErrorMessage('Por favor, escreva uma biografia com pelo menos 20 caracteres.');
      return;
    }
    if (!acceptDataProtection || !acceptTruthfulInfo) {
      setErrorMessage('Você deve aceitar os termos de proteção de dados e veracidade das informações.');
      return;
    }

    setIsSubmitting(true);

    const defaultAvatar = photoPreview || 'https://images.unsplash.com/photo-1594824813501-48e0259b3c3b?w=300&auto=format&fit=crop&q=80';
    const parsedTags = specialties.split(';').map(s => s.trim()).filter(Boolean);

    setTimeout(() => {
      onSubmit({
        name: name.trim(),
        crn: crn.trim(),
        crnState: crnState.trim().toUpperCase(),
        avatar: defaultAvatar,
        bio: bio.trim(),
        specialty: parsedTags[0] || 'Nutrição Geral',
        titles: selectedTitles,
        education: `${selectedTitles.join(', ')} • CRN-${crnState.trim().toUpperCase()}`,
        tags: parsedTags.length > 0 ? parsedTags : ['Nutrição Clínica'],
        status: 'in_review',
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        diplomaFileName: diplomaFileName || undefined,
        submittedAt: new Date().toISOString()
      });

      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
    }, 800);
  };

  if (isSubmittedSuccess) {
    return (
      <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 px-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-[#FAF7EE] border-2 border-[#63D753] rounded-3xl p-6 sm:p-10 shadow-lg text-center space-y-6">
          <div className="w-20 h-20 bg-[#D0F4A4] text-[#0C6816] rounded-full mx-auto flex items-center justify-center shadow-inner">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#D0F4A4]/80 text-[#0C6816] rounded-full text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Status: Cadastro em Análise</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0C6816]">
              Cadastro Enviado com Sucesso!
            </h2>
            <p className="text-sm text-[#5E6B52] max-w-lg mx-auto leading-relaxed">
              Obrigado, <strong>{name}</strong>! Seus dados, registro no <strong>CRN ({crn} - {crnState.toUpperCase()})</strong> e documentação comprobatória foram recebidos com segurança pela moderação.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EFE6D1] text-left text-xs sm:text-sm text-[#1F2E1E] space-y-3 shadow-2xs">
            <h4 className="font-bold text-[#0C6816] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#63D753]" />
              Próximos Passos do Processo de Análise:
            </h4>
            <p className="text-[#5E6B52] leading-relaxed">
              1. <strong>Validação do CRN:</strong> Nossa equipe consultará a regularidade cadastral junto ao Conselho Regional de Nutricionistas.
            </p>
            <p className="text-[#5E6B52] leading-relaxed">
              2. <strong>Verificação de Diplomas:</strong> Faremos a conferência dos títulos informados para atribuição do selo de especialista verificado.
            </p>
            <p className="text-[#5E6B52] leading-relaxed">
              3. <strong>Publicação na Aba de Recomendações:</strong> Assim que aprovado, sua foto, biografia, titulações e especialidades serão exibidas com destaque para os usuários.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onBack}
              id="btn-return-recommendations"
              className="w-full sm:w-auto bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Voltar para Recomendações de Nutricionistas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-3 sm:px-6 space-y-6">
      
      {/* Top Header Bar matching the screen design */}
      <div className="flex items-center justify-between bg-white border border-[#EFE6D1] rounded-2xl px-5 py-3.5 shadow-2xs">
        <button
          onClick={onBack}
          id="btn-back-to-nutritionists"
          className="flex items-center gap-2 text-[#5E6B52] hover:text-[#0C6816] font-bold text-sm transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-[#EFE6D1]/50"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-[#5E6B52]" />
          <span className="hidden sm:inline">Voltar para Recomendações</span>
        </button>

        <span className="font-display font-extrabold text-xl sm:text-2xl tracking-widest text-[#5E6B52] uppercase">
          NUTRISMART
        </span>

        <div className="text-xs font-bold text-[#0C6816] bg-[#D0F4A4]/50 px-3 py-1.5 rounded-full">
          Portal do Profissional
        </div>
      </div>

      {/* Main Registration Card matching exact screenshot visual layout */}
      <div className="bg-[#FAF7EE] border border-[#EFE6D1] rounded-[32px] p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Title Header */}
        <div className="text-center space-y-2 border-b border-[#EFE6D1] pb-6">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#52634C] tracking-tight">
            Cadastro de Nutricionista
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6B52] max-w-xl mx-auto">
            Preencha seus dados profissionais para que nossa equipe avalie e publique seu perfil no acervo de especialistas recomendados do NutriSmart.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          
          {/* Error Banner if any */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Dados de Identificação Profissional */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base sm:text-lg text-[#52634C] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0C6816]" />
              Identificação e Registro Profissional
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Field 1: Qual é seu nome? */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="block text-sm font-medium text-[#5E6B52]">
                  Qual é seu nome? *
                </label>
                <input
                  type="text"
                  id="input-nutri-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full px-4 py-3 bg-white border border-[#D9D3C1] focus:border-[#63D753] rounded-xl text-sm text-[#1F2E1E] placeholder:text-[#9AA68E] outline-hidden shadow-2xs transition-colors"
                />
              </div>

              {/* Field 2: Qual seu CRN? */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-sm font-medium text-[#5E6B52]">
                  Qual seu CRN? *
                </label>
                <input
                  type="text"
                  id="input-nutri-crn"
                  value={crn}
                  onChange={(e) => setCrn(e.target.value)}
                  placeholder="Ex: CRN-3 12345"
                  className="w-full px-4 py-3 bg-white border border-[#D9D3C1] focus:border-[#63D753] rounded-xl text-sm text-[#1F2E1E] placeholder:text-[#9AA68E] outline-hidden shadow-2xs transition-colors"
                />
              </div>

              {/* Field 3: Qual o estado de emissão do CRN? */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-sm font-medium text-[#5E6B52]">
                  Estado *
                </label>
                <input
                  type="text"
                  id="input-nutri-state"
                  value={crnState}
                  onChange={(e) => setCrnState(e.target.value)}
                  placeholder="Ex: SP"
                  maxLength={2}
                  className="w-full px-4 py-3 bg-white border border-[#D9D3C1] focus:border-[#63D753] rounded-xl text-sm text-[#1F2E1E] placeholder:text-[#9AA68E] outline-hidden shadow-2xs uppercase text-center font-bold transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Titulações Acadêmicas */}
          <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#EFE6D1] shadow-2xs">
            <label className="block font-medium text-sm text-[#5E6B52]">
              Qual(is) titulação(ções) você possui? *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
              {AVAILABLE_TITLES.map((title) => {
                const isChecked = selectedTitles.includes(title);
                return (
                  <label 
                    key={title}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none text-xs sm:text-sm ${
                      isChecked 
                        ? 'bg-[#D0F4A4]/40 border-[#63D753] font-bold text-[#0C6816]' 
                        : 'bg-[#FAF7EE] border-[#EFE6D1] text-[#4A573F] hover:border-[#D9D3C1]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTitle(title)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0C6816] focus:ring-[#63D753] accent-[#0C6816] cursor-pointer"
                    />
                    <span>{title}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Especialidades e Biografia */}
          <div className="space-y-4">
            {/* Field 5: Qual(is) é(são) sua(s) especialidade(s)? */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#5E6B52]">
                Qual(is) é(são) sua(s) especialidade(s)? *
              </label>
              <input
                type="text"
                id="input-nutri-specialties"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder='Ex: Nutrição Esportiva; Emagrecimento; Saúde da Mulher; Hipertrofia (separe por ";")'
                className="w-full px-4 py-3 bg-white border border-[#D9D3C1] focus:border-[#63D753] rounded-xl text-sm text-[#1F2E1E] placeholder:text-[#9AA68E] outline-hidden shadow-2xs transition-colors"
              />
            </div>

            {/* Field 6: Escreva sua biografia */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#5E6B52]">
                Escreva sua biografia profissional *
              </label>
              <textarea
                id="textarea-nutri-bio"
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte sobre sua formação, experiência clínica, metodologia e abordagem nutricional..."
                className="w-full px-4 py-3.5 bg-white border border-[#D9D3C1] focus:border-[#63D753] rounded-2xl text-sm text-[#1F2E1E] placeholder:text-[#9AA68E] outline-hidden shadow-2xs transition-colors resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Section 4: Documentos e Foto de Perfil (Side by Side on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Field 7: Anexe uma foto sua */}
            <div className="space-y-2 bg-white p-5 rounded-2xl border border-[#EFE6D1] shadow-2xs">
              <label className="block text-sm font-medium text-[#5E6B52]">
                Foto de Perfil Profissional
              </label>
              
              <input
                ref={photoInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="flex border border-[#D9D3C1] rounded-xl bg-[#FAF7EE] overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-4 py-3 bg-[#EFE6D1] hover:bg-[#E2D6BB] text-[#5E6B52] font-semibold text-xs sm:text-sm transition-colors cursor-pointer border-r border-[#D9D3C1]"
                >
                  Arquivos
                </button>
                <div className="px-3 py-3 text-xs sm:text-sm text-[#5E6B52] flex-1 truncate flex items-center justify-between">
                  <span className={photoFileName ? 'text-[#0C6816] font-semibold' : 'text-[#8A967E]'}>
                    {photoFileName || 'Nenhum arquivo escolhido'}
                  </span>
                  {photoPreview && (
                    <img src={photoPreview} alt="Preview" className="w-7 h-7 rounded-full object-cover ring-2 ring-[#63D753]" />
                  )}
                </div>
              </div>
              <p className="text-[11px] text-[#8A967E]">
                Formatos aceitos: PNG ou JPG (Foto nítida e com boa iluminação)
              </p>
            </div>

            {/* Field 8: Anexe seus diplomas para comprovação */}
            <div className="space-y-2 bg-white p-5 rounded-2xl border border-[#EFE6D1] shadow-2xs">
              <label className="block text-sm font-medium text-[#5E6B52]">
                Diplomas e Certificados para Comprovação
              </label>

              <input
                ref={diplomaInputRef}
                type="file"
                accept="application/pdf, image/png, image/jpeg, image/jpg"
                onChange={handleDiplomaUpload}
                className="hidden"
              />

              <div className="flex border border-[#D9D3C1] rounded-xl bg-[#FAF7EE] overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => diplomaInputRef.current?.click()}
                  className="px-4 py-3 bg-[#EFE6D1] hover:bg-[#E2D6BB] text-[#5E6B52] font-semibold text-xs sm:text-sm transition-colors cursor-pointer border-r border-[#D9D3C1]"
                >
                  Arquivos
                </button>
                <div className="px-3 py-3 text-xs sm:text-sm text-[#5E6B52] flex-1 truncate flex items-center justify-between">
                  <span className={diplomaFileName ? 'text-[#0C6816] font-semibold' : 'text-[#8A967E]'}>
                    {diplomaFileName || 'Nenhum arquivo escolhido'}
                  </span>
                  {diplomaFileName && <FileText className="w-5 h-5 text-[#0C6816]" />}
                </div>
              </div>
              <p className="text-[11px] text-[#8A967E]">
                Formatos aceitos: PDF ou JPG (Frente e verso do diploma)
              </p>
            </div>

          </div>

          {/* Section 5: Contato Profissional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#5E6B52]">
                E-mail Profissional (Opcional)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="exemplo@nutrismart.med.br"
                className="w-full px-4 py-3 bg-white border border-[#D9D3C1] focus:border-[#63D753] rounded-xl text-sm text-[#1F2E1E] placeholder:text-[#9AA68E] outline-hidden shadow-2xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#5E6B52]">
                Telefone / WhatsApp (Opcional)
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 bg-white border border-[#D9D3C1] focus:border-[#63D753] rounded-xl text-sm text-[#1F2E1E] placeholder:text-[#9AA68E] outline-hidden shadow-2xs"
              />
            </div>
          </div>

          {/* Section 6: Termos e Confirmações */}
          <div className="space-y-3 bg-[#EFE6D1]/40 p-5 rounded-2xl border border-[#EFE6D1]">
            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none text-xs sm:text-sm text-[#5E6B52] leading-relaxed">
                <input
                  type="checkbox"
                  checked={acceptDataProtection}
                  onChange={(e) => setAcceptDataProtection(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-400 text-[#0C6816] focus:ring-[#63D753] accent-[#0C6816] cursor-pointer shrink-0"
                />
                <span>
                  Todos os dados serão protegidos e analisados por nossa equipe para sua aprovação como especialista na plataforma. Entraremos em contato!
                </span>
              </label>
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none text-xs sm:text-sm text-[#5E6B52] leading-relaxed">
                <input
                  type="checkbox"
                  checked={acceptTruthfulInfo}
                  onChange={(e) => setAcceptTruthfulInfo(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-400 text-[#0C6816] focus:ring-[#63D753] accent-[#0C6816] cursor-pointer shrink-0"
                />
                <span>
                  Ao enviar seu cadastro, você confirma que todas as informações e registros profissionais fornecidos são autênticos e verdadeiros.
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button styled */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-submit-nutri-register"
              className="w-full bg-[#52634C] hover:bg-[#43523E] active:bg-[#344030] text-white font-bold text-base py-4 px-8 rounded-2xl shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando Cadastro para Análise...</span>
                </>
              ) : (
                <span>Enviar Cadastro para Análise</span>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};

