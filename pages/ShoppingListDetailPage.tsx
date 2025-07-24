
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../App';
import { Product, ShoppingListItem } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { DEFAULT_PRODUCT_IMAGE_PLACEHOLDER } from '../constants';
import { PlusIcon, TrashIcon, PencilIcon, CheckCircleIcon, CircleIcon, MagnifyingGlassIcon, ShoppingBagIcon } from '../components/icons';

const ShoppingListDetailPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const { 
    getShoppingListById, 
    products, 
    addProductToShoppingList, 
    removeProductFromShoppingList,
    togglePurchaseItem,
    updateShoppingListItem,
    updateShoppingList
  } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditListNameModalOpen, setIsEditListNameModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [newListName, setNewListName] = useState('');

  const shoppingList = useMemo(() => {
    if (!listId) return undefined;
    return getShoppingListById(listId);
  }, [listId, getShoppingListById]);

  useEffect(() => {
    if (shoppingList) {
      setNewListName(shoppingList.name);
    }

    const shouldOpenModalViaURL = location.pathname.endsWith('/add-item');
    
    if (shouldOpenModalViaURL && shoppingList && !isAddProductModalOpen) {
      setIsAddProductModalOpen(true);
    }
  }, [shoppingList, location.pathname, listId, isAddProductModalOpen, setNewListName]);


  if (!listId) {
    navigate('/'); 
    return null;
  }
  
  if (!shoppingList) {
    return (
      <div className="text-center py-10 px-4 min-h-full">
        <h2 className="text-xl font-semibold text-gray-700">Lista de compras no encontrada</h2>
        <Button onClick={() => navigate('/')} variant="outline" className="mt-6">
          Volver a las listas
        </Button>
      </div>
    );
  }
  
  const availableProducts = products.filter(p => 
    !shoppingList.items.some(item => item.productId === p.id) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.name.localeCompare(b.name));

  const handleAddProduct = () => {
    if (selectedProductId && quantity > 0) {
      addProductToShoppingList(shoppingList.id, selectedProductId, quantity);
      setSelectedProductId('');
      setQuantity(1);
      setSearchTerm('');
      setIsAddProductModalOpen(false);
      navigate(`/shopping-lists/${listId}`, { replace: true }); 
    }
  };
  
  const handleUpdateListName = () => {
    if (newListName.trim() && shoppingList) {
      updateShoppingList({ ...shoppingList, name: newListName.trim() });
      setIsEditListNameModalOpen(false);
    }
  };

  const totalItems = shoppingList.items.length;
  const purchasedItems = shoppingList.items.filter(item => item.isPurchased).length;
  const progress = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

  const pendingItems = shoppingList.items.filter(item => !item.isPurchased);
  const completedItems = shoppingList.items.filter(item => item.isPurchased);
  const sortedListItems = [...pendingItems, ...completedItems];


  return (
    // Removed bg-black, will inherit from App.tsx
    <div className="pb-4 px-2 sm:px-0 min-h-full"> 
      {/* Progress Bar Area - Reverted to light theme style */}
      <div className="px-2 py-3 sticky top-16 bg-gray-50 z-10 border-b border-gray-200">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{purchasedItems} de {totalItems} comprados</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {sortedListItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md mx-2 mt-4">
          <ShoppingBagIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-xl">¡Lista Vacía!</p>
          <p className="text-gray-400 mt-2">Añade productos usando el botón "+" en la cabecera.</p>
        </div>
      ) : (
        <ul className="space-y-2.5 px-2 mt-4">
          {sortedListItems.map((item: ShoppingListItem) => (
            <li 
              key={item.productId} 
              className={`flex items-center p-3 rounded-xl shadow-md transition-all duration-300 
              bg-white text-gray-800 
              ${item.isPurchased ? 'opacity-60' : 'hover:shadow-lg hover:bg-gray-50'}`}
            >
              <button 
                  onClick={() => togglePurchaseItem(shoppingList.id, item.productId)} 
                  className="p-1 mr-3 flex-shrink-0"
                  title={item.isPurchased ? "Marcar como no comprado" : "Marcar como comprado"}
                  aria-label={item.isPurchased ? "Marcar como no comprado" : "Mostrar como comprado"}
                >
                {item.isPurchased ? 
                  <CheckCircleIcon className="w-7 h-7 text-emerald-600" /> : 
                  <span className="block w-6 h-6 rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400"></span>
                }
              </button>
              <img 
                src={item.productImageBase64 || DEFAULT_PRODUCT_IMAGE_PLACEHOLDER} 
                alt={item.productName} 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover border border-gray-200 flex-shrink-0"
              />
              <div className="flex-grow mx-3 overflow-hidden">
                <h3 className={`font-medium text-sm sm:text-base truncate ${item.isPurchased ? 'line-through text-gray-500' : 'text-gray-700'}`}>{item.productName}</h3>
              </div>
              <div className="flex items-center flex-shrink-0">
                <input 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateShoppingListItem(shoppingList.id, item.productId, { quantity: parseInt(e.target.value) || 1})}
                    min="1"
                    className={`w-12 sm:w-14 p-1.5 border rounded-md text-xs sm:text-sm text-center
                    bg-gray-50 border-gray-300 text-gray-700 focus:ring-1 focus:ring-emerald-400
                    ${item.isPurchased ? 'cursor-not-allowed opacity-70' : ''}`}
                    disabled={item.isPurchased}
                    aria-label="Cantidad"
                />
                {!item.isPurchased && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeProductFromShoppingList(shoppingList.id, item.productId)} 
                    className="text-red-500 hover:bg-red-100 p-1.5 ml-1.5 sm:ml-2"
                    aria-label="Eliminar producto de la lista"
                  >
                    <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal title="Añadir Producto" isOpen={isAddProductModalOpen} onClose={() => {setIsAddProductModalOpen(false); navigate(`/shopping-lists/${listId}`, { replace: true });}} size="md">
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 transform -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar productos existentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-700 placeholder-gray-400"
            />
          </div>
          {availableProducts.length > 0 ? (
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-700 appearance-none bg-no-repeat bg-right pr-8"
              style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%239ca3af' class='w-6 h-6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")` }}
            >
              <option value="">Selecciona un producto</option>
              {availableProducts.map((p: Product) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          ) : (
             <p className="text-sm text-gray-500 text-center py-2">
                {searchTerm ? "No hay productos que coincidan." : "Todos los productos ya están en la lista o no hay productos."}
                <Link to="/products/new" className="text-emerald-600 hover:underline ml-1">Añadir nuevo</Link>
             </p>
          )}
          {selectedProductId && (
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-700 placeholder-gray-400"
              placeholder="Cantidad (ej: 1)"
            />
          )}
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" onClick={() => {setIsAddProductModalOpen(false); navigate(`/shopping-lists/${listId}`, { replace: true });}}>Cancelar</Button>
            <Button onClick={handleAddProduct} disabled={!selectedProductId || quantity <= 0}>Añadir</Button>
          </div>
        </div>
      </Modal>
      
      <Modal title="Editar Nombre de la Lista" isOpen={isEditListNameModalOpen} onClose={() => setIsEditListNameModalOpen(false)}>
        <div className="space-y-4">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Nuevo nombre de la lista"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-700 placeholder-gray-400"
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsEditListNameModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateListName} disabled={!newListName.trim()}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShoppingListDetailPage;
