import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/button/Button';
import { FaCamera, FaStop, FaPlay, FaCheckCircle, FaTimesCircle, FaUser, FaClock } from 'react-icons/fa';

interface ScannedEmployee {
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
}

export default function QRScanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isScanning, setIsScanning] = useState(false);
  const [scannedEmployee, setScannedEmployee] = useState<ScannedEmployee | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Vérifier les permissions du caissier
  useEffect(() => {
    if (user && user.role !== 'CASHIER' && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      showError('Accès refusé', 'Seuls les caissiers et administrateurs peuvent accéder à cette page');
      navigate('/dashboard');
    }
  }, [user, navigate, showError]);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Caméra arrière sur mobile
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        scanQRCode();
      }
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      showError('Erreur caméra', 'Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setScannedEmployee(null);
  };

  const scanQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Capturer l'image de la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Ici nous simulons la détection QR - en production, utiliser une bibliothèque comme jsQR
    // Pour l'instant, nous allons simuler avec un timeout
    setTimeout(() => {
      if (isScanning) {
        // Simulation d'un scan réussi
        simulateQRScan();
      }
    }, 2000);
  };

  const simulateQRScan = () => {
    // Simulation d'un employé scanné
    const mockEmployee: ScannedEmployee = {
      employeeId: 'EMP001',
      employeeCode: 'EMP001',
      firstName: 'Jean',
      lastName: 'Dupont',
      department: 'Informatique',
      position: 'Développeur'
    };

    setScannedEmployee(mockEmployee);
    setLastScanTime(new Date());
    stopScanning();
  };

  const validateAttendance = async () => {
    if (!scannedEmployee) return;

    setIsProcessing(true);
    try {
      // Simulation de l'enregistrement du pointage
      const attendanceData = {
        employeeId: scannedEmployee.employeeId,
        type: 'ARRIVEE', // ou 'DEPART'
        timestamp: new Date().toISOString(),
        scannedBy: user?.id,
        location: 'Bureau principal' // En production, utiliser la géolocalisation
      };

      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      showSuccess('Pointage enregistré', `Pointage de ${scannedEmployee.firstName} ${scannedEmployee.lastName} enregistré avec succès`);

      // Réinitialiser pour le prochain scan
      setScannedEmployee(null);
      setLastScanTime(null);

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      showError('Erreur', 'Impossible d\'enregistrer le pointage');
    } finally {
      setIsProcessing(false);
    }
  };

  const rejectScan = () => {
    setScannedEmployee(null);
    setLastScanTime(null);
  };

  useEffect(() => {
    return () => {
      // Nettoyer la caméra lors du démontage du composant
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      <PageMeta
        title="Scanner QR Code | Gestion RH"
        description="Scanner les QR codes des employés pour enregistrer les pointages"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Scanner QR Code
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Scannez le QR code d'un employé pour enregistrer son pointage
            </p>
          </div>
          <Button
            onClick={() => navigate('/attendance')}
            variant="outline"
          >
            Voir les pointages
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Zone de scan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Caméra
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Positionnez le QR code de l'employé dans le cadre
              </p>
            </div>

            <div className="p-6">
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                {!isScanning ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <FaCamera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Caméra inactive
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay de ciblage */}
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-32 h-32 border-2 border-white rounded-lg opacity-50"></div>
                      </div>
                    </div>
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex justify-center space-x-4">
                {!isScanning ? (
                  <Button
                    onClick={startScanning}
                    className="flex items-center space-x-2"
                  >
                    <FaPlay />
                    <span>Démarrer le scan</span>
                  </Button>
                ) : (
                  <Button
                    onClick={stopScanning}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <FaStop />
                    <span>Arrêter</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Résultats du scan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Résultat du scan
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Informations de l'employé scanné
              </p>
            </div>

            <div className="p-6">
              {scannedEmployee ? (
                <div className="space-y-4">
                  {/* Informations de l'employé */}
                  <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <FaUser className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {scannedEmployee.firstName} {scannedEmployee.lastName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {scannedEmployee.employeeId} • {scannedEmployee.department}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {scannedEmployee.position}
                      </p>
                    </div>
                    <FaCheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
                  </div>

                  {/* Informations du scan */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                      <FaClock className="h-4 w-4" />
                      <span>Scanné à {lastScanTime?.toLocaleTimeString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={validateAttendance}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Traitement...</span>
                        </>
                      ) : (
                        <>
                          <FaCheckCircle />
                          <span>Valider le pointage</span>
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={rejectScan}
                      variant="outline"
                      disabled={isProcessing}
                      className="flex items-center space-x-2"
                    >
                      <FaTimesCircle />
                      <span>Annuler</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaCamera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucun QR code scanné
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Démarrez le scan et positionnez un QR code d'employé
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Instructions d'utilisation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-2">Pour scanner :</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Cliquez sur "Démarrer le scan"</li>
                <li>Autorisez l'accès à la caméra</li>
                <li>Positionnez le QR code dans le cadre</li>
                <li>Le système détecte automatiquement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Après scan :</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Vérifiez les informations de l'employé</li>
                <li>Cliquez sur "Valider le pointage"</li>
                <li>Le pointage est enregistré</li>
                <li>Prêt pour le prochain employé</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}