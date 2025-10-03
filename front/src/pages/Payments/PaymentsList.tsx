import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCompany } from "../../context/CompanyContext";
import { paymentsService, Payment } from "../../services/payments";
import PageMeta from "../../components/common/PageMeta";

export default function PaymentsList() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);

  // Vérifier si l'utilisateur a les permissions (SUPERADMIN ou CASHIER)
  const hasPaymentAccess = user?.role === 'SUPERADMIN' || user?.role === 'CASHIER';

  useEffect(() => {
    if (!hasPaymentAccess) {
      setError("Accès refusé. Seuls les SUPERADMIN et CASHIER peuvent accéder aux paiements.");
      setLoading(false);
      return;
    }

    loadPayments();
  }, [hasPaymentAccess]);

  const loadPayments = async () => {
    try {
      setLoading(true);

      // Pour ADMIN et CASHIER avec une entreprise, filtrer par entreprise
      if ((user?.role === 'ADMIN' || user?.role === 'CASHIER') && company) {
        const data = await paymentsService.getPaymentsByCompany(company.id);
        if (data && data.payments) {
          setPayments(data.payments);
        } else {
          setPayments([]);
        }
      } else {
        // Pour SUPERADMIN, charger tous les paiements
        const data = await paymentsService.getAllPayments();
        if (Array.isArray(data)) {
          setPayments(data);
        } else if (data && typeof data === 'object' && 'payments' in data) {
          setPayments((data as { payments: Payment[] }).payments);
        } else {
          setPayments([]);
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement des paiements:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPayment = (paymentId: number) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.map(p => p.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "En attente", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
      PROCESSED: { label: "Traité", class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
      CANCELLED: { label: "Annulé", class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
      FAILED: { label: "Échec", class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      CASH: "Espèces",
      BANK_TRANSFER: "Virement bancaire",
      CHECK: "Chèque",
      MOBILE_MONEY: "Mobile Money"
    };
    return methods[method as keyof typeof methods] || method;
  };

  if (!hasPaymentAccess) {
    return (
      <>
        <PageMeta
          title="Accès refusé | Gestion RH"
          description="Accès refusé aux paiements"
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
          title="Paiements | Gestion RH"
          description="Gestion des paiements"
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des paiements...</p>
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
          description="Erreur lors du chargement des paiements"
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
              onClick={loadPayments}
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
        title="Paiements | Gestion RH"
        description="Gestion des paiements des employés"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Gestion des Paiements
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérer les paiements des employés
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadPayments}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Actualiser
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Nouveau Paiement
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Paiements
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {payments.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Traités
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {payments.filter(p => p.status === 'PROCESSED').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    En attente
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {payments.filter(p => p.status === 'PENDING').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Montant Total
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('fr-FR')} XOF
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des paiements */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Liste des Paiements
              </h3>
              {selectedPayments.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedPayments.length} sélectionné(s)
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    Actions groupées
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPayments.length === payments.length && payments.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <p className="text-lg font-medium">Aucun paiement trouvé</p>
                        <p className="text-sm">Commencez par créer un nouveau paiement.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPayments.includes(payment.id)}
                          onChange={() => handleSelectPayment(payment.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {payment.employee?.user?.firstName?.[0]}{payment.employee?.user?.lastName?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {payment.employee?.user?.firstName} {payment.employee?.user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {payment.employee?.position || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.amount.toLocaleString('fr-FR')} XOF
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            Voir
                          </button>
                          <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                            Modifier
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}