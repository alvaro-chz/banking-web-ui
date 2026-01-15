import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateAccountPage.module.css';

// Componentes y Hooks
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/Button';

// Servicios
import { getUserProfile } from '../../../services/user';
import type { UserResponse } from '../../../services/user';
import { createAccount } from '../../../services/account';

export const CreateAccountPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Solo necesitamos el ID del contexto

  // Estados
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Datos del Formulario
  const [currency, setCurrency] = useState('USD');
  const [accountType, setAccountType] = useState('AHORROS');

  // Cargar perfil al entrar
  useEffect(() => {
    if (user?.id) {
      const fetchProfile = async () => {
        try {
          const data = await getUserProfile(user.id);
          setProfile(data);
        } catch (error) {
          console.error("Error al cargar perfil", error);
          alert("No pudimos cargar tus datos");
          navigate('/accounts');
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    if (!user?.id) return;
    
    // Validación básica
    if (!currency || !accountType) {
      alert("Por favor selecciona todos los campos");
      return;
    }

    try {
      setLoading(true); // Reusamos el loading screen para la creación
      
      await createAccount({
        currency: currency,
        accountType: accountType
      }, user.id);

      alert("¡Cuenta creada exitosamente!");
      navigate('/accounts'); // Volver al dashboard

    } catch (error) {
      console.error("Error creando cuenta", error);
      alert("Hubo un error al crear la cuenta. Intenta nuevamente.");
      setLoading(false);
    }
  };

  if (loading || !profile) return <LoadingScreen />;

  return (
    <div className={styles.container}>
      <Header title="Solicitar Nuevo Producto" />

      <div className={styles.contentGrid}>
        
        {/* --- IZQUIERDA: FORMULARIO --- */}
        <div className={styles.formSection}>
          
          {/* Bloque 1: Datos del Titular (Read Only) */}
          <h3 className={styles.sectionTitle}>Datos del Titular</h3>
          
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombres</label>
              <input type="text" value={profile.name} className={styles.readOnlyInput} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Documento ID</label>
              <input type="text" value={profile.documentId} className={styles.readOnlyInput} readOnly />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Apellido Paterno</label>
              <input type="text" value={profile.lastName1} className={styles.readOnlyInput} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Apellido Materno</label>
              <input type="text" value={profile.lastName2 || '-'} className={styles.readOnlyInput} readOnly />
            </div>
          </div>

          <div className={styles.formGroup} style={{marginBottom: '30px'}}>
             <label className={styles.label}>Correo Electrónico</label>
             <input type="text" value={profile.email} className={styles.readOnlyInput} readOnly />
          </div>

          {/* Bloque 2: Configuración de la Cuenta */}
          <h3 className={styles.sectionTitle}>Datos de la Cuenta</h3>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Moneda</label>
              <select 
                className={styles.selectInput}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">Dólares (USD)</option>
                <option value="PEN">Soles (PEN)</option>
                <option value="MXN">Pesos (MXN)</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de Cuenta</label>
              <select 
                 className={styles.selectInput}
                 value={accountType}
                 onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="AHORROS">Ahorros</option>
                <option value="CORRIENTE">Corriente</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            
            {/* Botón Cancelar (Secundario) */}
            <Button 
              label="Cancelar" 
              variant="secondary" 
              type="button" 
              onClick={() => navigate('/accounts')} 
            />

            {/* Botón Crear (Primario por defecto) */}
            <Button 
              label="Crear Cuenta" 
              type="submit" // O onClick={handleSubmit} si no usas <form>
              onClick={handleSubmit}
              isLoading={loading} // ¡Incluso podemos mostrar cargando en el botón!
            />
            
          </div>

        </div>

        {/* --- DERECHA: PREVIEW DE LA TARJETA --- */}
        <div className={styles.previewSection}>
           <div className={styles.previewTitle}>Vista Previa</div>
           
           {/* La tarjeta cambia de color (data-currency) según lo seleccionado */}
           <div className={styles.cardPreview} data-currency={currency}>
              
              <div>
                 <div className={styles.cardLabel}>Banking App</div>
                 <div style={{fontSize: '1.5rem'}}>📡</div>
              </div>

              <div>
                <div className={styles.cardNumber}>**** **** **** ****</div>
                <div className={styles.cardHolder}>
                  {profile.name} {profile.lastName1}
                </div>
              </div>

              <div className={styles.cardFooter}>
                 <div className={styles.cardType}>{accountType}</div>
                 <div style={{fontWeight:'bold'}}>{currency}</div>
              </div>
           
           </div>

           <p style={{marginTop:'20px', color:'#666', fontSize:'0.9rem', textAlign:'center'}}>
             * El número de cuenta se generará automáticamente al finalizar.
           </p>
        </div>

      </div>

      <Footer />
    </div>
  );
};