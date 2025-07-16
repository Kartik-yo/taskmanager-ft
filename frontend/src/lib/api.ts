import axios from "axios"
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  TaskResponse,
  ChatMessage,
  ChatResponse,
} from "../types/task"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Task API functions
export const taskApi = {
  // Get all tasks with filters
  getTasks: async (filters: TaskFilters = {}): Promise<TaskResponse> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    const response = await api.get(`/tasks?${params.toString()}`)
    return response.data
  },

  // Get single task
  getTask: async (id: string): Promise<{ success: boolean; data: Task }> => {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },

  // Create new task
  createTask: async (taskData: CreateTaskData): Promise<{ success: boolean; data: Task; message: string }> => {
    const response = await api.post("/tasks", taskData)
    return response.data
  },

  // Update task
  updateTask: async (
    id: string,
    taskData: UpdateTaskData,
  ): Promise<{ success: boolean; data: Task; message: string }> => {
    const response = await api.put(`/tasks/${id}`, taskData)
    return response.data
  },

  // Update task status
  updateTaskStatus: async (
    id: string,
    status: Task["status"],
  ): Promise<{ success: boolean; data: Task; message: string }> => {
    const response = await api.patch(`/tasks/${id}/status`, { status })
    return response.data
  },

  // Delete task
  deleteTask: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/tasks/${id}`)
    return response.data
  },
}

// Chat API functions
export const chatApi = {
  // Send chat message
  sendMessage: async (message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> => {
    const response = await api.post("/chat", {
      message,
      conversationHistory,
    })
    return response.data
  },

  // Get AI suggestions
  getSuggestions: async (): Promise<{
    success: boolean
    data: {
      suggestions: string[]
      stats: {
        overdue: number
        highPriority: number
        todo: number
      }
    }
  }> => {
    const response = await api.get("/chat/suggestions")
    return response.data
  },
}

export default api
