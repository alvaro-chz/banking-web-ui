import { useState } from 'react'
import styles from './RegisterPage.module.css'
import { registerService } from '../../services/auth'
import type { RegisterRequest } from '../../services/auth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Footer } from '../../components/Footer';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    lastName1: '',
    lastName2: '',
    documentId: '',
    phoneNumber: '',
    email: '',
    password: ''
  })

  const [error, setError] = useState<string | null>(null)

  // Manejo genérico de inputs (para no hacer 4 funciones diferentes)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      console.log('Enviando...', formData)
      await registerService(formData)
      
      alert('¡Cuenta creada con éxito!')
      // Redirigir al login automáticamente
      navigate('/login')
      
    } catch (err: any) {
      console.error('Error registro:', err)
      // Si el backend devuelve mensajes de error específicos (ej: "Email ya existe"), podrías mostrarlos aquí
      setError('Error al registrar. Verifica los datos.')
    }
  }

  return (
    <div className={styles.pageContainer}>
      
      {/* TARJETA DE REGISTRO (Sin imagen) */}
      <div className={styles.registerCard}>
        <h1 className={styles.title}>Crear Cuenta</h1>
        <p className={styles.subtitle}>Únete a nuestro banco digital</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div style={{color: 'red', fontSize: '14px', textAlign: 'center'}}>{error}</div>}

          <input
            type="text"
            name="name"
            placeholder="Nombres"
            className={styles.input}
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={100}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              name="lastName1"
              placeholder="Primer Apellido"
              className={styles.input}
              value={formData.lastName1}
              onChange={handleChange}
              required
              maxLength={100}
            />
            <input
              type="text"
              name="lastName2"
              placeholder="Segundo Apellido"
              className={styles.input}
              value={formData.lastName2}
              onChange={handleChange}
              // OJO: Este NO es required según tu Java DTO
              maxLength={100}
            />
          </div>

          {/* --- BLOQUE DE DOCUMENTO --- */}
          <input
            type="text"
            name="documentId"
            placeholder="DNI / Documento de Identidad"
            className={styles.input}
            value={formData.documentId}
            onChange={handleChange}
            required
            minLength={8}
            maxLength={12}
          />

          {/* --- BLOQUE DE CONTACTO --- */}
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Teléfono / Celular"
            className={styles.input}
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            minLength={6}
            maxLength={20}
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            className={styles.input}
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          {/* --- BLOQUE DE SEGURIDAD --- */}
          <input
            type="password"
            name="password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            className={styles.input}
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          <Button label="Registrarse" type="submit" />
        </form>

        <div className={styles.loginRedirect}>
          ¿Ya tienes cuenta? <Link to="/login" className={styles.loginLink}>Inicia sesión</Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}