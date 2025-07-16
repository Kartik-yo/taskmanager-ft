import express from "express"
import { body, validationResult } from "express-validator"
import Task from "../models/Task.js"

const router = express.Router()

// Validation middleware
const validateTask = [
  body("title").trim().isLength({ min: 1, max: 100 }).withMessage("Title must be between 1 and 100 characters"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high"),
  body("status")
    .optional()
    .isIn(["todo", "in-progress", "completed"])
    .withMessage("Status must be todo, in-progress, or completed"),
  body("dueDate").optional().isISO8601().withMessage("Due date must be a valid date"),
]

// GET /api/tasks - Get all tasks with filtering and sorting
router.get("/", async (req, res) => {
  try {
    const { status, priority, search, sortBy = "createdAt", sortOrder = "desc", page = 1, limit = 50 } = req.query

    // Build filter object
    const filter = {}
    if (status && status !== "all") filter.status = status
    if (priority && priority !== "all") filter.priority = priority
    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Execute query
    const tasks = await Task.find(filter).sort(sort).skip(skip).limit(Number.parseInt(limit))

    // Get total count for pagination
    const total = await Task.countDocuments(filter)

    // Get task statistics
    const stats = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const taskStats = {
      total,
      todo: stats.find((s) => s._id === "todo")?.count || 0,
      "in-progress": stats.find((s) => s._id === "in-progress")?.count || 0,
      completed: stats.find((s) => s._id === "completed")?.count || 0,
    }

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
      stats: taskStats,
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch tasks",
    })
  }
})

// GET /api/tasks/:id - Get single task
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      })
    }

    res.json({ success: true, data: task })
  } catch (error) {
    console.error("Error fetching task:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch task",
    })
  }
})

// POST /api/tasks - Create new task
router.post("/", validateTask, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const task = new Task(req.body)
    await task.save()

    res.status(201).json({
      success: true,
      data: task,
      message: "Task created successfully",
    })
  } catch (error) {
    console.error("Error creating task:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create task",
    })
  }
})

// PUT /api/tasks/:id - Update task
router.put("/:id", validateTask, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      })
    }

    res.json({
      success: true,
      data: task,
      message: "Task updated successfully",
    })
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update task",
    })
  }
})

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      })
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete task",
    })
  }
})

// PATCH /api/tasks/:id/status - Update task status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body

    if (!["todo", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value",
      })
    }

    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      })
    }

    res.json({
      success: true,
      data: task,
      message: "Task status updated successfully",
    })
  } catch (error) {
    console.error("Error updating task status:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update task status",
    })
  }
})

export default router
