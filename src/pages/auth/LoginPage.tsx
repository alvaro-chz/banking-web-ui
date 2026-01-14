import { useState } from 'react'
import styles from './LoginPage.module.css' // Asegúrate que cargue el CSS nuevo
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Footer } from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login({ email, password })
      navigate('/accounts')
    } catch (err: any) {
      console.error('Error de login:', err)
      setError('Credenciales inválidas o error de conexión')
    }
  }

  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.contentWrapper}>
        {/* IZQUIERDA: Imagen */}
        <div className={styles.imageSide}>
           Imagen
        </div>

        {/* DERECHA: Formulario */}
        <div className={styles.loginCard}>
          <h1 className={styles.title}>Login</h1>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div style={{color: 'red', fontSize: '14px', textAlign: 'center'}}>{error}</div>}

            <input
              type="text"
              placeholder="Usuario o Correo"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <input
              type="password"
              placeholder="Contraseña"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button label="Iniciar sesión" type="submit" />
          </form>

          {/* Aquí usamos la clase nueva para controlar el tamaño de fuente */}
          <div className={styles.signupRedirect}>
            ¿No tienes una cuenta? 
            <Link to="/register" className={styles.signupLink}>Regístrate</Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}