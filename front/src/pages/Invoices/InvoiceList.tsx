import React from 'react';
import PageMeta from '../../components/common/PageMeta';

const InvoiceList: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Gestion des Factures | Système RH"
        description="Gérer les factures et paiements"
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gestion des Factures
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Gérez vos factures et paiements
                </p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Nouvelle Facture
              </button>
            </div>

            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">📄 Module Facturation</p>
                <p>Cette page sera bientôt disponible avec toutes les fonctionnalités de gestion des factures.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceList;