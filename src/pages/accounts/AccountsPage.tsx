import { useEffect, useState } from 'react';
import styles from './AccountsPage.module.css';
import { getAccountsByUserId } from '../../services/account';
import type { AccountResponse } from '../../services/account';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import { LoadingScreen } from '../../components/LoadingScreen';

// Diccionarios para formatear datos según el código de moneda (USD, PEN, MXN)
const currencyNames: Record<string, string> = {
  USD: 'Dólares Americanos',
  PEN: 'Soles Peruanos',
  MXN: 'Pesos Mexicanos'
};

const currencySymbols: Record<string, string> = {
  USD: '$',
  PEN: 'S/',
  MXN: '$'
};

export const AccountsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [activeIndex, setActiveIndex] = useState(0); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const fetchAccounts = async () => {
        try {
          const data = await getAccountsByUserId(user.id);
          setAccounts(data);
        } catch (error) {
          console.error("Error", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAccounts();
    }
  }, [user]);

  const handlePrev = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < accounts.length - 1) setActiveIndex(activeIndex + 1);
  };

  const trackStyle = {
    transform: `translateX(calc(50% - 170px - (${activeIndex} * 380px)))`
  };

  if (loading) return <LoadingScreen />;

  if (accounts.length === 0) return (
     <div className={styles.container}>
        <Header title="Mis Productos" />
        <div style={{marginTop: '100px', textAlign: 'center'}}>
            <h2>No tienes cuentas activas</h2>
            <p style={{color: '#666', marginBottom: '20px'}}>Comienza creando tu primera cuenta digital.</p>
            
            {/* Botón central si no hay cuentas */}
            <button 
              className={styles.addButton} 
              style={{position: 'static', margin: '0 auto', transform: 'none', width: 'auto', height: 'auto', padding: '10px 20px', borderRadius: '10px', fontSize: '1rem'}}
              onClick={() => navigate('/create-account')}
            >
              + Crear Cuenta
            </button>
        </div>
        <Footer />
     </div>
  );

  const currentAccount = accounts[activeIndex];

  return (
    <div className={styles.container}>
      
      <Header title="Mis Productos" />

      {/* --- ZONA DE CARRUSEL --- */}
      <div className={styles.carouselContainer}>
        
        <button 
          className={`${styles.navButton} ${styles.prevBtn}`} 
          onClick={handlePrev} 
          disabled={activeIndex === 0}
        >
          &lt;
        </button>

        <div className={styles.track} style={trackStyle}>
          {accounts.map((acc, index) => (
            <div 
              key={acc.id} 
              className={`${styles.card} ${index === activeIndex ? styles.cardActive : ''}`}
              // 👇 AQUÍ LA MAGIA: Pasamos la moneda al CSS
              data-currency={acc.currency} 
              onClick={() => setActiveIndex(index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                  <span className={styles.cardLabel}>Banking App</span>
                  <span>📡</span>
              </div>
              
              <div className={styles.cardNumber}>
                {acc.accountNumber}
              </div>
              
              <div className={styles.cardType}>{acc.accountType}</div>
            </div>
          ))}
        </div>

        <button 
          className={`${styles.navButton} ${styles.nextBtn}`} 
          onClick={handleNext}
          disabled={activeIndex === accounts.length - 1}
        >
          &gt;
        </button>
      </div>

      {/* --- DETALLES DE LA CUENTA ACTIVA --- */}
      <div className={styles.detailsSection}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Moneda</span>
          <span className={styles.detailValue}>
              {/* Usamos el diccionario o mostramos el código si no existe */}
              {currencyNames[currentAccount.currency] || currentAccount.currency}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Tipo</span>
          <span className={styles.detailValue}>{currentAccount.accountType}</span>
        </div>
        <div className={styles.detailRow} style={{ borderBottom: 'none', marginTop: '10px' }}>
          <span className={styles.detailLabel}>Saldo Disponible</span>
        </div>
        <div className={styles.balanceValue}>
            {/* Símbolo dinámico según la moneda */}
            {currencySymbols[currentAccount.currency] || '$'} 
            {' '}
            {currentAccount.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* --- BOTÓN FLOTANTE --- */}
      <div className={styles.fabContainer} onClick={() => navigate('/create-account')}>
          <span className={styles.fabLabel}>Agregar nueva cuenta</span>
          <button className={styles.addButton}>
            +
          </button>
      </div>

      <Footer />
    </div>
  );
};