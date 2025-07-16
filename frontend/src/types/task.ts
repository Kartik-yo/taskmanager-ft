export interface Task {
  _id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed"
  dueDate?: string
  createdAt: string
  updatedAt: string
  isOverdue?: boolean
}

export interface TaskStats {
  total: number
  todo: number
  "in-progress": number
  completed: number
}

export interface CreateTaskData {
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  dueDate?: string
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: "todo" | "in-progress" | "completed"
}

export interface TaskFilters {
  status?: string
  priority?: string
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export interface TaskResponse {
  success: boolean
  data: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: TaskStats
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

export interface ChatResponse {
  success: boolean
  data: {
    message: string
    timestamp: string
  }
}
