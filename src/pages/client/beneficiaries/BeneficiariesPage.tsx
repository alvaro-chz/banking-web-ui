import { useEffect, useState } from 'react';
import styles from './BeneficiariesPage.module.css';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { Button } from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { 
  getBeneficiaries,
  addBeneficiary, 
  updateBeneficiary, 
  deleteBeneficiary, 
} from '../../../services/beneficiary';

import type { 
  BeneficiaryRequest, 
  BeneficiaryResponse 
} from '../../../services/beneficiary';

// Iconos
import { FiPlus, FiUser, FiEdit2, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';

export const BeneficiariesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Lista de beneficiarios
  const [list, setList] = useState<BeneficiaryResponse[]>([]);
  
  // Selección y Modos
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Formulario (Sirve tanto para Crear como para Editar)
  const [formData, setFormData] = useState<BeneficiaryRequest>({
    alias: '',
    bankName: '',
    accountNumber: ''
  });

  // 1. Cargar Lista Inicial
  useEffect(() => {
    if (user?.id) fetchList();
  }, [user]);

  const fetchList = async () => {
    if (!user?.id) return;
    try {
      const data = await getBeneficiaries(user.id);
      setList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Manejar Click en un Item de la Lista
  const handleSelect = (item: BeneficiaryResponse) => {
    setIsCreating(false);
    setIsEditing(false); // Empezamos en modo lectura
    setSelectedId(item.id);
    setFormData({
      alias: item.alias,
      bankName: item.bankName,
      accountNumber: item.accountNumber
    });
  };

  // 3. Manejar Click en "Agregar Nuevo" (+)
  const handleAddNew = () => {
    setSelectedId(null); // Deseleccionamos
    setIsCreating(true);
    setIsEditing(true); // En modo crear, siempre es editable
    setFormData({ alias: '', bankName: '', accountNumber: '' }); // Formulario limpio
  };

  // 4. Guardar (Crear o Actualizar)
  const handleSave = async () => {
    if (!user?.id) return;
    
    // Validación simple
    if (!formData.accountNumber || !formData.alias) {
      alert("El número de cuenta y el alias son obligatorios");
      return;
    }

    setLoading(true);
    try {
      if (isCreating) {
        // --- LOGICA DE CREAR ---
        await addBeneficiary(formData, user.id);
        alert("Beneficiario agregado");
        setIsCreating(false);
      } else if (selectedId) {
        // --- LOGICA DE ACTUALIZAR ---
        await updateBeneficiary(formData, selectedId, user.id);
        alert("Beneficiario actualizado");
        setIsEditing(false); // Volver a solo lectura
      }
      
      // Recargar la lista y limpiar
      await fetchList(); 
      if (isCreating) {
          setFormData({ alias: '', bankName: '', accountNumber: '' });
          setSelectedId(null);
      }

    } catch (error) {
      console.error(error);
      alert("Error al guardar. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Eliminar
  const handleDelete = async () => {
    if (!user?.id || !selectedId) return;
    if (!confirm("¿Estás seguro de eliminar este beneficiario?")) return;

    setLoading(true);
    try {
      await deleteBeneficiary(selectedId, user.id);
      await fetchList();
      setSelectedId(null); // Limpiar selección
      setFormData({ alias: '', bankName: '', accountNumber: '' });
      alert("Beneficiario eliminado");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && list.length === 0 && !isCreating) return <LoadingScreen />;

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.contentGrid}>
        
        {/* --- COLUMNA IZQUIERDA: LISTA --- */}
        <div className={styles.listCard}>
          <div className={styles.listHeader}>
             Mis Beneficiarios ({list.length})
          </div>
          
          <div className={styles.listContent}>
            {list.map(item => (
              <div 
                key={item.id} 
                className={`${styles.beneficiaryItem} ${selectedId === item.id ? styles.active : ''}`}
                onClick={() => handleSelect(item)}
              >
                <div className={styles.avatarCircle}>
                  <FiUser />
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemAlias}>{item.alias}</span>
                  <span className={styles.itemBank}>{item.bankName || 'Banco desconocido'}</span>
                </div>
              </div>
            ))}
            
            {list.length === 0 && (
                <div style={{padding:'20px', textAlign:'center', color:'#999'}}>
                    No tienes beneficiarios registrados.
                </div>
            )}
          </div>

          <div className={styles.addButtonContainer}>
            <button className={styles.addBtn} onClick={handleAddNew}>
              <FiPlus /> Agregar Nuevo Beneficiario
            </button>
          </div>
        </div>

        {/* --- COLUMNA DERECHA: DETALLE / FORMULARIO --- */}
        <div className={styles.detailCard}>
          
          {!selectedId && !isCreating ? (
            // ESTADO VACÍO (Nada seleccionado)
            <div className={styles.emptyState}>
               <FiUser style={{fontSize:'3rem', marginBottom:'20px', opacity: 0.5}} />
               <p>
                 Selecciona un beneficiario para ver detalles o agrega uno nuevo.
               </p>
            </div>
          ) : (
            // FORMULARIO (Crear o Editar)
            <>
              <div className={styles.detailHeader}>
                <div className={styles.detailTitle}>
                  {isCreating ? 'Nuevo Beneficiario' : `Datos de ${formData.alias}`}
                </div>
                
                {/* Botones Lápiz/Check (Solo si no estamos creando, ya que creando siempre es editable) */}
                {!isCreating && (
                  <div className={styles.actionGroup}>
                    {!isEditing ? (
                      <button className={`${styles.iconBtn} ${styles.btnEdit}`} onClick={() => setIsEditing(true)} title="Editar">
                        <FiEdit2 />
                      </button>
                    ) : (
                      <>
                        <button className={`${styles.iconBtn} ${styles.btnSave}`} onClick={handleSave} title="Guardar">
                          <FiCheck />
                        </button>
                        <button className={`${styles.iconBtn} ${styles.btnCancel}`} onClick={() => setIsEditing(false)} title="Cancelar">
                          <FiX />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* CAMPOS DEL FORMULARIO */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Alias (Nombre corto)</label>
                <input 
                  type="text" 
                  className={`${styles.input} ${isEditing ? styles.inputEditable : styles.inputReadOnly}`}
                  readOnly={!isEditing}
                  value={formData.alias}
                  onChange={e => setFormData({...formData, alias: e.target.value})}
                  placeholder="Ej: Mamá, Juan Alquiler..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Número de Cuenta</label>
                <input 
                  type="text" 
                  className={`${styles.input} ${isEditing ? styles.inputEditable : styles.inputReadOnly}`}
                  readOnly={!isEditing}
                  value={formData.accountNumber}
                  onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                  placeholder="0000-0000-0000-0000"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Banco Destino</label>
                <input 
                  type="text" 
                  className={`${styles.input} ${isEditing ? styles.inputEditable : styles.inputReadOnly}`}
                  readOnly={!isEditing}
                  value={formData.bankName}
                  onChange={e => setFormData({...formData, bankName: e.target.value})}
                  placeholder="Ej: BCP, Interbank..."
                />
              </div>

              {/* Botones Específicos según modo */}
              
              {isCreating && (
                 <div style={{display:'flex', gap:'10px', marginTop:'30px'}}>
                    <Button label="Cancelar" variant="secondary" onClick={() => setIsCreating(false)} />
                    <Button label="Guardar Beneficiario" onClick={handleSave} />
                 </div>
              )}

              {/* Botón Eliminar (Solo si estamos viendo/editando uno existente) */}
              {!isCreating && selectedId && !isEditing && (
                <div className={styles.deleteContainer}>
                  <button 
                    className={styles.btnDelete} 
                    onClick={handleDelete} 
                    title="Eliminar Beneficiario"
                  >
                     <FiTrash2 /> Eliminar Beneficiario
                  </button>
                </div>
              )}

            </>
          )}

        </div>

      </div>

      <Footer />
    </div>
  );
};