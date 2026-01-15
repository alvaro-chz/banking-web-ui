import React from 'react';
import styles from './Modal.module.css'; // Crearemos este CSS abajo
import { FiX } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {children}
        </div>

      </div>
    </div>
  );
};