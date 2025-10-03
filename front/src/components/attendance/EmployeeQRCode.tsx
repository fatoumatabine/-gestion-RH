import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendance';
import { FaDownload, FaPrint, FaQrcode, FaCopy, FaCheck } from 'react-icons/fa';

interface EmployeeQRCodeProps {
  className?: string;
}

const EmployeeQRCode: React.FC<EmployeeQRCodeProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadEmployeeQRCode();
  }, []);

  const loadEmployeeQRCode = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getEmployeeQRCode();
      setQrCode(response.data.qrCode);
      setEmployeeId(response.data.employee.employeeId);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du QR code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const downloadQRCode = () => {
    // Simulation du téléchargement - en réalité, générer une image QR
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 200;
      canvas.height = 200;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#000000';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('QR Code', 100, 80);
      ctx.fillText(qrCode.substring(0, 16) + '...', 100, 100);
      ctx.fillText(employeeId, 100, 120);

      const link = document.createElement('a');
      link.download = `qr-code-${employeeId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${employeeId}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { border: 2px solid #000; padding: 20px; display: inline-block; margin: 20px; }
              .qr-code { font-family: monospace; font-size: 14px; margin: 10px 0; }
              .info { margin-top: 20px; }
            </style>
          </head>
          <body>
            <h2>Mon QR Code de Pointage</h2>
            <div class="qr-container">
              <div style="font-size: 48px; margin: 20px;">📱</div>
              <div class="qr-code">${qrCode}</div>
              <div class="info">
                <strong>ID Employé:</strong> ${employeeId}<br>
                <strong>Nom:</strong> ${user?.firstName} ${user?.lastName}
              </div>
            </div>
            <p>Utilisez ce code pour pointer votre arrivée et départ</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du QR code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-red-600">
          <FaQrcode className="h-12 w-12 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FaQrcode className="h-8 w-8 text-blue-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Mon QR Code de Pointage
        </h3>

        <p className="text-sm text-gray-600 mb-6">
          Utilisez ce code pour pointer votre arrivée et départ
        </p>

        {/* QR Code Display */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
          <div className="text-6xl mb-4">📱</div>
          <div className="font-mono text-sm bg-white px-3 py-2 rounded border break-all">
            {qrCode}
          </div>
        </div>

        {/* Employee Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-blue-800">
            <div className="font-medium">ID Employé: {employeeId}</div>
            <div>Nom: {user?.firstName} {user?.lastName}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <FaCheck className="mr-2 h-4 w-4 text-green-600" />
                Copié !
              </>
            ) : (
              <>
                <FaCopy className="mr-2 h-4 w-4" />
                Copier
              </>
            )}
          </button>

          <button
            onClick={downloadQRCode}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FaDownload className="mr-2 h-4 w-4" />
            Télécharger
          </button>

          <button
            onClick={printQRCode}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <FaPrint className="mr-2 h-4 w-4" />
            Imprimer
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-xs text-gray-500">
          <p>Présentez ce QR code à votre responsable pour pointer</p>
          <p>Arrivée et départ sont automatiquement enregistrés</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeQRCode;