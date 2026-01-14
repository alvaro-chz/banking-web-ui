import styles from './LoadingScreen.module.css';

export const LoadingScreen = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinnerContainer}>
        {/* El anillo que gira */}
        <div className={styles.spinner}></div>
        
        {/* El logo o texto en el centro (Quieto) */}
        <div className={styles.logo}>
            {/* Puedes cambiar esto por <img src="/logo.png" ... /> luego */}
            BANK
        </div>
      </div>
    </div>
  );
};