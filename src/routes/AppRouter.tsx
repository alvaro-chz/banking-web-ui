import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { AccountsPage } from '../pages/client/accounts/AccountsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { CreateAccountPage } from '../pages/client/accounts/CreateAccountPage';
import { ProfilePage } from '../pages/client/profile/ProfilePage';
import { BeneficiariesPage } from '../pages/client/beneficiaries/BeneficiariesPage';
import { TransactionsPage } from '../pages/client/transactions/TransactionsPage';
import { NewTransactionPage } from '../pages/client/transactions/NewTransactionPage';
import { AdminDashboardPage } from '../pages/admin/dashboard/DashboardPage';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Rutas Privadas (Protegidas) */}
      <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
         {/* Todas las rutas que pongas aquí requerirán login automáticamente */}
         <Route path="/accounts" element={<AccountsPage />} />
         {/* <Route path="/transfers" element={<TransfersPage />} /> */}
         <Route path="/create-account" element={<CreateAccountPage />} />
         <Route path="/profile" element={<ProfilePage />} />
         <Route path="/beneficiaries" element={<BeneficiariesPage />} />
         <Route path="/transactions" element={<TransactionsPage />} />
         <Route path="/transactions/new" element={<NewTransactionPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
         {/* Aquí pondremos las páginas del Admin */}
         <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/accounts" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};