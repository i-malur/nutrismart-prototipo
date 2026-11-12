import React, { useState, useEffect } from 'react';
import { X, User, Check, LogOut, ShieldAlert, FileText, Calendar, Loader2, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../types';
import { requestAccountDeletionFirestore } from '../services/firestoreService';
import { auth } from '../lib/firebase';

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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...user,
        dietaryRestrictions: user.dietaryRestrictions || [],
        customRestrictions: user.customRestrictions || ''
      });
      setShowDeleteConfirm(false);
      setDeleteError(null);
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

  const handleSendDeletionRequest = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Pega o UID real do utilizador autenticado no Firebase Auth ou do objeto user
      const currentUid = auth.currentUser?.uid || user.uid;

      if (!currentUid) {
        throw new Error('Utilizador não autenticado.');
      }

      await requestAccountDeletionFirestore(formData.email, currentUid);
      onClose();
      onLogout();
    } catch (err) {
      console.error(err);
      setDeleteError('Erro ao enviar solicitação. Tente novamente.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">

      {/* Pop-up de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EFE6D1] flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">

            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border-2 border-amber-300 shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-black text-lg text-gray-900">
                Solicitar Exclusão de Conta
              </h3>
              <p className="text-xs text-[#5E6B52] leading-relaxed">
                Insira o seu e-mail cadastrado para enviar um pedido formal de exclusão à nossa equipe. Entraremos em contato no e-mail cadastrado assim que o processo for concluído.
              </p>
            </div>

            {deleteError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs w-full">
                {deleteError}
              </div>
            )}

            <div className="w-full space-y-3 pt-1">
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-600 text-center cursor-not-allowed"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-[#FAF7EE] hover:bg-[#EFE6D1] text-[#5E6B52] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleSendDeletionRequest}
                  className="flex-1 py-2.5 bg-[#0C6816] hover:bg-[#095011] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>Enviar Pedido</span>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Principal de Perfil (Mais largo: max-w-4xl, e mais compacto com paddings menores) */}
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-[#EFE6D1] relative my-4 animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE6D1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D0F4A4] border-2 border-[#63D753] flex items-center justify-center text-[#0C6816]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-[#0C6816]">
                Cadastro & Perfil do Usuário
              </h2>
              <p className="text-[11px] text-[#5E6B52]">
                Configure suas restrições e preferências para recomendações 100% certeiras
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5E6B52] hover:text-[#0C6816] hover:bg-[#FAF7EE] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">

          {/* Dados Cadastrais */}
          <div className="space-y-2.5">
            <h3 className="font-display font-bold text-[11px] uppercase tracking-wider text-[#0C6816] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#63D753]" />
              Dados Cadastrais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#0C6816] mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0C6816] mb-1">Data de Nascimento *</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-[#5E6B52] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={formData.birthDate || ''}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0C6816] mb-1">E-mail *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#EFE6D1]" />

          {/* Restrições Padrão (Chips) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-[11px] uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                Restrições Alimentares & Alergias
              </h3>
              <span className="text-[10px] text-[#5E6B52]">Selecione todas que se aplicam</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {AVAILABLE_RESTRICTIONS.map(item => {
                const isSelected = formData.dietaryRestrictions?.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleRestriction(item)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${isSelected
                        ? 'bg-[#0C6816] text-white border border-[#0C6816] shadow-2xs'
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
            <label className="font-display font-bold text-[11px] uppercase tracking-wider text-[#0C6816] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#63D753]" />
              Restrições Específicas & Preferências Pessoais
            </label>
            <textarea
              rows={2}
              value={formData.customRestrictions || ''}
              onChange={e => setFormData({ ...formData, customRestrictions: e.target.value })}
              placeholder="Ex: Não como carne de porco, evito produtos com pimenta intensa..."
              className="w-full p-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden leading-relaxed resize-none"
            />
          </div>

          {/* Footer de Ações */}
          <div className="pt-3 border-t border-[#EFE6D1] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start flex-wrap">
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
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da Conta</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Excluir Conta</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
            >
              Salvar Perfil & Atualizar Recomendações
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};