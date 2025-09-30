import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const dashboardController = new DashboardController();

// Middleware d'authentification pour toutes les routes
router.use(auth);

// GET /api/dashboard/stats - Récupérer les statistiques du dashboard
router.get('/stats', async (req, res) => {
  await dashboardController.getSuperAdminStats(req, res);
});

// GET /api/dashboard/employee-distribution - Récupérer la distribution des employés
router.get('/employee-distribution', async (req, res) => {
  await dashboardController.getEmployeeDistribution(req, res);
});

// GET /api/dashboard/salary-evolution - Récupérer l'évolution des salaires
router.get('/salary-evolution', async (req, res) => {
  await dashboardController.getSalaryEvolution(req, res);
});

// GET /api/dashboard/system-status - Récupérer le statut du système
router.get('/system-status', async (req, res) => {
  await dashboardController.getSystemStatus(req, res);
});

export default router;