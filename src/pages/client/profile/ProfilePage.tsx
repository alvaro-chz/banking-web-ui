import { useEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { Footer } from '../../../components/Footer';
import { Header } from '../../../components/Header';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { useAuth } from '../../../context/AuthContext';
import type { UserResponse } from '../../../services/user';
import { changePassword, getUserProfile, updateUser } from '../../../services/user';
import styles from './ProfilePage.module.css';

// Iconos (Si instalaste react-icons, si no, usa texto "Edit" / "Save")
import { FiCheck, FiEdit2, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Datos del perfil (Solo lectura base)
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // --- LÓGICA DE EDICIÓN DE CONTACTO ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    phoneNumber: ''
  });

  // --- LÓGICA DE CAMBIO DE PASSWORD ---
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmationPassword: ''
  });
  const [loadingPass, setLoadingPass] = useState(false);

  // 1. Cargar datos iniciales
  useEffect(() => {
    if (user?.id) {
        loadProfile(user.id);
    }
  }, [user]);

  const loadProfile = async (id: number) => {
    try {
        const data = await getUserProfile(id);
        setProfile(data);
        // Inicializamos el formulario de edición con los datos actuales
        setEditForm({
            email: data.email,
            phoneNumber: data.phoneNumber
        });
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  // 2. Manejar toggle de edición (Lápiz -> Check)
  const handleEditToggle = () => {
      // Si estamos editando y cancelamos (revertir cambios)
      if (isEditing && profile) {
          setEditForm({ email: profile.email, phoneNumber: profile.phoneNumber });
      }
      setIsEditing(!isEditing);
  };

  // 3. Guardar cambios de Contacto
  const handleSaveContact = async () => {
      if (!user?.id || !profile) return;

      const emailChanged = editForm.email !== profile.email;

      try {
          setLoading(true);
          const updatedUser = await updateUser(user.id, editForm);
          setProfile(updatedUser); // Actualizamos la vista con lo nuevo
          setIsEditing(false); // Volvemos a modo lectura

          if (emailChanged) {
             // 2. Si cambió el email, forzamos salida por seguridad
             alert("Al actualizar tu correo electrónico, es necesario que inicies sesión nuevamente.");
             logout(); // Limpia el token viejo
             navigate('/login'); // Manda al login
          } else {
             // Si solo cambió teléfono, todo sigue normal
             alert("Datos actualizados correctamente");
          }

      } catch (error) {
          console.error(error);
          alert("Error al actualizar datos. Verifica el formato.");
      } finally {
          setLoading(false);
      }
  };

  // 4. Cambiar Contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.id) return;

      if (passForm.newPassword !== passForm.confirmationPassword) {
          alert("Las contraseñas nuevas no coinciden");
          return;
      }

      try {
          setLoadingPass(true);
          await changePassword(user.id, passForm);
          alert("Contraseña cambiada exitosamente");
          setPassForm({ currentPassword: '', newPassword: '', confirmationPassword: '' });
      } catch (error) {
          console.error(error);
          alert("Error al cambiar contraseña. Verifica tu contraseña actual.");
      } finally {
          setLoadingPass(false);
      }
  };

  if (loading || !profile) return <LoadingScreen />;

  return (
    <div className={styles.container}>
      <Header title="Mi Perfil" />

      <div className={styles.contentGrid}>
        
        {/* --- COLUMNA IZQUIERDA: DATOS PERSONALES --- */}
        <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Información Personal</h3>
            
            {/* DATOS NO EDITABLES */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Nombre Completo</label>
                <input 
                    type="text" 
                    value={`${profile.name} ${profile.lastName1} ${profile.lastName2 || ''}`} 
                    className={styles.inputReadOnly} 
                    readOnly 
                />
            </div>
            
            <div className={styles.formGroup}>
                <label className={styles.label}>Documento de Identidad</label>
                <input 
                    type="text" 
                    value={profile.documentId} 
                    className={styles.inputReadOnly} 
                    readOnly 
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Rol de Usuario</label>
                <input 
                    type="text" 
                    value={profile.role} 
                    className={styles.inputReadOnly} 
                    readOnly 
                />
            </div>

            {/* SEPARADOR */}
            <h3 className={styles.sectionTitle} style={{marginTop: '30px'}}>
                Datos de Contacto
            </h3>

            {/* EMAIL EDITABLE */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Correo Electrónico</label>
                <input 
                    type="email" 
                    value={isEditing ? editForm.email : profile.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className={isEditing ? styles.inputEditable : styles.inputReadOnly}
                    readOnly={!isEditing}
                />
            </div>

            {/* TELEFONO EDITABLE */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Teléfono</label>
                <div className={styles.editGroup}>
                    <input 
                        type="tel" 
                        value={isEditing ? editForm.phoneNumber : profile.phoneNumber}
                        onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                        className={isEditing ? styles.inputEditable : styles.inputReadOnly}
                        readOnly={!isEditing}
                    />
                    
                    {/* BOTONES DE ACCIÓN (Lápiz o Check/X) */}
                    {!isEditing ? (
                        <button className={`${styles.iconButton} ${styles.btnEdit}`} onClick={() => setIsEditing(true)} title="Editar">
                            <FiEdit2 /> {/* Lápiz */}
                        </button>
                    ) : (
                        <>
                            <button className={`${styles.iconButton} ${styles.btnSave}`} onClick={handleSaveContact} title="Guardar">
                                <FiCheck /> {/* Check */}
                            </button>
                            <button className={`${styles.iconButton} ${styles.btnCancel}`} onClick={handleEditToggle} title="Cancelar">
                                <FiX /> {/* X */}
                            </button>
                        </>
                    )}
                </div>
            </div>

        </div>

        {/* --- COLUMNA DERECHA: SEGURIDAD --- */}
        <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Seguridad</h3>
            <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'20px'}}>
                Actualiza tu contraseña periódicamente para mantener tu cuenta segura.
            </p>

            <form onSubmit={handleChangePassword} className={styles.passwordForm}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Contraseña Actual</label>
                    <input 
                        type="password" 
                        className={styles.inputEditable}
                        value={passForm.currentPassword}
                        onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Nueva Contraseña</label>
                    <input 
                        type="password" 
                        className={styles.inputEditable}
                        value={passForm.newPassword}
                        onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                        required
                        minLength={6}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Confirmar Nueva Contraseña</label>
                    <input 
                        type="password" 
                        className={styles.inputEditable}
                        value={passForm.confirmationPassword}
                        onChange={(e) => setPassForm({...passForm, confirmationPassword: e.target.value})}
                        required
                        minLength={6}
                    />
                </div>

                <Button 
                    label="Actualizar Contraseña" 
                    type="submit" 
                    isLoading={loadingPass}
                    style={{marginTop: '10px'}}
                />
            </form>
        </div>

      </div>

      <Footer />
    </div>
  );
};