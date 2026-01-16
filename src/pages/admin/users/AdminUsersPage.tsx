import { useEffect, useState } from 'react';
import styles from './AdminUsersPage.module.css';

// Componentes
import { HeaderAdmin } from '../../../components/HeaderAdmin';
import { Footer } from '../../../components/Footer';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';

// Servicios y Tipos
import { getUsers, unblockUser } from '../../../services/admin';
import type { UserAdminResponse } from '../../../services/admin';

// Iconos
import { FiSearch, FiUser, FiChevronLeft, FiChevronRight, FiUnlock, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { LoadingScreen } from '../../../components/LoadingScreen';

export const AdminUsersPage = () => {
  // Estado de Datos
  const [users, setUsers] = useState<UserAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filtros
  const [term, setTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, TRUE, FALSE
  const [blockedFilter, setBlockedFilter] = useState('ALL'); // ALL, TRUE, FALSE

  // Modal y Selección
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAdminResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // --- EFECTO: Cargar Usuarios ---
  useEffect(() => {
    fetchUsers();
  }, [page, activeFilter, blockedFilter]); 

  // Función para llamar al backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const isActive = activeFilter === 'ALL' ? undefined : (activeFilter === 'TRUE');
      const isBlocked = blockedFilter === 'ALL' ? undefined : (blockedFilter === 'TRUE');

      const data = await getUsers({
        page,
        size: 10,
        term: term || undefined,
        isActive,
        isBlocked
      });
      
      setUsers(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  // --- ACCIÓN: Desbloquear Usuario ---
  const handleUnblock = async () => {
    if (!selectedUser) return;
    
    if (!window.confirm(`¿Seguro que deseas desbloquear a ${selectedUser.fullName}?`)) return;

    setActionLoading(true);
    try {
      await unblockUser(selectedUser.id);
      alert('Usuario desbloqueado exitosamente');
      setIsModalOpen(false);
      fetchUsers(); 
    } catch (error) {
      console.error(error);
      alert('Error al desbloquear usuario');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetails = (u: UserAdminResponse) => {
    setSelectedUser(u);
    setIsModalOpen(true);
  };

  if (loading && isFirstLoad) {
    return <LoadingScreen/>
  }

  return (
    <div className={styles.container}>
      <HeaderAdmin />
      
      <div className={styles.content}>
        <h2 style={{marginBottom: '20px', color: '#1f2937'}}>Gestión de Usuarios</h2>

        {/* --- BARRA DE FILTROS --- */}
        <div className={styles.filterBar}>
            
            {/* Búsqueda por Texto */}
            <div className={styles.filterGroup} style={{flex: 2}}>
                <label className={styles.label}>Buscar</label>
                <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Nombre, DNI o Email..." 
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>

            {/* Filtro Estado */}
            <div className={styles.filterGroup}>
                <label className={styles.label}>Estado Cuenta</label>
                <select 
                    className={styles.select} 
                    value={activeFilter} 
                    onChange={(e) => { setActiveFilter(e.target.value); setPage(0); }}
                >
                    <option value="ALL">Todos</option>
                    <option value="TRUE">Activos</option>
                    <option value="FALSE">Inactivos</option>
                </select>
            </div>

            {/* Filtro Bloqueo */}
            <div className={styles.filterGroup}>
                <label className={styles.label}>Bloqueo</label>
                <select 
                    className={styles.select} 
                    value={blockedFilter} 
                    onChange={(e) => { setBlockedFilter(e.target.value); setPage(0); }}
                >
                    <option value="ALL">Todos</option>
                    <option value="TRUE">Bloqueados</option>
                    <option value="FALSE">Normal</option>
                </select>
            </div>

            {/* Botón Buscar */}
            <button className={styles.searchBtn} onClick={handleSearch} title="Buscar">
                <FiSearch />
            </button>
        </div>

        {/* --- LISTA DE USUARIOS --- */}
        <div className={styles.listContainer}>
            {loading ? (
                /* 1. Estado de Carga (Spinner) */
                <div className={styles.loadingState}>
                    <FiRefreshCw className={styles.spin} />
                    <span>Cargando usuarios...</span>
                </div>
            ) : (
                /* 2. Lista de Datos */
                <>
                    {users.length === 0 ? (
                        /* AQUI ESTÁ EL MENSAJE QUE PEDISTE */
                        <div style={{padding: 60, textAlign: 'center', color: '#888'}}>
                            No se encontraron usuarios con estos criterios.
                        </div>
                    ) : (
                        users.map(u => (
                            <div key={u.id} className={styles.userRow} onClick={() => openDetails(u)}>
                                <div className={styles.iconBox}>
                                    <FiUser />
                                </div>
                                <div>
                                    <span className={styles.userName}>{u.fullName}</span>
                                    <span className={styles.userEmail}>{u.email}</span>
                                </div>
                                <span className={styles.userDoc}>{u.documentId}</span>
                                <span className={styles.userDate}>
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </span>
                                <div className={styles.badgesContainer}>
                                    {u.isBlocked && (
                                        <span className={`${styles.badge} ${styles.badgeBlocked}`}>BLOQUEADO</span>
                                    )}
                                </div>
                                <div style={{color: '#ccc'}}><FiChevronRight /></div>
                            </div>
                        ))
                    )}
                </>
            )}
            
            {/* Paginación */}
            {!loading && totalPages > 1 && (
                <div className={styles.pagination}>
                    <button 
                        className={styles.pageBtn} 
                        disabled={page === 0} 
                        onClick={() => setPage(page - 1)}
                    >
                        <FiChevronLeft /> Anterior
                    </button>
                    <span>Página {page + 1} de {totalPages}</span>
                    <button 
                        className={styles.pageBtn} 
                        disabled={page === totalPages - 1} 
                        onClick={() => setPage(page + 1)}
                    >
                        Siguiente <FiChevronRight />
                    </button>
                </div>
            )}
        </div>

      </div>

      <Footer />

      {/* --- MODAL DETALLES --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Detalles del Usuario"
      >
        {selectedUser && (
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                
                <div style={{textAlign: 'center', marginBottom: '10px'}}>
                    <div style={{
                        width: '60px', height: '60px', background: '#eff6ff', 
                        borderRadius: '50%', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', margin: '0 auto 10px auto',
                        color: '#2563eb', fontSize: '1.5rem'
                    }}>
                        <FiUser />
                    </div>
                    <h3>{selectedUser.fullName}</h3>
                    <span style={{color: '#666', fontSize: '0.9rem'}}>{selectedUser.email}</span>
                </div>

                {selectedUser.isBlocked && (
                    <div style={{
                        background: '#fee2e2', color: '#b91c1c', padding: '10px', 
                        borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px',
                        fontSize: '0.9rem'
                    }}>
                        <FiAlertTriangle />
                        <span>Este usuario está <strong>bloqueado</strong>.</span>
                    </div>
                )}

                <DetailRow label="ID Sistema" value={`#${selectedUser.id}`} />
                <DetailRow label="Documento ID" value={selectedUser.documentId} />
                <DetailRow label="Teléfono" value={selectedUser.phoneNumber} />
                <DetailRow label="Fecha Registro" value={new Date(selectedUser.createdAt).toLocaleString()} />
                
                <div style={{marginTop: '20px', display: 'flex', gap: '10px', flexDirection: 'column'}}>
                    
                    {selectedUser.isBlocked && (
                        <Button 
                            label={actionLoading ? "Desbloqueando..." : "Desbloquear Usuario"} 
                            onClick={handleUnblock}
                            disabled={actionLoading}
                            variant="success"
                            icon={<FiUnlock />}
                        />
                    )}

                    <Button 
                        label="Cerrar" 
                        onClick={() => setIsModalOpen(false)} 
                        variant="secondary" 
                    />
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

// Componente auxiliar
const DetailRow = ({label, value}: {label: string, value: string}) => (
    <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px'}}>
        <span style={{color: '#6b7280', fontSize: '0.95rem'}}>{label}</span>
        <span style={{fontWeight: '600', color: '#374151', textAlign:'right'}}>{value || '-'}</span>
    </div>
);