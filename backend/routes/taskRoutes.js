import express from "express";
import {
  getTasks, createTask, toggleTask, deleteTask, getStats,
  getDailyHistory, getWeeklyHistory, getMonthlyHistory, getStreaks,
} from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/stats",            getStats);
router.get("/streaks",          getStreaks);
router.get("/history/daily",    getDailyHistory);
router.get("/history/weekly",   getWeeklyHistory);
router.get("/history/monthly",  getMonthlyHistory);
router.get("/",                 getTasks);
router.post("/",                createTask);
router.put("/:id",              toggleTask);
router.delete("/:id",           deleteTask);

export default router;
