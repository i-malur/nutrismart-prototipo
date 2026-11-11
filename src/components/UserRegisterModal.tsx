import React, { useState, useEffect } from 'react';
import { X, User, Check, LogOut, ShieldAlert, FileText } from 'lucide-react';
import { UserProfile } from '../types';

interface UserRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updatedUser: UserProfile) => void;
  onLogout: () => void;
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
  'SÍNDROME DO INTESTINO IRRITÁVEL (FODMAP)',
  'Religiosa / Halal / Kosher'
];

export const UserRegisterModal: React.FC<UserRegisterModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  onLogout,
}) => {
  const [formData, setFormData] = useState<UserProfile>({
    ...user,
    dietaryRestrictions: user.dietaryRestrictions || [],
    customRestrictions: user.customRestrictions || ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...user,
        dietaryRestrictions: user.dietaryRestrictions || [],
        customRestrictions: user.customRestrictions || ''
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const toggleRestriction = (restriction: string) => {
    setFormData(prev => {
      const exists = prev.dietaryRestrictions.includes(restriction);
      return {
        ...prev,
        dietaryRestrictions: exists
          ? prev.dietaryRestrictions.filter(r => r !== restriction)
          : [...prev.dietaryRestrictions, restriction]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EFE6D1] relative my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#EFE6D1]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D0F4A4] border-2 border-[#63D753] flex items-center justify-center text-[#0C6816]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0C6816]">
                Cadastro & Perfil do Usuário
              </h2>
              <p className="text-xs sm:text-sm text-[#5E6B52]">
                Configure suas restrições e preferências para recomendações 100% certeiras
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#5E6B52] hover:text-[#0C6816] hover:bg-[#FAF7EE] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          
          {/* Dados Cadastrais */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#0C6816] flex items-center gap-2">
              <User className="w-4 h-4 text-[#63D753]" />
              Dados Cadastrais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Data de Nascimento</label>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={formData.birthDate || ''}
                  onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">E-mail *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Senha de Acesso</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password || ''}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#EFE6D1]" />

          {/* Restrições Padrão (Chips) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-rose-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Restrições Alimentares & Alergias
              </h3>
              <span className="text-[11px] text-[#5E6B52]">Selecione todas que se aplicam</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_RESTRICTIONS.map(item => {
                const isSelected = formData.dietaryRestrictions?.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleRestriction(item)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0C6816] text-white border border-[#0C6816] shadow-2xs'
                        : 'bg-[#FAF7EE] hover:bg-[#EFE6D1] text-[#1F2E1E] border border-[#EFE6D1]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#63D753]" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Restrições Específicas / Texto Livre */}
          <div className="space-y-2">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-[#0C6816] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#63D753]" />
              Restrições Específicas & Preferências Pessoais
            </label>
            <p className="text-[11px] text-[#5E6B52]">
              Digite ingredientes que você não consome ou não gosta (ex.: <i>Não como carne de porco, evito coentro, alérgico a gergelim</i>).
            </p>
            <textarea
              rows={3}
              value={formData.customRestrictions || ''}
              onChange={e => setFormData({ ...formData, customRestrictions: e.target.value })}
              placeholder="Ex: Não como carne de porco, evito produtos com pimenta intensa..."
              className="w-full p-3.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-2xl text-xs text-[#1F2E1E] outline-hidden leading-relaxed resize-none"
            />
          </div>

          {/* Footer de Ações */}
          <div className="pt-4 border-t border-[#EFE6D1] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-[#5E6B52] hover:text-[#0C6816] cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={() => { onClose(); onLogout(); }}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer active:scale-95"
            >
              Salvar Perfil & Atualizar Recomendações
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};