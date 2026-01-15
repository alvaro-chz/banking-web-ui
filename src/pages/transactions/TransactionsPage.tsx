import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TransactionsPage.module.css';

// Componentes
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';

// Context y Servicios
import { useAuth } from '../../context/AuthContext';
import { getAccountsByUserId } from '../../services/account';
import type { AccountResponse } from '../../services/account';
import { getTransactionHistory } from '../../services/transaction';
import type { TransactionResponse } from '../../services/transaction';

// Iconos
import { FiPlus, FiArrowUpRight, FiArrowDownLeft, FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const TransactionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados de Datos
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>(''); // Número de cuenta
  
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filtros
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null);

  // 1. Cargar Cuentas al inicio
  useEffect(() => {
    if (user?.id) {
      getAccountsByUserId(user.id).then(data => {
        setAccounts(data);
        if (data.length > 0) {
          setSelectedAccount(data[0].accountNumber); // Seleccionar la primera por defecto
        }
      });
    }
  }, [user]);

  // 2. Cargar Historial cuando cambian los filtros o la cuenta
  useEffect(() => {
    if (user?.id && selectedAccount) {
      fetchHistory();
    }
  }, [user, selectedAccount, page, statusFilter, fromDate, toDate]);

  const fetchHistory = async () => {
    if (!user?.id || !selectedAccount) return;
    try {
      const data = await getTransactionHistory(selectedAccount, user.id, {
        page,
        size: 10,
        status: statusFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      });
      setTransactions(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (tx: TransactionResponse) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  // Icono según tipo de transacción
  const getIcon = (type: string) => {
    switch (type) {
      case 'DEPOSITO':
      case 'PAGO_INTERESES':
        return <FiArrowDownLeft />; 
      case 'TRANSFERENCIA':
      case 'RETIRO':
        return <FiArrowUpRight />;
      case 'PAGO_SERVICIO':
        return <FiRefreshCw />;
      default: return <FiSearch />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TRANSFERENCIA': return 'Transferencia';
      case 'DEPOSITO':      return 'Depósito'; // Le ponemos la tilde para la vista
      case 'RETIRO':        return 'Retiro';
      case 'PAGO_SERVICIO': return 'Pago de Servicio';
      case 'PAGO_INTERESES': return 'Pago de Intereses';
      default: return type; // Si llega algo raro, lo mostramos tal cual
    }
  };

  // Color del monto
  const isPositive = (type: string) => 
    type === 'DEPOSITO' || type === 'PAGO_INTERESES';

  if (loading && accounts.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.content}>
        
        <h2 style={{marginBottom: '20px', color: '#333'}}>Historial de Transacciones</h2>

        {/* --- FILTROS --- */}
        <div className={styles.filterBar}>
            
            {/* Selector de Cuenta */}
            <div className={styles.filterGroup} style={{flex: 2}}>
                <label className={styles.label}>Cuenta</label>
                <select 
                    className={styles.select}
                    value={selectedAccount}
                    onChange={(e) => { setSelectedAccount(e.target.value); setPage(0); }}
                >
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.accountNumber}>
                            {acc.accountType} - {acc.accountNumber} ({acc.currency})
                        </option>
                    ))}
                </select>
            </div>

            {/* Fechas */}
            <div className={styles.filterGroup}>
                <label className={styles.label}>Desde</label>
                <input type="date" className={styles.input} value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>

            <div className={styles.filterGroup}>
                <label className={styles.label}>Hasta</label>
                <input type="date" className={styles.input} value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>

            {/* Estado */}
            <div className={styles.filterGroup}>
                <label className={styles.label}>Estado</label>
                <select className={styles.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="SUCCESS">Exitoso</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="FAILED">Fallido</option>
                </select>
            </div>

            {/* Botón Nueva Transacción */}
            <button 
                className={styles.newTransactionBtn} 
                onClick={() => navigate('/transactions/new')}
                title="Nueva Transacción"
            >
                <FiPlus />
            </button>
        </div>

        {/* --- LISTA --- */}
        <div className={styles.listContainer}>
            {loading ? (
                <div className={styles.loadingState}>
                    <FiRefreshCw className={styles.spin} />
                    <span>Actualizando historial...</span>
                </div>
            ) : (
              <>
                {transactions.length === 0 ? (
                    <div style={{padding: 40, textAlign: 'center', color: '#888'}}>
                        No se encontraron transacciones con estos filtros.
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
            {totalPages > 1 && (
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

      {/* --- POP-UP DETALLES (MODAL) --- */}
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

// Componente auxiliar para filas del modal
const DetailRow = ({label, value}: {label: string, value: string}) => (
    <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>
        <span style={{color: '#666'}}>{label}</span>
        <span style={{fontWeight: '600', color: '#333', textAlign:'right'}}>{value || '-'}</span>
    </div>
);