import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './auth/auth.routes.js';
import userRoutes from './routes/users.js';
import companyRoutes from './routes/companies.js';
import paymentRoutes from './routes/payments.js';
import payrollRoutes from './routes/payrolls.js';
import employeeRoutes from './routes/employees.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();

// Middleware de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origine (comme les outils de développement mobile)
    // et les origines localhost sur les ports de développement courants
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
      'http://localhost:5179'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(helmet());

// Routes d'authentification
app.use('/auth', authRoutes);

// Routes des utilisateurs
app.use('/api/users', userRoutes);

// Routes des entreprises
app.use('/api/companies', companyRoutes);

// Routes des paiements (réservées aux caissiers)
app.use('/api/payments', paymentRoutes);

// Routes des paies et salaires
app.use('/api/payrolls', payrollRoutes);

// Routes des employés
app.use('/api/employees', employeeRoutes);

// Routes des notifications
app.use('/api/notifications', notificationRoutes);

// Routes du dashboard
app.use('/api/dashboard', dashboardRoutes);

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

export { app };
