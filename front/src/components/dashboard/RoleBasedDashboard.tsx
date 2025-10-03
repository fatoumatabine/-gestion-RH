import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import AdminDashboard from './AdminDashboard';
import CompanyAdminDashboard from './CompanyAdminDashboard';
import CashierDashboard from './CashierDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  const { company } = useCompany();

  if (!user) {
    return <div>Chargement...</div>;
  }

  switch (user.role) {
    case 'SUPERADMIN':
      return <AdminDashboard />;
    case 'ADMIN':
      // Si l'admin a une entreprise associée, afficher le dashboard entreprise
      return company ? <CompanyAdminDashboard /> : <AdminDashboard />;
    case 'CASHIER':
      return <CashierDashboard />;
    case 'EMPLOYEE':
      return <EmployeeDashboard />;
    default:
      return <div>Rôle non reconnu</div>;
  }
};

export default RoleBasedDashboard;