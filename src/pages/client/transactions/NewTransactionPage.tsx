import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NewTransactionPage.module.css';

// Componentes
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { Button } from '../../../components/Button';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { Modal } from '../../../components/Modal';

// Context y Servicios
import { useAuth } from '../../../context/AuthContext';
import { getAccountsByUserId } from '../../../services/account';
import type { AccountResponse } from '../../../services/account';
import { getBeneficiaries } from '../../../services/beneficiary';
import type { BeneficiaryResponse } from '../../../services/beneficiary';
import { performTransfer, performDeposit, performWithdraw, performPayment } from '../../../services/transaction';

// Iconos
import { FiArrowUpRight, FiArrowDownLeft, FiCreditCard, FiDollarSign, FiUsers } from 'react-icons/fi';

type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAW' | 'PAYMENT';

export const NewTransactionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryResponse[]>([]); // 👈 Estado para beneficiarios
  
  // Modales beneficiarios y cuentas
  const [isBenModalOpen, setIsBenModalOpen] = useState(false);
  const [isMyAccountsModalOpen, setIsMyAccountsModalOpen] = useState(false);

  // Estado del Formulario
  const [type, setType] = useState<TransactionType>('TRANSFER');
  const [formData, setFormData] = useState({
    sourceAccount: '', 
    targetAccount: '', 
    amount: '',
    currency: 'USD',
    description: '',
    serviceName: '',   
    supplyCode: ''     
  });

  // Cargar cuentas y beneficiarios
  useEffect(() => {
    if (user?.id) {
      // 1. Cargar Cuentas
      getAccountsByUserId(user.id).then(data => {
        setAccounts(data);
        if (data.length > 0) {
            setFormData(prev => ({ ...prev, sourceAccount: data[0].accountNumber }));
        }
      });

      // 2. Cargar Beneficiarios (para tenerlos listos)
      getBeneficiaries(user.id).then(data => {
        setBeneficiaries(data);
      });
    }
  }, [user]);

  // Helper para obtener moneda
  const getSelectedAccountCurrency = (accountNum: string) => {
    const acc = accounts.find(a => a.accountNumber === accountNum);
    return acc ? acc.currency : 'USD';
  };

  // Helper para seleccionar un beneficiario del modal
  const selectBeneficiary = (accountNumber: string) => {
    setFormData(prev => ({ ...prev, targetAccount: accountNumber }));
    setIsBenModalOpen(false);
  };

  const selectMyAccount = (accountNumber: string) => {
    setFormData(prev => ({ ...prev, targetAccount: accountNumber }));
    setIsMyAccountsModalOpen(false);
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum) || amountNum <= 0) throw new Error("Monto inválido");
      if (!formData.description) throw new Error("Agrega una descripción");

      const commonData = {
          amount: amountNum,
          currency: formData.currency, // ¡Aquí va lo que eligió el usuario!
          description: formData.description
      };

      switch (type) {
        case 'TRANSFER':
          if (!formData.sourceAccount || !formData.targetAccount) throw new Error("Faltan cuentas");
          await performTransfer({
            sourceAccount: formData.sourceAccount,
            targetAccount: formData.targetAccount,
            ...commonData
          }, user.id);
          break;

        case 'DEPOSIT':
            if (!formData.targetAccount) throw new Error("Selecciona cuenta destino");
            await performDeposit({
                targetAccount: formData.targetAccount,
                ...commonData
            });
            break;

        case 'WITHDRAW':
            if (!formData.sourceAccount) throw new Error("Selecciona cuenta origen");
            await performWithdraw({
                sourceAccount: formData.sourceAccount,
                ...commonData
            }, user.id);
            break;

        case 'PAYMENT':
            if (!formData.serviceName || !formData.supplyCode) throw new Error("Faltan datos del servicio");
            await performPayment({
                sourceAccount: formData.sourceAccount,
                serviceName: formData.serviceName,
                supplyCode: formData.supplyCode,
                ...commonData
            }, user.id);
            break;
      }

      alert("¡Transacción Exitosa!");
      navigate('/transactions');

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error al procesar la transacción");
    } finally {
      setLoading(false);
    }
  };

  const renderFields = () => {
    return (
      <>
        {/* CUENTA ORIGEN (Para todo MENOS Depósito) */}
        {type !== 'DEPOSIT' && (
           <div className={styles.formGroup}>
              <label className={styles.label}>Cuenta de Origen (Cargo)</label>
              <select 
                 className={styles.select}
                 value={formData.sourceAccount}
                 onChange={e => setFormData({...formData, sourceAccount: e.target.value})}
              >
                 {accounts.map(acc => (
                   <option key={acc.id} value={acc.accountNumber}>
                     {acc.accountType} - {acc.accountNumber} - {acc.currency} ({acc.currentBalance})
                   </option>
                 ))}
              </select>
           </div>
        )}

        {/* CUENTA DESTINO (Solo Transferencia - Con botón de Beneficiarios) */}
        {type === 'TRANSFER' && (
           <div className={styles.formGroup}>
              <label className={styles.label}>Cuenta Destino (A quien envías)</label>
              
              {/* 👇 AQUÍ ESTÁ EL CAMBIO: Input Group con Botón */}
              <div className={styles.inputGroup}>
                <input 
                    className={`${styles.input} ${styles.inputGroupInput}`} // Clase combinada si necesitas
                    placeholder="Número de cuenta del destinatario"
                    value={formData.targetAccount}
                    onChange={e => setFormData({...formData, targetAccount: e.target.value})}
                />
                
                <button 
                    type="button" // Importante para no enviar el form
                    className={styles.iconInputBtn}
                    onClick={() => setIsBenModalOpen(true)}
                    title="Seleccionar Beneficiario"
                >
                    <FiUsers />
                </button>
              </div>

           </div>
        )}

        {/* CUENTA DESTINO DEPÓSITO (Híbrido: Manual / Mis Cuentas / Beneficiarios) */}
        {type === 'DEPOSIT' && (
           <div className={styles.formGroup}>
              <label className={styles.label}>Cuenta de Destino (Donde recibes)</label>
              
              <div className={styles.inputGroup}>
                {/* 1. Campo Manual */}
                <input 
                    className={`${styles.input} ${styles.inputGroupInput}`}
                    placeholder="Ingresa cuenta o selecciona ->"
                    value={formData.targetAccount}
                    onChange={e => setFormData({...formData, targetAccount: e.target.value})}
                />
                
                {/* 2. Botón Mis Cuentas */}
                <button 
                    type="button"
                    className={styles.iconInputBtn}
                    onClick={() => setIsMyAccountsModalOpen(true)}
                    title="Seleccionar una de mis cuentas"
                    style={{backgroundColor: '#f0fdf4', borderColor: '#16a34a', color: '#16a34a'}} // Un toque verde para diferenciar
                >
                    <FiCreditCard />
                </button>

                {/* 3. Botón Beneficiarios */}
                <button 
                    type="button"
                    className={styles.iconInputBtn}
                    onClick={() => setIsBenModalOpen(true)}
                    title="Seleccionar Beneficiario"
                >
                    <FiUsers />
                </button>
              </div>
           </div>
        )}

        {/* CAMPOS EXTRA PARA PAGO DE SERVICIOS (Sin cambios) */}
        {type === 'PAYMENT' && (
           <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
              <div className={styles.formGroup}>
                 <label className={styles.label}>Servicio</label>
                 <input 
                    className={styles.input} placeholder="Ej: Luz del Sur, Sedapal"
                    value={formData.serviceName}
                    onChange={e => setFormData({...formData, serviceName: e.target.value})}
                 />
              </div>
              <div className={styles.formGroup}>
                 <label className={styles.label}>Código Suministro</label>
                 <input 
                    className={styles.input} placeholder="Ej: 1234567"
                    value={formData.supplyCode}
                    onChange={e => setFormData({...formData, supplyCode: e.target.value})}
                 />
              </div>
           </div>
        )}

        <div className={styles.formGroup}>
           <label className={styles.label}>Monto y Moneda</label>
           
           <div className={styles.inputGroup}>
                <input 
                    type="number"
                    className={`${styles.input} ${styles.inputGroupInput}`}
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                />
                
                {/* Selector de Moneda integrado */}
                <select 
                    className={styles.currencySelect} // Necesitaremos estilo para esto
                    value={formData.currency}
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                    style={{width: '100px', flex: 'none'}}
                >
                    <option value="USD">USD ($)</option>
                    <option value="PEN">PEN (S/)</option>
                    <option value="MXN">MXN ($)</option>
                </select>
           </div>
           
           {/* Feedback visual pequeño */}
           {type !== 'DEPOSIT' && formData.sourceAccount && getSelectedAccountCurrency(formData.sourceAccount) !== formData.currency && (
               <small style={{color: '#eab308', marginTop: '5px', display: 'block'}}>
                   ⚠️ Tu cuenta es en {getSelectedAccountCurrency(formData.sourceAccount)}. Se aplicará tipo de cambio.
               </small>
           )}
        </div>

        <div className={styles.formGroup}>
           <label className={styles.label}>Descripción / Referencia</label>
           <input 
              className={styles.input}
              placeholder="Ej: Pago de alquiler, Cena, Ahorros..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
           />
        </div>
      </>
    );
  };

  const getTypeLabel = (t: TransactionType) => {
    switch (t) {
        case 'TRANSFER': return 'Transferencia';
        case 'DEPOSIT': return 'Depósito';
        case 'WITHDRAW': return 'Retiro';
        case 'PAYMENT': return 'Pago de Servicio';
        default: return t;
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.contentGrid}>
        
        <div className={styles.formCard}>
           <h2 className={styles.sectionTitle}>Nueva Transacción</h2>
           
           <div className={styles.typeGrid}>
              <button className={`${styles.typeBtn} ${type === 'TRANSFER' ? styles.active : ''}`} onClick={() => setType('TRANSFER')}>
                 <FiArrowUpRight className={styles.typeIcon} /> Transferencia
              </button>
              <button className={`${styles.typeBtn} ${type === 'PAYMENT' ? styles.active : ''}`} onClick={() => setType('PAYMENT')}>
                 <FiCreditCard className={styles.typeIcon} /> Pago Servicio
              </button>
              <button className={`${styles.typeBtn} ${type === 'DEPOSIT' ? styles.active : ''}`} onClick={() => setType('DEPOSIT')}>
                 <FiArrowDownLeft className={styles.typeIcon} /> Depósito
              </button>
              <button className={`${styles.typeBtn} ${type === 'WITHDRAW' ? styles.active : ''}`} onClick={() => setType('WITHDRAW')}>
                 <FiDollarSign className={styles.typeIcon} /> Retiro
              </button>
           </div>

           {renderFields()}

           <div className={styles.actions}>
              <Button label="Cancelar" variant="secondary" onClick={() => navigate('/transactions')} />
              <Button label="Confirmar Operación" onClick={handleSubmit} />
           </div>
        </div>

        <div className={styles.previewCard}>
           <div className={styles.previewTitle}>Resumen de Operación</div>
           
           <div className={`${styles.amountPreview} ${type === 'DEPOSIT' ? styles.deposit : styles.expense}`}>
              {type === 'DEPOSIT' ? '+' : '-'} {formData.amount || '0.00'}
              <span style={{fontSize: '1rem', marginLeft:'5px'}}>{formData.currency}</span>
           </div>

           <div className={styles.previewRow}>
              <span className={styles.pLabel}>Tipo</span>
              <span className={styles.pValue}>{getTypeLabel(type)}</span>
           </div>

           <div className={styles.previewRow}>
              <span className={styles.pLabel}>Desde</span>
              <span className={styles.pValue}>
                 {type === 'DEPOSIT' ? 'Externo / Ventanilla' : formData.sourceAccount || '-'}
              </span>
           </div>

           <div className={styles.previewRow}>
              <span className={styles.pLabel}>Para</span>
              <span className={styles.pValue}>
                 {type === 'PAYMENT' ? formData.serviceName : (formData.targetAccount || '-')}
              </span>
           </div>

           <div className={styles.previewRow}>
              <span className={styles.pLabel}>Descripción</span>
              <span className={styles.pValue}>{formData.description || '-'}</span>
           </div>
        </div>

      </div>

      <Footer />

      {/* 👇 MODAL DE BENEFICIARIOS */}
      <Modal
        isOpen={isBenModalOpen}
        onClose={() => setIsBenModalOpen(false)}
        title="Seleccionar Beneficiario"
      >
        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
            {beneficiaries.length === 0 ? (
                <p style={{textAlign:'center', color:'#999', padding:'20px'}}>
                    No tienes beneficiarios registrados.
                </p>
            ) : (
                beneficiaries.map(ben => (
                    <div 
                        key={ben.id} 
                        className={styles.beneficiaryItem}
                        onClick={() => selectBeneficiary(ben.accountNumber)}
                    >
                        <div>
                            <div className={styles.benAlias}>{ben.alias}</div>
                            <div className={styles.benAccount}>
                                {ben.accountNumber} 
                                <span className={styles.benBank}>({ben.bankName || 'Otro banco'})</span>
                            </div>
                        </div>
                        <FiArrowUpRight style={{color: '#ccc'}} />
                    </div>
                ))
            )}
        </div>
      </Modal>

      {/* 👇 MODAL DE MIS CUENTAS (Para Depósito) */}
      <Modal
        isOpen={isMyAccountsModalOpen}
        onClose={() => setIsMyAccountsModalOpen(false)}
        title="Seleccionar Mis Cuentas"
      >
        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
            {accounts.map(acc => (
                <div 
                    key={acc.id} 
                    className={styles.beneficiaryItem} // Reusamos el estilo de item
                    onClick={() => selectMyAccount(acc.accountNumber)}
                >
                    <div>
                        <div className={styles.benAlias}>{acc.accountType}</div> {/* Usamos Tipo como título */}
                        <div className={styles.benAccount}>
                            {acc.accountNumber} 
                            <span className={styles.benBank} style={{color: '#2563eb'}}>({acc.currency})</span>
                        </div>
                        <div style={{fontSize: '0.8rem', color: '#666'}}>
                            Saldo: {acc.currentBalance} {acc.currency}
                        </div>
                    </div>
                    <FiArrowDownLeft style={{color: '#16a34a'}} />
                </div>
            ))}
        </div>
      </Modal>

    </div>
  );
};