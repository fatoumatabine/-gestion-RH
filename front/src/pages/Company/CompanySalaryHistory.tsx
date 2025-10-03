import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { companyService, CompanyHistoriqueSalaire } from "../../services/company";
import { useToast } from "../../context/ToastContext";

export default function CompanySalaryHistory() {
  const [salaryHistory, setSalaryHistory] = useState<CompanyHistoriqueSalaire[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    loadSalaryHistory();
  }, []);

  const loadSalaryHistory = async () => {
    try {
      setLoading(true);
      const data = await companyService.getHistoriqueSalaires();
      setSalaryHistory(data);
    } catch (err) {
      console.error("Error loading salary history:", err);
      showError("Erreur", "Impossible de charger l'historique des salaires");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' XOF';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Historique des salaires | Gestion RH"
        description="Historique des modifications de salaire"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Historique des salaires
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Suivi des modifications de salaire des employés
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          {salaryHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun historique trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Les modifications de salaire apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {salaryHistory.map((history) => (
                <div
                  key={history.id}
                  className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">👤</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {history.employee.user.firstName} {history.employee.user.lastName}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {history.employeId}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                            <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                              Ancien salaire
                            </div>
                            <div className="text-lg font-semibold text-red-900 dark:text-red-100">
                              {formatCurrency(history.ancienSalaire)}
                            </div>
                          </div>

                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                              Nouveau salaire
                            </div>
                            <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                              {formatCurrency(history.nouveauSalaire)}
                            </div>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                              Différence
                            </div>
                            <div className={`text-lg font-semibold ${
                              history.nouveauSalaire > history.ancienSalaire
                                ? 'text-green-900 dark:text-green-100'
                                : 'text-red-900 dark:text-red-100'
                            }`}>
                              {history.nouveauSalaire > history.ancienSalaire ? '+' : ''}
                              {formatCurrency(history.nouveauSalaire - history.ancienSalaire)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Motif:</span> {history.motif}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(history.dateEffet).toLocaleDateString('fr-FR')}
                          </div>
                          <div>
                            <span className="font-medium">Modifié par:</span> {history.modifier.firstName} {history.modifier.lastName}
                          </div>
                        </div>

                        {history.notes && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Notes:
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {history.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        history.nouveauSalaire > history.ancienSalaire
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : history.nouveauSalaire < history.ancienSalaire
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {history.nouveauSalaire > history.ancienSalaire ? 'Augmentation' :
                         history.nouveauSalaire < history.ancienSalaire ? 'Diminution' : 'Aucun changement'}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(history.creeLe).toLocaleDateString('fr-FR')} à {new Date(history.creeLe).toLocaleTimeString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}