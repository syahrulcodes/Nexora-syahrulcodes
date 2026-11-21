"use client"

import { useState, useMemo } from "react"
import {
  Plus, Search, Filter, LayoutList, Columns, Trash2,
  Edit, CheckCircle2, Circle, Clock, Tag, MoreHorizontal,
  AlertTriangle, ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/store/useAppStore"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format, isBefore, startOfDay } from "date-fns"
import type { Task, Priority, TaskStatus } from "@/types"
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent
} from "@dnd-kit/core"
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.string().optional(),
  due_time: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in_progress", "completed"]),
  category: z.string().optional(),
  tags: z.string().optional(),
})

type TaskForm = z.infer<typeof taskSchema>

const priorityConfig = {
  low: { label: "Low", color: "text-[var(--accent-teal)]", bg: "bg-[var(--accent-teal)]/10", variant: "teal" as const },
  medium: { label: "Medium", color: "text-[var(--status-warning)]", bg: "bg-[var(--status-warning)]/10", variant: "warning" as const },
  high: { label: "High", color: "text-[var(--status-error)]", bg: "bg-[var(--status-error)]/10", variant: "destructive" as const },
}

const statusConfig = {
  todo: { label: "To Do", color: "text-[var(--text-muted)]", bg: "bg-[var(--bg-elevated)]" },
  in_progress: { label: "In Progress", color: "text-[var(--accent-blue)]", bg: "bg-[var(--accent-blue)]/10" },
  completed: { label: "Completed", color: "text-[var(--status-success)]", bg: "bg-[var(--status-success)]/10" },
}

