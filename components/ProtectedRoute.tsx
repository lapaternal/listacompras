
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { session, isLoading, isSupabaseInitialized, error: authError } = useAuth();

  if (!isSupabaseInitialized) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Configuración</h1>
            <p className="text-gray-700">
                El servicio de autenticación (Supabase) no está configurado correctamente.
            </p>
            <p className="text-sm text-gray-500">
                {/* Updated message as env vars are no longer the direct cause */}
                Por favor, verifica la configuración de Supabase o contacta al administrador.
            </p>
            {authError?.message && <p className="text-xs text-red-400 mt-1">Detalle: {authError.message}</p>}
        </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Cargando sesión...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Renders child routes if authenticated
};

export default ProtectedRoute;