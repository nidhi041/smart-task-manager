import express from "express";
import mongoose from "mongoose";
import cors from "cors";


const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect("mongodb://127.0.0.1:27017/taskflow")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Schema
const taskSchema = new mongoose.Schema({
  title: String,
  completed: Boolean,
  priority: String
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

// Routes

// GET all tasks
app.get("/api/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// ADD task
app.post("/api/tasks", async (req, res) => {
  const task = await Task.create({
    title: req.body.title,
    completed: false
  });
  res.json(task);
});

// DELETE task
app.delete("/api/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

// TOGGLE task
app.put("/api/tasks/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.completed = !task.completed;
  await task.save();
  res.json(task);
});

app.listen(5000, () => console.log("Server running on 5000"));