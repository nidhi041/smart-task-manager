import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ["Planning", "Pending", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
