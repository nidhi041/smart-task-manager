import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

// Database connection
connectDB();

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-task-manager-six-sigma.vercel.app", // production Vercel URL
  process.env.FRONTEND_URL,                           // override via env var if needed
].filter(Boolean); // remove any undefined/null values

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server requests (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health check route (for Render)
app.get("/", (req, res) => {
  res.send("Smart Task Manager API is running 🚀");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: "Internal server error",
  });
});


// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);