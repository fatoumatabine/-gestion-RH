import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/button/Button';
import { FaArrowLeft, FaUser, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaQrcode, FaDownload } from 'react-icons/fa';

interface AttendanceDetail {
  id: number;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  location: string;
  qrCode: string;
  validatedBy: string;
  notes: string;
}

const AttendanceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();

  const [attendance, setAttendance] = useState<AttendanceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier les permissions
  useEffect(() => {
    if (user && !['CASHIER', 'ADMIN', 'SUPERADMIN'].includes(user.role)) {
      showError('Accès refusé', 'Seuls les caissiers et administrateurs peuvent accéder à cette page');
      navigate('/dashboard');
    }
  }, [user, navigate, showError]);

  // Charger les détails du pointage
  useEffect(() => {
    loadAttendanceDetail();
  }, [id]);

  const loadAttendanceDetail = async () => {
    try {
      setLoading(true);

      // Simulation des données détaillées - en production, faire un appel API
      const mockDetail: AttendanceDetail = {
        id: parseInt(id || '1'),
        employeeId: 'ENT-1-0001', // Format correct: ENT-{entrepriseId}-{numéro}
        employeeName: 'Moussa Diallo',
        department: 'Marketing',
        position: 'Chef de Projet',
        date: '2025-10-02',
        checkInTime: '08:30',
        checkOutTime: '17:45',
        status: 'PRESENT',
        location: 'Bureau principal',
        qrCode: '/uploads/qrcodes/qr-ENT-1-0001.png', // QR code avec le bon format
        validatedBy: 'Admin System',
        notes: 'Pointage régulier, employé ponctuel'
      };

      setAttendance(mockDetail);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      showError('Erreur', 'Impossible de charger les détails du pointage');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <FaClock className="h-5 w-5 text-green-600" />;
      case 'LATE':
        return <FaClock className="h-5 w-5 text-yellow-600" />;
      case 'ABSENT':
        return <FaClock className="h-5 w-5 text-red-600" />;
      default:
        return <FaClock className="h-5 w-5 text-gray-600" />;
    }
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      if (fileUrl.startsWith('/uploads/')) {
        // Nouveau format : fichier sur le serveur - utiliser fetch pour éviter CORS
        const downloadUrl = `http://localhost:5000${fileUrl}`;

        try {
          // Télécharger le fichier via fetch pour créer un blob local
          const response = await fetch(downloadUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });

          if (!response.ok) {
            // Si le fichier n'existe pas (mock data ou 404), créer un QR code simulé
            console.log('Fichier QR non trouvé (404), génération d\'un QR code simulé');
            createMockQRDownload(fileName);
            return;
          }

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          // Créer un lien pour télécharger le blob
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;

          // Télécharger de manière sécurisée
          if (document.body) {
            document.body.appendChild(link);
            link.click();
            // Utiliser setTimeout pour s'assurer que le click est traité avant de supprimer
            setTimeout(() => {
              if (document.body && document.body.contains(link)) {
                document.body.removeChild(link);
              }
              // Libérer l'URL du blob
              URL.revokeObjectURL(blobUrl);
            }, 100);
          } else {
            console.error('document.body non disponible pour le téléchargement');
            URL.revokeObjectURL(blobUrl);
          }
        } catch {
          // Si fetch échoue (CORS ou fichier inexistant), créer un QR code simulé
          console.log('Erreur de récupération du fichier, génération d\'un QR code simulé');
          createMockQRDownload(fileName);
        }

      } else if (fileUrl.startsWith('data:image')) {
        // Ancien format : data URL (pour compatibilité)
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Format de fichier non supporté:', fileUrl);
      }

    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error);
    }
  };

  const createMockQRDownload = (fileName: string) => {
    try {
      // Créer un QR code simulé simple (carré noir sur fond blanc)
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Fond blanc
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 200, 200);

        // Bordure noire
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 180, 180);

        // Motif QR simple (carrés noirs)
        ctx.fillStyle = 'black';
        ctx.fillRect(30, 30, 20, 20);
        ctx.fillRect(60, 30, 20, 20);
        ctx.fillRect(90, 30, 20, 20);
        ctx.fillRect(30, 60, 20, 20);
        ctx.fillRect(90, 60, 20, 20);
        ctx.fillRect(30, 90, 20, 20);
        ctx.fillRect(60, 90, 20, 20);
        ctx.fillRect(90, 90, 20, 20);

        // Texte au centre
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR CODE', 100, 120);
        ctx.fillText('SIMULÉ', 100, 140);

        // Convertir en data URL
        const dataUrl = canvas.toDataURL('image/png');

        // Télécharger de manière sécurisée
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;

        // Vérifier que document.body existe
        if (document.body) {
          document.body.appendChild(link);
          link.click();
          // Utiliser setTimeout pour s'assurer que le click est traité avant de supprimer
          setTimeout(() => {
            if (document.body && document.body.contains(link)) {
              document.body.removeChild(link);
            }
          }, 100);
        } else {
          console.error('document.body non disponible pour le téléchargement');
        }
      } else {
        console.error('Impossible de créer le contexte canvas');
      }
    } catch (error) {
      console.error('Erreur lors de la création du QR code simulé:', error);
    }
  };

  const downloadQRCode = async () => {
    if (!attendance?.qrCode) return;
    await downloadFile(attendance.qrCode, `qr-code-${attendance.employeeId}.png`);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaClock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Pointage non trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            Les détails de ce pointage ne sont pas disponibles.
          </p>
          <Button onClick={() => navigate('/attendance')}>
            Retour aux pointages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Pointage ${attendance.employeeName} | Gestion RH`}
        description={`Détails du pointage de ${attendance.employeeName}`}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/attendance')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <FaArrowLeft />
              <span>Retour</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Détails du pointage
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {attendance.employeeName} - {new Date(attendance.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            {attendance.qrCode && (
              <Button
                onClick={downloadQRCode}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <FaDownload />
                <span>Télécharger QR</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statut du pointage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Statut du pointage
                </h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(attendance.status)}`}>
                  {getStatusIcon(attendance.status)}
                  <span className="ml-2 capitalize">
                    {attendance.status === 'PRESENT' ? 'Présent' :
                     attendance.status === 'LATE' ? 'En retard' : 'Absent'}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Date
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(attendance.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Lieu
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {attendance.location || 'Non spécifié'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaClock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Arrivée
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {attendance.checkInTime || 'Non pointé'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaClock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Départ
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {attendance.checkOutTime || 'Non pointé'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations employé */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informations de l'employé
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FaUser className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Nom complet
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {attendance.employeeName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaUser className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ID Employé
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {attendance.employeeId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaUser className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Département
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {attendance.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaUser className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Poste
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {attendance.position}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes et commentaires */}
            {attendance.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Notes et commentaires
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {attendance.notes}
                </p>
              </div>
            )}
          </div>

          {/* QR Code et validation */}
          <div className="space-y-6">
            {/* QR Code et Scan */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                QR Code employé
              </h3>

              {attendance.qrCode ? (
                  <div className="text-center mb-6">
                    <img
                      src={attendance.qrCode.startsWith('/uploads/') ? `http://localhost:5000${attendance.qrCode}` : attendance.qrCode}
                      alt={`QR Code ${attendance.employeeId}`}
                      className="mx-auto mb-4 border border-gray-300 dark:border-gray-600 rounded-lg"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                      onError={(e) => {
                        console.error('Erreur chargement QR code détaillé:', attendance.qrCode);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      ID: {attendance.employeeId}
                    </p>
                    <Button
                      onClick={downloadQRCode}
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <FaDownload />
                      <span>Télécharger QR</span>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaQrcode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      QR Code non disponible
                    </p>
                  </div>
                )}

            </div>

            {/* Informations de validation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Validation
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Validé par
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {attendance.validatedBy || 'Système automatique'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Date de validation
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(attendance.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceDetail;