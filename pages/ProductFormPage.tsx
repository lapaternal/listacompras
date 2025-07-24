
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../App';
import { Product } from '../types';
import Button from '../components/Button';
import { DEFAULT_PRODUCT_IMAGE_PLACEHOLDER } from '../constants';
import { suggestProductDetailsFromImage, isGeminiAvailable } from '../services/geminiService';
import { SparklesIcon, CameraIcon } from '../components/icons';

const ProductFormPage: React.FC = () => {
  const { productId } = useParams<{ productId?: string }>();
  const { addProduct, updateProduct, getProductById, dataError: appContextError } = useAppContext();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productId) {
      const product = getProductById(productId);
      if (product) {
        setName(product.name);
        setDescription(product.description || '');
        setImageBase64(product.imageBase64);
        setIsEditing(true);
      } else {
        navigate('/products'); 
      }
    }
  }, [productId, getProductById, navigate]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleGeminiSuggest = useCallback(async () => {
    if (!imageFile || !imageBase64) {
      setGeminiError("Por favor, sube una imagen primero para obtener sugerencias.");
      return;
    }
    setIsLoadingGemini(true);
    setGeminiError(null);
    try {
      const suggestion = await suggestProductDetailsFromImage(imageBase64, imageFile.type);
      if (suggestion) {
        setName(suggestion.name);
        setDescription(suggestion.description);
      } else {
        setGeminiError("No se pudieron obtener sugerencias. Prueba con una imagen diferente o revisa la consola.");
      }
    } catch (error) {
      console.error("Error en sugerencia de Gemini:", error);
      setGeminiError("Ocurrió un error al obtener sugerencias.");
    } finally {
      setIsLoadingGemini(false);
    }
  }, [imageFile, imageBase64]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setIsLoading(true);

    if (!name.trim()) {
      setFormError("El nombre del producto no puede estar vacío.");
      setIsLoading(false);
      return;
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      imageBase64,
    };

    let result: Product | null = null;
    try {
      if (isEditing && productId) {
        result = await updateProduct({ ...productData, id: productId, user_id: getProductById(productId)?.user_id });
      } else {
        result = await addProduct(productData as Omit<Product, 'id' | 'user_id' | 'created_at'>);
      }

      if (result) {
        navigate('/products');
      } else {
        setFormError(appContextError?.message || "No se pudo guardar el producto. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error submitting product form:", error);
      setFormError((error as Error).message || "Ocurrió un error inesperado al guardar el producto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 bg-white min-h-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        {isEditing && imageBase64 && (
          <div className="flex flex-col items-center">
            <img 
              src={imageBase64 || DEFAULT_PRODUCT_IMAGE_PLACEHOLDER} 
              alt="Vista previa del producto" 
              className="w-48 h-48 rounded-lg object-cover border-2 border-emerald-200 shadow-md mb-2"
            />
             <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<CameraIcon className="w-4 h-4" />}
              >
                Cambiar Foto
              </Button>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Nombre del Producto</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Leche Entera, Manzanas Fuji"
            className="w-full px-4 py-2.5 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-emerald-50 text-gray-700 placeholder-emerald-500"
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Descripción (Opcional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Ej: Fresca y crujiente, ideal para postres"
            className="w-full px-4 py-2.5 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-emerald-50 text-gray-700 placeholder-emerald-500"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-600 mb-1">
            {isEditing ? (imageBase64 ? 'Cambiar Foto' : 'Añadir Foto') : 'Subir Foto'}
          </label>
          {!isEditing && (
            <div className="mt-1 flex items-center space-x-4 mb-3">
              <img 
                src={imageBase64 || DEFAULT_PRODUCT_IMAGE_PLACEHOLDER} 
                alt="Vista previa" 
                className="w-24 h-24 rounded-lg object-cover border border-emerald-200"
              />
            </div>
          )}
          <Button 
            type="button" 
            variant='outline'
            onClick={() => fileInputRef.current?.click()} 
            leftIcon={<CameraIcon className="w-5 h-5"/>}
            className="w-full"
            disabled={isLoading}
          >
            {imageBase64 ? 'Cambiar archivo de imagen' : 'Seleccionar archivo de imagen'}
          </Button>
          <input
            type="file"
            id="image"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden" 
            disabled={isLoading}
          />
        </div>

        {isGeminiAvailable() && imageBase64 && (
          <div className="my-4">
            <Button 
              type="button" 
              onClick={handleGeminiSuggest} 
              variant="secondary"
              size="sm"
              leftIcon={<SparklesIcon className="w-4 h-4"/>}
              disabled={isLoadingGemini || isLoading}
              className="w-full"
            >
              {isLoadingGemini ? 'Analizando imagen...' : 'Sugerir con IA'}
            </Button>
            {geminiError && <p className="text-sm text-red-500 mt-2 text-center">{geminiError}</p>}
            {isLoadingGemini && <p className="text-sm text-gray-500 mt-2 text-center">La IA está pensando...</p>}
          </div>
        )}
        
        {formError && (
          <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{formError}</p>
        )}

        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full py-3 text-base" disabled={isLoading}>
            {isLoading ? (isEditing ? 'Guardando...' : 'Añadiendo...') : (isEditing ? 'Guardar Cambios' : 'Añadir Producto')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;