import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PantryView } from './components/PantryView';
import { RecipesView } from './components/RecipesView';
import { SavedItemsView } from './components/SavedItemsView';
import { NutritionistsView } from './components/NutritionistsView';
import { UserRegisterModal } from './components/UserRegisterModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMoreModal } from './components/MobileMoreModal';
import { AuthScreen } from './components/AuthScreen';
import { AdminModerationView } from './components/AdminModerationView';

import { initialRecipes, initialNutritionists, initialUser } from './data/initialData';
import { TabType, PantryItem, Recipe, Nutritionist, UserProfile } from './types';
import { Sparkles, Bot, LogOut, ShieldCheck } from 'lucide-react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Importações dos serviços do Firebase
import {
  fetchPantryItems,
  addPantryItemFirestore,
  updatePantryItemFirestore,
  deletePantryItemFirestore,
  fetchSavedItems,
  saveItemFirestore,
  deleteSavedItemFirestore,
  addRecipeFirestore, 
  fetchUserRecipes,
  deleteUserRecipeFirestore
} from './services/firestoreService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dispensa');
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUser);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>(initialNutritionists);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  // Modals & Drawers
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleDeleteUserRecipe = async (id: string) => {
    if (!currentUserId) return;
    await deleteUserRecipeFirestore(id, currentUserId);
    setRecipes(prev => prev.filter(r => r.id !== id));
    showToast('Receita removida do seu caderno.');
  };

  // Observa o estado real do Firebase Auth e busca os dados do utilizador no Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUserId(user.uid);
        setCurrentUserEmail(user.email);

        try {
          // Busca o perfil real gravado na raiz da coleção users no Firestore
          const userDocRef = doc(db, `users/${user.uid}`);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserProfile({
              ...initialUser,
              name: data.name || user.email?.split('@')[0] || 'Usuário NutriSmart',
              email: data.email || user.email || '',
              birthDate: data.birthDate || '',
              dietaryRestrictions: data.dietaryRestrictions || [],
              customRestrictions: data.customRestrictions || ''
            });
          } else {
            setUserProfile({
              ...initialUser,
              name: user.email?.split('@')[0] || 'Usuário NutriSmart',
              email: user.email || ''
            });
          }

          // Carrega os dados exclusivos deste UID no Firestore
          const remotePantry = await fetchPantryItems(user.uid);
          setPantryItems(remotePantry);

          const remoteSaved = await fetchSavedItems(user.uid);
          setSavedItems(remoteSaved);

          // CARREGA AS RECEITAS DO CADERNO DO UTILIZADOR
          const remoteRecipes = await fetchUserRecipes(user.uid);
          if (remoteRecipes && remoteRecipes.length > 0) {
            const formattedRecipes = remoteRecipes.map(r => ({
              ...r,
              isUserCreated: true
            }));
            setRecipes([...initialRecipes, ...formattedRecipes]);
          } else {
            setRecipes(initialRecipes);
          }

        } catch (e) {
          console.error("Erro ao carregar dados do Firestore:", e);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUserId(null);
        setCurrentUserEmail(null);
        setPantryItems([]);
        setSavedItems([]);
        setRecipes(initialRecipes);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSaveToLibrary = async (newItem: { type: string; title: string; description: string; content: any }) => {
    if (!currentUserId) return;
    const itemPayload = {
      type: newItem.type,
      title: newItem.title,
      description: newItem.description,
      content: newItem.content
    };

    const docId = await saveItemFirestore(itemPayload, currentUserId);
    const itemToSave = {
      id: docId || `save-${Date.now()}`,
      ...itemPayload,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    setSavedItems(prev => [itemToSave, ...prev]);
    showToast(`📌 "${newItem.title}" foi salvo em Sugestões & Salvos!`);
  };

  const handleDeleteSavedItem = async (id: string) => {
    if (!currentUserId) return;
    await deleteSavedItemFirestore(id, currentUserId);
    setSavedItems(prev => prev.filter(item => item.id !== id));
    showToast('Item removido dos seus salvos.');
  };

  const handleLogin = (user: UserProfile) => {
    setUserProfile(user);
    setIsAuthenticated(true);
    showToast(`Bem-vindo(a) ao NutriSmart, ${user.name}!`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Erro ao encerrar sessão:", e);
    }
    setIsAuthenticated(false);
    setCurrentUserId(null);
    setCurrentUserEmail(null);
    setIsUserModalOpen(false);
    setIsMobileMoreOpen(false);
    setIsAiAssistantOpen(false);
    showToast('Você saiu da sua conta com segurança.');
  };

  const handleSaveUserProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    showToast('Perfil e preferências atualizados com sucesso!');
  };

  // Pantry Handlers com UID real do Firebase
  const handleAddPantryItem = async (newItem: Omit<PantryItem, 'id' | 'addedAt' | 'daysLeft'>) => {
    if (!currentUserId) return;
    const today = new Date();
    let daysLeft = 0;

    if (newItem.expirationDate) {
      const expDate = new Date(newItem.expirationDate);
      const diffTime = expDate.getTime() - today.getTime();
      daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const docId = await addPantryItemFirestore(newItem, currentUserId);
    const item: PantryItem = {
      ...newItem,
      id: docId || `p-${Date.now()}`,
      daysLeft,
      addedAt: today.toISOString().split('T')[0]
    };

    setPantryItems(prev => [item, ...prev]);
    showToast(`"${item.name}" foi adicionado à sua dispensa!`);
  };

  const handleDeletePantryItem = async (id: string) => {
    if (!currentUserId) return;
    const item = pantryItems.find(i => i.id === id);
    await deletePantryItemFirestore(id, currentUserId);
    setPantryItems(prev => prev.filter(i => i.id !== id));
    if (item) {
      showToast(`"${item.name}" foi removido da dispensa.`);
    }
  };

  const handleUpdatePantryQuantity = async (id: string, qty: number) => {
    if (!currentUserId) return;
    const updatedQty = Math.max(0, qty);
    setPantryItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, quantity: updatedQty };
        updatePantryItemFirestore(updatedItem, currentUserId);
        return updatedItem;
      }
      return item;
    }));
  };

  const handleEditPantryItem = async (updatedItem: PantryItem) => {
    if (!currentUserId) return;
    const today = new Date();
    let daysLeft = 0;

    if (updatedItem.expirationDate) {
      const expDate = new Date(updatedItem.expirationDate);
      const diffTime = expDate.getTime() - today.getTime();
      daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const finalItem = { ...updatedItem, daysLeft };
    await updatePantryItemFirestore(finalItem, currentUserId);

    setPantryItems(prev => prev.map(item => item.id === finalItem.id ? finalItem : item));
    showToast(`✏️ "${finalItem.name}" atualizado com sucesso!`);
  };

  const handleAddRecipe = async (newRecipe: Recipe) => {
    if (!currentUserId) return;

    const recipePayload = {
      ...newRecipe,
      isUserCreated: true,
      status: (newRecipe as any).contributeToAcervo ? 'em analise' : 'privado',
      authorName: userProfile.name
    };

    try {
      const docId = await addRecipeFirestore(recipePayload, currentUserId);
      const savedRecipe: Recipe = {
        ...recipePayload,
        id: docId || `rec-${Date.now()}`
      };

      setRecipes(prev => [savedRecipe, ...prev]);
      showToast(`📖 "${newRecipe.title}" salva no seu caderno pessoal!`);
    } catch (error) {
      console.error("Erro ao salvar receita no Firestore:", error);
      showToast('Erro ao salvar receita no banco.');
    }
  };

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        defaultUser={userProfile}
      />
    );
  }

  // SE O USUÁRIO LOGADO FOR O ADMIN OFICIAL DA EQUIPE, EXIBE O PAINEL DE MODERAÇÃO
  if (currentUserEmail === 'teamnutrismart@gmail.com') {
    return (
      <div className="min-h-screen bg-[#FAF7EE] text-[#1F2E1E] flex flex-col font-sans selection:bg-[#D0F4A4] selection:text-[#0C6816]">
        <header className="bg-white border-b border-[#EFE6D1] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0C6816] text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-black text-base text-[#0C6816]">NutriSmart Admin</h1>
              <p className="text-xs text-[#5E6B52]">Painel Restrito da Equipe</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sair da Conta
          </button>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          <AdminModerationView onShowToast={showToast} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#1F2E1E] flex flex-col font-sans selection:bg-[#D0F4A4] selection:text-[#0C6816]">

      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={userProfile}
        pantryCount={pantryItems.length}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenUserProfile={() => setIsUserModalOpen(true)}
        onLogout={handleLogout}
      />

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
            onDeleteUserRecipe={handleDeleteUserRecipe}
            onAddUserRecipe={handleAddRecipe}
          />
        )}

        {activeTab === 'nutricionistas' && (
          <NutritionistsView
            nutritionists={nutritionists}
            user={userProfile}
          />
        )}

      </main>

      <UserRegisterModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={userProfile}
        onSave={handleSaveUserProfile}
        onLogout={handleLogout}
      />

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

      <AiAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        user={userProfile}
        pantryItems={pantryItems}
        onSaveToLibrary={handleSaveToLibrary}
      />

      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pantryCount={pantryItems.length}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenMoreMenu={() => setIsMobileMoreOpen(true)}
        isMoreActive={isMobileMoreOpen}
      />

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

      {toast && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0C6816] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#63D753] text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <span>{toast}</span>
        </div>
      )}

      <footer className="bg-white border-t border-[#EFE6D1] py-5 mt-12 mb-16 md:mb-0 text-center text-xs text-[#5E6B52]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
          <span className="font-display font-black text-[#0C6816]">nutrismart</span>
          <span>— Nutrição personalizada, inteligente e sustentável.</span>
        </div>
      </footer>

    </div>
  );
}