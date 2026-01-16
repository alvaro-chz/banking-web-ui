import { useEffect, useState } from 'react';
import styles from './AdminTransactionsPage.module.css'; // Reutiliza o crea este CSS

// Componentes
import { HeaderAdmin } from '../../../components/HeaderAdmin';
import { Footer } from '../../../components/Footer';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';

// Servicios y Tipos
import { getAllTransactions } from '../../../services/admin';
import type { TransactionResponse } from '../../../services/transaction'; // Importamos el tipo existente

// Iconos
import { FiArrowUpRight, FiArrowDownLeft, FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { LoadingScreen } from '../../../components/LoadingScreen';

export const AdminTransactionsPage = () => {
  
  // Estados de Datos
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true); // Para la carga inicial
  
  // Paginación
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filtros
  const [accountNumber, setAccountNumber] = useState(''); // 👈 INPUT TEXTO
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null);

  // --- EFECTO: Cargar Transacciones ---
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // Solo recargamos automático al cambiar de página

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getAllTransactions({
        accountNumber: accountNumber || undefined,
        status: statusFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        size: 10
      });
      
      setTransactions(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  };

  // Manejador de búsqueda manual (Botón o Enter)
  const handleSearch = () => {
    setPage(0);
    fetchTransactions();
  };

  const openDetails = (tx: TransactionResponse) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  // --- HELPERS VISUALES (Igual que en TransactionPage) ---
  const getIcon = (type: string) => {
    switch (type) {
      case 'DEPOSITO':
      case 'PAGO_INTERESES': return <FiArrowDownLeft />; 
      case 'TRANSFERENCIA':
      case 'RETIRO': return <FiArrowUpRight />;
      case 'PAGO_SERVICIO': return <FiRefreshCw />;
      default: return <FiSearch />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TRANSFERENCIA': return 'Transferencia';
      case 'DEPOSITO':      return 'Depósito';
      case 'RETIRO':        return 'Retiro';
      case 'PAGO_SERVICIO': return 'Pago de Servicio';
      case 'PAGO_INTERESES': return 'Pago de Intereses';
      default: return type;
    }
  };

  const isPositive = (type: string) => 
    type === 'DEPOSITO' || type === 'PAGO_INTERESES';

  if (loading && isFirstLoad) {
    return <LoadingScreen/>
  }

  return (
    <div className={styles.container}>
      <HeaderAdmin />
      
      <div className={styles.content}>
        
        <h2 style={{marginBottom: '20px', color: '#1f2937'}}>Monitor de Transacciones</h2>

        {/* --- FILTROS --- */}
        <div className={styles.filterBar}>
            
            {/* 1. INPUT CUENTA (Cambio principal) */}
            <div className={styles.filterGroup} style={{flex: 2, minWidth: '200px'}}>
                <label className={styles.label}>N° Cuenta</label>
                <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Ej: 100-2026-001" 
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>

            {/* 2. Fechas */}
            <div className={styles.filterGroup}>
                <label className={styles.label}>Desde</label>
                <input type="date" className={styles.input} value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>

            <div className={styles.filterGroup}>
                <label className={styles.label}>Hasta</label>
                <input type="date" className={styles.input} value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>

            {/* 3. Estado */}
            <div className={styles.filterGroup}>
                <label className={styles.label}>Estado</label>
                <select className={styles.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="SUCCESS">Exitoso</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="FAILED">Fallido</option>
                </select>
            </div>

            {/* 4. Botón Buscar */}
            <button className={styles.searchBtn} onClick={handleSearch} title="Buscar filtros">
                <FiSearch />
            </button>
        </div>

        {/* --- LISTA --- */}
        <div className={styles.listContainer}>
            {loading ? (
                <div className={styles.loadingState}>
                    <FiRefreshCw className={styles.spin} />
                    <span>Cargando transacciones...</span>
                </div>
            ) : (
              <>
                {transactions.length === 0 ? (
                    <div style={{padding: 60, textAlign: 'center', color: '#888'}}>
                        No se encontraron transacciones con estos criterios.
                    </div>
                ) : (
                    transactions.map(tx => (
                        <div key={tx.id} className={styles.transactionRow} onClick={() => openDetails(tx)}>
                            <div className={styles.iconBox}>{getIcon(tx.transactionType)}</div>
                            
                            <div>
                                <span className={styles.transDesc}>{getTypeLabel(tx.transactionType)}</span>
                                <span className={styles.transRef}>{tx.description || 'Sin descripción'}</span>
                            </div>

                            <span className={styles.transDate}>
                                {new Date(tx.createdAt).toLocaleDateString()}
                            </span>

                            <span className={`${styles.transAmount} ${isPositive(tx.transactionType) ? styles.positive : styles.negative}`}>
                                {isPositive(tx.transactionType) ? '+' : '-'} {tx.amount.toFixed(2)} {tx.currency}
                            </span>

                            <span className={`${styles.statusBadge} ${styles[`status${tx.transactionStatus}`]}`}>
                                {tx.transactionStatus}
                            </span>
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

      {/* --- MODAL DETALLES (Idéntico a TransactionPage) --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Detalles de Transacción"
      >
        {selectedTx && (
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                
                <div style={{textAlign: 'center', marginBottom: '10px'}}>
                    <h1 style={{color: isPositive(selectedTx.transactionType) ? '#16a34a' : '#333'}}>
                       {selectedTx.amount.toFixed(2)} {selectedTx.currency}
                    </h1>
                    <span className={`${styles.statusBadge} ${styles[`status${selectedTx.transactionStatus}`]}`}>
                        {selectedTx.transactionStatus}
                    </span>
                </div>

                <DetailRow label="ID Interno" value={`#${selectedTx.id}`} />
                <DetailRow label="Tipo" value={getTypeLabel(selectedTx.transactionType)} />
                <DetailRow label="Fecha" value={new Date(selectedTx.createdAt).toLocaleString()} />
                <DetailRow label="Referencia" value={selectedTx.referenceCode} />
                <DetailRow label="Origen" value={selectedTx.sourceAccount} />
                <DetailRow label="Destino" value={selectedTx.targetAccount} />
                <DetailRow label="Descripción" value={selectedTx.description} />
                
                <div style={{marginTop: '20px'}}>
                    <Button label="Cerrar" onClick={() => setIsModalOpen(false)} variant="secondary" />
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

// Componente auxiliar
const DetailRow = ({label, value}: {label: string, value: string}) => (
    <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>
        <span style={{color: '#666'}}>{label}</span>
        <span style={{fontWeight: '600', color: '#333', textAlign:'right'}}>{value || '-'}</span>
    </div>
);