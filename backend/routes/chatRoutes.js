import express from "express"
import { GoogleGenerativeAI } from "@google/generative-ai"
import Task from "../models/Task.js"

const router = express.Router()

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// POST /api/chat - Handle chat messages
router.post("/", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Message is required and must be a string",
      })
    }

    // Get current task statistics for context
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const totalTasks = await Task.countDocuments()
    const todoTasks = taskStats.find((s) => s._id === "todo")?.count || 0
    const inProgressTasks = taskStats.find((s) => s._id === "in-progress")?.count || 0
    const completedTasks = taskStats.find((s) => s._id === "completed")?.count || 0

    // Get recent tasks for context
    const recentTasks = await Task.find().sort({ createdAt: -1 }).limit(5).select("title status priority dueDate")

    // Build context for AI
    const context = `
Current Task Statistics:
- Total Tasks: ${totalTasks}
- Todo: ${todoTasks}
- In Progress: ${inProgressTasks}
- Completed: ${completedTasks}

Recent Tasks:
${recentTasks.map((task) => `- ${task.title} (${task.status}, ${task.priority} priority)`).join("\n")}

You are a helpful AI assistant integrated into a task management application. You can help users with:
1. Creating and organizing tasks
2. Setting priorities and due dates
3. Breaking down complex projects into smaller tasks
4. Providing productivity tips and suggestions
5. Helping with time management
6. Suggesting task categorization
7. Analyzing current workload and providing insights

Be concise, helpful, and focused on productivity and task management. When users ask about creating tasks, provide structured suggestions they can easily implement.
`

    // Prepare conversation history for Gemini
    const history = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Start chat with history
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    })

    // Send message with context
    const result = await chat.sendMessage(`${context}\n\nUser: ${message}`)
    const response = await result.response
    const aiMessage = response.text()

    res.json({
      success: true,
      data: {
        message: aiMessage,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error in chat route:", error)

    // Handle specific Gemini API errors
    if (error.message?.includes("API key")) {
      return res.status(401).json({
        success: false,
        error: "Invalid or missing Gemini API key",
      })
    }

    if (error.message?.includes("quota")) {
      return res.status(429).json({
        success: false,
        error: "API quota exceeded. Please try again later.",
      })
    }

    res.status(500).json({
      success: false,
      error: "Failed to process chat message",
    })
  }
})

// GET /api/chat/suggestions - Get AI suggestions based on current tasks
router.get("/suggestions", async (req, res) => {
  try {
    // Get task statistics
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    })

    const highPriorityTasks = await Task.countDocuments({
      priority: "high",
      status: { $ne: "completed" },
    })

    // Generate suggestions based on task data
    const suggestions = []

    if (overdueTasks > 0) {
      suggestions.push(`You have ${overdueTasks} overdue task(s). Consider prioritizing these first.`)
    }

    if (highPriorityTasks > 0) {
      suggestions.push(`Focus on your ${highPriorityTasks} high-priority task(s) today.`)
    }

    const todoCount = taskStats.find((s) => s._id === "todo")?.count || 0
    if (todoCount > 10) {
      suggestions.push("You have many pending tasks. Consider breaking them down into smaller, manageable chunks.")
    }

    if (suggestions.length === 0) {
      suggestions.push("Great job staying on top of your tasks! Consider planning ahead for upcoming deadlines.")
    }

    res.json({
      success: true,
      data: {
        suggestions,
        stats: {
          overdue: overdueTasks,
          highPriority: highPriorityTasks,
          todo: todoCount,
        },
      },
    })
  } catch (error) {
    console.error("Error generating suggestions:", error)
    res.status(500).json({
      success: false,
      error: "Failed to generate suggestions",
    })
  }
})

export default router
