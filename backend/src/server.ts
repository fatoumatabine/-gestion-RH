import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"

// Import routes
import authRoutes from "./routes/auth"
import userRoutes from "./routes/users"
import employeeRoutes from "./routes/employees"
import invoiceRoutes from "./routes/invoices"
import dashboardRoutes from "./routes/dashboard"

// Load environment variables
dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// Initialize Prisma Client
export const prisma = new PrismaClient()

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/employees", employeeRoutes)
app.use("/api/invoices", invoiceRoutes)
app.use("/api/dashboard", dashboardRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`)
  console.log(`📊 API Documentation: http://localhost:${port}/api`)
})

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down server...")
  await prisma.$disconnect()
  process.exit(0)
})
