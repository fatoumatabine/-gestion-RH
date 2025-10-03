import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import { FaCamera, FaStop, FaPlay, FaCheckCircle, FaTimesCircle, FaUser, FaClock, FaIdCard, FaQrcode } from 'react-icons/fa';

interface ScannedEmployee {
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
}

export default function AttendanceCheckIn() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<'form' | 'scan'>('form');
  const [employeeId, setEmployeeId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedEmployee, setScannedEmployee] = useState<ScannedEmployee | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

    // Simulation de détection QR
    setTimeout(() => {
      if (isScanning) {
        simulateQRScan();
      }
    }, 2000);
  };

  const simulateQRScan = () => {
    // Simulation d'un employé scanné
    const mockEmployee: ScannedEmployee = {
      employeeId: 'ENT-1-0001',
      firstName: 'Jean',
      lastName: 'Dupont',
      department: 'Informatique',
      position: 'Développeur'
    };

    setScannedEmployee(mockEmployee);
    setLastScanTime(new Date());
    stopScanning();
  };

  const handleFormSubmit = async () => {
    if (!employeeId.trim()) {
      showError('Erreur', 'Veuillez saisir votre ID employé');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulation de recherche d'employé
      const mockEmployee: ScannedEmployee = {
        employeeId: employeeId.toUpperCase(),
        firstName: 'Jean',
        lastName: 'Dupont',
        department: 'Informatique',
        position: 'Développeur'
      };

      setScannedEmployee(mockEmployee);
      setLastScanTime(new Date());
      showSuccess('Employé trouvé', `Bienvenue ${mockEmployee.firstName} ${mockEmployee.lastName}`);

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      showError('Erreur', 'Employé non trouvé');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateAttendance = async () => {
    if (!scannedEmployee) return;

    setIsProcessing(true);
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      showSuccess('Pointage enregistré', `Pointage de ${scannedEmployee.firstName} ${scannedEmployee.lastName} enregistré avec succès`);

      // Réinitialiser
      setScannedEmployee(null);
      setLastScanTime(null);
      setEmployeeId('');

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
    setEmployeeId('');
  };

  useEffect(() => {
    return () => {
      // Nettoyer la caméra lors du démontage
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      <PageMeta
        title="Pointage rapide | Gestion RH"
        description="Enregistrez votre pointage rapidement"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6">
              <FaClock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Pointage rapide
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enregistrez votre arrivée ou départ
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('form')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'form'
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <FaIdCard className="inline mr-2" />
                Formulaire
              </button>
              <button
                onClick={() => setActiveTab('scan')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'scan'
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <FaQrcode className="inline mr-2" />
                Scan QR
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'form' ? (
                /* Formulaire */
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID Employé
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: ENT-1-0001"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={handleFormSubmit}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Recherche...</span>
                      </>
                    ) : (
                      <>
                        <FaUser />
                        <span>Rechercher employé</span>
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                /* Scan QR */
                <div className="space-y-6">
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
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
                        <div className="absolute inset-0 border-2 border-green-500 rounded-lg">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-32 h-32 border-2 border-white rounded-lg opacity-50"></div>
                          </div>
                        </div>
                      </>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div className="flex justify-center">
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
              )}
            </div>
          </div>

          {/* Résultat */}
          {scannedEmployee && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <FaUser className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {scannedEmployee.firstName} {scannedEmployee.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {scannedEmployee.employeeId} • {scannedEmployee.department}
                  </p>
                </div>
                <FaCheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                  <FaClock className="h-4 w-4" />
                  <span>Identifié à {lastScanTime?.toLocaleTimeString('fr-FR')}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={validateAttendance}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Enregistrement...</span>
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
          )}

          {/* Bouton retour */}
          <div className="text-center">
            <Button
              onClick={() => navigate('/auth/sign-in')}
              variant="outline"
              className="flex items-center justify-center space-x-2 mx-auto"
            >
              <span>Retour à la connexion</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}