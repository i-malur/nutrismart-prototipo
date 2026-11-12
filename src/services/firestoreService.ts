import { db, auth } from '../lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, collectionGroup } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { PantryItem, Recipe } from '../types';

const DEFAULT_USER_ID = 'usuario_demo';

function sanitizeData(data: Record<string, any>) {
  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    if (data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
}

export async function fetchPantryItems(userId?: string): Promise<PantryItem[]> {
  try {
    const safeId = (userId && userId.trim() !== '') ? userId.trim() : DEFAULT_USER_ID;
    const querySnapshot = await getDocs(collection(db, `users/${safeId}/pantry`));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PantryItem[];
  } catch (error) {
    console.error("Erro ao buscar dispensa do Firestore:", error);
    return [];
  }
}

export async function addPantryItemFirestore(item: Omit<PantryItem, 'id'>, userId?: string) {
  try {
    const safeId = (userId && userId.trim() !== '') ? userId.trim() : DEFAULT_USER_ID;
    const cleanData = sanitizeData(item);
    const docRef = await addDoc(collection(db, `users/${safeId}/pantry`), cleanData);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    throw error;
  }
}

export async function updatePantryItemFirestore(item: PantryItem, userId?: string) {
  try {
    const safeId = (userId && userId.trim() !== '') ? userId.trim() : DEFAULT_USER_ID;
    const { id, ...data } = item;
    const cleanData = sanitizeData(data);
    const docRef = doc(db, `users/${safeId}/pantry`, id);
    await updateDoc(docRef, cleanData);
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
  }
}

export async function deletePantryItemFirestore(id: string, userId?: string) {
  try {
    const safeId = (userId && userId.trim() !== '') ? userId.trim() : DEFAULT_USER_ID;
    const docRef = doc(db, `users/${safeId}/pantry`, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao apagar item:", error);
  }
}

export async function fetchSavedItems(userId?: string): Promise<any[]> {
  try {
    const safeId = (userId && userId.trim() !== '') ? userId.trim() : DEFAULT_USER_ID;
    const querySnapshot = await getDocs(collection(db, `users/${safeId}/savedItems`));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erro ao buscar itens salvos:", error);
    return [];
  }
}

export async function saveItemFirestore(item: any, userId?: string) {
  try {
    const safeId = (userId && userId.trim() !== '') ? userId.trim() : DEFAULT_USER_ID;
    const cleanData = sanitizeData({
      ...item,
      createdAt: new Date().toISOString()
    });
    const docRef = await addDoc(collection(db, `users/${safeId}/savedItems`), cleanData);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar item:", error);
  }
}

export async function deleteSavedItemFirestore(id: string, userId?: string) {
  try {
    const safeId = (userId && userId.trim() !== '') ? userId.trim() : DEFAULT_USER_ID;
    const docRef = doc(db, `users/${safeId}/savedItems`, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao apagar item salvo:", error);
  }
}

export async function addRecipeFirestore(recipe: Recipe, userId?: string) {
  try {
    const safeId = (userId && userId.trim() !== '') ? userId.trim() : DEFAULT_USER_ID;
    const cleanData = sanitizeData({
      ...recipe,
      createdAt: new Date().toISOString()
    });
    const docRef = await addDoc(collection(db, `users/${safeId}/recipes`), cleanData);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar receita:", error);
    throw error;
  }
}

export async function fetchUserRecipes(userId?: string): Promise<any[]> {
  try {
    const safeId = (userId && userId.trim() !== '') ? userId.trim() : DEFAULT_USER_ID;
    const querySnapshot = await getDocs(collection(db, `users/${safeId}/recipes`));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erro ao buscar receitas do usuário:", error);
    return [];
  }
}

export async function deleteUserRecipeFirestore(id: string, userId?: string) {
  try {
    const safeId = (userId && userId.trim() !== '') ? userId.trim() : DEFAULT_USER_ID;
    const docRef = doc(db, `users/${safeId}/recipes`, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao apagar receita do usuário:", error);
  }
}

export async function fetchAllPendingRecipes() {
  try {
    const querySnapshot = await getDocs(collectionGroup(db, 'recipes'));
    const allRecipes: any[] = [];

    querySnapshot.forEach((document) => {
      const data = document.data();
      allRecipes.push({
        id: document.id,
        path: document.ref.path,
        ...data
      });
    });

    return allRecipes.filter(r => r.status === 'em analise');
  } catch (error) {
    console.error("Erro ao buscar receitas pendentes:", error);
    return [];
  }
}

export async function updateRecipeStatusFirestore(recipePath: string, newStatus: 'aprovado' | 'privado') {
  try {
    const docRef = doc(db, recipePath);
    await updateDoc(docRef, { status: newStatus });
  } catch (error) {
    console.error("Erro ao atualizar status da receita:", error);
  }
}

// FUNÇÃO EXPORTADA EXIGIDA PELO MODAL
export async function requestAccountDeletionFirestore(email: string, userId: string) {
  try {
    await addDoc(collection(db, 'deletionRequests'), {
      userId,
      email,
      status: 'pendente',
      requestedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Erro ao solicitar exclusão:", error);
    throw error;
  }
}

// Buscar todos os pedidos de exclusão (pendentes e concluídos)
export async function fetchDeletionRequests(): Promise<any[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'deletionRequests'));
    const requests: any[] = [];
    querySnapshot.forEach((document) => {
      requests.push({
        id: document.id,
        ...document.data()
      });
    });
    return requests; // Retorna todos para o Admin separar por status
  } catch (error) {
    console.error("Erro ao buscar pedidos de exclusão:", error);
    return [];
  }
}

// Marcar pedido de exclusão como resolvido/concluído
export async function resolveDeletionRequest(requestId: string) {
  try {
    const docRef = doc(db, 'deletionRequests', requestId);
    await updateDoc(docRef, {
      status: 'concluido',
      resolvedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro ao concluir pedido de exclusão:", error);
    throw error;
  }
}

// Apagar conta do usuário e todas as subcoleções (pantry, recipes, savedItems)
export async function deleteUserAccount(userId: string) {
  console.log("A tentar apagar dados para o UID:", userId);
  
  if (!userId || userId === 'demo') {
    console.warn("UID inválido ou de demonstração. A ignorar limpeza de subcoleções.");
    return;
  }

  const userRef = doc(db, `users/${userId}`);

  const subCollections = ['pantry', 'recipes', 'savedItems'];
  for (const subCol of subCollections) {
    const subColRef = collection(db, `users/${userId}/${subCol}`);
    const snapshot = await getDocs(subColRef);
    
    const deletePromises = snapshot.docs.map(document => deleteDoc(document.ref));
    await Promise.all(deletePromises);
  }

  await deleteDoc(userRef);
  console.log("Dados do utilizador apagados com sucesso do Firestore!");
}

// Buscar todas as receitas de todos os utilizadores (para moderação e histórico)
export async function fetchAllRecipesAdmin() {
  try {
    const querySnapshot = await getDocs(collectionGroup(db, 'recipes'));
    const allRecipes: any[] = [];
    
    querySnapshot.forEach((document) => {
      allRecipes.push({
        id: document.id,
        path: document.ref.path,
        ...document.data()
      });
    });
    return allRecipes;
  } catch (error) {
    console.error("Erro ao buscar todas as receitas para o admin:", error);
    return [];
  }
}