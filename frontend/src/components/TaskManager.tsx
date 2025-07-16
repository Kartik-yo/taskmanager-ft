"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import toast from "react-hot-toast"
import { taskApi } from "../lib/api"
import type { Task, TaskFilters, CreateTaskData, UpdateTaskData } from "../types/task"
import { debounce } from "../lib/utils"
import TaskList from "./TaskList"
import TaskForm from "./TaskForm"
import TaskStats from "./TaskStats"
import TaskFiltersComponent from "./TaskFilters"
import Chatbot from "./Chatbot"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"

const TaskManager: React.FC = () => {
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 50,
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const queryClient = useQueryClient()

  // Fetch tasks with filters
  const {
    data: tasksResponse,
    isLoading,
    error,
    refetch,
  } = useQuery(["tasks", filters], () => taskApi.getTasks(filters), {
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to fetch tasks")
    },
  })

  // Create task mutation
  const createTaskMutation = useMutation(taskApi.createTask, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["tasks"])
      toast.success(data.message || "Task created successfully")
      setIsCreateDialogOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to create task")
    },
  })

  // Update task mutation
  const updateTaskMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateTaskData }) => taskApi.updateTask(id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["tasks"])
        toast.success(data.message || "Task updated successfully")
        setEditingTask(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || "Failed to update task")
      },
    },
  )

  // Update task status mutation
  const updateStatusMutation = useMutation(
    ({ id, status }: { id: string; status: Task["status"] }) => taskApi.updateTaskStatus(id, status),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["tasks"])
        toast.success(data.message || "Task status updated")
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || "Failed to update task status")
      },
    },
  )

  // Delete task mutation
  const deleteTaskMutation = useMutation(taskApi.deleteTask, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["tasks"])
      toast.success(data.message || "Task deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete task")
    },
  })

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }))
    }, 300),
    [],
  )

  // Handle filter changes
  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  // Handle search
  const handleSearch = (searchTerm: string) => {
    debouncedSearch(searchTerm)
  }

  // Handle task creation
  const handleCreateTask = (taskData: CreateTaskData) => {
    createTaskMutation.mutate(taskData)
  }

  // Handle task update
  const handleUpdateTask = (id: string, taskData: UpdateTaskData) => {
    updateTaskMutation.mutate({ id, data: taskData })
  }

  // Handle task status toggle
  const handleStatusToggle = (task: Task) => {
    const newStatus = task.status === "completed" ? "todo" : task.status === "todo" ? "in-progress" : "completed"

    updateStatusMutation.mutate({ id: task._id, status: newStatus })
  }

  // Handle task deletion
  const handleDeleteTask = (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id)
    }
  }

  const tasks = tasksResponse?.data || []
  const stats = tasksResponse?.stats || { total: 0, todo: 0, "in-progress": 0, completed: 0 }
  const pagination = tasksResponse?.pagination

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Manager</h1>
          <p className="text-gray-600">Organize and track your tasks efficiently</p>
        </div>

        {/* Stats */}
        <TaskStats stats={stats} />

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <TaskFiltersComponent filters={filters} onFilterChange={handleFilterChange} onSearch={handleSearch} />

            <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Task List */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          error={error}
          onStatusToggle={handleStatusToggle}
          onEdit={setEditingTask}
          onDelete={handleDeleteTask}
          pagination={pagination}
          onPageChange={(page) => handleFilterChange("page", page)}
        />

        {/* Task Form Dialog */}
        <TaskForm
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateTask}
          isLoading={createTaskMutation.isLoading}
          title="Add New Task"
        />

        {/* Edit Task Dialog */}
        {editingTask && (
          <TaskForm
            isOpen={!!editingTask}
            onClose={() => setEditingTask(null)}
            onSubmit={(data) => handleUpdateTask(editingTask._id, data)}
            isLoading={updateTaskMutation.isLoading}
            title="Edit Task"
            initialData={editingTask}
            isEdit
          />
        )}

        {/* AI Chatbot */}
        <Chatbot tasks={tasks} />
      </div>
    </div>
  )
}

export default TaskManager
