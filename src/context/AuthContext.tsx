import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginService, registerService } from '../services/auth';
import type { RegisterRequest, LoginRequest } from '../services/auth';

// 1. Definimos qué forma tiene nuestro Usuario en la app
interface User {
  id: number;
  token: string;
  name?: string; // Opcional, si quieres guardarlo para mostrarlo en el Header
  email?: string;
}

// 2. Definimos qué funciones y datos tendrá nuestro Contexto
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

// Creamos el contexto vacío
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. El Proveedor (El componente que envolverá a toda la app)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al cargar la app, revisamos si ya hay sesión guardada
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedName = localStorage.getItem('name');
    
    if (storedToken && storedUserId) {
      setUser({
        id: Number(storedUserId),
        token: storedToken,
        name: storedName ?? undefined
      });
    }
    setIsLoading(false);
  }, []);

  // Función de Login Centralizada
  const login = async (credentials: LoginRequest) => {
    const response = await loginService(credentials);
    
    // Guardamos en LocalStorage
    localStorage.setItem('token', response.token);
    if (response.id) {
        localStorage.setItem('userId', response.id.toString());
    }
    if (response.name) {
        localStorage.setItem('name', response.name);
    }

    // Actualizamos el estado global
    setUser({
      id: Number(response.id),
      token: response.token,
      name: response.name
    });
  };

  // Función de Registro Centralizada
  const register = async (data: RegisterRequest) => {
    // Solo llamamos al servicio. Podríamos hacer auto-login aquí si quisiéramos.
    await registerService(data);
  };

  // Función de Logout Centralizada
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, // true si user existe
      isLoading,
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};