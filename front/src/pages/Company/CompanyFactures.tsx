import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { companyService, CompanyFacture } from "../../services/company";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/button/Button";

export default function CompanyFactures() {
  const [factures, setFactures] = useState<CompanyFacture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacture, setSelectedFacture] = useState<CompanyFacture | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showError } = useToast();

  useEffect(() => {
    loadFactures();
  }, []);

  const loadFactures = async () => {
    try {
      setLoading(true);
      const data = await companyService.getFactures();
      setFactures(data);
    } catch (err) {
      console.error("Error loading factures:", err);
      showError("Erreur", "Impossible de charger les factures");
    } finally {
      setLoading(false);
    }
  };

  const viewFactureDetails = (facture: CompanyFacture) => {
    setSelectedFacture(facture);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFacture(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAYEE': return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ANNULEE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAYEE': return 'Payée';
      case 'EN_ATTENTE': return 'En attente';
      case 'ANNULEE': return 'Annulée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Factures | Gestion RH"
        description="Gestion des factures d'entreprise"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Factures
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestion des factures et paiements
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          {factures.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune facture trouvée
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Les factures apparaîtront ici une fois créées.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {factures.map((facture) => (
                <div
                  key={facture.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">📄</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {facture.numeroFacture}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {facture.employee.user.firstName} {facture.employee.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Créée le {new Date(facture.creeLe).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {facture.montant.toLocaleString()} XOF
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(facture.statut)}`}>
                        {getStatusText(facture.statut)}
                      </span>
                    </div>

                    <Button
                      onClick={() => viewFactureDetails(facture)}
                      variant="outline"
                      size="sm"
                    >
                      Détails
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails de facture */}
      {isModalOpen && selectedFacture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Détails de la facture
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Numéro de facture</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedFacture.numeroFacture}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Montant total</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedFacture.montant.toLocaleString()} XOF
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Statut</div>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedFacture.statut)}`}>
                    {getStatusText(selectedFacture.statut)}
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Employé</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedFacture.employee.user.firstName} {selectedFacture.employee.user.lastName}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date de création</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedFacture.creeLe).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {selectedFacture.dateEcheance && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date d'échéance</div>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedFacture.dateEcheance).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                )}

                {selectedFacture.datePaiement && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date de paiement</div>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedFacture.datePaiement).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedFacture.description && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</div>
                  <div className="text-base text-gray-900 dark:text-white">
                    {selectedFacture.description}
                  </div>
                </div>
              )}

              {/* Lignes de facture */}
              {selectedFacture.lignesFacture && selectedFacture.lignesFacture.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Détail des lignes
                  </h4>
                  <div className="space-y-3">
                    {selectedFacture.lignesFacture.map((ligne, index) => (
                      <div key={ligne.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {ligne.description}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Quantité: {ligne.quantite} × {ligne.prixUnitaire.toLocaleString()} XOF
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {ligne.prixTotal.toLocaleString()} XOF
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <Button onClick={closeModal} variant="outline">
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}