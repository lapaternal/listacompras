
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User, AuthError, signInWithEmail as sbSignIn, signUpWithEmail as sbSignUp, signOutUser as sbSignOut, onAuthStateChange as sbOnAuthStateChange, supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null | Error; // Allow generic Error for non-Supabase errors
  signIn: (email: string, password_string: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password_string: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<{ error: AuthError | Error | null }>;
  isSupabaseInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true to check initial session
  const [error, setError] = useState<AuthError | null | Error>(null);
  // isSupabaseInitialized relies on the supabase client from supabaseClient.ts
  // If SUPABASE_URL or SUPABASE_ANON_KEY are incorrect in constants.ts, 
  // supabase might be null or createClient might throw an error,
  // which would be caught by the !supabase check below.
  const [isSupabaseInitialized, setIsSupabaseInitialized] = useState(!!supabase);


  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      // Updated error message as env vars are no longer the direct cause if keys are hardcoded.
      // This error now implies an issue with the hardcoded keys or Supabase client creation itself.
      setError(new Error("El cliente de Supabase no está inicializado. Verifica la configuración de Supabase."));
      setIsSupabaseInitialized(false); // Explicitly set if supabase is null
      return;
    }
    
    setIsSupabaseInitialized(true); // Supabase client exists
    setIsLoading(true);
    // Check initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    }).catch(err => {
      console.error("Error getting initial session:", err);
      setError(new Error("Error al obtener la sesión inicial de Supabase."));
      setIsLoading(false);
    });

    const { data: { subscription } } = sbOnAuthStateChange((newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      // Don't set loading to false here, as this is for subsequent changes, not initial load.
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password_string: string) => {
    if (!supabase) return { error: new Error("El cliente de Supabase no está inicializado.") };
    setIsLoading(true);
    setError(null);
    const { data, error: signInError } = await sbSignIn(email, password_string);
    if (signInError) {
      setError(signInError);
    } else {
      setSession(data.session);
      setUser(data.user);
    }
    setIsLoading(false);
    return { error: signInError };
  };

  const signUp = async (email: string, password_string: string) => {
    if (!supabase) return { error: new Error("El cliente de Supabase no está inicializado.") };
    setIsLoading(true);
    setError(null);
    const { data, error: signUpError } = await sbSignUp(email, password_string);
     if (signUpError) {
      setError(signUpError);
    } else if (data.session && data.user) { 
      setSession(data.session);
      setUser(data.user);
    } else {
      console.log('Sign up successful, email confirmation might be pending.', data);
    }
    setIsLoading(false);
    return { error: signUpError };
  };

  const signOut = async () => {
    if (!supabase) return { error: new Error("El cliente de Supabase no está inicializado.") };
    setIsLoading(true);
    setError(null);
    const { error: signOutError } = await sbSignOut();
    if (signOutError) {
      setError(signOutError);
    } else {
      setSession(null);
      setUser(null);
    }
    setIsLoading(false);
    return { error: signOutError };
  };
  
  const value = {
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    isSupabaseInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};