import React, { useState } from 'react';
import { 
  Leaf, 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  ShieldAlert, 
  FileText, 
  Eye, 
  EyeOff, 
  Check 
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
  defaultUser: UserProfile;
}

const AVAILABLE_RESTRICTIONS = [
  'Sem Glúten',
  'Sem Lactose',
  'Sem Açúcar / Diabético',
  'Vegetariano',
  'Vegano',
  'Alergia a Amendoim',
  'Alergia a Frutos do Mar',
  'Alergia a Soja',
  'Alergia a Ovo',
  'Intolerância a Fructose',
  'Hipertenso (Baixo Sódio)',
  'Baixo Colesterol (Low Fat)',
  'Religiosa / Halal / Kosher'
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, defaultUser }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [name, setName] = useState(defaultUser.name || 'Maria Luiza');
  const [email, setEmail] = useState(defaultUser.email || 'maria@nutrismart.app');
  const [birthDate, setBirthDate] = useState(defaultUser.birthDate || '');
  const [password, setPassword] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(defaultUser.dietaryRestrictions || []);
  const [customRestrictions, setCustomRestrictions] = useState(defaultUser.customRestrictions || '');

  const toggleRestriction = (restriction: string) => {
    setSelectedRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userToSave: UserProfile = {
      ...defaultUser,
      name: name.trim() || 'Usuário NutriSmart',
      email: email.trim() || 'usuario@nutrismart.app',
      birthDate: birthDate || undefined,
      dietaryRestrictions: selectedRestrictions,
      customRestrictions: customRestrictions.trim() || undefined,
    };

    onLogin(userToSave);
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center p-4 font-sans selection:bg-[#D0F4A4] selection:text-[#0C6816]">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#EFE6D1] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Logo / Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#D0F4A4] text-[#0C6816] mx-auto flex items-center justify-center border-2 border-[#63D753] shadow-xs">
            <Leaf className="w-7 h-7" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0C6816] tracking-tight">
            nutrismart
          </h1>
          <p className="text-xs text-[#5E6B52]">
            {isRegister 
              ? 'Crie sua conta e receba recomendações inteligentes para a sua dispensa' 
              : 'Entre na sua conta para gerir sua dispensa e receitas'}
          </p>
        </div>

        {/* Tab Toggle: Entrar vs Cadastrar */}
        <div className="bg-[#FAF7EE] p-1 rounded-2xl border border-[#EFE6D1] flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isRegister
                ? 'bg-[#0C6816] text-white shadow-xs'
                : 'text-[#5E6B52] hover:text-[#0C6816]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRegister
                ? 'bg-[#0C6816] text-white shadow-xs'
                : 'text-[#5E6B52] hover:text-[#0C6816]'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Form Main */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo Nome (Apenas no Cadastro) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Nome Completo *</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Campo E-mail */}
          <div>
            <label className="block text-xs font-bold text-[#0C6816] mb-1.5">E-mail *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
              />
            </div>
          </div>

          {/* Campo Data de Nascimento (Apenas no Cadastro) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Data de Nascimento (Opcional)</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Campo Senha */}
          <div>
            <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Senha de Acesso *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5E6B52] hover:text-[#0C6816]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Seção de Restrições e Alergias Alimentares (Apenas no Cadastro) */}
          {isRegister && (
            <div className="space-y-4 pt-2 border-t border-[#EFE6D1]">
              
              {/* Restrições Padrão (Chips) */}
              <div className="space-y-2">
                <label className="font-display font-bold text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  Restrições & Alergias Alimentares
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_RESTRICTIONS.map(item => {
                    const isSelected = selectedRestrictions.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleRestriction(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0C6816] text-white border border-[#0C6816]'
                            : 'bg-[#FAF7EE] hover:bg-[#EFE6D1] text-[#1F2E1E] border border-[#EFE6D1]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#63D753]" />}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Restrições Específicas / Texto Livre */}
              <div className="space-y-1.5">
                <label className="font-display font-bold text-xs text-[#0C6816] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#63D753]" />
                  Restrições Específicas / Preferências Pessoais
                </label>
                <textarea
                  rows={2}
                  value={customRestrictions}
                  onChange={e => setCustomRestrictions(e.target.value)}
                  placeholder="Ex: Não como carne de porco, evito coentro, alérgico a gergelim..."
                  className="w-full p-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden leading-relaxed resize-none"
                />
              </div>

            </div>
          )}

          {/* Botão de Submissão */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            <Sparkles className="w-4 h-4 text-[#D0F4A4]" />
            <span>{isRegister ? 'Finalizar Cadastro & Iniciar' : 'Entrar no NutriSmart'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};