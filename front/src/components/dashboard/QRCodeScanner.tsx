import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaStop, FaPlay, FaQrcode, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import QrScanner from 'qr-scanner';
import { attendanceService } from '../../services/attendance';
import { useToast } from '../../context/ToastContext';

interface ScanResult {
  employee: {
    id: number;
    employeeId: string;
    firstName: string;
    lastName: string;
    department: string;
  };
  attendance: {
    id: number;
    statut: string;
    heureArrivee: string | null;
    heureDepart: string | null;
  };
  timestamp: string;
  status: string;
  qrCode: string;
  scanMode: 'check-in' | 'check-out';
}

interface QRCodeScannerProps {
  onScanSuccess?: (result: ScanResult) => void;
  onScanError?: (error: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScanSuccess,
  onScanError
}) => {
  const { showSuccess, showError } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<{
    qrCode: string;
    success?: boolean;
    error?: string;
    processing?: boolean;
    employee?: {
      id: number;
      employeeId: string;
      firstName: string;
      lastName: string;
      department: string;
    };
  } | null>(null);
  const [scanMode, setScanMode] = useState<'check-in' | 'check-out'>('check-in');
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  // Check camera availability on mount
  useEffect(() => {
    QrScanner.hasCamera().then(setHasCamera);
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.destroy();
      }
    };
  }, [scanner]);

  const startScanning = async () => {
    console.log('🔍 Démarrage du scan QR...');

    if (!videoRef.current) {
      console.error('❌ Référence vidéo non trouvée');
      return;
    }

    // Vérifier si on est en HTTPS ou localhost pour le scanner
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    console.log('🔒 Connexion sécurisée:', isSecure, 'Protocol:', window.location.protocol, 'Hostname:', window.location.hostname);

    if (!isSecure) {
      console.log('❌ Connexion non sécurisée - affichage erreur');
      showError('Erreur', 'Le scanner QR nécessite une connexion sécurisée (HTTPS) ou localhost');
      return;
    }

    try {
      console.log('📷 Création du scanner QR...');
      const qrScanner = new QrScanner(
        videoRef.current,
        async (result) => {
          console.log('📱 QR code détecté:', result.data);
          await handleScanResult(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
        }
      );

      console.log('▶️ Démarrage du scanner...');
      await qrScanner.start();
      console.log('✅ Scanner démarré avec succès');
      setScanner(qrScanner);
      setIsScanning(true);
      setLastScanResult(null);
    } catch (error) {
      console.error('❌ Erreur lors du démarrage du scanner:', error);
      showError('Erreur', 'Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setHasCamera(false);
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.stop();
      setIsScanning(false);
    }
  };

  const handleScanResult = async (qrCode: string) => {
    if (!qrCode || lastScanResult) return; // Prevent multiple scans

    setLastScanResult({ qrCode, processing: true });

    try {
      // Get current location if available
      let locationData = {};
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });

          locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            ipAddress: '',
            deviceInfo: navigator.userAgent
          };
        } catch (locationError) {
          console.warn('Impossible d\'obtenir la localisation:', locationError);
        }
      }

      const response = await attendanceService.scanQRCode(qrCode, scanMode, locationData);

      if (response.success) {
        const result = {
          ...response.data,
          qrCode,
          scanMode,
          timestamp: new Date().toISOString()
        };

        setLastScanResult({ ...result, success: true });
        showSuccess('Pointage réussi', response.message);

        if (onScanSuccess) {
          onScanSuccess(result);
        }

        // Auto-stop scanning after successful scan
        setTimeout(() => {
          stopScanning();
        }, 2000);
      } else {
        throw new Error(response.message);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du scan du QR code';
      setLastScanResult({ qrCode, success: false, error: errorMessage });
      showError('Erreur de pointage', errorMessage);

      if (onScanError) {
        onScanError(errorMessage);
      }
    }
  };

  const resetScanner = () => {
    setLastScanResult(null);
    if (!isScanning) {
      startScanning();
    }
  };

  if (hasCamera === false) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <FaCamera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Caméra non disponible</h3>
          <p className="text-gray-600 mb-4">
            Aucune caméra n'a été détectée sur cet appareil.
          </p>
          <p className="text-sm text-gray-500">
            Assurez-vous que votre caméra est activée et que vous avez accordé les permissions nécessaires.
          </p>
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
            <h3 className="text-lg font-semibold text-gray-900">Scanner QR Code</h3>
            <p className="text-sm text-gray-500">Scannez le QR code d'un employé</p>
          </div>
        </div>

        {/* Scan Mode Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Mode:</span>
          <select
            value={scanMode}
            onChange={(e) => setScanMode(e.target.value as 'check-in' | 'check-out')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isScanning}
          >
            <option value="check-in">Arrivée</option>
            <option value="check-out">Départ</option>
          </select>
        </div>
      </div>

      {/* Video Scanner */}
      <div className="relative mb-4">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <FaCamera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Caméra prête</p>
              </div>
            </div>
          )}
        </div>

        {/* Scan Result Overlay */}
        {lastScanResult && (
          <div className={`absolute top-4 left-4 right-4 p-3 rounded-lg ${
            lastScanResult.success
              ? 'bg-green-100 border border-green-300'
              : 'bg-red-100 border border-red-300'
          }`}>
            <div className="flex items-center">
              {lastScanResult.success ? (
                <FaCheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <FaTimesCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  lastScanResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {lastScanResult.success ? 'Pointage réussi' : 'Erreur de pointage'}
                </p>
                {lastScanResult.employee && (
                  <p className="text-xs text-gray-600">
                    {lastScanResult.employee.firstName} {lastScanResult.employee.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <FaPlay className="mr-2" />
            Démarrer le scan
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            <FaStop className="mr-2" />
            Arrêter le scan
          </button>
        )}

        {lastScanResult && (
          <button
            onClick={resetScanner}
            className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            <FaQrcode className="mr-2" />
            Nouveau scan
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions :</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Positionnez le QR code dans le cadre de la caméra</li>
          <li>• Assurez-vous que le QR code est bien éclairé</li>
          <li>• Le scan s'arrête automatiquement après un pointage réussi</li>
          <li>• Vérifiez le mode (arrivée/départ) avant de scanner</li>
        </ul>
      </div>
    </div>
  );
};

export default QRCodeScanner;