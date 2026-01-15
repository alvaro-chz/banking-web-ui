import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';

interface Props {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  // 1. Si no está logueado -> Al Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si hay roles definidos y el usuario NO tiene el rol -> Al Home o Login
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Aquí podrías mandarlo a una página "403 Forbidden"
    // Por ahora lo mandamos al login para forzar salida o al home correspondiente
    return <Navigate to="/login" replace />; 
  }

  // 3. Todo bien -> Renderizar la ruta
  return <Outlet />;
};