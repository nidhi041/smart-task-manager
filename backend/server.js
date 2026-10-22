
import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://smart-task-manager-six-sigma.vercel.app",
]);

if (process.env.FRONTEND_URL) {
  allowedOrigins.add(
    process.env.FRONTEND_URL.trim().replace(/\/+$/, "")
  );
}

const corsOptions = {
  origin: (origin, callback) => {
    console.log("CORS origin:", origin || "(no origin)");

    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    console.error("CORS rejected origin:", origin);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Smart Task Manager API is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);

  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    await connectDB();
  } catch (error) {
    console.error("Database startup failed:", error.message);
  }
});
