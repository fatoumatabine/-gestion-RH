import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";

interface Payroll {
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
  payRun: {
    id: number;
    dateDebut: string;
    dateFin: string;
  };
  salaireBrut: number;
  salaireNet: number;
  statutPaiement: string;
  creeLe: string;
}

export default function PayrollList() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/payrolls", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPayrolls(data.bulletins);
        } else {
          console.error("Erreur lors de la récupération des bulletins");
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrolls();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PAYE: { color: "bg-green-100 text-green-800", label: "Payé" },
      EN_ATTENTE: { color: "bg-yellow-100 text-yellow-800", label: "En attente" },
      ANNULE: { color: "bg-red-100 text-red-800", label: "Annulé" }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.EN_ATTENTE;
  };

  const handleViewBulletin = (payroll: Payroll) => {
    // For now, navigate to payrun detail since we don't have individual bulletin detail page
    // TODO: Create individual bulletin detail page
    window.location.href = `/payrolls/${payroll.payRun.id}`;
  };

  const handleDownloadPDF = async (payroll: Payroll) => {
    try {
      const response = await fetch(`http://localhost:5000/api/payrolls/${payroll.id}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${payroll.numeroBulletin}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (response.status === 404) {
        alert("Le PDF n'a pas encore été généré pour ce bulletin. Veuillez d'abord générer les PDFs pour ce payrun.");
      } else {
        console.error("Erreur lors du téléchargement du PDF");
        alert("Erreur lors du téléchargement du PDF");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du téléchargement du PDF");
    }
  };

  return (
    <>
      <PageMeta
        title="Bulletins de Paie | Gestion RH"
        description="Consultez et gérez tous les bulletins de paie"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Bulletins de Paie
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez les bulletins de salaire de vos employés
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/payrolls/new'}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Générer Paie
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Tous les Bulletins
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Période
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Salaire Brut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Salaire Net
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {payrolls.map((payroll) => {
                    const statusBadge = getStatusBadge(payroll.statutPaiement);
                    const period = `${new Date(payroll.payRun.dateDebut).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
                    return (
                      <tr key={payroll.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {payroll.numeroBulletin}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {payroll.employee.user.firstName} {payroll.employee.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {payroll.employee.employeeId} • {payroll.employee.department || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {period}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {payroll.salaireBrut.toLocaleString('fr-FR')} XOF
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {payroll.salaireNet.toLocaleString('fr-FR')} XOF
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewBulletin(payroll)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Voir les détails"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(payroll)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              title="Télécharger le PDF"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}