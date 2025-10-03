/**
 * Service d'envoi d'emails (simulation pour développement)
 * En production, remplacer par un vrai service comme SendGrid, Mailgun, etc.
 */

export const sendEmployeeQRCodeEmail = async (to, employeeData) => {
  try {
    const subject = `Bienvenue ${employeeData.firstName} ${employeeData.lastName} - Votre QR Code`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Bienvenue dans l'équipe !</h2>

        <p>Bonjour <strong>${employeeData.firstName} ${employeeData.lastName}</strong>,</p>

        <p>Vous avez été ajouté(e) en tant qu'employé(e) dans notre système de gestion RH.</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Informations de votre compte :</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>ID Employé :</strong> ${employeeData.employeeId}</li>
            <li><strong>Département :</strong> ${employeeData.department || 'Non spécifié'}</li>
            <li><strong>Poste :</strong> ${employeeData.position || 'Non spécifié'}</li>
          </ul>
        </div>

        <div style="background-color: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin-top: 0; color: #495057;">Votre QR Code</h3>
          <p>Utilisez ce QR code pour pointer vos heures de travail :</p>
          <div style="background-color: white; padding: 20px; border-radius: 4px; display: inline-block;">
            <img src="cid:qrcode" alt="QR Code" style="max-width: 200px; max-height: 200px;" />
          </div>
          <p style="margin-top: 15px; font-size: 14px; color: #6c757d;">
            Code QR : ${employeeData.qrCode}
          </p>
        </div>

        <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0c5460;">Instructions :</h4>
          <ol style="margin: 0; padding-left: 20px;">
            <li>Téléchargez l'application mobile de pointage</li>
            <li>Scannez votre QR code lors de vos arrivées et départs</li>
            <li>Conservez ce code en sécurité</li>
          </ol>
        </div>

        <p style="color: #6c757d; font-size: 14px;">
          Si vous avez des questions, contactez votre administrateur RH.
        </p>

        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">

        <p style="font-size: 12px; color: #6c757d; text-align: center;">
          Cet email a été envoyé automatiquement par le système de gestion RH.
        </p>
      </div>
    `;

    // Simulation d'envoi d'email
    console.log('📧 SIMULATION ENVOI EMAIL:');
    console.log('='.repeat(60));
    console.log(`À: ${to}`);
    console.log(`Sujet: ${subject}`);
    console.log('Contenu HTML:');
    console.log(htmlContent);
    console.log('='.repeat(60));
    console.log('✅ Email simulé envoyé avec succès !');

    // En production, remplacer par :
    // const transporter = nodemailer.createTransporter({...});
    // await transporter.sendMail({
    //   from: 'noreply@company.com',
    //   to: to,
    //   subject: subject,
    //   html: htmlContent,
    //   attachments: [{
    //     filename: 'qrcode.png',
    //     content: qrCodeImageBuffer,
    //     cid: 'qrcode'
    //   }]
    // });

    return { success: true, message: 'Email envoyé avec succès' };

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Échec de l\'envoi de l\'email');
  }
};

export const sendAdminNotificationEmail = async (adminEmail, employeeData, companyName) => {
  try {
    const subject = `Nouvel employé ajouté - ${employeeData.firstName} ${employeeData.lastName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Notification Administrative</h2>

        <p>Un nouvel employé a été ajouté au système :</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Détails de l'employé :</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Nom :</strong> ${employeeData.firstName} ${employeeData.lastName}</li>
            <li><strong>ID Employé :</strong> ${employeeData.employeeId}</li>
            <li><strong>Email :</strong> ${employeeData.email}</li>
            <li><strong>Entreprise :</strong> ${companyName}</li>
            <li><strong>Département :</strong> ${employeeData.department || 'Non spécifié'}</li>
            <li><strong>Poste :</strong> ${employeeData.position || 'Non spécifié'}</li>
          </ul>
        </div>

        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;">
            <strong>Action requise :</strong> Vérifiez les informations et contactez l'employé si nécessaire.
          </p>
        </div>

        <p style="color: #6c757d; font-size: 14px;">
          Cet email a été envoyé automatiquement lors de l'ajout d'un employé.
        </p>
      </div>
    `;

    // Simulation d'envoi d'email
    console.log('📧 SIMULATION ENVOI EMAIL ADMIN:');
    console.log('='.repeat(60));
    console.log(`À: ${adminEmail}`);
    console.log(`Sujet: ${subject}`);
    console.log('Contenu HTML:');
    console.log(htmlContent);
    console.log('='.repeat(60));
    console.log('✅ Email admin simulé envoyé avec succès !');

    return { success: true, message: 'Email de notification envoyé' };

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email admin:', error);
    throw new Error('Échec de l\'envoi de l\'email de notification');
  }
};