
import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
// No longer using useLocalStorage
import { Product, ShoppingList, ShoppingListItem, AppContextType } from './types';
import { APP_NAME } from './constants'; 

import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';

import HomePage from './pages/HomePage';
import ManageProductsPage from './pages/ManageProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ShoppingListDetailPage from './pages/ShoppingListDetailPage';
import { 
  Bars3Icon, PlusIcon, ArrowLeftIcon, Cog6ToothIcon, Squares2X2Icon, XMarkIcon, ShoppingBagIcon as PageIconShoppingBag
} from './components/icons';
import Modal from './components/Modal';
import Button from './components/Button';

import {
  getProductsForUser,
  addProductForUser,
  updateProductForUser,
  deleteProductForUser,
  getShoppingListsForUser,
  addShoppingListForUser,
  updateShoppingListForUser,
  deleteShoppingListForUser,
} from './services/supabaseClient';


const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const MainAppLayout: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<Error | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session } = useAuth();

  const [headerTitle, setHeaderTitle] = useState(APP_NAME);
  const [headerLeftAction, setHeaderLeftAction] = useState<React.ReactNode>(null);
  const [headerRightAction, setHeaderRightAction] = useState<React.ReactNode>(null);
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [newListNameForModal, setNewListNameForModal] = useState('');

  const fetchAllDataForCurrentUser = useCallback(async () => {
    if (!user || !session) {
      setProducts([]);
      setShoppingLists([]);
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    setDataError(null);
    try {
      const [userProducts, userShoppingLists] = await Promise.all([
        getProductsForUser(user.id),
        getShoppingListsForUser(user.id)
      ]);
      setProducts(userProducts);
      setShoppingLists(userShoppingLists);
    } catch (error) {
      const supabaseError = error as any;
      const operationDescription = "fetching user data";
      const consoleErrorMessage = `Error ${operationDescription} from Supabase. ` +
        `Message: ${supabaseError?.message || 'N/A'}. ` +
        `Details: ${supabaseError?.details || 'N/A'}. ` +
        `Hint: ${supabaseError?.hint || 'N/A'}. ` +
        `Code: ${supabaseError?.code || 'N/A'}.`;
      console.error(consoleErrorMessage, "Full Error Object:", supabaseError);
      
      const userFacingErrorMessage = supabaseError?.message || "Error desconocido al cargar datos.";
      setDataError(new Error(userFacingErrorMessage));
      setProducts([]); 
      setShoppingLists([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, session]);

  useEffect(() => {
    fetchAllDataForCurrentUser();
  }, [fetchAllDataForCurrentUser]);


  const addProduct = async (productData: Omit<Product, 'id' | 'user_id' | 'created_at'>): Promise<Product | null> => {
    if (!user) {
      const msg = "Usuario no autenticado.";
      console.error("addProduct: " + msg);
      setDataError(new Error(msg));
      return null;
    }
    try {
      const newProduct = await addProductForUser(user.id, productData);
      setProducts(prev => [...prev, newProduct]);
      setDataError(null); 
      return newProduct;
    } catch (error) {
      const supabaseError = error as any;
      const operationDescription = "adding product";
      const consoleErrorMessage = `Error ${operationDescription} via Supabase. ` +
        `Message: ${supabaseError?.message || 'N/A'}. ` +
        `Details: ${supabaseError?.details || 'N/A'}. ` +
        `Hint: ${supabaseError?.hint || 'N/A'}. ` +
        `Code: ${supabaseError?.code || 'N/A'}.`;
      console.error(consoleErrorMessage, "Full Error Object:", supabaseError);
      
      const userFacingErrorMessage = supabaseError?.message || "Error desconocido al añadir producto.";
      setDataError(new Error(userFacingErrorMessage));
      return null;
    }
  };

  const updateProduct = async (productData: Product): Promise<Product | null> => {
    if (!user) {
      const msg = "Usuario no autenticado.";
      console.error("updateProduct: " + msg);
      setDataError(new Error(msg));
      return null;
    }
    try {
      const updatedProd = await updateProductForUser(user.id, productData);
      setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
      setShoppingLists(prevLists => prevLists.map(list => ({
        ...list,
        items: list.items.map(item => 
          item.productId === updatedProd.id 
          ? { ...item, productName: updatedProd.name, productImageBase64: updatedProd.imageBase64 }
          : item
        )
      })));
      setDataError(null);
      return updatedProd;
    } catch (error) {
      const supabaseError = error as any;
      const operationDescription = "updating product";
      const consoleErrorMessage = `Error ${operationDescription} via Supabase. ` +
        `Message: ${supabaseError?.message || 'N/A'}. ` +
        `Details: ${supabaseError?.details || 'N/A'}. ` +
        `Hint: ${supabaseError?.hint || 'N/A'}. ` +
        `Code: ${supabaseError?.code || 'N/A'}.`;
      console.error(consoleErrorMessage, "Full Error Object:", supabaseError);
      
      const userFacingErrorMessage = supabaseError?.message || "Error desconocido al actualizar producto.";
      setDataError(new Error(userFacingErrorMessage));
      return null;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    if (!user) {
      const msg = "Usuario no autenticado.";
      console.error("deleteProduct: " + msg);
      setDataError(new Error(msg));
      return false;
    }
    try {
      await deleteProductForUser(user.id, productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setShoppingLists(prevLists => prevLists.map(list => ({
        ...list,
        items: list.items.filter(item => item.productId !== productId)
      })));
      setDataError(null);
      return true;
    } catch (error) {
      const supabaseError = error as any;
      const operationDescription = "deleting product";
      const consoleErrorMessage = `Error ${operationDescription} via Supabase. ` +
        `Message: ${supabaseError?.message || 'N/A'}. ` +
        `Details: ${supabaseError?.details || 'N/A'}. ` +
        `Hint: ${supabaseError?.hint || 'N/A'}. ` +
        `Code: ${supabaseError?.code || 'N/A'}.`;
      console.error(consoleErrorMessage, "Full Error Object:", supabaseError);
      
      const userFacingErrorMessage = supabaseError?.message || "Error desconocido al eliminar producto.";
      setDataError(new Error(userFacingErrorMessage));
      return false;
    }
  };
  
  const getProductById = useCallback((productId: string) => products.find(p => p.id === productId), [products]);

  const addShoppingList = async (name: string): Promise<ShoppingList | null> => {
    if (!user) {
      const msg = "Usuario no autenticado.";
      console.error("addShoppingList: " + msg);
      setDataError(new Error(msg));
      return null;
    }
    try {
      const newList = await addShoppingListForUser(user.id, name, []);
      setShoppingLists(prev => [newList, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setDataError(null);
      return newList;
    } catch (error) {
      const supabaseError = error as any;
      const operationDescription = "adding shopping list";
      const consoleErrorMessage = `Error ${operationDescription} via Supabase. ` +
        `Message: ${supabaseError?.message || 'N/A'}. ` +
        `Details: ${supabaseError?.details || 'N/A'}. ` +
        `Hint: ${supabaseError?.hint || 'N/A'}. ` +
        `Code: ${supabaseError?.code || 'N/A'}.`;
      console.error(consoleErrorMessage, "Full Error Object:", supabaseError);
      
      const userFacingErrorMessage = supabaseError?.message || "Error desconocido al añadir lista de compras.";
      setDataError(new Error(userFacingErrorMessage));
      return null;
    }
  };
  
  const updateShoppingList = async (updatedList: ShoppingList): Promise<ShoppingList | null> => {
    if (!user || !updatedList.id) {
      const msg = "Usuario no autenticado o ID de lista inválido.";
      console.error("updateShoppingList: " + msg);
      setDataError(new Error(msg));
      return null;
    }
    try {
      const savedList = await updateShoppingListForUser(user.id, updatedList);
      setShoppingLists(prev => prev.map(list => list.id === savedList.id ? savedList : list));
      setDataError(null);
      return savedList;
    } catch (error) {
      const supabaseError = error as any;
      const operationDescription = "updating shopping list";
      const consoleErrorMessage = `Error ${operationDescription} via Supabase. ` +
        `Message: ${supabaseError?.message || 'N/A'}. ` +
        `Details: ${supabaseError?.details || 'N/A'}. ` +
        `Hint: ${supabaseError?.hint || 'N/A'}. ` +
        `Code: ${supabaseError?.code || 'N/A'}.`;
      console.error(consoleErrorMessage, "Full Error Object:", supabaseError);
      
      const userFacingErrorMessage = supabaseError?.message || "Error desconocido al actualizar lista de compras.";
      setDataError(new Error(userFacingErrorMessage));
      return null;
    }
  };

  const deleteShoppingList = async (listId: string): Promise<boolean> => {
     if (!user) {
      const msg = "Usuario no autenticado.";
      console.error("deleteShoppingList: " + msg);
      setDataError(new Error(msg));
      return false;
    }
    try {
      await deleteShoppingListForUser(user.id, listId);
      setShoppingLists(prev => prev.filter(list => list.id !== listId));
      setDataError(null);
      return true;
    } catch (error) {
      const supabaseError = error as any;
      const operationDescription = "deleting shopping list";
      const consoleErrorMessage = `Error ${operationDescription} via Supabase. ` +
        `Message: ${supabaseError?.message || 'N/A'}. ` +
        `Details: ${supabaseError?.details || 'N/A'}. ` +
        `Hint: ${supabaseError?.hint || 'N/A'}. ` +
        `Code: ${supabaseError?.code || 'N/A'}.`;
      console.error(consoleErrorMessage, "Full Error Object:", supabaseError);
      
      const userFacingErrorMessage = supabaseError?.message || "Error desconocido al eliminar lista de compras.";
      setDataError(new Error(userFacingErrorMessage));
      return false;
    }
  };
  
  const getShoppingListById = useCallback((listId: string) => shoppingLists.find(list => list.id === listId), [shoppingLists]);

  const addProductToShoppingList = async (listId: string, productId: string, quantity: number): Promise<ShoppingList | null> => {
    if (!user) return null;
    const list = getShoppingListById(listId);
    const product = getProductById(productId);
    if (!list || !product) {
      setDataError(new Error("Lista o producto no encontrado para añadir a la lista."));
      return null;
    }

    const existingItem = list.items.find(item => item.productId === productId);
    let newItems: ShoppingListItem[];

    if (existingItem) {
      newItems = list.items.map(item => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item);
    } else {
      newItems = [...list.items, { 
        productId, 
        productName: product.name, 
        productImageBase64: product.imageBase64, 
        quantity, 
        isPurchased: false 
      }];
    }
    return updateShoppingList({ ...list, items: newItems });
  };

  const updateShoppingListItem = async (listId: string, productId: string, updates: Partial<Omit<ShoppingListItem, 'productId' | 'productName' | 'productImageBase64'>>): Promise<ShoppingList | null> => {
    if (!user) return null;
    const list = getShoppingListById(listId);
    if (!list) {
       setDataError(new Error("Lista no encontrada para actualizar ítem."));
      return null;
    }
    
    const newItems = list.items.map(item => item.productId === productId ? { ...item, ...updates } : item);
    return updateShoppingList({ ...list, items: newItems });
  };

  const removeProductFromShoppingList = async (listId: string, productId: string): Promise<ShoppingList | null> => {
    if (!user) return null;
    const list = getShoppingListById(listId);
    if (!list) {
       setDataError(new Error("Lista no encontrada para eliminar ítem."));
      return null;
    }

    const newItems = list.items.filter(item => item.productId !== productId);
    return updateShoppingList({ ...list, items: newItems });
  };

  const togglePurchaseItem = async (listId: string, productId: string): Promise<ShoppingList | null> => {
     if (!user) return null;
    const list = getShoppingListById(listId);
    if (!list) {
      setDataError(new Error("Lista no encontrada para marcar ítem como comprado/no comprado."));
      return null;
    }

    const newItems = list.items.map(item => item.productId === productId ? { ...item, isPurchased: !item.isPurchased } : item);
    return updateShoppingList({ ...list, items: newItems });
  };

  const handleCreateNewListFromModal = async () => {
    if (newListNameForModal.trim()) {
      const newList = await addShoppingList(newListNameForModal.trim());
      if (newList) {
        setNewListNameForModal('');
        setIsNewListModalOpen(false);
        navigate(`/shopping-lists/${newList.id}`);
      } else {
        // Error handling already in addShoppingList, dataError in context should be set.
      }
    }
  };
  
  useEffect(() => {
    const path = location.pathname;
    const pathParts = path.split('/').filter(Boolean);

    const BackButton = (
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-emerald-600" aria-label="Volver">
        <ArrowLeftIcon className="w-6 h-6" />
      </button>
    );
    
    const CloseButton = (
       <button onClick={() => navigate(-1)} className="p-2 -mr-2 text-gray-600 hover:text-emerald-600" aria-label="Cerrar">
        <XMarkIcon className="w-6 h-6" />
      </button>
    );

    if (path === '/') {
      setHeaderTitle('Mis Listas');
      setHeaderLeftAction(null);
      setHeaderRightAction(
        <button onClick={() => setIsNewListModalOpen(true)} className="p-2 -mr-2 text-emerald-600 hover:text-emerald-700" aria-label="Crear nueva lista">
          <PlusIcon className="w-6 h-6" />
        </button>
      );
    } else if (path.startsWith('/shopping-lists/')) {
      const listId = pathParts[1];
      const list = getShoppingListById(listId);
      setHeaderTitle(list ? list.name : 'Lista de Compras');
      setHeaderLeftAction(BackButton);
      setHeaderRightAction(
        <button onClick={() => navigate(`/shopping-lists/${listId}/add-item`)} 
              className="p-2 -mr-2 text-emerald-600 hover:text-emerald-700" 
              aria-label="Añadir producto a la lista">
          <PlusIcon className="w-6 h-6" />
        </button>
      );
    } else if (path === '/products') {
      setHeaderTitle('Gestionar Productos');
      setHeaderLeftAction(null);
       setHeaderRightAction(
        <Link to="/products/new" className="p-2 -mr-2 text-emerald-600 hover:text-emerald-700" aria-label="Añadir nuevo producto">
          <PlusIcon className="w-6 h-6" />
        </Link>
      );
    } else if (path === '/products/new') {
      setHeaderTitle('Añadir Producto');
      setHeaderLeftAction(BackButton);
      setHeaderRightAction(CloseButton);
    } else if (path.startsWith('/products/edit/')) {
      setHeaderTitle('Editar Producto');
      setHeaderLeftAction(BackButton);
      setHeaderRightAction(CloseButton);
    } else if (path.startsWith('/products/')) {
       const prodId = pathParts[1];
       const product = getProductById(prodId);
      setHeaderTitle(product ? product.name : 'Detalle del Producto');
      setHeaderLeftAction(BackButton);
      setHeaderRightAction(null);
    } else if (path === '/settings') {
      setHeaderTitle('Ajustes');
      setHeaderLeftAction(null);
      setHeaderRightAction(null);
    } else {
      setHeaderTitle(APP_NAME);
      setHeaderLeftAction(path === '/' ? null : BackButton);
      setHeaderRightAction(null);
    }
  }, [location.pathname, navigate, getShoppingListById, getProductById, shoppingLists, products]); 

  const contextValue: AppContextType = {
    products, shoppingLists, isLoadingData, dataError,
    addProduct, updateProduct, deleteProduct, getProductById,
    addShoppingList, updateShoppingList, deleteShoppingList, getShoppingListById,
    addProductToShoppingList, updateShoppingListItem, removeProductFromShoppingList, togglePurchaseItem,
    fetchAllDataForCurrentUser
  };

  const navItems = [
    { path: '/', label: 'Lista', icon: Bars3Icon },
    { path: '/products', label: 'Productos', icon: Squares2X2Icon },
    { path: '/settings', label: 'Ajustes', icon: Cog6ToothIcon },
  ];
  
  // All pages now use the same light emerald background
  const mainLayoutBackground = 'bg-emerald-50';


  if (isLoadingData && !products.length && !shoppingLists.length) { 
    return (
        <div className={`flex flex-col items-center justify-center min-h-screen ${mainLayoutBackground}`}>
            <PageIconShoppingBag className="w-16 h-16 text-emerald-500 animate-pulse mb-4" />
            <p className="text-xl font-semibold text-emerald-700">Cargando tus datos...</p>
        </div>
    );
  }

  if (dataError && !isLoadingData && !products.length && !shoppingLists.length) { // Show full page error if initial load fails
     return (
        <div className={`flex flex-col items-center justify-center min-h-screen p-4 text-center bg-red-50`}>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Datos</h1>
            <p className="text-gray-700 mb-2">
                No pudimos cargar tus productos o listas de compras. Por favor, intenta recargar la página.
            </p>
            <p className="text-sm text-red-500 mb-4">{dataError.message}</p>
            <Button onClick={() => fetchAllDataForCurrentUser()} variant="primary">Reintentar</Button>
        </div>
    );
  }


  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-h-screen flex flex-col pt-16 pb-16 ${mainLayoutBackground}`}> 
        <header className="fixed top-0 left-0 right-0 bg-white h-16 flex items-center px-4 shadow-sm z-20 border-b border-gray-200">
          <div className="w-1/6">
            {headerLeftAction}
          </div>
          <h1 className="w-4/6 text-lg font-semibold text-gray-700 text-center truncate" aria-live="polite">
            {headerTitle}
          </h1>
          <div className="w-1/6 flex justify-end">
            {headerRightAction}
          </div>
        </header>
        
        <main className="flex-grow container mx-auto w-full px-0 sm:px-4 py-0">
          {isLoadingData && (products.length > 0 || shoppingLists.length > 0) && ( 
            <div className="fixed top-16 left-0 right-0 flex justify-center p-2 bg-emerald-100 bg-opacity-80 z-30">
              <span className="text-xs text-emerald-700">Actualizando datos...</span>
            </div>
          )}
           {dataError && (products.length > 0 || shoppingLists.length > 0) && ( // Show non-blocking error if data already exists
            <div className="fixed top-16 left-0 right-0 flex justify-center p-2 bg-red-100 bg-opacity-80 z-30">
              <span className="text-xs text-red-700">Error: {dataError.message}. Algunas acciones podrían fallar.</span>
            </div>
          )}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ManageProductsPage />} />
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/edit/:productId" element={<ProductFormPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/shopping-lists/:listId" element={<ShoppingListDetailPage />} />
            <Route path="/shopping-lists/:listId/add-item" element={<ShoppingListDetailPage />} /> 
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white h-16 flex justify-around items-center shadow-top z-20 border-t border-gray-200">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center text-xs px-2 py-1 w-1/3 transition-colors duration-150 ${isActive ? 'text-emerald-600 font-medium' : 'text-gray-500 hover:text-emerald-500'}`
              }
            >
              <item.icon className="w-6 h-6 mb-0.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Modal title="Crear Nueva Lista" isOpen={isNewListModalOpen} onClose={() => setIsNewListModalOpen(false)}>
          <div className="space-y-4">
            <label htmlFor="newListNameModalInput" className="sr-only">Nombre de la nueva lista</label>
            <input
              id="newListNameModalInput"
              type="text"
              value={newListNameForModal}
              onChange={(e) => setNewListNameForModal(e.target.value)}
              placeholder="Nombre de la nueva lista"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
              aria-required="true"
            />
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsNewListModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateNewListFromModal} disabled={!newListNameForModal.trim() || isLoadingData}>
                {isLoadingData ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppContext.Provider>
  );
};


export const App: React.FC = () => { 
  const { session, isLoading: isAuthLoading, isSupabaseInitialized, error: authContextError } = useAuth();
  
  // Use a simple loading message for auth check
  if (isAuthLoading) { 
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Verificando sesión...</div>
      </div>
    );
  }
  
  // Handle Supabase initialization error more gracefully
  if (!isSupabaseInitialized) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Crítico de Configuración</h1>
            <p className="text-gray-700 mb-2">
                El servicio de autenticación (Supabase) no está configurado correctamente.
            </p>
            <p className="text-sm text-gray-500">
                Por favor, verifica la configuración de Supabase o contacta al administrador.
            </p>
             {authContextError?.message && <p className="text-xs text-red-400 mt-1">Detalle: {authContextError.message}</p>}
        </div>
    );
  }


  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={session ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<MainAppLayout />} /> 
      </Route>
    </Routes>
  );
};
