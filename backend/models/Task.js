import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },
    dueDate: {
      type: Date,
      validate: {
        validator: (value) => !value || value >= new Date(),
        message: "Due date cannot be in the past",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
taskSchema.index({ status: 1, priority: 1 })
taskSchema.index({ createdAt: -1 })

// Pre-save middleware to update updatedAt
taskSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

// Virtual for checking if task is overdue
taskSchema.virtual("isOverdue").get(function () {
  if (this.status === "completed" || !this.dueDate) return false
  return this.dueDate < new Date()
})

// Ensure virtual fields are serialized
taskSchema.set("toJSON", { virtuals: true })

const Task = mongoose.model("Task", taskSchema)

export default Task
