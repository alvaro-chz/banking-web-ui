import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger'; // 👈 Nueva prop
}

export const Button = ({ 
  label, 
  isLoading, 
  variant = 'primary', // Por defecto será azul
  className,
  ...props 
}: ButtonProps) => {
  
  // Combinamos las clases: Base + Variante + Clases extras que pases
  const combinedClassName = `${styles.button} ${styles[variant]} ${className || ''}`;

  return (
    <button 
      className={combinedClassName}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Cargando...' : label}
    </button>
  );
};