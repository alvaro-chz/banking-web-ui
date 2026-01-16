import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success'; // Agregué 'success' para tu botón verde
  icon?: React.ReactNode; // 👈 Nueva prop para el icono
}

export const Button = ({ 
  label, 
  isLoading, 
  variant = 'primary', 
  className,
  icon,
  ...props 
}: ButtonProps) => {
  
  const combinedClassName = `${styles.button} ${styles[variant]} ${className || ''}`;

  return (
    <button 
      className={combinedClassName}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        'Cargando...'
      ) : (
        /* Usamos un span flex para alinear icono y texto */
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {icon && <span style={{ display: 'flex' }}>{icon}</span>}
          {label}
        </span>
      )}
    </button>
  );
};