import React from 'react';
import { useAuth } from '../../context/AuthContext';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            👤 Mon Espace Employé
          </h1>
          <p className="text-gray-600">
            Bienvenue {user?.firstName} ! Consultez vos informations et paiements.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Mes Informations</h3>
              <p className="text-blue-700 text-sm">Consultez vos données personnelles</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Mes Paiements</h3>
              <p className="text-green-700 text-sm">Historique de vos bulletins de salaire</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;