function SortableTaskCard({
  task, onEdit, onDelete, onStatusChange
}: {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const isOverdue = task.due_date && task.status !== "completed" && isBefore(new Date(task.due_date), startOfDay(new Date()))

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 group transition-all",
        isDragging ? "opacity-50 shadow-lg" : "hover:border-[var(--accent-sage)]/30 hover:shadow-sm",
        isOverdue && "border-[var(--status-error)]/30"
      )}
    >
      <div className="flex items-start gap-2">
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-0.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-0.5"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="8" cy="6" r="1.5" /><circle cx="16" cy="6" r="1.5" />
            <circle cx="8" cy="12" r="1.5" /><circle cx="16" cy="12" r="1.5" />
            <circle cx="8" cy="18" r="1.5" /><circle cx="16" cy="18" r="1.5" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium leading-snug",
            task.status === "completed" ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"
          )}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Badge variant={priorityConfig[task.priority].variant} className="text-[10px]">
              {task.priority}
            </Badge>
            {task.due_date && (
              <span className={cn(
                "text-[10px] flex items-center gap-0.5",
                isOverdue ? "text-[var(--status-error)]" : "text-[var(--text-muted)]"
              )}>
                <Clock className="h-2.5 w-2.5" />
                {format(new Date(task.due_date), "d MMM")}
              </span>
            )}
            {task.category && (
              <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                {task.category}
              </span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, task.status === "completed" ? "todo" : "completed")}>
              <CheckCircle2 className="h-4 w-4" />
              {task.status === "completed" ? "Reopen" : "Mark Complete"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-[var(--status-error)]">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, setTasks } = useAppStore()
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("created")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "medium", status: "todo" },
  })

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesPriority = filterPriority === "all" || t.priority === filterPriority
        const matchesStatus = filterStatus === "all" || t.status === filterStatus
        return matchesSearch && matchesPriority && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === "due_date") return (a.due_date || "").localeCompare(b.due_date || "")
        if (sortBy === "priority") {
          const order = { high: 0, medium: 1, low: 2 }
          return order[a.priority] - order[b.priority]
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [tasks, searchQuery, filterPriority, filterStatus, sortBy])

  const kanbanColumns = {
    todo: filteredTasks.filter((t) => t.status === "todo"),
    in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
    completed: filteredTasks.filter((t) => t.status === "completed"),
  }

  const openCreateDialog = () => {
    setEditingTask(null)
    reset({ priority: "medium", status: "todo" })
    setDialogOpen(true)
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setValue("title", task.title)
    setValue("description", task.description || "")
    setValue("due_date", task.due_date || "")
    setValue("due_time", task.due_time || "")
    setValue("priority", task.priority)
    setValue("status", task.status)
    setValue("category", task.category || "")
    setValue("tags", task.tags?.join(", ") || "")
    setDialogOpen(true)
  }

  const onSubmit = (data: TaskForm) => {
    const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : []

    if (editingTask) {
      updateTask(editingTask.id, {
        ...data,
        tags,
        description: data.description || null,
        due_date: data.due_date || null,
        due_time: data.due_time || null,
        category: data.category || null,
        updated_at: new Date().toISOString(),
      })
      toast.success("Task updated")
    } else {
      addTask({
        id: crypto.randomUUID(),
        user_id: "",
        title: data.title,
        description: data.description || null,
        due_date: data.due_date || null,
        due_time: data.due_time || null,
        priority: data.priority,
        status: data.status,
        category: data.category || null,
        tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      toast.success("Task created!")
    }
    setDialogOpen(false)
    reset()
  }

  const handleDelete = (id: string) => {
    deleteTask(id)
    setDeleteConfirm(null)
    toast.success("Task deleted")
  }

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateTask(id, { status, updated_at: new Date().toISOString() })
    toast.success(status === "completed" ? "Task completed! ✓" : "Task updated")
  }

  const handleDragEnd = (event: DragEndEvent, columnStatus: TaskStatus) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const colTasks = tasks.filter((t) => t.status === columnStatus)
    const oldIndex = colTasks.findIndex((t) => t.id === active.id)
    const newIndex = colTasks.findIndex((t) => t.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(colTasks, oldIndex, newIndex)
      const otherTasks = tasks.filter((t) => t.status !== columnStatus)
      setTasks([...otherTasks, ...reordered])
    }
  }

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Tasks</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {stats.completed}/{stats.total} completed · {stats.in_progress} in progress
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" /> Create Task
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries({ "Total": stats.total, "To Do": stats.todo, "In Progress": stats.in_progress, "Completed": stats.completed }).map(([label, count]) => (
          <Card key={label}>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-[var(--text-primary)]">{count}</p>
              <p className="text-xs text-[var(--text-muted)]">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border border-[var(--border)] rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-2 transition-colors",
                viewMode === "list" ? "bg-[var(--accent-sage)]/15 text-[var(--accent-sage)]" : "hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]"
              )}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "px-3 py-2 transition-colors",
                viewMode === "kanban" ? "bg-[var(--accent-sage)]/15 text-[var(--accent-sage)]" : "hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]"
              )}
            >
              <Columns className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            {filteredTasks.length === 0 ? (
              <div className="py-16 text-center">
                <CheckCircle2 className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-[var(--text-secondary)] font-medium">No tasks found</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {searchQuery ? "Try a different search" : "Create your first task"}
                </p>
                <Button onClick={openCreateDialog} size="sm" className="mt-4">
                  <Plus className="h-4 w-4" /> Create Task
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {filteredTasks.map((task) => {
                  const isOverdue = task.due_date && task.status !== "completed" &&
                    isBefore(new Date(task.due_date), startOfDay(new Date()))
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-4 hover:bg-[var(--bg-elevated)] transition-colors group"
                    >
                      <button
                        onClick={() => handleStatusChange(task.id, task.status === "completed" ? "todo" : "completed")}
                        className="shrink-0 transition-colors"
                      >
                        {task.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-[var(--status-success)]" />
                        ) : (
                          <Circle className="h-5 w-5 text-[var(--border)] hover:text-[var(--accent-sage)]" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          task.status === "completed" ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"
                        )}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {task.category && (
                            <span className="text-xs text-[var(--text-muted)]">{task.category}</span>
                          )}
                          {task.due_date && (
                            <span className={cn(
                              "text-xs flex items-center gap-1",
                              isOverdue ? "text-[var(--status-error)]" : "text-[var(--text-muted)]"
                            )}>
                              <Clock className="h-3 w-3" />
                              {format(new Date(task.due_date), "d MMM yyyy")}
                              {isOverdue && " · Overdue"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={priorityConfig[task.priority].variant} className="text-[10px] hidden sm:flex">
                          {task.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] hidden sm:flex">
                          {statusConfig[task.status].label}
                        </Badge>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(task)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteConfirm(task.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-[var(--status-error)]" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 kanban-scroll">
          {(["todo", "in_progress", "completed"] as TaskStatus[]).map((status) => {
            const colTasks = kanbanColumns[status]
            const cfg = statusConfig[status]
            return (
              <div key={status} className="bg-[var(--bg-secondary)] rounded-xl p-3 min-h-96">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</span>
                    <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      openCreateDialog()
                      setValue("status", status)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, status)}
                >
                  <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {colTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onEdit={openEditDialog}
                          onDelete={(id) => setDeleteConfirm(id)}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                {colTasks.length === 0 && (
                  <div className="py-8 text-center border-2 border-dashed border-[var(--border)] rounded-lg">
                    <p className="text-xs text-[var(--text-muted)]">No tasks here</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input {...register("title")} placeholder="Task title..." />
              {errors.title && <p className="text-xs text-[var(--status-error)]">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Optional description..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" {...register("due_date")} />
              </div>
              <div className="space-y-1.5">
                <Label>Due Time</Label>
                <Input type="time" {...register("due_time")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select defaultValue="medium" onValueChange={(v) => setValue("priority", v as Priority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select defaultValue="todo" onValueChange={(v) => setValue("status", v as TaskStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input {...register("category")} placeholder="e.g. Work, Personal, Study..." />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input {...register("tags")} placeholder="e.g. urgent, review, design..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingTask ? "Save Changes" : "Create Task"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--text-secondary)]">
            This action cannot be undone. The task will be permanently deleted.
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
