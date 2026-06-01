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
  process.env.FRONTEND_URL
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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