import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <a href="#" className={styles.link}>Información</a>
        <a href="#" className={styles.link}>Ayuda</a>
        <a href="#" className={styles.link}>API</a>
        <a href="#" className={styles.link}>Privacidad</a>
        <a href="#" className={styles.link}>Condiciones</a>
      </div>
      <div>
        © 2025 Banking App from Alvaro
      </div>
    </footer>
  );
};