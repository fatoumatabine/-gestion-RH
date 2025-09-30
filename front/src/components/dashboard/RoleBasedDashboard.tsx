import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import CashierDashboard from './CashierDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Chargement...</div>;
  }

  switch (user.role) {
    case 'ADMIN':
    case 'SUPERADMIN':
      return <AdminDashboard />;
    case 'CASHIER':
      return <CashierDashboard />;
    case 'EMPLOYEE':
      return <EmployeeDashboard />;
    default:
      return <div>Rôle non reconnu</div>;
  }
};

export default RoleBasedDashboard;