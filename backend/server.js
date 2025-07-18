import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import connectDB from "./config/database.js"
import taskRoutes from "./routes/taskRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB Atlas
connectDB()

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
)

// Body parser middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Routes
app.use("/api/tasks", taskRoutes)
app.use("/api/chat", chatRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Task Manager API is running",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
})
