
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { DEFAULT_PRODUCT_IMAGE_PLACEHOLDER } from '../constants';
import Button from '../components/Button';
import { PencilIcon, TrashIcon } from '../components/icons';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getProductById, deleteProduct } = useAppContext();
  const navigate = useNavigate();
  
  if (!productId) {
    navigate('/products');
    return null; 
  }

  const product = getProductById(productId);

  if (!product) {
    return (
      <div className="text-center py-10 px-4">
        <h2 className="text-xl font-semibold text-gray-700">Producto no encontrado</h2>
        <Button onClick={() => navigate('/products')} variant="outline" className="mt-6">
          Volver a Productos
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${product.name}"? Esto también lo eliminará de todas las listas de compras.`)) {
      deleteProduct(product.id);
      navigate('/products');
    }
  };

  return (
    <div className="bg-white min-h-full">
      <div className="w-full">
        <img
          src={product.imageBase64 || DEFAULT_PRODUCT_IMAGE_PLACEHOLDER}
          alt={product.name}
          className="w-full h-64 sm:h-80 object-cover" 
        />
      </div>
      <div className="p-5 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
        
        {product.description ? (
          <p className="text-gray-600 text-base leading-relaxed">
            {product.description}
          </p>
        ) : (
          <p className="italic text-gray-400">No se proporcionó descripción.</p>
        )}
        
        <div className="pt-4 space-y-3">
          <Button 
            onClick={() => navigate(`/products/edit/${product.id}`)} 
            variant="primary"
            leftIcon={<PencilIcon className="w-5 h-5" />}
            className="w-full py-3 text-base"
          >
            Editar Producto
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="danger"
            leftIcon={<TrashIcon className="w-5 h-5" />}
            className="w-full py-3 text-base"
          >
            Eliminar Producto
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;