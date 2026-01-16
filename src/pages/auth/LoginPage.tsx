import { useState } from 'react';
import styles from './LoginPage.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Footer } from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { FiAlertCircle } from 'react-icons/fi';
import loginImage from '/src/assets/login-image.png';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. VALIDACIÓN LOCAL
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa ambos campos.');
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });
      const role = localStorage.getItem('role');

      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/accounts');
      }
      
    } catch (err: any) {
      console.error('Error de login:', err);

      // 2. MANEJO DE ERRORES DEL BACKEND
      if (err.response) {
        const data = err.response.data;
        const status = err.response.status;

        // LÓGICA DE MENSAJES
        if (data && data.message) {
            // CASO ESPECIAL: Error de validación "feo" de Java (ej: {email=...})
            if (data.message.includes('{') || data.message.includes('=')) {
                // Opción A: Mensaje genérico amigable
                setError('Los datos ingresados no tienen el formato correcto.');
                
                // Opción B (Avanzada): Si quisieras limpiar el string (ej: "El email no cumple el formato")
                // pero por ahora el genérico es más seguro y limpio.
            } 
            // CASO NORMAL: Mensaje limpio del backend (ej: "Usuario no encontrado")
            else {
                setError(data.message);
            }
        } 
        // FALLBACKS POR CÓDIGO DE ESTADO
        else if (status === 401 || status === 403) {
            setError('Credenciales incorrectas. Inténtalo de nuevo.');
        } else if (status === 404) {
            setError('El usuario no existe.');
        } else {
            setError('Ocurrió un error en el servidor. Intenta más tarde.');
        }

      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica tu internet.');
      } else {
        setError('Ocurrió un error inesperado al procesar la solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (error) setError(null);
  };

  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.contentWrapper}>
        {/* IZQUIERDA: Imagen */}
        <div className={styles.imageSide}>
           {/* 👇 2. USA LA IMAGEN AQUÍ */}
           <img src={loginImage} alt="Bienvenido al Banco" className={styles.heroImage} />
        </div>

        {/* DERECHA: Formulario */}
        <div className={styles.loginCard}>
          <h1 className={styles.title}>Login</h1>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            
            {/* Mensaje de Error */}
            {error && (
              <div className={styles.errorMessage}>
                <FiAlertCircle style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Inputs con estilos de error */}
            <input
              type="text"
              placeholder="Usuario o Correo"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              value={email}
              onChange={(e) => handleInputChange(setEmail, e.target.value)}
              disabled={loading}
            />
            
            <input
              type="password"
              placeholder="Contraseña"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              value={password}
              onChange={(e) => handleInputChange(setPassword, e.target.value)}
              disabled={loading}
            />

            <Button 
                label={loading ? "Cargando..." : "Iniciar sesión"} 
                type="submit" 
                disabled={loading}
            />
          </form>

          <div className={styles.signupRedirect}>
            ¿No tienes una cuenta? 
            <Link to="/register" className={styles.signupLink}>Regístrate</Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};