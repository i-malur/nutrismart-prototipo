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
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
  defaultUser: UserProfile;
}

export const AVAILABLE_RESTRICTIONS = [
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
  'SÍNDROME DO INTESTINO IRRITÁVEL (FODMAP)',
  'Religiosa / Halal / Kosher'
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, defaultUser }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [customRestrictions, setCustomRestrictions] = useState('');

  const handleToggleMode = (registerMode: boolean) => {
    setIsRegister(registerMode);
    setName('');
    setEmail('');
    setBirthDate('');
    setPassword('');
    setSelectedRestrictions([]);
    setCustomRestrictions('');
    setErrorMessage(null);
  };

  const toggleRestriction = (restriction: string) => {
    setSelectedRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const validateEmail = (mail: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(mail);
  };

  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return {
      minLength,
      hasLetter,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasLetter && hasNumber && hasSpecial
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateEmail(email)) {
      setErrorMessage('Por favor, insira um e-mail com uma estrutura válida (ex: nome@exemplo.com).');
      return;
    }

    if (isRegister) {
      if (name.trim().length < 3) {
        setErrorMessage('O nome completo deve ter no mínimo 3 caracteres.');
        return;
      }

      if (!birthDate) {
        setErrorMessage('Por favor, insira a sua data de nascimento.');
        return;
      }

      const passCheck = validatePassword(password);
      if (!passCheck.isValid) {
        setErrorMessage('A senha não cumpre todos os requisitos de segurança exigidos.');
        return;
      }
    }

    setIsLoading(true);

    try {
      let currentUid = '';

      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        currentUid = userCredential.user.uid;

        await setDoc(doc(db, `users/${currentUid}`), {
          name: name.trim(),
          email: email.trim(),
          birthDate: birthDate || null,
          dietaryRestrictions: selectedRestrictions,
          customRestrictions: customRestrictions.trim() || null,
          createdAt: new Date().toISOString()
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        currentUid = userCredential.user.uid;
      }

      const userToSave: UserProfile = {
        ...defaultUser,
        uid: currentUid,
        name: name.trim() || (isRegister ? 'Novo Usuário' : 'Usuário NutriSmart'),
        email: email.trim(),
        birthDate: birthDate || undefined,
        dietaryRestrictions: selectedRestrictions,
        customRestrictions: customRestrictions.trim() || undefined,
      };

      onLogin(userToSave);
    } catch (error: any) {
      console.error("Erro na autenticação:", error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Este e-mail já está registado. Tente entrar na sua conta.');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMessage('E-mail ou senha incorretos.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('A senha é muito fraca. Escolha uma senha mais segura.');
      } else {
        setErrorMessage('Ocorreu um erro ao processar a autenticação. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passStatus = validatePassword(password);

  return (
    <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center p-4 font-sans selection:bg-[#D0F4A4] selection:text-[#0C6816]">
      {/* Largura aumentada para max-w-3xl para um aspeto mais amplo e espaçoso */}
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#EFE6D1] shadow-2xl p-6 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#D0F4A4] text-[#0C6816] mx-auto flex items-center justify-center border-2 border-[#63D753] shadow-xs">
            <Leaf className="w-7 h-7" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0C6816] tracking-tight">
            nutrismart
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6B52]">
            {isRegister
              ? 'Crie sua conta e receba recomendações inteligentes para a sua dispensa'
              : 'Entre na sua conta para gerir sua dispensa e receitas'}
          </p>
        </div>

        <div className="bg-[#FAF7EE] p-1 rounded-2xl border border-[#EFE6D1] flex items-center gap-1 max-w-md mx-auto">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleToggleMode(false)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${!isRegister
              ? 'bg-[#0C6816] text-white shadow-xs'
              : 'text-[#5E6B52] hover:text-[#0C6816]'
              }`}
          >
            Entrar
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleToggleMode(true)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isRegister
              ? 'bg-[#0C6816] text-white shadow-xs'
              : 'text-[#5E6B52] hover:text-[#0C6816]'
              }`}
          >
            Cadastrar
          </button>
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {isRegister ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Nome Completo * (Mín. 3 caracteres)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    minLength={3}
                    disabled={isLoading}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Data de Nascimento *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    disabled={isLoading}
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0C6816] mb-1.5">E-mail *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0C6816] mb-1.5">Senha de Acesso *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5E6B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
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
          </div>

          {isRegister && password.length > 0 && (
            <div className="p-3 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl space-y-1.5 text-[11px]">
              <p className="font-bold text-[#0C6816]">Requisitos da senha:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <span className={passStatus.minLength ? 'text-emerald-700 font-semibold' : 'text-[#5E6B52]'}>
                  {passStatus.minLength ? '✓' : '•'} Mínimo de 8 dígitos
                </span>
                <span className={passStatus.hasLetter ? 'text-emerald-700 font-semibold' : 'text-[#5E6B52]'}>
                  {passStatus.hasLetter ? '✓' : '•'} Letras (a-Z)
                </span>
                <span className={passStatus.hasNumber ? 'text-emerald-700 font-semibold' : 'text-[#5E6B52]'}>
                  {passStatus.hasNumber ? '✓' : '•'} Números (0-9)
                </span>
                <span className={passStatus.hasSpecial ? 'text-emerald-700 font-semibold' : 'text-[#5E6B52]'}>
                  {passStatus.hasSpecial ? '✓' : '•'} Caractere especial
                </span>
              </div>
            </div>
          )}

          {isRegister && (
            <div className="space-y-4 pt-3 border-t border-[#EFE6D1]">
              <div className="space-y-2">
                <label className="font-display font-bold text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  Restrições & Alergias Alimentares
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {AVAILABLE_RESTRICTIONS.map(item => {
                    const isSelected = selectedRestrictions.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleRestriction(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${isSelected
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

              <div className="space-y-1.5">
                <label className="font-display font-bold text-xs text-[#0C6816] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#63D753]" />
                  Restrições Específicas / Preferências Pessoais
                </label>
                <textarea
                  rows={2}
                  disabled={isLoading}
                  value={customRestrictions}
                  onChange={e => setCustomRestrictions(e.target.value)}
                  placeholder="Ex: Não como carne de porco, evito coentro, alérgico a gergelim..."
                  className="w-full p-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden leading-relaxed resize-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#0C6816] hover:bg-[#095011] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#D0F4A4]" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D0F4A4]" />
                <span>{isRegister ? 'Finalizar Cadastro & Iniciar' : 'Entrar no NutriSmart'}</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};