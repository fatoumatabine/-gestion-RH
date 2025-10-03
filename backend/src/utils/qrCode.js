import qrcode from 'qrcode';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Génère un code QR unique pour un employé et le sauvegarde comme fichier
 * @param {number} employeeId - ID de l'employé
 * @param {string} employeeCode - Code employé (ex: EMP001)
 * @returns {Promise<string>} Chemin relatif du fichier QR code
 */
export const generateEmployeeQRCode = async (employeeId, employeeCode) => {
  try {
    // Créer un hash unique pour le QR code
    const qrData = {
      employeeId,
      employeeCode,
      timestamp: Date.now(),
      type: 'employee_attendance'
    };

    // Générer un hash pour sécuriser le QR code
    const hash = crypto.createHash('sha256')
      .update(JSON.stringify(qrData))
      .digest('hex')
      .substring(0, 16);

    // Données à encoder dans le QR code
    const qrContent = JSON.stringify({
      ...qrData,
      hash
    });

    // Créer le dossier qrcodes s'il n'existe pas
    const qrDir = path.join(process.cwd(), 'uploads', 'qrcodes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    // Générer le nom du fichier
    const fileName = `qr-${employeeCode}.png`;
    const filePath = path.join(qrDir, fileName);

    // Générer et sauvegarder le QR code
    await qrcode.toFile(filePath, qrContent, {
      errorCorrectionLevel: 'M',
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    // Retourner le chemin relatif pour le stockage en base
    return `/uploads/qrcodes/${fileName}`;
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
    throw new Error('Impossible de générer le QR code');
  }
};

/**
 * Valide un QR code scanné
 * @param {string} qrData - Données du QR code scanné
 * @returns {Object} Données validées ou null si invalide
 */
export const validateQRCode = (qrData) => {
  try {
    const data = JSON.parse(qrData);

    // Vérifier la structure des données
    if (!data.employeeId || !data.employeeCode || !data.hash || !data.type) {
      return null;
    }

    // Vérifier le type
    if (data.type !== 'employee_attendance') {
      return null;
    }

    // Recréer le hash pour validation
    const { hash, ...dataWithoutHash } = data;
    const expectedHash = crypto.createHash('sha256')
      .update(JSON.stringify(dataWithoutHash))
      .digest('hex')
      .substring(0, 16);

    if (hash !== expectedHash) {
      return null;
    }

    // Vérifier que le QR code n'est pas trop vieux (24h)
    const age = Date.now() - data.timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      return null;
    }

    return {
      employeeId: data.employeeId,
      employeeCode: data.employeeCode,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Erreur lors de la validation du QR code:', error);
    return null;
  }
};

/**
 * Génère un code QR simple avec juste l'ID employé
 * @param {string} employeeCode - Code employé
 * @returns {Promise<string>} Code QR en base64
 */
export const generateSimpleQRCode = async (employeeCode) => {
  try {
    const qrCodeDataURL = await qrcode.toDataURL(employeeCode, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Erreur lors de la génération du QR code simple:', error);
    throw new Error('Impossible de générer le QR code');
  }
};