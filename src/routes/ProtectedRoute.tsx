import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />; // Mostramos carga mientras verificamos el token
  }

  if (!isAuthenticated) {
    // Si no está logueado, lo mandamos al login
    return <Navigate to="/login" replace />;
  }

  // Si está logueado, dejamos pasar (renderizamos la ruta hija)
  return <Outlet />;
};