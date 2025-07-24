
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ShoppingCartIcon } from '../components/icons';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signUp, isLoading, error: authError, session, isSupabaseInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-bg');
    return () => {
      document.body.classList.remove('auth-bg');
    };
  }, []);

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);
  
  useEffect(() => {
    if (authError) {
      if (authError.message.includes("User already registered")) {
        setErrorMessage("Este correo electrónico ya está registrado. Intenta iniciar sesión.");
      } else if (authError.message.includes("Password should be at least 6 characters.")) {
        setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      }
      else {
        setErrorMessage("Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.");
      }
      console.error("Registration error:", authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isSupabaseInitialized) {
        setErrorMessage("El servicio de autenticación no está disponible. Contacta al administrador.");
        return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const { error } = await signUp(email, password);
    if (!error) {
      setSuccessMessage("¡Registro exitoso! Si tu cuenta requiere confirmación, por favor revisa tu bandeja de entrada (y spam) para el correo de confirmación antes de intentar iniciar sesión.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-teal-500 p-4 rounded-full mb-4 shadow-lg">
            <ShoppingCartIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white text-center">Crear Cuenta</h1>
          <p className="text-gray-100 mt-2 text-center">Únete y organiza tus compras</p>
        </div>

        <div className="glassmorphism-card p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-100 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white bg-opacity-10 text-white placeholder-gray-200 border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition duration-150 ease-in-out"
                  placeholder="tu@email.com"
                  disabled={!!successMessage}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password_string" className="block text-sm font-medium text-gray-100 mb-1">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white bg-opacity-10 text-white placeholder-gray-200 border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition duration-150 ease-in-out"
                  placeholder="Mínimo 6 caracteres"
                  disabled={!!successMessage}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-200 hover:text-pink-300"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  disabled={!!successMessage}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-100 mb-1">Confirmar Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-200" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white bg-opacity-10 text-white placeholder-gray-200 border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition duration-150 ease-in-out"
                  placeholder="Repite tu contraseña"
                  disabled={!!successMessage}
                />
                 <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-200 hover:text-pink-300"
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  disabled={!!successMessage}
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {errorMessage && (
              <p className="text-sm text-red-100 bg-red-500 bg-opacity-40 p-3 rounded-md text-center">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-sm text-green-100 bg-green-500 bg-opacity-40 p-3 rounded-md text-center">{successMessage}</p>
            )}

            <div>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full bg-white text-indigo-600 hover:bg-gray-100 focus:ring-indigo-400 py-3 text-base font-semibold shadow-md"
                disabled={isLoading || !!successMessage}
              >
                {isLoading ? 'Registrando...' : 'Regístrate'}
              </Button>
            </div>
          </form>

          <p className="text-sm text-center text-gray-100">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-pink-300 hover:text-pink-200">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
      {!isSupabaseInitialized && !isLoading && ( 
         <div className="fixed bottom-4 left-4 right-4 bg-red-700 text-white p-4 rounded-md shadow-lg text-center">
           Error de Configuración: El servicio de autenticación no está disponible. Verifica la consola o contacta al administrador.
         </div>
       )}
    </div>
  );
};

export default RegisterPage;