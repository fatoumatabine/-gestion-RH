import React, { useState, useEffect } from 'react';
import { FaQrcode, FaDownload, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import { attendanceService } from '../../services/attendance';
import QRCode from 'qrcode';

const EmployeeQRCode: React.FC = () => {
  const { showError } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadEmployeeQRCode();
  }, []);

  useEffect(() => {
    if (qrCode && showQR) {
      generateQRCodeImage();
    }
  }, [qrCode, showQR]);

  const loadEmployeeQRCode = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getEmployeeQRCode();
      if (response.success) {
        setQrCode(response.data.qrCode);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement du QR code';
      showError('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodeImage = async () => {
    if (!qrCode) return;

    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeImage(qrCodeDataURL);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      showError('Erreur', 'Impossible de générer l\'image QR code');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeImage) return;

    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = 'mon-qr-code-pointage.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <FaQrcode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">QR Code non disponible</h3>
          <p className="text-gray-600">Votre QR code de pointage n'a pas encore été généré.</p>
          <button
            onClick={loadEmployeeQRCode}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Actualiser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaQrcode className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mon QR Code</h3>
            <p className="text-sm text-gray-500">Utilisez ce code pour pointer rapidement</p>
          </div>
        </div>
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {showQR ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
          {showQR ? 'Masquer' : 'Afficher'}
        </button>
      </div>

      {showQR && (
        <div className="space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
              {qrCodeImage ? (
                <img
                  src={qrCodeImage}
                  alt="QR Code de pointage"
                  className="w-48 h-48"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <FaQrcode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Génération...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Comment utiliser votre QR code :</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Présentez ce code devant le scanner de pointage</li>
              <li>• Assurez-vous que le code est bien visible</li>
              <li>• Un seul scan suffit pour pointer arrivée ou départ</li>
              <li>• Le système détecte automatiquement le type de pointage</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={downloadQRCode}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <FaDownload className="mr-2" />
              Télécharger
            </button>
            <button
              onClick={() => setShowQR(false)}
              className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <FaEyeSlash className="mr-2" />
              Masquer
            </button>
          </div>

          {/* Security Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <FaQrcode className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Sécurité</p>
                <p className="text-xs text-yellow-800 mt-1">
                  Ce QR code est personnel et unique. Ne le partagez pas avec d'autres personnes.
                  En cas de perte, contactez votre administrateur pour le régénérer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showQR && (
        <div className="text-center py-8">
          <FaQrcode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Votre QR code est masqué pour des raisons de sécurité</p>
          <button
            onClick={() => setShowQR(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Afficher mon QR code
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeQRCode;