import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { PantryItem } from '../types';

const DEFAULT_USER_ID = 'usuario_demo';

// Função auxiliar para remover campos 'undefined' antes de enviar ao Firestore
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

// Funções para Salvos / Receitas
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
    const safeId = (userId && userId.trim() !== '') ? userId.trim() : 'usuario_demo';
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