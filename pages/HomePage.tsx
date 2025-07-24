
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Corrected import
import { useAppContext } from '../App';
import { ShoppingList } from '../types';
import Button from '../components/Button';
import { TrashIcon, EyeIcon, ShoppingBagIcon } from '../components/icons';

const HomePage: React.FC = () => {
  const { shoppingLists, deleteShoppingList } = useAppContext();
  const navigate = useNavigate(); // Corrected import

  return (
    <div className="space-y-4 p-4">
      {shoppingLists.length === 0 ? (
        <div className="text-center py-12 mt-10 bg-white rounded-lg shadow-md mx-4">
          <ShoppingBagIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-xl">No hay listas de compras.</p>
          <p className="text-gray-400 mt-2">Crea una nueva lista usando el botón "+" en la cabecera.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shoppingLists.map((list: ShoppingList) => (
            <div key={list.id} className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="flex-grow">
                <h2 className="text-lg font-semibold text-emerald-700 mb-1 truncate">{list.name}</h2>
                <p className="text-xs text-gray-500 mb-1">
                  {list.items.length} producto(s)
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Creada: {new Date(list.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex space-x-2 mt-2">
                <Button 
                  onClick={() => navigate(`/shopping-lists/${list.id}`)} 
                  variant="primary" 
                  size="sm" 
                  className="flex-1 py-2" 
                  leftIcon={<EyeIcon className="w-4 h-4"/>}
                >
                  Ver Lista
                </Button>
                <Button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if(window.confirm(`¿Estás seguro de que quieres eliminar la lista "${list.name}"?`)) {
                      deleteShoppingList(list.id);
                    }
                  }} 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:bg-red-50 px-3 py-2"
                  aria-label={`Eliminar lista ${list.name}`}
                  title="Eliminar lista"
                >
                  <TrashIcon className="w-5 h-5"/>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;