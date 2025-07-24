
import { createClient, Session, User, AuthError, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, TABLE_PRODUCTS, TABLE_SHOPPING_LISTS } from '../constants';
import { Product, ShoppingList, ShoppingListItem } from '../types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      [TABLE_PRODUCTS]: {
        Row: {
          created_at: string
          description: string | null
          id: string
          imageBase64: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          imageBase64?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          imageBase64?: string | null
          name?: string
          user_id?: string
        }
      }
      [TABLE_SHOPPING_LISTS]: {
        Row: {
          created_at: string
          id: string
          items: ShoppingListItem[]
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items: ShoppingListItem[]
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: ShoppingListItem[]
          name?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_delete_product: {
        Args: {
          product_id_to_delete: string
        }
        Returns: undefined
      }
    }
  }
}


// Use hardcoded Supabase URL and Anon Key
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

// The check for missing URL/Key from env vars is no longer needed here
// as they are hardcoded. If SUPABASE_URL or SUPABASE_ANON_KEY in constants.ts
// were empty, createClient would fail, which is handled by isSupabaseInitialized in AuthContext.

export const supabase: SupabaseClient<Database> | null = 
  (supabaseUrl && supabaseAnonKey) ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Do not persist session to localStorage. This can help in environments
      // where localStorage is flaky or restricted, which can cause fetch errors.
      persistSession: false
    }
  }) : null;

// --- Auth Functions ---
export const signUpWithEmail = async (email: string, password_string: string) => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password_string,
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password_string: string) => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password_string,
  });
  return { data, error };
};

export const signOutUser = async () => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!supabase) {
    console.error("Supabase client not initialized.");
    return null;
  }
  const { data: { user } , error } = await supabase.auth.getUser();
   if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

export const onAuthStateChange = (callback: (session: Session | null) => void) => {
  if (!supabase) {
    console.error("Supabase client not initialized. Cannot subscribe to auth state changes.");
    callback(null); 
    return { data: { subscription: null } };
  }
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return { data: { subscription } };
};

// --- Product Data Functions ---
export const getProductsForUser = async (userId: string): Promise<Product[]> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { data, error } = await supabase
    .from(TABLE_PRODUCTS)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const addProductForUser = async (userId: string, productData: Omit<Product, 'id' | 'user_id' | 'created_at'>): Promise<Product> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { data, error } = await supabase
    .from(TABLE_PRODUCTS)
    .insert([{ ...productData, user_id: userId }])
    .select()
    .single(); // Expects a single row to be returned
  if (error) throw error;
  if (!data) throw new Error("Failed to add product, no data returned.");
  return data;
};

export const updateProductForUser = async (userId: string, productData: Product): Promise<Product> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { id, ...updates } = productData;
  // Ensure user_id is not in updates to prevent changing ownership, RLS should handle auth.
  delete updates.user_id; 
  delete updates.created_at;

  const { data, error } = await supabase
    .from(TABLE_PRODUCTS)
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId) // Ensure user owns the product
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Failed to update product, no data returned or product not found for user.");
  return data;
};

export const deleteProductForUser = async (userId: string, productId: string): Promise<boolean> => {
  if (!supabase) throw new Error("Supabase client not initialized.");

  // Llama a la función de la base de datos (RPC) 'handle_delete_product' para
  // ejecutar toda la lógica de eliminación de forma atómica y eficiente en el servidor.
  // Esto previene los timeouts al minimizar el tiempo de bloqueo de la base de datos.
  const { error } = await supabase.rpc('handle_delete_product', {
    product_id_to_delete: productId
  });

  if (error) {
    console.error("Error al ejecutar RPC handle_delete_product:", error);
    throw error;
  }

  return true;
};


// --- Shopping List Data Functions ---
export const getShoppingListsForUser = async (userId: string): Promise<ShoppingList[]> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { data, error } = await supabase
    .from(TABLE_SHOPPING_LISTS)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }); // Supabase uses 'created_at' by default
  if (error) throw error;
  // Adapt to local 'createdAt' if needed, or rename in Supabase
  return (data || []).map(list => ({ ...list, createdAt: list.created_at }));
};

export const addShoppingListForUser = async (userId: string, name: string, items: ShoppingListItem[] = []): Promise<ShoppingList> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const newListPayload = { 
    user_id: userId, 
    name, 
    items, 
    // Supabase will add id and created_at
  };
  const { data, error } = await supabase
    .from(TABLE_SHOPPING_LISTS)
    .insert([newListPayload])
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Failed to add shopping list, no data returned.");
  return { ...data, createdAt: data.created_at };
};

export const updateShoppingListForUser = async (userId: string, listData: ShoppingList): Promise<ShoppingList> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { id, items, name } = listData; // Only allow updating items and name
  const updates = { items, name };

  const { data, error } = await supabase
    .from(TABLE_SHOPPING_LISTS)
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId) // Ensure user owns the list
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Failed to update shopping list, no data returned or list not found for user.");
  return { ...data, createdAt: data.created_at };
};

export const deleteShoppingListForUser = async (userId: string, listId: string): Promise<boolean> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { error } = await supabase
    .from(TABLE_SHOPPING_LISTS)
    .delete()
    .eq('id', listId)
    .eq('user_id', userId);
  if (error) throw error;
  return true;
};

export type { Session, User, AuthError };