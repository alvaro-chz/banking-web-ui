import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { AccountsPage } from '../pages/accounts/AccountsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { CreateAccountPage } from '../pages/accounts/CreateAccountPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { BeneficiariesPage } from '../pages/beneficiaries/BeneficiariesPage';
import { TransactionsPage } from '../pages/transactions/TransactionsPage';
import { NewTransactionPage } from '../pages/transactions/NewTransactionPage';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Rutas Privadas (Protegidas) */}
      <Route element={<ProtectedRoute />}>
         {/* Todas las rutas que pongas aquí requerirán login automáticamente */}
         <Route path="/accounts" element={<AccountsPage />} />
         {/* <Route path="/transfers" element={<TransfersPage />} /> */}
         <Route path="/create-account" element={<CreateAccountPage />} />
         <Route path="/profile" element={<ProfilePage />} />
         <Route path="/beneficiaries" element={<BeneficiariesPage />} />
         <Route path="/transactions" element={<TransactionsPage />} />
         <Route path="/transactions/new" element={<NewTransactionPage />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/accounts" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};