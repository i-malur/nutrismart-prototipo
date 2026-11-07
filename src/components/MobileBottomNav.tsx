import React from 'react';
import { 
  PackageCheck, 
  Sparkles, 
  CalendarDays, 
  ShoppingCart, 
  Bot,
  User,
  MoreHorizontal
} from 'lucide-react';
import { TabType } from '../types';

interface MobileBottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pantryCount: number;
  shoppingCount?: number;
  onOpenAiAssistant: () => void;
  onOpenMoreMenu: () => void;
  isMoreActive?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  pantryCount,
  shoppingCount = 0,
  onOpenAiAssistant,
  onOpenMoreMenu,
  isMoreActive = false
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#EFE6D1] shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        
        {/* 1. Dispensa */}
        <button
          type="button"
          onClick={() => onSelectTab('dispensa')}
          className={`flex flex-col items-center justify-center h-full w-full relative transition-colors ${
            activeTab === 'dispensa' ? 'text-[#0C6816]' : 'text-[#5E6B52]'
          }`}
        >
          <div className="relative">
            <PackageCheck className={`w-5 h-5 ${activeTab === 'dispensa' ? 'text-[#0C6816] stroke-[2.5]' : 'text-[#5E6B52]'}`} />
            {pantryCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#63D753] text-[#0C6816] font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {pantryCount > 99 ? '99+' : pantryCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] mt-1 font-bold ${activeTab === 'dispensa' ? 'text-[#0C6816]' : 'text-[#5E6B52]'}`}>
            Dispensa
          </span>
          {activeTab === 'dispensa' && (
            <span className="absolute bottom-1 w-5 h-0.5 bg-[#0C6816] rounded-full" />
          )}
        </button>

        {/* 2. Receitas */}
        <button
          type="button"
          onClick={() => onSelectTab('receitas')}
          className={`flex flex-col items-center justify-center h-full w-full relative transition-colors ${
            activeTab === 'receitas' ? 'text-[#0C6816]' : 'text-[#5E6B52]'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${activeTab === 'receitas' ? 'text-[#0C6816] stroke-[2.5]' : 'text-[#63D753]'}`} />
          <span className={`text-[10px] mt-1 font-bold ${activeTab === 'receitas' ? 'text-[#0C6816]' : 'text-[#5E6B52]'}`}>
            Receitas
          </span>
          {activeTab === 'receitas' && (
            <span className="absolute bottom-1 w-5 h-0.5 bg-[#0C6816] rounded-full" />
          )}
        </button>

        {/* 3. Botão Central: IA NutriSmart (Destaque redondo) */}
        <button
          type="button"
          onClick={onOpenAiAssistant}
          className="flex flex-col items-center justify-center -mt-5 group"
          title="Falar com a IA NutriSmart"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-br from-[#63D753] via-[#0C6816] to-[#0C6816] text-white flex items-center justify-center shadow-lg shadow-[#0C6816]/30 border-4 border-white transition-transform active:scale-95 group-hover:scale-105">
            <Bot className="w-6 h-6 text-[#D0F4A4]" />
          </div>
          <span className="text-[10px] mt-0.5 font-black text-[#0C6816] tracking-tight">
            IA Nutri
          </span>
        </button>

        {/* 4. Compras */}
        <button
          type="button"
          onClick={() => onSelectTab('compras')}
          className={`flex flex-col items-center justify-center h-full w-full relative transition-colors ${
            activeTab === 'compras' ? 'text-[#0C6816]' : 'text-[#5E6B52]'
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`w-5 h-5 ${activeTab === 'compras' ? 'text-[#0C6816] stroke-[2.5]' : 'text-[#5E6B52]'}`} />
            {shoppingCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#0C6816] text-[#D0F4A4] font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {shoppingCount > 99 ? '99+' : shoppingCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] mt-1 font-bold ${activeTab === 'compras' ? 'text-[#0C6816]' : 'text-[#5E6B52]'}`}>
            Compras
          </span>
          {activeTab === 'compras' && (
            <span className="absolute bottom-1 w-5 h-0.5 bg-[#0C6816] rounded-full" />
          )}
        </button>

        {/* 5. Mais Opções (Cardápio, Nutris, Comunidade, Desafios) */}
        <button
          type="button"
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center h-full w-full relative transition-colors ${
            isMoreActive || ['cardapio', 'nutricionistas', 'comunidade', 'desafios'].includes(activeTab) 
              ? 'text-[#0C6816]' 
              : 'text-[#5E6B52]'
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 ${
            isMoreActive || ['cardapio', 'nutricionistas', 'comunidade', 'desafios'].includes(activeTab)
              ? 'text-[#0C6816] stroke-[2.5]'
              : 'text-[#5E6B52]'
          }`} />
          <span className={`text-[10px] mt-1 font-bold ${
            isMoreActive || ['cardapio', 'nutricionistas', 'comunidade', 'desafios'].includes(activeTab)
              ? 'text-[#0C6816]'
              : 'text-[#5E6B52]'
          }`}>
            Mais
          </span>
          {['cardapio', 'nutricionistas', 'comunidade', 'desafios'].includes(activeTab) && (
            <span className="absolute bottom-1 w-5 h-0.5 bg-[#0C6816] rounded-full" />
          )}
        </button>

      </div>
    </div>
  );
};
