import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";

interface SalaryHistoryItem {
  id: number;
  ancienSalaire: number;
  nouveauSalaire: number;
  dateEffet: string;
  motif: string;
  notes: string;
  creeLe: string;
  employee: {
    user: {
      firstName: string;
      lastName: string;
    };
    employeeId: string;
    department: string;
  };
  modifier: {
    firstName: string;
    lastName: string;
  };
}

export default function SalaryHistory() {
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalaryHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/payrolls/salary-history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSalaryHistory(data.salaryHistory);
        } else {
          console.error("Erreur lors de la récupération de l'historique des salaires");
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryHistory();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' XOF';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getChangeType = (oldSalary: number, newSalary: number) => {
    if (newSalary > oldSalary) {
      return { type: 'increase', label: 'Augmentation', color: 'text-green-600', bgColor: 'bg-green-50' };
    } else if (newSalary < oldSalary) {
      return { type: 'decrease', label: 'Diminution', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else {
      return { type: 'nochange', label: 'Aucun changement', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const calculateChange = (oldSalary: number, newSalary: number) => {
    const difference = newSalary - oldSalary;
    const percentage = oldSalary > 0 ? ((difference / oldSalary) * 100) : 0;
    return { difference, percentage };
  };

  return (
    <>
      <PageMeta
        title="Historique Salaires | Gestion RH"
        description="Consultez l'historique des salaires"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Historique des Salaires
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Suivez l'évolution des salaires des employés
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Évolution des Salaires
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
            </div>
          ) : salaryHistory.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Aucun historique disponible
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Les changements de salaire apparaîtront ici une fois qu'ils seront enregistrés.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {salaryHistory.map((item) => {
                const changeType = getChangeType(item.ancienSalaire, item.nouveauSalaire);
                const change = calculateChange(item.ancienSalaire, item.nouveauSalaire);

                return (
                  <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {item.employee.user.firstName} {item.employee.user.lastName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.employee.employeeId} • {item.employee.department || 'N/A'}
                            </p>
                          </div>
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${changeType.bgColor} ${changeType.color}`}>
                            {changeType.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Salaire précédent</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(item.ancienSalaire)}
                            </p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <p className="text-sm text-blue-600 dark:text-blue-400">Nouveau salaire</p>
                            <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                              {formatCurrency(item.nouveauSalaire)}
                            </p>
                          </div>
                          <div className={`rounded-lg p-4 ${changeType.bgColor}`}>
                            <p className={`text-sm ${changeType.color}`}>Changement</p>
                            <p className={`text-lg font-semibold ${changeType.color}`}>
                              {change.difference > 0 ? '+' : ''}{formatCurrency(change.difference)}
                              {change.percentage !== 0 && (
                                <span className="text-sm ml-1">
                                  ({change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(1)}%)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Motif</p>
                            <p className="text-sm text-gray-900 dark:text-white">{item.motif}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date d'effet</p>
                            <p className="text-sm text-gray-900 dark:text-white">{formatDate(item.dateEffet)}</p>
                          </div>
                        </div>

                        {item.notes && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                            <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-2 rounded">
                              {item.notes}
                            </p>
                          </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          Modifié par {item.modifier.firstName} {item.modifier.lastName} le {formatDate(item.creeLe)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}