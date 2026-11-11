import React, { useState } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  PantryView 
} from './components/PantryView';
import { 
  RecipesView 
} from './components/RecipesView';
import { 
  SavedItemsView 
} from './components/SavedItemsView';
import { 
  NutritionistsView 
} from './components/NutritionistsView';
import { 
  UserRegisterModal 
} from './components/UserRegisterModal';
import { 
  AiAssistantDrawer 
} from './components/AiAssistantDrawer';
import {
  MobileBottomNav
} from './components/MobileBottomNav';
import {
  MobileMoreModal
} from './components/MobileMoreModal';
import {
  AuthScreen
} from './components/AuthScreen';

import {
  initialPantry,
  initialRecipes,
  initialNutritionists,
  initialUser
} from './data/initialData';

import {
  TabType,
  PantryItem,
  Recipe,
  Nutritionist,
  UserProfile
} from './types';
import { Sparkles, Bot } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('dispensa');
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUser);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(initialPantry);
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>(initialNutritionists);

  // ESTADO GLOBAL DE ITENS SALVOS (COM SUPORTE A LOCALSTORAGE)
  const [savedItems, setSavedItems] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('nutrismart_saved_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Drawers
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // FUNÇÃO PARA ADICIONAR ITEM AOS SALVOS E ATUALIZAR O LOCALSTORAGE
  const handleSaveToLibrary = (newItem: { type: string; title: string; description: string; content: any }) => {
    const itemToSave = {
      id: `save-${Date.now()}`,
      type: newItem.type,
      title: newItem.title,
      description: newItem.description,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      content: newItem.content
    };

    setSavedItems(prev => {
      const updated = [itemToSave, ...prev];
      try {
        localStorage.setItem('nutrismart_saved_items', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    showToast(`📌 "${newItem.title}" foi salvo em Sugestões & Salvos!`);
  };

  const handleDeleteSavedItem = (id: string) => {
    setSavedItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('nutrismart_saved_items', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showToast('🗑️ Item removido dos seus salvos.');
  };

  const handleLogin = (user: UserProfile) => {
    setUserProfile(user);
    setIsAuthenticated(true);
    showToast(`👋 Bem-vindo(a) ao NutriSmart, ${user.name}!`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsUserModalOpen(false);
    setIsMobileMoreOpen(false);
    setIsAiAssistantOpen(false);
    showToast('🔒 Você saiu da sua conta com segurança.');
  };

  const handleSaveUserProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    showToast('👤 Perfil e preferências atualizados com sucesso!');
  };

  // Pantry Handlers
  const handleAddPantryItem = (newItem: Omit<PantryItem, 'id' | 'addedAt' | 'daysLeft'>) => {
    const today = new Date();
    let daysLeft = 0;

    if (newItem.expirationDate) {
      const expDate = new Date(newItem.expirationDate);
      const diffTime = expDate.getTime() - today.getTime();
      daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const item: PantryItem = {
      ...newItem,
      id: `p-${Date.now()}`,
      daysLeft,
      addedAt: today.toISOString().split('T')[0]
    };
    setPantryItems(prev => [item, ...prev]);
    showToast(`✅ "${item.name}" foi adicionado à sua dispensa!`);
  };

  const handleDeletePantryItem = (id: string) => {
    const item = pantryItems.find(i => i.id === id);
    setPantryItems(prev => prev.filter(i => i.id !== id));
    if (item) {
      showToast(`🗑️ "${item.name}" foi removido da dispensa.`);
    }
  };

  const handleUpdatePantryQuantity = (id: string, qty: number) => {
    setPantryItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, qty) } : item));
  };

  const handleEditPantryItem = (updatedItem: PantryItem) => {
    const today = new Date();
    let daysLeft = 0;

    if (updatedItem.expirationDate) {
      const expDate = new Date(updatedItem.expirationDate);
      const diffTime = expDate.getTime() - today.getTime();
      daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    setPantryItems(prev => prev.map(item => item.id === updatedItem.id ? { ...updatedItem, daysLeft } : item));
    showToast(`✏️ "${updatedItem.name}" atualizado com sucesso!`);
  };

  // Recipe Handlers
  const handleAddRecipe = (newRecipe: Recipe) => {
    setRecipes(prev => [newRecipe, ...prev]);
    showToast(`📖 "${newRecipe.title}" salva no seu caderno pessoal!`);
  };

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        defaultUser={userProfile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#1F2E1E] flex flex-col font-sans selection:bg-[#D0F4A4] selection:text-[#0C6816]">

      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={userProfile}
        pantryCount={pantryItems.length}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenUserProfile={() => setIsUserModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 md:pb-8">

        {activeTab === 'dispensa' && (
          <PantryView
            pantryItems={pantryItems}
            user={userProfile}
            onAddItem={handleAddPantryItem}
            onEditItem={handleEditPantryItem}
            onDeleteItem={handleDeletePantryItem}
            onUpdateQuantity={handleUpdatePantryQuantity}
            onGenerateRecipesWithPantry={() => setActiveTab('receitas')}
            onNavigateToRecipes={() => setActiveTab('receitas')}
          />
        )}

        {activeTab === 'receitas' && (
          <RecipesView
            recipes={recipes}
            pantryItems={pantryItems}
            user={userProfile}
            userName={userProfile.name}
            onAddRecipe={handleAddRecipe}
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}

        {activeTab === 'cardapio' && (
          <SavedItemsView
            user={userProfile}
            pantryItems={pantryItems}
            items={savedItems}
            userRecipes={recipes.filter(r => r.isUserCreated)}
            onDeleteItem={handleDeleteSavedItem}
          />
        )}

        {activeTab === 'nutricionistas' && (
          <NutritionistsView
            nutritionists={nutritionists}
            user={userProfile}
          />
        )}

      </main>

      {/* User Registration & Profile Management Modal */}
      <UserRegisterModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={userProfile}
        onSave={handleSaveUserProfile}
        onLogout={handleLogout}
      />

      {/* Floating Quick AI Assistant Bubble */}
      <button
        onClick={() => setIsAiAssistantOpen(true)}
        id="floating-ai-assistant-btn"
        className="hidden md:flex fixed bottom-6 right-6 z-40 bg-[#0C6816] hover:bg-[#095011] text-white px-5 py-3.5 rounded-2xl shadow-xl items-center gap-3 border-2 border-[#63D753] transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        aria-label="Abrir Assistente NutriSmart IA"
      >
        <div className="w-8 h-8 rounded-xl bg-[#63D753] text-[#0C6816] flex items-center justify-center font-bold">
          <Bot className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-semibold text-[#D0F4A4] uppercase tracking-wider">NutriSmart IA</p>
          <p className="text-xs font-bold text-white">Perguntar ao Assistente</p>
        </div>
        <Sparkles className="w-4 h-4 text-[#D0F4A4] animate-pulse" />
      </button>

      {/* AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        user={userProfile}
        pantryItems={pantryItems}
        onSaveToLibrary={handleSaveToLibrary}
      />

      {/* Mobile-First Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pantryCount={pantryItems.length}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenMoreMenu={() => setIsMobileMoreOpen(true)}
        isMoreActive={isMobileMoreOpen}
      />

      {/* Mobile Overflow Menu Modal */}
      <MobileMoreModal
        isOpen={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenUserProfile={() => setIsUserModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        user={userProfile}
        onLogout={handleLogout}
      />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0C6816] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#63D753] text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <span>{toast}</span>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-[#EFE6D1] py-5 mt-12 mb-16 md:mb-0 text-center text-xs text-[#5E6B52]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
          <span className="font-display font-black text-[#0C6816]">nutrismart</span>
          <span>— Nutrição personalizada, inteligente e sustentável.</span>
        </div>
      </footer>

    </div>
  );
}