import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { companyService, CompanyDocument } from "../../services/company";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/button/Button";

export default function CompanyDocuments() {
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<CompanyDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await companyService.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error("Error loading documents:", err);
      showError("Erreur", "Impossible de charger les documents");
    } finally {
      setLoading(false);
    }
  };

  const viewDocumentDetails = (document: CompanyDocument) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  const downloadDocument = async (doc: CompanyDocument) => {
    try {
      const blob = await companyService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.titre}.${getFileExtension(doc.mimeType)}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess("Téléchargement réussi", "Le document a été téléchargé");
    } catch (err) {
      console.error("Error downloading document:", err);
      showError("Erreur", "Impossible de télécharger le document");
    }
  };

  const getFileExtension = (mimeType: string) => {
    const extensions: { [key: string]: string } = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt',
    };
    return extensions[mimeType] || 'file';
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return '📄';
      case 'image':
      case 'photo': return '🖼️';
      case 'contract':
      case 'contrat': return '📋';
      case 'cv':
      case 'resume': return '👤';
      case 'certificate':
      case 'certificat': return '🏆';
      default: return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des documents...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Documents | Gestion RH"
        description="Gestion des documents d'entreprise"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Documents
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestion et consultation des documents des employés
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun document trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Les documents uploadés apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <span className="text-2xl">{getFileIcon(document.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {document.titre}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {document.employee.user.firstName} {document.employee.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                        {document.type} • {formatFileSize(document.tailleFichier)}
                      </p>

                      {document.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {document.description}
                        </p>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => viewDocumentDetails(document)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Détails
                        </Button>
                        <Button
                          onClick={() => downloadDocument(document)}
                          variant="primary"
                          size="sm"
                          className="flex-1"
                        >
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails du document */}
      {isModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Détails du document
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
              <div className="flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <span className="text-3xl">{getFileIcon(selectedDocument.type)}</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedDocument.titre}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedDocument.employee.user.firstName} {selectedDocument.employee.user.lastName}
                  </p>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedDocument.type}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Taille</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {formatFileSize(selectedDocument.tailleFichier)}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type MIME</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedDocument.mimeType}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Uploadé par</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    Utilisateur {selectedDocument.uploadePar}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedDocument.description && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</div>
                  <div className="text-base text-gray-900 dark:text-white">
                    {selectedDocument.description}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedDocument.tags && selectedDocument.tags !== '[]' && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(selectedDocument.tags || '[]').map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date d'upload</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedDocument.creeLe).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Dernière modification</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedDocument.modifieLe).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              {/* Métadonnées JSON */}
              {selectedDocument.metadata && Object.keys(selectedDocument.metadata).length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Métadonnées</div>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(selectedDocument.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <Button onClick={closeModal} variant="outline">
                Fermer
              </Button>
              <Button
                onClick={() => downloadDocument(selectedDocument)}
                variant="primary"
              >
                Télécharger le document
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}