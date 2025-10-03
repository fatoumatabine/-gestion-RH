import qrcode from 'qrcode';

async function testSimpleQR() {
  try {
    console.log('🧪 Test génération QR code simple...');

    // Test avec un texte très court
    const testData = 'TEST123';
    console.log('📝 Données de test:', testData);

    const qrCodeDataURL = await qrcode.toDataURL(testData, {
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

    console.log('✅ QR code généré');
    console.log('📏 Longueur:', qrCodeDataURL.length, 'caractères');
    console.log('🔍 Format valide:', qrCodeDataURL.startsWith('data:image/png;base64,'));
    console.log('📄 Aperçu:', qrCodeDataURL.substring(0, 100) + '...');

    // Tester si c'est une URL valide
    try {
      const url = new URL(qrCodeDataURL);
      console.log('✅ URL valide syntaxiquement');
    } catch (error) {
      console.log('❌ URL invalide:', error.message);
    }

    // Créer un fichier HTML de test
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Test QR Code</title>
</head>
<body>
    <h1>Test QR Code Simple</h1>
    <p>Données: ${testData}</p>
    <img src="${qrCodeDataURL}" alt="Test QR Code" style="border: 1px solid black;" />
    <p>Longueur: ${qrCodeDataURL.length} caractères</p>
</body>
</html>`;

    const fs = await import('fs');
    fs.writeFileSync('test-qr.html', htmlContent);
    console.log('📄 Fichier test-qr.html créé');

  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

testSimpleQR();