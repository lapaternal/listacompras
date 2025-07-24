
export interface Product {
  id: string;
  user_id?: string; // Added for Supabase integration
  name: string;
  description?: string;
  imageBase64?: string; // Base64 encoded image string
  created_at?: string; // Added for Supabase timestamp
}

export interface ShoppingListItem {
  productId: string;
  productName: string; // Denormalized for easier display
  productImageBase64?: string; // Denormalized
  quantity: number;
  isPurchased: boolean;
}

export interface ShoppingList {
  id: string;
  user_id?: string; // Added for Supabase integration
  name: string;
  createdAt: string; // ISO date string (or created_at from Supabase)
  items: ShoppingListItem[];
  created_at?: string; // Supabase timestamp
}

// Context types
export interface AppContextType {
  products: Product[];
  shoppingLists: ShoppingList[];
  isLoadingData: boolean;
  dataError: Error | null;

  addProduct: (productData: Omit<Product, 'id' | 'user_id' | 'created_at'>) => Promise<Product | null>;
  updateProduct: (productData: Product) => Promise<Product | null>;
  deleteProduct: (productId: string) => Promise<boolean>;
  getProductById: (productId: string) => Product | undefined;
  
  addShoppingList: (name: string) => Promise<ShoppingList | null>;
  updateShoppingList: (list: ShoppingList) => Promise<ShoppingList | null>; 
  deleteShoppingList: (listId: string) => Promise<boolean>;
  getShoppingListById: (listId: string) => ShoppingList | undefined;
  
  addProductToShoppingList: (listId: string, productId: string, quantity: number) => Promise<ShoppingList | null>;
  updateShoppingListItem: (listId: string, productId: string, updates: Partial<Omit<ShoppingListItem, 'productId' | 'productName' | 'productImageBase64'>>) => Promise<ShoppingList | null>;
  removeProductFromShoppingList: (listId: string, productId: string) => Promise<ShoppingList | null>;
  togglePurchaseItem: (listId: string, productId: string) => Promise<ShoppingList | null>;
  fetchAllDataForCurrentUser: () => Promise<void>;
}
