import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PageMeta from "../../components/common/PageMeta";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

// Types
interface Company {
  id: number;
  nom: string;
}

interface PeriodePaie {
  id: number;
  nom: string;
  dateDebut: string;
  dateFin: string;
}

interface PayRun {
  id: number;
  reference: string;
  statut: string;
  totalBrut: number;
  totalNet: number;
  nombreEmployes: number;
  _count: {
    bulletins: number;
  };
  entreprise?: {
    nom: string;
  };
}

interface Bulletin {
  id: number;
  statutPaiement: string;
}

interface PaymentResult {
  error?: string;
}

// Schema de validation
const generatePayrollSchema = z.object({
  entrepriseId: z.string().min(1, "Veuillez sélectionner une entreprise"),
  periodePaieId: z.string().min(1, "Veuillez sélectionner une période de paie"),
  datePaiement: z.string().min(1, "Veuillez sélectionner une date de paiement"),
});

type GeneratePayrollForm = z.infer<typeof generatePayrollSchema>;

export default function GeneratePayroll() {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [periodesPaie, setPeriodesPaie] = useState<PeriodePaie[]>([]);
  const [payRuns, setPayRuns] = useState<PayRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [processingPayments, setProcessingPayments] = useState<number | null>(null);
  const [generatingPDFs, setGeneratingPDFs] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<GeneratePayrollForm>({
    resolver: zodResolver(generatePayrollSchema),
  });

  const selectedEntrepriseId = watch("entrepriseId");

  // Charger les entreprises
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/companies", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
      }
    };

    fetchCompanies();
  }, []);

  // Charger les périodes de paie
  useEffect(() => {
    const fetchPeriodesPaie = async () => {
      try {
        // Pour l'instant, charger toutes les périodes de paie
        // TODO: Filtrer par entreprise sélectionnée
        const response = await fetch("http://localhost:5000/api/payrolls/periodes-paie", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPeriodesPaie(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des périodes de paie:", error);
      }
    };

    fetchPeriodesPaie();
  }, []);

  // Charger les payruns existants
  useEffect(() => {
    const fetchPayRuns = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/payrolls/payruns/list", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPayRuns(data.payRuns);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des payruns:", error);
      }
    };

    fetchPayRuns();
  }, []);

  const onSubmit = async (data: GeneratePayrollForm) => {
    setLoading(true);

    try {
      // Créer le payrun
      const payRunResponse = await fetch("http://localhost:5000/api/payrolls/payruns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          entrepriseId: parseInt(data.entrepriseId),
          periodePaieId: parseInt(data.periodePaieId),
          datePaiement: data.datePaiement,
        }),
      });

      if (!payRunResponse.ok) {
        throw new Error("Erreur lors de la création du payrun");
      }

      const payRunData = await payRunResponse.json();
      const payRunId = payRunData.payRun.id;

      // Générer les bulletins
      setGenerating(true);
      const generateResponse = await fetch(`http://localhost:5000/api/payrolls/payruns/${payRunId}/generate`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!generateResponse.ok) {
        throw new Error("Erreur lors de la génération des bulletins");
      }

      const generateData = await generateResponse.json();

      showSuccess(
        'Paie générée avec succès !',
        `${generateData.payRun.nombreEmployes} bulletins générés pour le cycle de paie.`
      );

      reset();
      // Recharger les payruns
      const updatedResponse = await fetch("http://localhost:5000/api/payrolls/payruns/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setPayRuns(updatedData.payRuns);
      }

    } catch (error) {
      console.error("Erreur:", error);
      showError(
        'Erreur lors de la génération',
        error instanceof Error ? error.message : "Une erreur est survenue lors de la génération de la paie"
      );
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const handleProcessPayments = async (payRunId: number) => {
    setProcessingPayments(payRunId);

    try {
      // Récupérer les bulletins du payrun
      const summaryResponse = await fetch(`http://localhost:5000/api/payrolls/payruns/${payRunId}/summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!summaryResponse.ok) {
        throw new Error("Erreur lors de la récupération des bulletins");
      }

      const summary = await summaryResponse.json();
      const pendingBulletins = summary.bulletins.filter((b: Bulletin) => b.statutPaiement === 'EN_ATTENTE');

      if (pendingBulletins.length === 0) {
        showInfo(
          'Information',
          'Tous les bulletins de ce cycle sont déjà payés'
        );
        return;
      }

      // Traiter les paiements pour tous les bulletins en attente
      const bulletinIds = pendingBulletins.map((b: Bulletin) => b.id);

      const paymentResponse = await fetch(`http://localhost:5000/api/payrolls/payruns/${payRunId}/process-payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          bulletinIds,
          paymentData: {
            amount: 0, // Sera calculé automatiquement pour chaque bulletin
            paymentMethod: 'BANK_TRANSFER',
            notes: 'Paiement automatique du cycle de paie',
            processedBy: user?.id
          }
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error("Erreur lors du traitement des paiements");
      }

      const paymentResult = await paymentResponse.json();
      const successCount = paymentResult.results.filter((r: PaymentResult) => !r.error).length;

      showSuccess(
        'Paiements traités avec succès !',
        `${successCount} bulletins ont été payés avec succès.`
      );

      // Recharger les payruns
      const updatedResponse = await fetch("http://localhost:5000/api/payrolls/payruns/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setPayRuns(updatedData.payRuns);
      }

    } catch (error) {
      console.error("Erreur:", error);
      showError(
        'Erreur de paiement',
        error instanceof Error ? error.message : "Une erreur est survenue lors du traitement des paiements"
      );
    } finally {
      setProcessingPayments(null);
    }
  };

  const handleGeneratePDFs = async (payRunId: number) => {
    setGeneratingPDFs(payRunId);

    try {
      const response = await fetch(`http://localhost:5000/api/payrolls/payruns/${payRunId}/generate-pdfs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération des PDFs");
      }

      const result = await response.json();

      showSuccess(
        'PDFs générés avec succès !',
        `${result.result.generatedPDFs} bulletins de paie ont été générés en PDF.`
      );

      // Télécharger automatiquement les PDFs générés
      if (result.result.generatedPDFs > 0) {
        await downloadPayRunPDFs(payRunId);
      }

      // Recharger les payruns
      const updatedResponse = await fetch("http://localhost:5000/api/payrolls/payruns/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setPayRuns(updatedData.payRuns);
      }

    } catch (error) {
      console.error("Erreur:", error);
      showError(
        'Erreur de génération PDF',
        error instanceof Error ? error.message : "Une erreur est survenue lors de la génération des PDFs"
      );
    } finally {
      setGeneratingPDFs(null);
    }
  };

  const downloadPayRunPDFs = async (payRunId: number) => {
    try {
      // Récupérer les bulletins du payrun
      const summaryResponse = await fetch(`http://localhost:5000/api/payrolls/payruns/${payRunId}/summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!summaryResponse.ok) {
        throw new Error("Erreur lors de la récupération des bulletins");
      }

      const summary = await summaryResponse.json();
      const bulletins = summary.bulletins || [];

      // Télécharger chaque PDF
      for (const bulletin of bulletins) {
        if (bulletin.cheminPDF) {
          try {
            const pdfResponse = await fetch(`http://localhost:5000/api/payrolls/${bulletin.id}/pdf`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              },
            });

            if (pdfResponse.ok) {
              const blob = await pdfResponse.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${bulletin.numeroBulletin}.pdf`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }
          } catch (downloadError) {
            console.error(`Erreur lors du téléchargement du PDF ${bulletin.numeroBulletin}:`, downloadError);
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement des PDFs:", error);
    }
  };

  return (
    <>
      <PageMeta
        title="Générer Paie | Gestion RH"
        description="Générer les bulletins de paie"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Générer les Bulletins de Paie
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Créer les bulletins de salaire pour une période donnée
            </p>
          </div>
        </div>

        {/* Formulaire de génération */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Nouveau Cycle de Paie
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sélection entreprise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entreprise
                </label>
                <select
                  {...register("entrepriseId")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Sélectionner une entreprise</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.nom}
                    </option>
                  ))}
                </select>
                {errors.entrepriseId && (
                  <p className="mt-1 text-sm text-red-600">{errors.entrepriseId.message}</p>
                )}
              </div>

              {/* Sélection période de paie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Période de Paie
                </label>
                <select
                  {...register("periodePaieId")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  disabled={!selectedEntrepriseId}
                >
                  <option value="">Sélectionner une période</option>
                  {periodesPaie.map((periode) => (
                    <option key={periode.id} value={periode.id}>
                      {periode.nom}
                    </option>
                  ))}
                </select>
                {errors.periodePaieId && (
                  <p className="mt-1 text-sm text-red-600">{errors.periodePaieId.message}</p>
                )}
              </div>

              {/* Date de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de Paiement
                </label>
                <input
                  type="date"
                  {...register("datePaiement")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                {errors.datePaiement && (
                  <p className="mt-1 text-sm text-red-600">{errors.datePaiement.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || generating}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Création..." : generating ? "Génération..." : "Générer les Bulletins"}
              </button>
            </div>
          </form>
        </div>

        {/* Liste des payruns existants */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Cycles de Paie Existants
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-4 font-medium text-gray-700 dark:text-gray-300">Référence</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700 dark:text-gray-300">Entreprise</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700 dark:text-gray-300">Statut</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700 dark:text-gray-300">Employés</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700 dark:text-gray-300">Bulletins</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700 dark:text-gray-300">Total Brut</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700 dark:text-gray-300">Total Net</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payRuns.map((payRun) => (
                  <tr key={payRun.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{payRun.reference}</td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{payRun.entreprise?.nom || 'N/A'}</td>
                    <td className="py-2 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        payRun.statut === 'COMPLETE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : payRun.statut === 'EN_COURS'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {payRun.statut === 'COMPLETE' ? 'Terminé' :
                         payRun.statut === 'EN_COURS' ? 'En cours' :
                         payRun.statut === 'BROUILLON' ? 'Brouillon' : payRun.statut}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{payRun.nombreEmployes}</td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{payRun._count.bulletins}</td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">
                      {payRun.totalBrut?.toLocaleString('fr-FR')} XOF
                    </td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">
                      {payRun.totalNet?.toLocaleString('fr-FR')} XOF
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleProcessPayments(payRun.id)}
                          disabled={processingPayments === payRun.id || payRun.statut === 'BROUILLON'}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingPayments === payRun.id ? 'Traitement...' : 'Traiter Paiements'}
                        </button>
                        <button
                          onClick={() => handleGeneratePDFs(payRun.id)}
                          disabled={generatingPDFs === payRun.id || payRun.statut === 'BROUILLON'}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingPDFs === payRun.id ? 'Génération...' : 'Générer PDFs'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}