import React from 'react';
import PageMeta from '../../components/common/PageMeta';

const UserManagement: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Administration Utilisateurs | Système RH"
        description="Gérer les utilisateurs du système"
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  👑 Administration Utilisateurs
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Contrôle global des utilisateurs système
                </p>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Nouvel Utilisateur
              </button>
            </div>

            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">👥 Panel d'Administration</p>
                <p>Cette page sera bientôt disponible avec toutes les fonctionnalités d'administration des utilisateurs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserManagement;