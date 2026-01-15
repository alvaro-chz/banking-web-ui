import { useEffect, useState } from 'react';
import styles from './DashboardPage.module.css';
import { getAdminDashboard } from '../../../services/admin';
import type { AdminDashboardResponse } from '../../../services/admin';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { HeaderAdmin } from '../../../components/HeaderAdmin';
import { Footer } from '../../../components/Footer';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

export const AdminDashboardPage = () => {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para la moneda seleccionada
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  useEffect(() => {
    getAdminDashboard()
      .then(dashboardData => {
          setData(dashboardData);
          // Seleccionar la primera moneda disponible si no hay USD por defecto
          if (dashboardData.transactionCurve) {
             const keys = Object.keys(dashboardData.transactionCurve);
             if (keys.length > 0 && !keys.includes('USD')) {
                 setSelectedCurrency(keys[0]);
             }
          }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <LoadingScreen />;

  // --- 1. DATOS PASTEL ---
  const pieData = [
    { name: 'Retenidos', value: data.retainedUsersCount, color: '#10b981' }, 
    { name: 'Inactivos', value: data.totalUsers - data.retainedUsersCount, color: '#e5e7eb' }
  ];
  const retentionRate = data.totalUsers > 0 
    ? Math.round((data.retainedUsersCount / data.totalUsers) * 100) : 0;

  // --- 2. DATOS CURVAS ---
  const allDates = new Set<string>();
  if(data.transactionCurve) {
      Object.values(data.transactionCurve).forEach(list => 
          list.forEach(point => allDates.add(point.date))
      );
  }
  
  const lineData = Array.from(allDates).sort().map(date => {
      const point: any = { date };
      Object.keys(data.transactionCurve).forEach(currency => {
          const found = data.transactionCurve[currency].find(p => p.date === date);
          point[currency] = found ? found.amount : 0;
      });
      return point;
  });

  // Colores fijos para las principales, fallback aleatorio para otras
  const colors: Record<string, string> = { PEN: '#ef4444', USD: '#3b82f6', MXN: '#10b981', EUR: '#f59e0b' };
  const availableCurrencies = data.transactionCurve ? Object.keys(data.transactionCurve) : [];

  // Formateador para el eje Y (ej: 5000 -> 5k o 5,000)
  const formatYAxis = (tickItem: number) => {
      return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(tickItem);
  };

  return (
    <div className={styles.container}>
      <HeaderAdmin />

      <div className={styles.content}>
          <h1 className={styles.title}>Dashboard General</h1>

          <div className={styles.topGrid}>
            {/* Tarjeta Pastel */}
            <div className={styles.card}>
                <h3>Retención de Usuarios</h3>
                <div className={styles.pieContainer}>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie 
                                data={pieData} 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.pieText}>
                        <span className={styles.bigNumber}>{retentionRate}%</span>
                        <span className={styles.label}>Retenidos</span>
                    </div>
                </div>
                <div className={styles.statsRow}>
                    <div>Total: <strong>{data.totalUsers}</strong></div>
                    <div>Activos: <strong>{data.retainedUsersCount}</strong></div>
                </div>
            </div>

            {/* Tarjeta Bloqueados */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3>Usuarios Bloqueados ({data.totalBlockedUsersCount})</h3>
                </div>
                <div className={styles.blockedList}>
                    {data.lastUsersBlocked.length === 0 ? (
                        <p style={{color: '#999', textAlign: 'center', marginTop: '40px'}}>
                            No hay usuarios bloqueados recientemente.
                        </p>
                    ) : (
                        data.lastUsersBlocked.map((u, i) => (
                            <div key={i} className={styles.blockedItem}>
                                <div className={styles.blockedInfo}>
                                    <span className={styles.bName}>{u.name}</span>
                                    <span className={styles.bDoc}>{u.documentId}</span>
                                </div>
                                <span className={styles.bDate}>
                                    {new Date(u.blockedAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>

          {/* Gráfico de Líneas con SELECTOR */}
          <div className={`${styles.card} ${styles.chartCard}`}>
              <div className={styles.chartHeader}>
                  <h3>Volumen Transaccional</h3>
                  
                  {/* 👇 CAMBIO A SELECT: Escalable para N monedas */}
                  <div className={styles.filterGroup}>
                      <label htmlFor="currencySelect" className={styles.filterLabel}>Moneda:</label>
                      <select 
                        id="currencySelect"
                        className={styles.currencySelect}
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                      >
                          {availableCurrencies.map(c => (
                              <option key={c} value={c}>{c}</option>
                          ))}
                      </select>
                  </div>
              </div>
              
              <div style={{width: '100%', height: 300}}>
                <ResponsiveContainer>
                    <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tick={{fontSize: 12}} 
                            tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {day:'2-digit', month:'2-digit'})}
                        />
                        <YAxis 
                            tickFormatter={formatYAxis} 
                            tick={{fontSize: 12}}
                        />
                        <Tooltip 
                            formatter={(value: any) => [
                                value ? Number(value).toLocaleString() : '0', 
                                'Monto Total'
                            ]}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Legend />
                        
                        <Line 
                            type="monotone" 
                            dataKey={selectedCurrency} 
                            name={`Total en ${selectedCurrency}`}
                            stroke={colors[selectedCurrency] || '#8884d8'} 
                            strokeWidth={3}
                            dot={{r: 4}}
                            activeDot={{r: 6}}
                            animationDuration={800}
                        />
                    </LineChart>
                </ResponsiveContainer>
              </div>
          </div>
      </div>

      <Footer />
    </div>
  );
};