
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import { Cog6ToothIcon, ArrowRightOnRectangleIcon } from '../components/icons';
// Removed ThemeSwitch import

const SettingsPage: React.FC = () => {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/login'); 
    } else {
      console.error("Logout failed:", error);
      alert(`Error al cerrar sesión: ${error.message}`);
    }
  };

  return (
    <div className="p-4 space-y-6 bg-white min-h-full">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
        <Cog6ToothIcon className="w-8 h-8 text-emerald-600" />
        <h1 className="text-2xl font-semibold text-gray-800">Ajustes</h1>
      </div>

      {user && (
        <div className="bg-emerald-50 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Sesión iniciada como:</p>
          <p className="text-md font-medium text-emerald-700 truncate">{user.email}</p>
        </div>
      )}

      <div className="space-y-3 pt-4">
        {/* Removed Apariencia section and ThemeSwitch */}
        <h2 className="text-lg font-medium text-gray-700 mb-2">Cuenta</h2>
         <p className="text-sm text-gray-500">Más opciones de configuración de cuenta estarán disponibles próximamente.</p>
      </div>
      

      <div className="mt-8 pt-6 border-t border-gray-200">
        <Button 
          onClick={handleLogout} 
          variant="danger" 
          className="w-full py-3"
          leftIcon={<ArrowRightOnRectangleIcon className="w-5 h-5"/>}
          disabled={isLoading}
        >
          {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;