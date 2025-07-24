
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { Product } from '../types';
import { DEFAULT_PRODUCT_IMAGE_PLACEHOLDER } from '../constants';
import Button from '../components/Button';
import { PencilIcon, TrashIcon, EyeIcon, Squares2X2Icon } from '../components/icons';

const ManageProductsPage: React.FC = () => {
  const { products, deleteProduct } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="space-y-4 p-4">
      {products.length === 0 ? (
         <div className="text-center py-12 mt-10 bg-white rounded-lg shadow-md mx-4">
          <Squares2X2Icon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-xl">No hay productos.</p>
          <p className="text-gray-400 mt-2">Añade productos usando el botón "+" en la cabecera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map((product: Product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
              <img
                src={product.imageBase64 || DEFAULT_PRODUCT_IMAGE_PLACEHOLDER}
                alt={product.name}
                className="w-full h-36 object-cover" 
                onClick={() => navigate(`/products/${product.id}`)} 
              />
              <div className="p-3 flex flex-col flex-grow">
                <h3 
                  className="text-sm font-semibold text-gray-700 mb-1 truncate cursor-pointer" 
                  title={product.name}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2 flex-grow min-h-[30px] overflow-hidden text-ellipsis لائن-clamp-2">
                  {product.description || 'Sin descripción.'}
                </p>
                <div className="mt-auto flex space-x-1.5">
                   <Button 
                    onClick={() => navigate(`/products/edit/${product.id}`)} 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-emerald-600 hover:bg-emerald-50 p-1.5"
                    aria-label="Editar producto"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4"/>
                  </Button>
                  <Button 
                    onClick={() => {
                      if (window.confirm(`¿Estás seguro de que quieres eliminar ${product.name}? Esto también lo eliminará de todas las listas de compras.`)) {
                        deleteProduct(product.id);
                      }
                    }}
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-red-500 hover:bg-red-50 p-1.5"
                    aria-label="Eliminar producto"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4"/>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageProductsPage;