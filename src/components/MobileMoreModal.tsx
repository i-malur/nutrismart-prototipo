import React from 'react';
import { 
  CalendarDays, 
  Apple, 
  Users, 
  Trophy, 
  UserCheck, 
  X, 
  ChevronRight,
  Sparkles,
  Flame,
  Award,
  LogOut
} from 'lucide-react';
import { TabType, UserProfile } from '../types';

interface MobileMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  user: UserProfile;
  onOpenUserProfile: () => void;
  onLogout: () => void;
}

export const MobileMoreModal: React.FC<MobileMoreModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  user,
  onOpenUserProfile,
  onLogout
}) => {
  if (!isOpen) return null;

  const handleSelect = (tab: TabType) => {
    onSelectTab(tab);
    onClose();
  };

  const moreItems: { id: TabType; label: string; desc: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    {
      id: 'cardapio',
      label: 'Cardápio Semanal',
      desc: 'Plano completo de 7 dias com 4 refeições diárias',
      icon: CalendarDays,
      badge: 'Nutri'
    },
    {
      id: 'nutricionistas',
      label: 'Nutricionistas Certificados',
      desc: 'Consulte profissionais credenciados com CRN ativo',
      icon: Apple,
      badge: 'CRN'
    },
    {
      id: 'comunidade',
      label: 'Comunidade & Feed',
      desc: 'Troque dicas, receitas e motive-se com outros membros',
      icon: Users,
    },
    {
      id: 'desafios',
      label: 'Desafios & Prêmios',
      desc: 'Conquiste selos, acumule pontos e troque por descontos',
      icon: Trophy,
      badge: `${user.points} pts`
    },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full bg-white rounded-t-3xl border-t border-[#EFE6D1] shadow-2xl p-5 pb-8 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
      >
        {/* Pull handle indicator */}
        <div className="w-12 h-1.5 bg-[#EFE6D1] rounded-full mx-auto -mt-1 mb-2" />

        {/* Modal Handle & Close Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE6D1]">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-[#63D753] rounded-full" />
            <h3 className="font-display font-black text-lg text-[#0C6816]">
              Mais Seções do NutriSmart
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF7EE] text-[#5E6B52] hover:text-[#0C6816] flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Shortcut */}
        <div 
          onClick={() => { onOpenUserProfile(); onClose(); }}
          className="bg-gradient-to-r from-[#FAF7EE] to-[#EFE6D1]/40 border border-[#EFE6D1] p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#63D753] transition-colors"
        >
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-11 h-11 rounded-full object-cover ring-2 ring-[#63D753]" 
            />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-[#0C6816]">{user.name}</p>
                <UserCheck className="w-3.5 h-3.5 text-[#63D753]" />
              </div>
              <p className="text-xs text-[#5E6B52]">
                {user.diet} • {user.streakDays} dias seguidos 🔥
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#0C6816] bg-white px-2.5 py-1 rounded-xl border border-[#EFE6D1]">
            Editar Perfil
          </span>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {moreItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                  isCurrent 
                    ? 'bg-[#0C6816] text-white border-[#0C6816] shadow-sm' 
                    : 'bg-white hover:bg-[#FAF7EE] text-[#1F2E1E] border-[#EFE6D1]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCurrent ? 'bg-[#63D753] text-[#0C6816]' : 'bg-[#D0F4A4] text-[#0C6816]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-[#0C6816]'}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isCurrent ? 'bg-white text-[#0C6816]' : 'bg-[#D0F4A4] text-[#0C6816]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isCurrent ? 'text-[#D0F4A4]' : 'text-[#5E6B52]'}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-[#D0F4A4]' : 'text-[#5E6B52]'}`} />
              </button>
            );
          })}

          {/* Sair da Conta */}
          <button
            type="button"
            onClick={() => { onClose(); onLogout(); }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-red-200 bg-red-50/60 hover:bg-red-50 text-red-700 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-700">Sair da Conta</p>
                <p className="text-xs text-red-500">Voltar para a tela de login e cadastro</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
