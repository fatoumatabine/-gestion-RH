import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { companyService, CompanyBulletin } from "../../services/company";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/button/Button";

export default function CompanyBulletins() {
  const [bulletins, setBulletins] = useState<CompanyBulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBulletin, setSelectedBulletin] = useState<CompanyBulletin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    loadBulletins();
  }, []);

  const loadBulletins = async () => {
    try {
      setLoading(true);
      const data = await companyService.getBulletins();
      setBulletins(data);
    } catch (err) {
      console.error("Error loading bulletins:", err);
      showError("Erreur", "Impossible de charger les bulletins");
    } finally {
      setLoading(false);
    }
  };

  const viewBulletinDetails = (bulletin: CompanyBulletin) => {
    setSelectedBulletin(bulletin);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBulletin(null);
  };

  const downloadBulletinPDF = async (bulletin: CompanyBulletin) => {
    try {
      const blob = await companyService.downloadBulletinPDF(bulletin.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bulletin.numeroBulletin}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess("Téléchargement réussi", "Le bulletin a été téléchargé");
    } catch (err) {
      console.error("Error downloading bulletin:", err);
      showError("Erreur", "Impossible de télécharger le bulletin");
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paye':
      case 'payé': return 'bg-green-100 text-green-800';
      case 'en attente':
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des bulletins...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Bulletins de salaire | Gestion RH"
        description="Gestion des bulletins de salaire"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Bulletins de salaire
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestion et consultation des bulletins de salaire
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          {bulletins.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun bulletin trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Les bulletins de salaire apparaîtront ici une fois générés.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bulletins.map((bulletin) => (
                <div
                  key={bulletin.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <span className="text-green-600 dark:text-green-400 font-bold">📄</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {bulletin.numeroBulletin}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {bulletin.employee.user.firstName} {bulletin.employee.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Période: {new Date(bulletin.datePaiement).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {bulletin.salaireNet.toLocaleString()} XOF
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(bulletin.statutPaiement)}`}>
                        {bulletin.statutPaiement}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => viewBulletinDetails(bulletin)}
                        variant="outline"
                        size="sm"
                      >
                        Détails
                      </Button>
                      {bulletin.cheminPDF && (
                        <Button
                          onClick={() => downloadBulletinPDF(bulletin)}
                          variant="primary"
                          size="sm"
                        >
                          PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails du bulletin */}
      {isModalOpen && selectedBulletin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Bulletin de salaire - {selectedBulletin.numeroBulletin}
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
              {/* Informations de l'employé */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Employé</h4>
                <p className="text-blue-800 dark:text-blue-200">
                  {selectedBulletin.employee.user.firstName} {selectedBulletin.employee.user.lastName}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  ID: {selectedBulletin.employeId}
                </p>
              </div>

              {/* Période et dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date de paiement</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedBulletin.datePaiement).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Jours travaillés</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedBulletin.joursTravailles}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Heures travaillées</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedBulletin.heuresTravailes}
                  </div>
                </div>
              </div>

              {/* Rémunération */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rémunération</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-green-800 dark:text-green-200">Salaire de base</span>
                      <span className="font-semibold text-green-900 dark:text-green-100">
                        {selectedBulletin.salaireBase.toLocaleString()} XOF
                      </span>
                    </div>

                    <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-blue-800 dark:text-blue-200">Heures supplémentaires</span>
                      <span className="font-semibold text-blue-900 dark:text-blue-100">
                        {selectedBulletin.montantHeuresSupp.toLocaleString()} XOF
                      </span>
                    </div>

                    <div className="flex justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="text-purple-800 dark:text-purple-200">Bonus</span>
                      <span className="font-semibold text-purple-900 dark:text-purple-100">
                        {selectedBulletin.montantBonus.toLocaleString()} XOF
                      </span>
                    </div>

                    <div className="flex justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <span className="text-yellow-800 dark:text-yellow-200">Indemnités</span>
                      <span className="font-semibold text-yellow-900 dark:text-yellow-100">
                        {selectedBulletin.indemnites.toLocaleString()} XOF
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Salaire brut</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {selectedBulletin.salaireBrut.toLocaleString()} XOF
                      </span>
                    </div>

                    <div className="flex justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="text-red-800 dark:text-red-200">Total déductions</span>
                      <span className="font-semibold text-red-900 dark:text-red-100">
                        -{selectedBulletin.totalDeductions.toLocaleString()} XOF
                      </span>
                    </div>

                    <div className="flex justify-between p-3 bg-green-100 dark:bg-green-800 rounded-lg border-2 border-green-300 dark:border-green-600">
                      <span className="text-green-900 dark:text-green-100 font-medium">Salaire net</span>
                      <span className="font-bold text-green-900 dark:text-green-100 text-lg">
                        {selectedBulletin.salaireNet.toLocaleString()} XOF
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations de paiement */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Montant payé</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedBulletin.montantPaye.toLocaleString()} XOF
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reste à payer</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedBulletin.resteAPayer.toLocaleString()} XOF
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Statut paiement</div>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(selectedBulletin.statutPaiement)}`}>
                    {selectedBulletin.statutPaiement}
                  </span>
                </div>
              </div>

              {/* Calculs détaillés (si disponibles) */}
              {selectedBulletin.calculs && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Calculs détaillés</h4>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(selectedBulletin.calculs, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              {selectedBulletin.cheminPDF && (
                <Button
                  onClick={() => downloadBulletinPDF(selectedBulletin)}
                  variant="primary"
                >
                  Télécharger PDF
                </Button>
              )}
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