import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
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

interface Bulletin {
  id: number;
  numeroBulletin: string;
  employee: {
    user: {
      firstName: string;
      lastName: string;
    };
    employeeId: string;
    department: string;
  };
  salaireBrut: number;
  salaireNet: number;
  statutPaiement: string;
  creeLe: string;
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

const paymentStatusConfig = {
  PAYE: { label: "Payé", class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  EN_ATTENTE: { label: "En attente", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  ANNULE: { label: "Annulé", class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" }
};

export default function PayRunDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [payRun, setPayRun] = useState<PayRun | null>(null);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayments, setProcessingPayments] = useState<number | null>(null);
  const [generatingPDFs, setGeneratingPDFs] = useState(false);

  const hasPayrollAccess = user?.role === 'SUPERADMIN' || user?.role === 'CASHIER';

  useEffect(() => {
    if (!hasPayrollAccess) {
      setError("Accès refusé. Seuls les SUPERADMIN et CASHIER peuvent accéder aux paies.");
      setLoading(false);
      return;
    }

    if (id) {
      loadPayRunDetail();
    }
  }, [id, hasPayrollAccess]);

  const loadPayRunDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      // Load payrun details
      const payRunResponse = await fetch(`${API_BASE_URL}/api/payrolls/payruns/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!payRunResponse.ok) {
        throw new Error(`Erreur lors du chargement du cycle de paie: ${payRunResponse.status}`);
      }

      const payRunData = await payRunResponse.json();
      setPayRun(payRunData.payRun);

      // Load bulletins
      const bulletinsResponse = await fetch(`${API_BASE_URL}/api/payrolls/payruns/${id}/bulletins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (bulletinsResponse.ok) {
        const bulletinsData = await bulletinsResponse.json();
        setBulletins(bulletinsData.bulletins || []);
      }

    } catch (err) {
      console.error("Erreur lors du chargement des détails:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des détails");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayments = async () => {
    if (!payRun) return;

    setProcessingPayments(payRun.id);
    try {
      const token = localStorage.getItem('auth_token');
      const pendingBulletins = bulletins.filter(b => b.statutPaiement === 'EN_ATTENTE');

      if (pendingBulletins.length === 0) {
        showSuccess('Information', 'Tous les bulletins de ce cycle sont déjà payés');
        setProcessingPayments(null);
        return;
      }

      const bulletinIds = pendingBulletins.map(b => b.id);
      const paymentResponse = await fetch(`${API_BASE_URL}/api/payrolls/payruns/${payRun.id}/process-payments`, {
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
      const successCount = paymentResult.results.filter((r: any) => !r.error).length;
      showSuccess('Paiements traités', `${successCount} bulletins ont été payés avec succès.`);

      // Reload data
      loadPayRunDetail();
    } catch (error) {
      console.error(error);
      showError('Erreur de paiement', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setProcessingPayments(null);
    }
  };

  const handleGeneratePDFs = async () => {
    if (!payRun) return;

    setGeneratingPDFs(true);
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/api/payrolls/payruns/${payRun.id}/generate-pdfs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la génération des PDFs: ${response.statusText}`);
      }

      const result = await response.json();
      showSuccess('PDFs générés', `Les bulletins de paie ont été générés avec succès.`);

      // Reload data
      loadPayRunDetail();
    } catch (error) {
      console.error(error);
      showError('Erreur de génération', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setGeneratingPDFs(false);
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

  const getPaymentStatusBadge = (status: string) => {
    const config = paymentStatusConfig[status as keyof typeof paymentStatusConfig] || paymentStatusConfig.EN_ATTENTE;
    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.class}`}>
        {config.label}
      </span>
    );
  };

  if (!hasPayrollAccess) {
    return (
      <>
        <PageMeta
          title="Accès refusé | Gestion RH"
          description="Accès refusé aux détails de paie"
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
          title="Chargement... | Gestion RH"
          description="Chargement des détails du cycle de paie"
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des détails...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !payRun) {
    return (
      <>
        <PageMeta
          title="Erreur | Gestion RH"
          description="Erreur lors du chargement des détails"
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
              onClick={loadPayRunDetail}
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
        title={`${payRun.reference} | Gestion RH`}
        description={`Détails du cycle de paie ${payRun.reference}`}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Cycle de Paie: {payRun.reference}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Entreprise: {payRun.entreprise.nom} • Créé par: {payRun.creator.firstName} {payRun.creator.lastName}
            </p>
          </div>
          <div className="flex gap-3">
            {(payRun.statut === 'EN_COURS' || payRun.statut === 'APPROUVE' || payRun.statut === 'COMPLETE') && (
              <button
                onClick={handleGeneratePDFs}
                disabled={generatingPDFs}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {generatingPDFs ? 'Génération...' : 'Générer les PDFs'}
              </button>
            )}
            {(payRun.statut === 'APPROUVE' || payRun.statut === 'COMPLETE') && (
              <button
                onClick={handleProcessPayments}
                disabled={processingPayments === payRun.id}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {processingPayments === payRun.id ? 'Traitement...' : 'Traiter les Paiements'}
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut</p>
                <div className="mt-1">{getStatusBadge(payRun.statut)}</div>
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
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{payRun.totalBrut.toLocaleString()} €</p>
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
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{payRun.totalNet.toLocaleString()} €</p>
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
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{payRun.nombreEmployes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Period Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Informations de Période</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date de début</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{new Date(payRun.dateDebut).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date de fin</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{new Date(payRun.dateFin).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date de paiement</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{new Date(payRun.datePaiement).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {/* Bulletins List */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bulletins de Paie ({bulletins.length})</h3>
          </div>

          <div className="overflow-x-auto">
            {bulletins.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun bulletin</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Les bulletins n'ont pas encore été générés pour ce cycle.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Référence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employé</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Salaire Brut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Salaire Net</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut Paiement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Créé le</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
                  {bulletins.map((bulletin) => (
                    <tr key={bulletin.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {bulletin.numeroBulletin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {bulletin.employee.user.firstName} {bulletin.employee.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {bulletin.employee.employeeId} • {bulletin.employee.department || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {bulletin.salaireBrut.toLocaleString()} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {bulletin.salaireNet.toLocaleString()} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(bulletin.statutPaiement)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(bulletin.creeLe).toLocaleDateString('fr-FR')}
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