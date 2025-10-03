import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import { useToast } from "../../context/ToastContext";

interface PayRun {
  id: number;
  reference: string;
  dateDebut: string;
  dateFin: string;
  datePaiement: string;
  statut: string;
  totalBrut: number;
  totalNet: number;
  totalDeductions: number;
  nombreEmployes: number;
  entreprise: {
    nom: string;
  };
  creator: {
    firstName: string;
    lastName: string;
  };
  _count: {
    bulletins: number;
  };
}

interface PayRunsResponse {
  payRuns: PayRun[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const statusConfig = {
  BROUILLON: { label: "Brouillon", class: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
  EN_COURS: { label: "En cours", class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  EN_ATTENTE_APPROBATION: { label: "En attente", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  APPROUVE: { label: "Approuvé", class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  REJETE: { label: "Rejeté", class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  COMPLETE: { label: "Terminé", class: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  ANNULE: { label: "Annulé", class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" }
};

export default function PayRunsList() {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [payRuns, setPayRuns] = useState<PayRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayRuns, setSelectedPayRuns] = useState<number[]>([]);
  const [processingGenerate, setProcessingGenerate] = useState<number | null>(null);
  const [processingPayments, setProcessingPayments] = useState<number | null>(null);

  // Vérifier si l'utilisateur a les permissions (SUPERADMIN ou CASHIER)
  const hasPayrollAccess = user?.role === 'SUPERADMIN' || user?.role === 'CASHIER';

  useEffect(() => {
    if (!hasPayrollAccess) {
      setError("Accès refusé. Seuls les SUPERADMIN et CASHIER peuvent accéder aux paies.");
      setLoading(false);
      return;
    }

    loadPayRuns();
  }, [hasPayrollAccess]);

  const loadPayRuns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/payrolls/payruns/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PayRunsResponse = await response.json();
      setPayRuns(data.payRuns || []);
    } catch (err) {
      console.error("Erreur lors du chargement des paies:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des paies");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPayRun = (payRunId: number) => {
    setSelectedPayRuns(prev =>
      prev.includes(payRunId)
        ? prev.filter(id => id !== payRunId)
        : [...prev, payRunId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayRuns.length === payRuns.length) {
      setSelectedPayRuns([]);
    } else {
      setSelectedPayRuns(payRuns.map(p => p.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.BROUILLON;

    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const handleGeneratePayRun = async (payRunId: number) => {
    setProcessingGenerate(payRunId);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/payrolls/payruns/${payRunId}/generate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Erreur lors de la génération: ${response.statusText}`);
      }
      const data = await response.json();
      showSuccess('Génération réussie', `Bulletins générés pour le payrun ${data.payRun.reference}`);
      loadPayRuns();
    } catch (error) {
      console.error(error);
      showError('Erreur de génération', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setProcessingGenerate(null);
    }
  };

  const handleProcessPayments = async (payRunId: number) => {
    setProcessingPayments(payRunId);
    try {
      const token = localStorage.getItem('auth_token');
      // Get summary to find bulletins with payment pending
      const summaryResponse = await fetch(`${API_BASE_URL}/api/payrolls/payruns/${payRunId}/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!summaryResponse.ok) {
        throw new Error(`Erreur lors de la récupération du résumé: ${summaryResponse.statusText}`);
      }
      const summary = await summaryResponse.json();
      const pendingBulletins = summary.bulletins.filter((b: { statutPaiement: string }) => b.statutPaiement === 'EN_ATTENTE');
      if (pendingBulletins.length === 0) {
        showInfo('Information', 'Tous les bulletins de ce cycle sont déjà payés');
        setProcessingPayments(null);
        return;
      }
      const bulletinIds = pendingBulletins.map((b: { id: number }) => b.id);
      const paymentResponse = await fetch(`${API_BASE_URL}/api/payrolls/payruns/${payRunId}/process-payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bulletinIds,
          paymentData: {
            amount: 0,
            paymentMethod: 'BANK_TRANSFER',
            notes: 'Paiement automatique du cycle de paie',
            processedBy: user?.id
          }
        }),
      });
      if (!paymentResponse.ok) {
        throw new Error(`Erreur lors du traitement des paiements: ${paymentResponse.statusText}`);
      }
      const paymentResult = await paymentResponse.json();
      const successCount = paymentResult.results.filter((r: { error?: boolean }) => !r.error).length;
      showSuccess('Paiements traités', `${successCount} bulletins ont été payés avec succès.`);
      loadPayRuns();
    } catch (error) {
      console.error(error);
      showError('Erreur de paiement', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setProcessingPayments(null);
    }
  };

  const handleNewPayRun = () => {
    // Navigate to GeneratePayroll page
    window.location.href = '/payrolls/new';
  };

  // Calculate statistics
  const totalPayRuns = payRuns.length;
  const totalBrut = payRuns.reduce((sum, pr) => sum + pr.totalBrut, 0);
  const totalNet = payRuns.reduce((sum, pr) => sum + pr.totalNet, 0);
  const totalEmployees = payRuns.reduce((sum, pr) => sum + pr.nombreEmployes, 0);

  if (!hasPayrollAccess) {
    return (
      <>
        <PageMeta
          title="Accès refusé | Gestion RH"
          description="Accès refusé aux paies"
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              Accès refusé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Seuls les SUPERADMIN et CASHIER peuvent accéder à cette page.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageMeta
          title="Paies | Gestion RH"
          description="Gestion des paies"
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des paies...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageMeta
          title="Erreur | Gestion RH"
          description="Erreur lors du chargement des paies"
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              Erreur de chargement
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={loadPayRuns}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Réessayer
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Paies | Gestion RH"
        description="Gestion des paies des employés"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Gestion des Paies (PayRuns)
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérer les cycles de paie des employés
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadPayRuns}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Actualiser
            </button>
            <button
              onClick={handleNewPayRun}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Nouvelle Paie
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Paies</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalPayRuns}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Brut</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalBrut.toLocaleString()} €</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Net</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalNet.toLocaleString()} €</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employés</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalEmployees}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des PayRuns */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cycles de Paie</h3>
              {payRuns.length > 0 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedPayRuns.length === payRuns.length && payRuns.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tout sélectionner</span>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {payRuns.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun cycle de paie</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Commencez par créer un nouveau cycle de paie.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedPayRuns.length === payRuns.length && payRuns.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Référence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entreprise</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Période</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employés</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Net</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
                  {payRuns.map((payRun) => (
                    <tr key={payRun.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPayRuns.includes(payRun.id)}
                          onChange={() => handleSelectPayRun(payRun.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {payRun.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payRun.entreprise.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payRun.dateDebut).toLocaleDateString()} - {new Date(payRun.dateFin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payRun.statut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payRun.nombreEmployes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payRun.totalNet.toLocaleString()} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {payRun.statut === 'BROUILLON' && (
                            <button
                              onClick={() => handleGeneratePayRun(payRun.id)}
                              disabled={processingGenerate === payRun.id}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                            >
                              {processingGenerate === payRun.id ? 'Génération...' : 'Générer'}
                            </button>
                          )}
                          {(payRun.statut === 'APPROUVE' || payRun.statut === 'COMPLETE') && (
                            <button
                              onClick={() => handleProcessPayments(payRun.id)}
                              disabled={processingPayments === payRun.id}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                            >
                              {processingPayments === payRun.id ? 'Paiement...' : 'Payer'}
                            </button>
                          )}
                          <button
                            onClick={() => window.location.href = `/payrolls/${payRun.id}`}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            Voir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

