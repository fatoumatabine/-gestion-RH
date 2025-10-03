import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import attendanceController from '../controllers/attendance.controller.js';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors.array()
    });
  }
  next();
};

// Toutes les routes nécessitent une authentification
router.use(auth);

// Routes pour les employés (pointage quotidien)
router.post('/check-in', [
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('ipAddress').optional().isIP(),
  body('deviceInfo').optional().isString()
], handleValidationErrors, attendanceController.checkIn);

router.post('/check-out', [
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('ipAddress').optional().isIP(),
  body('deviceInfo').optional().isString()
], handleValidationErrors, attendanceController.checkOut);

// Routes pour consulter l'historique (employés et admin)
router.get('/history', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], handleValidationErrors, attendanceController.getAttendanceHistory);

// Route pour obtenir le pointage du jour (employés)
router.get('/today', attendanceController.getTodayAttendance);

// Routes admin (nécessitent rôle ADMIN, CASHIER ou SUPERADMIN)
router.get('/admin/dashboard', roleMiddleware(['ADMIN', 'CASHIER', 'SUPERADMIN']), [
  query('date').optional().isISO8601(),
  query('department').optional().isString()
], handleValidationErrors, attendanceController.getAdminDashboard);

router.get('/admin/employee/:employeeId', roleMiddleware(['ADMIN', 'CASHIER', 'SUPERADMIN']), [
  param('employeeId').isInt({ min: 1 }),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], handleValidationErrors, attendanceController.getEmployeeAttendance);

router.put('/admin/validate/:id', roleMiddleware(['ADMIN', 'CASHIER', 'SUPERADMIN']), [
  param('id').isInt({ min: 1 }),
  body('statut').isIn(['PRESENT', 'RETARD', 'DEPART_ANTICIPE', 'ABSENT', 'CONGE', 'MALADIE', 'AUTRE']),
  body('commentaire').optional().isString()
], handleValidationErrors, attendanceController.validateAttendance);

// Routes pour les règles de pointage (admin seulement)
router.get('/rules', roleMiddleware(['ADMIN', 'SUPERADMIN']), attendanceController.getAttendanceRules);

router.put('/rules', roleMiddleware(['ADMIN', 'SUPERADMIN']), [
  body('heureDebut').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('heureFin').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('toleranceRetard').isInt({ min: 0, max: 480 }),
  body('toleranceDepart').isInt({ min: 0, max: 480 }),
  body('joursTravail').isArray(),
  body('heuresParJour').isInt({ min: 1, max: 24 }),
  body('heuresSupAutorise').isBoolean(),
  body('seuilHeuresSup').isInt({ min: 0 }),
  body('pauseDejeuner').isInt({ min: 0, max: 480 }),
  body('estFlexible').isBoolean()
], handleValidationErrors, attendanceController.updateAttendanceRules);

// Routes pour les absences
router.get('/absences', attendanceController.getAbsences);

router.post('/absences', [
  body('typeAbsence').isIn(['CONGE_ANNUEL', 'CONGE_MALADIE', 'CONGE_MATERNITE', 'CONGE_PATERNITE', 'CONGE_EXCEPTIONNEL', 'ABSENCE_NON_JUSTIFIEE', 'ACCIDENT_TRAVAIL', 'FORMATION', 'AUTRE']),
  body('dateDebut').isISO8601(),
  body('dateFin').isISO8601(),
  body('motif').optional().isString(),
  body('pieceJointe').optional().isString()
], handleValidationErrors, attendanceController.createAbsence);

router.put('/absences/:id', roleMiddleware(['ADMIN', 'CASHIER', 'SUPERADMIN']), [
  param('id').isInt({ min: 1 }),
  body('statut').isIn(['EN_ATTENTE', 'APPROUVEE', 'REJETEE', 'ANNULEE']),
  body('commentaireApprobation').optional().isString()
], handleValidationErrors, attendanceController.updateAbsenceStatus);

// Routes QR Code
router.post('/qr/scan', roleMiddleware(['ADMIN', 'CASHIER', 'SUPERADMIN']), [
  body('qrCode').isString().notEmpty(),
  body('type').isIn(['check-in', 'check-out']),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('ipAddress').optional().isIP(),
  body('deviceInfo').optional().isString()
], handleValidationErrors, attendanceController.scanQRCode);

router.get('/qr/my-code', attendanceController.getEmployeeQRCode);

router.post('/qr/regenerate/:employeeId', roleMiddleware(['ADMIN', 'SUPERADMIN']), [
  param('employeeId').isInt({ min: 1 })
], handleValidationErrors, attendanceController.regenerateEmployeeQRCode);

// Routes de reporting (admin seulement)
router.get('/reports/summary', roleMiddleware(['ADMIN', 'CASHIER', 'SUPERADMIN']), [
  query('startDate').isISO8601(),
  query('endDate').isISO8601(),
  query('department').optional().isString()
], handleValidationErrors, attendanceController.getAttendanceReport);

router.get('/reports/detailed', roleMiddleware(['ADMIN', 'CASHIER', 'SUPERADMIN']), [
  query('startDate').isISO8601(),
  query('endDate').isISO8601(),
  query('employeeId').optional().isInt({ min: 1 }),
  query('department').optional().isString()
], handleValidationErrors, attendanceController.getDetailedReport);

export default router;