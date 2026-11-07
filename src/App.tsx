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
  WeeklyPlanView 
} from './components/WeeklyPlanView';
import { 
  NutritionistsView 
} from './components/NutritionistsView';
import { 
  CommunityView 
} from './components/CommunityView';
import { 
  ChallengesView 
} from './components/ChallengesView';
import { 
  ShoppingListView 
} from './components/ShoppingListView';
import { 
  DailyMenuCard 
} from './components/DailyMenuCard';
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
  initialWeeklyPlan,
  initialNutritionists,
  initialCommunityPosts,
  initialChallenges,
  initialCoupons,
  initialUser,
  initialShoppingList
} from './data/initialData';

import {
  TabType,
  PantryItem,
  Recipe,
  DayPlan,
  Nutritionist,
  CommunityPost,
  Challenge,
  RewardCoupon,
  UserProfile,
  FoodCategory,
  ShoppingListItem
} from './types';
import { Sparkles, Bot } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('dispensa');
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUser);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(initialPantry);
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(() => {
    try {
      const saved = localStorage.getItem('nutrismart_weekly_plan');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return initialWeeklyPlan;
  });
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>(initialNutritionists);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(initialCommunityPosts);
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [rewards, setRewards] = useState<RewardCoupon[]>(initialCoupons);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(initialShoppingList);
  
  // Modals & Drawers
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
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

  // Shopping List Handlers
  const handleToggleShoppingItem = (id: string) => {
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, isChecked: !i.isChecked } : i));
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(i => i.id !== id));
  };

  const handleAddShoppingItem = (newItem: Omit<ShoppingListItem, 'id' | 'addedAt'>) => {
    const item: ShoppingListItem = {
      ...newItem,
      id: `shop-${Date.now()}`,
      addedAt: new Date().toISOString().split('T')[0]
    };
    setShoppingList(prev => [item, ...prev]);
    showToast(`🛒 "${item.name}" adicionado à sua Lista de Compras!`);
  };

  const handleMoveBoughtToPantry = (boughtItems: ShoppingListItem[]) => {
    const boughtIds = new Set(boughtItems.map(b => b.id));
    const newPantryEntries: PantryItem[] = boughtItems.map(item => ({
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      brand: 'Mercado',
      expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysLeft: 14,
      addedAt: new Date().toISOString().split('T')[0],
      notes: 'Comprado pelo checklist inteligente'
    }));

    setPantryItems(prev => [...newPantryEntries, ...prev]);
    setShoppingList(prev => prev.filter(i => !boughtIds.has(i.id)));
    showToast(`🎉 ${boughtItems.length} item(s) comprados movidos com sucesso para sua Dispensa Virtual!`);
  };

  const handleClearCheckedShopping = () => {
    setShoppingList(prev => prev.filter(i => !i.isChecked));
    showToast('🧹 Itens marcados removidos da lista.');
  };

  const handleAddToShoppingListFromPantry = (item: PantryItem) => {
    const exists = shoppingList.find(i => i.name.toLowerCase() === item.name.toLowerCase());
    if (exists) {
      showToast(`🛒 "${item.name}" já está na sua Lista de Compras!`);
      return;
    }
    const newItem: ShoppingListItem = {
      id: `shop-${Date.now()}`,
      name: item.name,
      category: item.category,
      quantity: 1,
      unit: item.unit,
      estimatedPrice: 12.0,
      isChecked: false,
      source: 'Dispensa Baixa',
      addedAt: new Date().toISOString().split('T')[0]
    };
    setShoppingList(prev => [newItem, ...prev]);
    showToast(`🛒 "${item.name}" adicionado à Lista de Compras para reposição!`);
  };

  const handleAddMissingIngredientsToShoppingList = (ingredients: string[]) => {
    const newItems: ShoppingListItem[] = ingredients.map((ing, idx) => ({
      id: `shop-${Date.now()}-${idx}`,
      name: ing,
      category: 'Outros',
      quantity: 1,
      unit: 'unid',
      estimatedPrice: 8.0,
      isChecked: false,
      source: 'Receita',
      addedAt: new Date().toISOString().split('T')[0]
    }));
    setShoppingList(prev => [...newItems, ...prev]);
    showToast(`🛒 ${ingredients.length} ingrediente(s) adicionados à sua Lista de Compras!`);
  };

  const handleSaveUserProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    showToast('👤 Perfil e preferências atualizados com sucesso!');
  };

  const handleUpdateWeeklyPlan = (newPlan: DayPlan[]) => {
    setWeeklyPlan(newPlan);
    try {
      localStorage.setItem('nutrismart_weekly_plan', JSON.stringify(newPlan));
    } catch {
      // ignore in iframe
    }
  };

  // Pantry Handlers
  const handleAddPantryItem = (newItem: Omit<PantryItem, 'id' | 'addedAt' | 'daysLeft'>) => {
    const today = new Date();
    const expDate = new Date(newItem.expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

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
    const expDate = new Date(updatedItem.expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    setPantryItems(prev => prev.map(item => item.id === updatedItem.id ? { ...updatedItem, daysLeft } : item));
    showToast(`✏️ "${updatedItem.name}" atualizado com sucesso!`);
  };

  // Recipe Handlers
  const handleAddRecipe = (newRecipe: Recipe) => {
    setRecipes(prev => [newRecipe, ...prev]);
    setUserProfile(prev => ({ ...prev, points: prev.points + 30 }));
    if (newRecipe.contributeToAcervo) {
      showToast(`📖 "${newRecipe.title}" salva no seu caderno e enviada para moderação no Acervo (+30 pts)!`);
    } else {
      showToast(`📖 "${newRecipe.title}" salva no seu caderno pessoal (+30 pts)!`);
    }
  };

  const handleShareToCommunity = (recipe: Recipe) => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: userProfile.name,
      authorAvatar: userProfile.avatar,
      authorBadge: userProfile.levelTitle,
      timeAgo: 'Agora',
      content: `Acabei de preparar esta receita incrível sugerida pela IA do NutriSmart: "${recipe.title}". Super prática, nutritiva e aproveitou ingredientes que já estavam na minha dispensa!`,
      recipeTitle: recipe.title,
      imageUrl: recipe.imageUrl,
      likesCount: 1,
      hasLiked: true,
      comments: [],
      tags: ['NutriSmartReceitas', 'ZeroDesperdício', ...recipe.tags.slice(0, 2)]
    };
    setCommunityPosts(prev => [newPost, ...prev]);
    setActiveTab('comunidade');
    showToast('🎉 Receita compartilhada com sucesso no Feed da Comunidade!');
  };

  // Weekly Plan Handlers
  const handleRegenerateWeeklyPlan = async (goal: string, calories: number) => {
    try {
      const res = await fetch('/api/ai/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pantryItems,
          preferences: [goal],
          targetCalories: calories,
          daysCount: 7
        })
      });

      const data = await res.json();
      if (data.weeklyPlan && data.weeklyPlan.length > 0) {
        setWeeklyPlan(data.weeklyPlan);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Community Handlers
  const handleAddCommunityPost = (postData: Omit<CommunityPost, 'id' | 'timeAgo' | 'likesCount' | 'hasLiked' | 'comments'>) => {
    const newPost: CommunityPost = {
      ...postData,
      id: `post-${Date.now()}`,
      timeAgo: 'Agora',
      likesCount: 0,
      hasLiked: false,
      comments: []
    };
    setCommunityPosts(prev => [newPost, ...prev]);
    setUserProfile(prev => ({ ...prev, points: prev.points + 50 }));
    showToast('✨ Publicação realizada com sucesso (+50 pontos)!');
  };

  const handleLikeCommunityPost = (postId: string) => {
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.hasLiked;
        return {
          ...p,
          hasLiked: nextLiked,
          likesCount: nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId: string, commentText: string) => {
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: `comm-${Date.now()}`,
              authorName: userProfile.name,
              authorAvatar: userProfile.avatar,
              authorBadge: userProfile.levelTitle,
              text: commentText,
              timeAgo: 'Agora'
            }
          ]
        };
      }
      return p;
    }));
    setUserProfile(prev => ({ ...prev, points: prev.points + 15 }));
  };

  // Nutritionists Handlers
  const handleRegisterNutritionist = (data: Omit<Nutritionist, 'id' | 'verified' | 'rating' | 'reviewsCount'>) => {
    const newNutri: Nutritionist = {
      ...data,
      id: `nutri-${Date.now()}`,
      verified: false,
      status: 'in_review',
      rating: 5.0,
      reviewsCount: 0
    };
    setNutritionists(prev => [newNutri, ...prev]);
    showToast(`📋 Cadastro de "${newNutri.name}" recebido! Em análise pela equipe.`);
  };

  // Challenges Handlers
  const handleUpdateChallengeProgress = (challengeId: string) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id === challengeId) {
        const nextProgress = Math.min(ch.target, ch.progress + 1);
        const justCompleted = nextProgress >= ch.target && ch.progress < ch.target;
        if (justCompleted) {
          setUserProfile(u => ({ ...u, points: u.points + ch.pointsReward }));
          showToast(`🏆 Parabéns! Desafio "${ch.title}" concluído (+${ch.pointsReward} pontos)!`);
        }
        return {
          ...ch,
          progress: nextProgress
        };
      }
      return ch;
    }));
  };

  const handleClaimReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    setUserProfile(u => ({ ...u, points: Math.max(0, u.points - reward.pointsCost) }));
    setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, isClaimed: true } : r));
    showToast(`🎁 Cupom "${reward.title}" resgatado com sucesso!`);
  };

  // Se o usuário não estiver autenticado, exibe a tela cheia de Login & Cadastro
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        defaultUser={userProfile}
        weeklyPlan={weeklyPlan}
        onUpdateWeeklyPlan={handleUpdateWeeklyPlan}
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
        shoppingCount={shoppingList.filter(i => !i.isChecked).length}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenUserProfile={() => setIsUserModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 md:pb-8">
        
        {/* Sugestão de Cardápio Diário Inteligente no Topo da Home/Dispensa ou Cardápio */}
        {(activeTab === 'dispensa' || activeTab === 'cardapio') && (
          <DailyMenuCard
            dayPlan={weeklyPlan[0]}
            user={userProfile}
            pantryItems={pantryItems}
            onRegenerateDaily={() => handleRegenerateWeeklyPlan(userProfile.diet, 2000)}
            onViewWeeklyPlan={() => setActiveTab('cardapio')}
            onAddMissingToShoppingList={handleAddMissingIngredientsToShoppingList}
          />
        )}

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
            onAddToShoppingList={handleAddToShoppingListFromPantry}
          />
        )}

        {activeTab === 'receitas' && (
          <RecipesView
            recipes={recipes}
            pantryItems={pantryItems}
            userName={userProfile.name}
            onAddRecipe={handleAddRecipe}
            onShareToCommunity={handleShareToCommunity}
            onAddMissingToShoppingList={handleAddMissingIngredientsToShoppingList}
          />
        )}

        {activeTab === 'compras' && (
          <ShoppingListView
            shoppingList={shoppingList}
            user={userProfile}
            pantryItems={pantryItems}
            onToggleItem={handleToggleShoppingItem}
            onDeleteItem={handleDeleteShoppingItem}
            onAddItem={handleAddShoppingItem}
            onMoveBoughtToPantry={handleMoveBoughtToPantry}
            onClearChecked={handleClearCheckedShopping}
          />
        )}

        {activeTab === 'cardapio' && (
          <WeeklyPlanView
            weeklyPlan={weeklyPlan}
            onRegeneratePlan={handleRegenerateWeeklyPlan}
            onUpdateWeeklyPlan={handleUpdateWeeklyPlan}
          />
        )}

        {activeTab === 'nutricionistas' && (
          <NutritionistsView
            nutritionists={nutritionists}
            user={userProfile}
          />
        )}

        {activeTab === 'comunidade' && (
          <CommunityView
            posts={communityPosts}
            user={userProfile}
            onAddPost={handleAddCommunityPost}
            onLikePost={handleLikeCommunityPost}
          />
        )}

        {activeTab === 'desafios' && (
          <ChallengesView
            challenges={challenges}
            rewards={rewards}
            user={userProfile}
            onUpdateChallengeProgress={handleUpdateChallengeProgress}
            onClaimReward={handleClaimReward}
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
        weeklyPlan={weeklyPlan}
        onUpdateWeeklyPlan={handleUpdateWeeklyPlan}
      />

      {/* Floating Quick AI Assistant Bubble (Desktop only, mobile uses prominent bottom nav center button) */}
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
      />

      {/* Mobile-First Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pantryCount={pantryItems.length}
        shoppingCount={shoppingList.filter(i => !i.isChecked).length}
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
