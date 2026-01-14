import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Usamos NavLink
import styles from './Header.module.css';
import { useAuth } from '../context/AuthContext';

// Iconos
import { FiSettings, FiUser, FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  // Ya no necesitamos title obligatorio, el título lo define la navegación
  title?: string; 
}

export const Header = ({ }: HeaderProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };  

  return (
    <header className={styles.header}>
      
      {/* IZQUIERDA: LOGO */}
      <div className={styles.logoContainer} onClick={() => navigate('/accounts')}>
        <div className={styles.logoCircle}>BK</div>
        <span>BANK</span>
      </div>

      {/* CENTRO: NAVEGACIÓN */}
      <nav className={styles.nav}>
        {/* NavLink nos permite saber si está activo automáticamente */}
        <NavLink 
          to="/accounts" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
        >
          Cuentas
        </NavLink>

        <NavLink 
          to="/transactions" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
        >
          Transacciones
        </NavLink>

        <NavLink 
          to="/beneficiaries" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
        >
          Beneficiarios
        </NavLink>
      </nav>

      {/* DERECHA: PERFIL (Engranaje) */}
      <div className={styles.profileSection}>
        
        {/* Botón Circular */}
        <button 
          className={styles.profileIconBtn} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Configuración"
        >
          <FiSettings />
        </button>

        {/* Menú Desplegable (Solo si isMenuOpen es true) */}
        {isMenuOpen && (
          <div className={styles.dropdown} onMouseLeave={() => setIsMenuOpen(false)}>
            
            {/* Cabecera del menú con nombre */}
            <div style={{padding: '10px 15px', color: '#9ca3af', fontSize: '0.8rem', fontWeight: 'bold'}}>
              HOLA, {user?.name?.toUpperCase() || 'USUARIO'}
            </div>
            
            <NavLink to="/profile" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
              <FiUser /> Ver perfil
            </NavLink>

            <div className={styles.divider}></div>

            <button className={styles.dropdownItem} onClick={handleLogout} style={{color: '#ef4444'}}>
              <FiLogOut /> Salir
            </button>
          </div>
        )}

      </div>
    </header>
  );
};