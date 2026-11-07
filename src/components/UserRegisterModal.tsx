import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Lock, 
  AlertCircle, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  X,
  HeartPulse,
  Flame,
  Utensils,
  LogOut,
  Clock
} from 'lucide-react';
import { UserProfile, DayPlan } from '../types';

interface UserRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveProfile?: (updated: UserProfile) => void;
  onSave?: (updated: UserProfile) => void;
  onLogout?: () => void;
  weeklyPlan?: DayPlan[];
  onUpdateWeeklyPlan?: (newPlan: DayPlan[]) => void;
}

const COMMON_RESTRICTIONS = [
  'Sem Glúten',
  'Sem Lactose',
  'Sem Açúcar / Diabético',
  'Vegetariano',
  'Vegano',
  'Alergia a Amendoim',
  'Alergia a Frutos do Mar',
  'Alergia a Soja',
  'Alergia a Ovo',
  'Hipertenso (Baixo Sódio)',
];

const DIET_OPTIONS = [
  'Equilibrada',
  'Low Carb',
  'Vegetariana',
  'Vegana',
  'Ganho de Massa (Hipertrofia)',
  'Cetogênica',
  'Econômica & Zero Desperdício'
];

export const UserRegisterModal: React.FC<UserRegisterModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
  onSave,
  onLogout,
  weeklyPlan,
  onUpdateWeeklyPlan,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [birthDate, setBirthDate] = useState(user.birthDate || '1996-05-14');
  const [password, setPassword] = useState(user.password || '••••••••');
  const [diet, setDiet] = useState(user.diet || 'Equilibrada');
  const [restrictions, setRestrictions] = useState<string[]>(user.dietaryRestrictions || ['Sem Glúten']);
  const [calorieTarget, setCalorieTarget] = useState(user.calorieTarget || 2000);

  // Segunda a Sexta Meal Plan
  const [showMealPlanSection, setShowMealPlanSection] = useState(false);
  const [customMeals, setCustomMeals] = useState({
    breakfast: weeklyPlan && weeklyPlan[0] ? weeklyPlan[0].breakfast?.name || '' : '',
    lunch: weeklyPlan && weeklyPlan[0] ? weeklyPlan[0].lunch?.name || '' : '',
    snack: weeklyPlan && weeklyPlan[0] ? weeklyPlan[0].snack?.name || '' : '',
    dinner: weeklyPlan && weeklyPlan[0] ? weeklyPlan[0].dinner?.name || '' : '',
  });

  if (!isOpen) return null;

  const toggleRestriction = (item: string) => {
    setRestrictions(prev => 
      prev.includes(item) ? prev.filter(r => r !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const updatedProfile: UserProfile = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      birthDate,
      password,
      diet,
      dietaryRestrictions: restrictions,
      allergies: restrictions.filter(r => r.toLowerCase().includes('alergia') || r.includes('Amendoim')),
      pantryUsageType: 'residencial',
      calorieTarget: Number(calorieTarget) || 2000,
    };

    if (onSaveProfile) {
      onSaveProfile(updatedProfile);
    } else if (onSave) {
      onSave(updatedProfile);
    }

    if (showMealPlanSection && weeklyPlan && onUpdateWeeklyPlan) {
      const updatedPlan = weeklyPlan.map((day, idx) => {
        if (idx <= 4) {
          return {
            ...day,
            breakfast: customMeals.breakfast.trim() ? {
              ...day.breakfast,
              name: customMeals.breakfast.trim(),
              description: `Personalizado no perfil (${diet})`
            } : day.breakfast,
            lunch: customMeals.lunch.trim() ? {
              ...day.lunch,
              name: customMeals.lunch.trim(),
              description: `Personalizado no perfil (${diet})`
            } : day.lunch,
            snack: customMeals.snack.trim() ? {
              ...day.snack,
              name: customMeals.snack.trim(),
              description: `Personalizado no perfil (${diet})`
            } : day.snack,
            dinner: customMeals.dinner.trim() ? {
              ...day.dinner,
              name: customMeals.dinner.trim(),
              description: `Personalizado no perfil (${diet})`
            } : day.dinner,
          };
        }
        return day;
      });
      onUpdateWeeklyPlan(updatedPlan);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-8 shadow-2xl border border-[#EFE6D1] relative animate-in fade-in zoom-in-95 duration-200 space-y-5 sm:space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-[#EFE6D1]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#D0F4A4] text-[#0C6816] flex items-center justify-center shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-[#0C6816]">
                Cadastro & Perfil do Usuário
              </h2>
              <p className="text-[11px] sm:text-xs text-[#5E6B52] leading-tight">
                Configure suas restrições e preferências para recomendações 100% certeiras
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#5E6B52] hover:text-[#0C6816] font-bold text-lg w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-[#FAF7EE] hover:bg-[#EFE6D1] transition-colors cursor-pointer active:scale-95 shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Dados Pessoais Básicos */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#0C6816] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#63D753]" />
              Dados Cadastrais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F2E1E] mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5E6B52] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs sm:text-sm text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2E1E] mb-1">
                  Data de Nascimento *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#5E6B52] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs sm:text-sm text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2E1E] mb-1">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5E6B52] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs sm:text-sm text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2E1E] mb-1">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#5E6B52] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs sm:text-sm text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dieta e Objetivo */}
          <div className="space-y-3 pt-2 border-t border-[#EFE6D1]">
            <h3 className="text-xs font-bold text-[#0C6816] uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-[#63D753]" />
              Dieta ou Objetivo Nutricional
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F2E1E] mb-1">
                  Qual dieta você segue atualmente?
                </label>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs sm:text-sm text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                >
                  {DIET_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2E1E] mb-1">
                  Meta Calórica Diária (kcal)
                </label>
                <div className="relative">
                  <Flame className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={calorieTarget}
                    onChange={(e) => setCalorieTarget(Number(e.target.value))}
                    min={1200}
                    max={4500}
                    step={50}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7EE] border border-[#EFE6D1] rounded-xl text-xs sm:text-sm text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Restrições Alimentares */}
          <div className="space-y-2 pt-2 border-t border-[#EFE6D1]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#0C6816] uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                Restrições Alimentares & Alergias
              </h3>
              <span className="text-[11px] text-[#5E6B52]">Selecione todas que se aplicam</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {COMMON_RESTRICTIONS.map(item => {
                const isSelected = restrictions.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleRestriction(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0C6816] text-white shadow-xs'
                        : 'bg-[#FAF7EE] text-[#5E6B52] border border-[#EFE6D1] hover:bg-[#EFE6D1]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plano Alimentar de Segunda a Sexta */}
          <div className="space-y-3 pt-2 border-t border-[#EFE6D1]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#0C6816] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#63D753]" />
                  Plano Alimentar de Segunda a Sexta
                </h3>
                <p className="text-[11px] text-[#5E6B52]">
                  Defina o que você costuma comer todos os dias nos dias úteis
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMealPlanSection(!showMealPlanSection)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  showMealPlanSection
                    ? 'bg-[#0C6816] text-white border-[#0C6816]'
                    : 'bg-[#FAF7EE] text-[#0C6816] border-[#0C6816]/30'
                }`}
              >
                {showMealPlanSection ? 'Ocultar' : '+ Ajustar Refeições'}
              </button>
            </div>

            {showMealPlanSection && (
              <div className="bg-[#FAF7EE] p-4 rounded-2xl border border-[#EFE6D1] space-y-3 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1F2E1E] mb-1">
                      ☕ Café da Manhã (Seg a Sex):
                    </label>
                    <input
                      type="text"
                      value={customMeals.breakfast}
                      onChange={(e) => setCustomMeals({ ...customMeals, breakfast: e.target.value })}
                      placeholder="Ex: Ovos mexidos com café"
                      className="w-full px-3 py-2 bg-white border border-[#EFE6D1] rounded-xl text-xs text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1F2E1E] mb-1">
                      🥗 Almoço (Seg a Sex):
                    </label>
                    <input
                      type="text"
                      value={customMeals.lunch}
                      onChange={(e) => setCustomMeals({ ...customMeals, lunch: e.target.value })}
                      placeholder="Ex: Salada com frango e arroz integral"
                      className="w-full px-3 py-2 bg-white border border-[#EFE6D1] rounded-xl text-xs text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1F2E1E] mb-1">
                      🍎 Lanche da Tarde (Seg a Sex):
                    </label>
                    <input
                      type="text"
                      value={customMeals.snack}
                      onChange={(e) => setCustomMeals({ ...customMeals, snack: e.target.value })}
                      placeholder="Ex: Iogurte grego ou frutas"
                      className="w-full px-3 py-2 bg-white border border-[#EFE6D1] rounded-xl text-xs text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1F2E1E] mb-1">
                      🍲 Jantar (Seg a Sex):
                    </label>
                    <input
                      type="text"
                      value={customMeals.dinner}
                      onChange={(e) => setCustomMeals({ ...customMeals, dinner: e.target.value })}
                      placeholder="Ex: Sopa leve de legumes ou wrap"
                      className="w-full px-3 py-2 bg-white border border-[#EFE6D1] rounded-xl text-xs text-[#1F2E1E] focus:outline-hidden focus:border-[#63D753]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-[#EFE6D1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#5E6B52] hover:text-[#0C6816] hover:bg-[#FAF7EE] rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Desconectar do aplicativo e ir para tela de login"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Sair da Conta</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0C6816] hover:bg-[#095011] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#D0F4A4]" />
              <span>Salvar Perfil & Atualizar Recomendações</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
