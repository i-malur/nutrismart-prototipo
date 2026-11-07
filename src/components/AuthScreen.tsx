import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Utensils,
  Clock
} from 'lucide-react';
import { UserProfile, DayPlan } from '../types';
import { Logo } from './Logo';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
  defaultUser?: UserProfile;
  weeklyPlan?: DayPlan[];
  onUpdateWeeklyPlan?: (newPlan: DayPlan[]) => void;
}

const COMMON_RESTRICTIONS = [
  'Sem Glúten',
  'Sem Lactose',
  'Sem Açúcar',
  'Vegetariano',
  'Vegano',
  'Alergia a Amendoim',
  'Alergia a Frutos do Mar',
  'Hipertenso (Baixo Sódio)',
];

const DIET_OPTIONS = [
  'Equilibrada',
  'Low Carb',
  'Vegetariana',
  'Vegana',
  'Ganho de Massa',
  'Cetogênica',
  'Econômica & Zero Desperdício'
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  onLogin, 
  defaultUser, 
  weeklyPlan, 
  onUpdateWeeklyPlan 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState(defaultUser?.email || 'camila.rocha@nutrismart.app');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState(defaultUser?.name || 'Camila Rocha');
  const [birthDate, setBirthDate] = useState(defaultUser?.birthDate || '1996-05-14');
  const [diet, setDiet] = useState(defaultUser?.diet || 'Equilibrada');
  const [restrictions, setRestrictions] = useState<string[]>(defaultUser?.dietaryRestrictions || ['Sem Glúten']);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Segunda a Sexta Meal Plan in Register
  const [hasFixedPlan, setHasFixedPlan] = useState(false);
  const [customMeals, setCustomMeals] = useState({
    breakfast: '',
    lunch: '',
    snack: '',
    dinner: ''
  });

  const toggleRestriction = (item: string) => {
    setRestrictions(prev => 
      prev.includes(item) ? prev.filter(r => r !== item) : [...prev, item]
    );
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor, informe seu e-mail e sua senha.');
      return;
    }

    const authenticatedUser: UserProfile = {
      ...(defaultUser || {
        level: 1,
        levelTitle: 'Iniciante Saudável',
        points: 150,
        streakDays: 1,
        calorieTarget: 2000,
        dietaryGoals: ['Alimentação Saudável', 'Zero Desperdício'],
        allergies: [],
      }),
      name: defaultUser && defaultUser.email.toLowerCase() === email.toLowerCase() ? defaultUser.name : (name || email.split('@')[0]),
      email: email.trim(),
      password,
      avatar: defaultUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      diet: defaultUser?.diet || 'Equilibrada',
      dietaryRestrictions: defaultUser?.dietaryRestrictions || [],
      allergies: defaultUser?.allergies || [],
      pantryUsageType: 'residencial',
    };

    onLogin(authenticatedUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const newUser: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      password,
      birthDate,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      level: 1,
      levelTitle: 'Novo Membro NutriSmart',
      points: 100, // bônus de boas-vindas
      streakDays: 1,
      calorieTarget: 2000,
      diet,
      dietaryGoals: ['Nutrição Consciente', 'Zero Desperdício', 'Mais Saúde'],
      dietaryRestrictions: restrictions,
      allergies: restrictions.filter(r => r.toLowerCase().includes('alergia')),
      pantryUsageType: 'residencial',
    };

    // Se o usuário preencheu o que come de segunda a sexta, atualiza o plano semanal de dias úteis
    if (hasFixedPlan && weeklyPlan && onUpdateWeeklyPlan) {
      const updatedPlan = weeklyPlan.map((day, idx) => {
        // Índices 0 a 4 correspondem a Segunda a Sexta
        if (idx <= 4) {
          const newBreakfast = customMeals.breakfast.trim() ? {
            ...day.breakfast,
            name: customMeals.breakfast.trim(),
            description: `Definido no cadastro (${diet})`
          } : day.breakfast;

          const newLunch = customMeals.lunch.trim() ? {
            ...day.lunch,
            name: customMeals.lunch.trim(),
            description: `Definido no cadastro (${diet})`
          } : day.lunch;

          const newSnack = customMeals.snack.trim() ? {
            ...day.snack,
            name: customMeals.snack.trim(),
            description: `Definido no cadastro (${diet})`
          } : day.snack;

          const newDinner = customMeals.dinner.trim() ? {
            ...day.dinner,
            name: customMeals.dinner.trim(),
            description: `Definido no cadastro (${diet})`
          } : day.dinner;

          return {
            ...day,
            breakfast: newBreakfast,
            lunch: newLunch,
            snack: newSnack,
            dinner: newDinner
          };
        }
        return day;
      });
      onUpdateWeeklyPlan(updatedPlan);
    }

    onLogin(newUser);
  };

  const handleQuickDemoLogin = () => {
    if (defaultUser) {
      onLogin(defaultUser);
    } else {
      onLogin({
        name: 'Camila Rocha',
        email: 'camila.rocha@nutrismart.app',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        level: 4,
        levelTitle: 'Chef Sustentável & Saudável',
        points: 840,
        streakDays: 14,
        calorieTarget: 2000,
        diet: 'Equilibrada',
        dietaryGoals: ['Equilíbrio & Vitalidade', 'Zero Desperdício'],
        dietaryRestrictions: ['Sem Glúten'],
        allergies: ['Amendoim'],
        pantryUsageType: 'residencial'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative background blurs using brand colors */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D0F4A4]/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#63D753]/20 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      {/* Header / Brand */}
      <div className="w-full max-w-2xl mx-auto relative z-10 text-center space-y-4">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center p-3.5 bg-white rounded-3xl border border-[#EFE6D1] shadow-sm">
          <Logo size="lg" />
        </div>

        <div>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#0C6816] tracking-tight">
            nutri<span className="text-[#63D753]">smart</span>
          </h1>
          <p className="text-sm sm:text-base text-[#5E6B52] font-medium mt-1.5 max-w-lg mx-auto">
            Nutrição personalizada, dispensa inteligente & plano alimentar sob medida
          </p>
        </div>

        {/* Tab switch Login vs Cadastro */}
        <div className="flex bg-[#EFE6D1]/70 p-1.5 rounded-2xl border border-[#EFE6D1] max-w-md mx-auto shadow-inner">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#0C6816] text-white shadow-md'
                : 'text-[#5E6B52] hover:text-[#0C6816]'
            }`}
          >
            Entrar na Conta
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-[#0C6816] text-white shadow-md'
                : 'text-[#5E6B52] hover:text-[#0C6816]'
            }`}
          >
            Criar Nova Conta
          </button>
        </div>
      </div>

      {/* Spacious Card Container */}
      <div className="mt-8 w-full max-w-2xl mx-auto relative z-10">
        <div className="bg-white py-8 px-6 sm:py-10 sm:px-10 shadow-xl border border-[#EFE6D1] rounded-3xl space-y-6">

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl font-medium">
              {errorMsg}
            </div>
          )}

          {mode === 'login' ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1F2E1E] mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-[#5E6B52] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm sm:text-base text-[#1F2E1E] placeholder:text-[#5E6B52]/60 focus:outline-hidden focus:border-[#63D753] focus:ring-2 focus:ring-[#63D753]/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs sm:text-sm font-bold text-[#1F2E1E]">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Para recuperar a senha de demonstração, utilize '123456' ou entre com o botão de acesso rápido.")}
                    className="text-xs font-bold text-[#0C6816] hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#5E6B52] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 sm:py-3.5 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm sm:text-base text-[#1F2E1E] placeholder:text-[#5E6B52]/60 focus:outline-hidden focus:border-[#63D753] focus:ring-2 focus:ring-[#63D753]/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5E6B52] hover:text-[#0C6816] cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center gap-2.5 text-[#5E6B52] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#0C6816] rounded border-[#EFE6D1] focus:ring-[#63D753]"
                  />
                  <span>Lembrar de mim neste dispositivo</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-sm sm:text-base py-3.5 sm:py-4 rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Acessar o NutriSmart</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Botão de demonstração imediata com 1 clique */}
              <div className="pt-4 border-t border-[#EFE6D1] text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="w-full bg-[#FAF7EE] hover:bg-[#EFE6D1] border border-[#EFE6D1] text-[#0C6816] font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#63D753]" />
                  <span>Entrar Instantaneamente com Conta Demo (Camila Rocha)</span>
                </button>
              </div>
            </form>
          ) : (
            /* ================= REGISTRO / CADASTRO FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1F2E1E] mb-1.5">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-[#5E6B52] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Maria Luiza Fernandes"
                    className="w-full pl-12 pr-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm sm:text-base text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753] focus:ring-2 focus:ring-[#63D753]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1F2E1E] mb-1.5">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-[#5E6B52] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753] focus:ring-2 focus:ring-[#63D753]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1F2E1E] mb-1.5">
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-[#5E6B52] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753] focus:ring-2 focus:ring-[#63D753]/30"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1F2E1E] mb-1.5">
                  Senha de Acesso *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#5E6B52] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-12 pr-12 py-3 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm sm:text-base text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753] focus:ring-2 focus:ring-[#63D753]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5E6B52] hover:text-[#0C6816] p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Preferência de Dieta */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1F2E1E] mb-1.5 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#0C6816]" />
                  <span>Estilo de Alimentação Principal</span>
                </label>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-sm text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753] cursor-pointer"
                >
                  {DIET_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Restrições Alimentares */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1F2E1E] mb-2">
                  Restrições & Alergias Alimentares
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_RESTRICTIONS.map(item => {
                    const isSelected = restrictions.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleRestriction(item)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0C6816] text-white border-[#0C6816] shadow-2xs'
                            : 'bg-[#FAF7EE] text-[#5E6B52] border-[#EFE6D1] hover:border-[#63D753]'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plano Alimentar de Segunda a Sexta (Opcional ou para quem tem rotina certinha) */}
              <div className="pt-3 border-t border-[#EFE6D1] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-[#0C6816] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#63D753]" />
                      <span>Plano Alimentar de Seg a Sex (Dias Úteis)</span>
                    </label>
                    <p className="text-[11px] text-[#5E6B52]">
                      Você já tem uma rotina de refeições fixa de segunda a sexta?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasFixedPlan(!hasFixedPlan)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      hasFixedPlan
                        ? 'bg-[#0C6816] text-white border-[#0C6816]'
                        : 'bg-[#FAF7EE] text-[#0C6816] border-[#0C6816]/30'
                    }`}
                  >
                    {hasFixedPlan ? '✓ Sim, cadastrar refeições' : '+ Cadastrar meu plano'}
                  </button>
                </div>

                {hasFixedPlan && (
                  <div className="bg-[#FAF7EE] p-4 rounded-2xl border border-[#EFE6D1] space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[#EFE6D1] pb-2">
                      <p className="text-xs font-bold text-[#0C6816]">
                        Defina suas refeições principais (aplicadas de Segunda a Sexta):
                      </p>
                      <span className="text-[10px] bg-white text-[#0C6816] px-2 py-0.5 rounded-md border border-[#EFE6D1] font-semibold">
                        Segunda a Sexta
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#1F2E1E] mb-1">
                          ☕ Café da Manhã habitual:
                        </label>
                        <input
                          type="text"
                          value={customMeals.breakfast}
                          onChange={(e) => setCustomMeals({ ...customMeals, breakfast: e.target.value })}
                          placeholder="Ex: Ovos mexidos, café e torrada"
                          className="w-full px-3 py-2 bg-white border border-[#EFE6D1] rounded-xl text-xs text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#1F2E1E] mb-1">
                          🥗 Almoço habitual:
                        </label>
                        <input
                          type="text"
                          value={customMeals.lunch}
                          onChange={(e) => setCustomMeals({ ...customMeals, lunch: e.target.value })}
                          placeholder="Ex: Frango grelhado, arroz integral e salada"
                          className="w-full px-3 py-2 bg-white border border-[#EFE6D1] rounded-xl text-xs text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#1F2E1E] mb-1">
                          🍎 Lanche da Tarde:
                        </label>
                        <input
                          type="text"
                          value={customMeals.snack}
                          onChange={(e) => setCustomMeals({ ...customMeals, snack: e.target.value })}
                          placeholder="Ex: Iogurte com castanhas ou fruta"
                          className="w-full px-3 py-2 bg-white border border-[#EFE6D1] rounded-xl text-xs text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#1F2E1E] mb-1">
                          🍲 Jantar habitual:
                        </label>
                        <input
                          type="text"
                          value={customMeals.dinner}
                          onChange={(e) => setCustomMeals({ ...customMeals, dinner: e.target.value })}
                          placeholder="Ex: Sopa de legumes com patinho moído"
                          className="w-full px-3 py-2 bg-white border border-[#EFE6D1] rounded-xl text-xs text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-[#5E6B52]">
                      💡 Estas refeições serão carregadas automaticamente no seu Cardápio Semanal de Segunda a Sexta, integrando com sua dispensa!
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-sm sm:text-base py-3.5 sm:py-4 rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-[#D0F4A4]" />
                <span>Finalizar Cadastro & Iniciar (+100 pts)</span>
              </button>
            </form>
          )}

        </div>

        {/* Security / Badge */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#5E6B52] inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#63D753]" />
            <span>Seus dados, plano e restrições estão seguros e salvos com você</span>
          </p>
        </div>
      </div>

    </div>
  );
};
