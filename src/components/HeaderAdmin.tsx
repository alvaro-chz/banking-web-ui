import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Header.module.css'; // Reusamos el mismo CSS del cliente
import { useAuth } from '../context/AuthContext';

// Iconos
import { FiSettings, FiLogOut, FiPieChart, FiUsers, FiActivity } from 'react-icons/fi';

interface HeaderProps {
  title?: string; 
}

export const HeaderAdmin = ({ }: HeaderProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };  

  return (
    <header className={styles.header}>
      
      {/* IZQUIERDA: LOGO (Rojo o distintivo para Admin) */}
      <div className={styles.logoContainer} onClick={() => navigate('/admin/dashboard')}>
        {/* Cambiamos el color del borde a rojo para diferenciar Admin */}
        <div className={styles.logoCircle} style={{borderColor: '#ef4444', color: '#ef4444'}}>BK</div>
        <span style={{color: '#ef4444'}}>ADMIN</span>
      </div>

      {/* CENTRO: NAVEGACIÓN ADMIN */}
      <nav className={styles.nav}>
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
        >
          <FiPieChart style={{marginRight: '8px'}}/> Dashboard
        </NavLink>

        <NavLink 
          to="/admin/users" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
        >
          <FiUsers style={{marginRight: '8px'}}/> Usuarios
        </NavLink>

        <NavLink 
          to="/admin/transactions" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
        >
          <FiActivity style={{marginRight: '8px'}}/> Transacciones
        </NavLink>
      </nav>

      {/* DERECHA: PERFIL */}
      <div className={styles.profileSection}>
        
        <button 
          className={styles.profileIconBtn} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Configuración"
        >
          <FiSettings />
        </button>

        {isMenuOpen && (
          <div className={styles.dropdown} onMouseLeave={() => setIsMenuOpen(false)}>
            <div style={{padding: '10px 15px', color: '#9ca3af', fontSize: '0.8rem', fontWeight: 'bold'}}>
              ADMINISTRADOR
            </div>
            
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