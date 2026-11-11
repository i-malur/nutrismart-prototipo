import React from 'react';
import { 
  Apple, 
  Sparkles, 
  CalendarDays, 
  Users, 
  Trophy, 
  Flame, 
  Award,
  PackageCheck,
  ShoppingCart,
  UserCheck,
  LogOut,
  User
} from 'lucide-react';
import { UserProfile, TabType } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  user: UserProfile;
  pantryCount: number;
  shoppingCount?: number;
  onOpenAiAssistant: () => void;
  onOpenUserProfile: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  user,
  pantryCount,
  shoppingCount = 0,
  onOpenAiAssistant,
  onOpenUserProfile,
  onLogout,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; highlight?: boolean; reward?: boolean }[] = [
    { id: 'dispensa', label: 'Dispensa Virtual', icon: PackageCheck, badge: pantryCount },
    { id: 'receitas', label: 'Receitas com IA', icon: Sparkles, highlight: true },
    { id: 'cardapio', label: 'Sugestões & Salvos', icon: CalendarDays },
    { id: 'nutricionistas', label: 'Nutricionistas', icon: Apple },

  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EFE6D1] shadow-xs">
      {/* Top Banner / Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo with uploaded vector mark */}
          <div 
            onClick={() => onSelectTab('dispensa')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white border border-[#EFE6D1] flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-[#63D753] transition-all p-1">
              <Logo size="md" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-[#0C6816]">
                  nutri<span className="text-[#63D753]">smart</span>
                </span>
                <span className="px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold bg-[#D0F4A4] text-[#0C6816] rounded-full border border-[#63D753]/40">
                  IA
                </span>
              </div>
              <p className="text-[11px] text-[#5E6B52] font-medium hidden sm:block">
                Nutrição Personalizada & Inteligente
              </p>
            </div>
          </div>

          {/* User Status Bar & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* User Profile Avatar & Logout (Ocultos em telas menores / mobile) */}
            <div className="hidden md:flex items-center gap-2 sm:gap-4 pl-2 border-l border-[#EFE6D1]">
              
              {/* User Profile Avatar / Cadastro Button */}
              <button 
                onClick={onOpenUserProfile}
                className="flex items-center gap-2 cursor-pointer group bg-transparent text-left"
                id="user-profile-btn"
                title="Editar Perfil, Cadastro e Restrições Alimentares"
              >
                <div className="relative">
                  {/* Ícone Genérico em vez da foto de perfil */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#D0F4A4] border-2 border-[#63D753] group-hover:border-[#0C6816] flex items-center justify-center text-[#0C6816] transition-all">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-[#0C6816] leading-tight group-hover:text-[#63D753] transition-colors">{user.name}</p>
                    <UserCheck className="w-3 h-3 text-[#63D753]" />
                  </div>
                  <p className="text-[10px] text-[#5E6B52] font-medium leading-tight">
                    {user.diet} {user.dietaryRestrictions?.length > 0 ? `• ${user.dietaryRestrictions[0]}` : ''}
                  </p>
                </div>
              </button>

              {/* Sair / Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-[#5E6B52] hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all cursor-pointer"
                title="Sair da conta"
                aria-label="Sair da conta"
                id="nav-logout-btn"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline text-xs font-semibold">Sair</span>
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* Desktop Navigation Tabs (Hidden on mobile to avoid horizontal clutter) */}
      <div className="hidden md:block bg-[#FAF7EE] border-t border-[#EFE6D1]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  className={`
                    whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 relative cursor-pointer
                    ${isActive 
                      ? 'bg-[#0C6816] text-white shadow-xs font-bold' 
                      : 'text-[#5E6B52] hover:text-[#0C6816] hover:bg-[#EFE6D1]/60'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D0F4A4]' : tab.highlight ? 'text-[#63D753]' : 'text-[#5E6B52]'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-[#63D753] text-[#0C6816]' : 'bg-[#EFE6D1] text-[#0C6816]'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};