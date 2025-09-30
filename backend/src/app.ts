import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

// Import des middlewares de sécurité
import { securityMiddleware, authLimiter } from './middleware/security.middleware'

// Import des routes
import authRoutes from './auth/auth.routes'
import userRoutes from './routes/users'
import employeeRoutes from './routes/employees'
import factureRoutes from './routes/invoices'
import paymentRoutes from './routes/payments'

// Import des middlewares
import { errorHandler } from './middleware/error.handler'
import { authMiddleware } from './middleware/auth.middleware'

const app = express()

// Middlewares de base
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Configuration CORS sécurisée
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(morgan('dev'))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', authMiddleware, userRoutes)
app.use('/api/employees', authMiddleware, employeeRoutes)
app.use('/api/factures', authMiddleware, factureRoutes)
app.use('/api/payments', authMiddleware, paymentRoutes)

// Middleware d'erreur
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`)
})

export default app