"use client"

import { useState, useMemo } from "react"
import {
  Plus, Trash2, Edit, Flame, CheckCircle2, Circle, Calendar, MoreHorizontal, Repeat
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/store/useAppStore"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format, subDays, startOfDay, isSameDay } from "date-fns"
import type { Habit } from "@/types"

const HABIT_CATEGORIES = ["Health", "Fitness", "Learning", "Productivity", "Mindfulness", "Finance", "Social", "Creative", "Other"]
const HABIT_COLORS = ["#A8B8AE", "#A9BAC8", "#D4C8B8", "#8FB8B0", "#7FAF8A", "#C8A97A"]
const HABIT_ICONS = ["🏃", "📚", "💧", "🧘", "💪", "✍️", "🎯", "🌱", "😴", "🍎"]

const habitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  color: z.string().min(1),
  icon: z.string().min(1),
})
type HabitForm = z.infer<typeof habitSchema>

export default function HabitsPage() {
  const { habits, addHabit, updateHabit, deleteHabit, habitLogs, addHabitLog, removeHabitLog } = useAppStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState("all")

  const today = new Date()
  const todayStr = format(today, "yyyy-MM-dd")

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema) as any,
    defaultValues: { color: "#A8B8AE", icon: "🎯" },
  })
  const watchColor = watch("color")
  const watchIcon = watch("icon")

  const filteredHabits = useMemo(() =>
    habits.filter((h) => filterCategory === "all" || h.category === filterCategory),
    [habits, filterCategory]
  )

  const completedToday = habits.filter((h) =>
    habitLogs.some((l) => l.habit_id === h.id && l.completed_at.startsWith(todayStr))
  ).length
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0

  // Last 7 days heatmap data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(today, 6 - i)
    const dayStr = format(day, "yyyy-MM-dd")
    const completed = habits.filter((h) =>
      habitLogs.some((l) => l.habit_id === h.id && l.completed_at.startsWith(dayStr))
    ).length
    return { day, dayStr, completed, total: habits.length, label: format(day, "EEE") }
  })

  const handleToggle = (habit: Habit) => {
    const isCompleted = habitLogs.some((l) => l.habit_id === habit.id && l.completed_at.startsWith(todayStr))
    if (isCompleted) {
      removeHabitLog(habit.id, todayStr)
      updateHabit(habit.id, {
        current_streak: Math.max(0, habit.current_streak - 1),
        updated_at: new Date().toISOString(),
      })
      toast.success("Habit unmarked")
    } else {
      addHabitLog({
        id: crypto.randomUUID(),
        habit_id: habit.id,
        user_id: "",
        completed_at: new Date().toISOString(),
        note: null,
        created_at: new Date().toISOString(),
      })
      const newStreak = habit.current_streak + 1
      updateHabit(habit.id, {
        current_streak: newStreak,
        best_streak: Math.max(habit.best_streak, newStreak),
        updated_at: new Date().toISOString(),
      })
      toast.success(`Habit completed! 🎉 Streak: ${habit.current_streak + 1}`)
    }
  }

  const openCreate = () => {
    setEditingHabit(null)
    reset({ color: "#A8B8AE", icon: "🎯" })
    setDialogOpen(true)
  }

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setValue("name", habit.name)
    setValue("description", habit.description || "")
    setValue("category", habit.category)
    setValue("color", habit.color)
    setValue("icon", habit.icon)
    setDialogOpen(true)
  }

  const onSubmit = (data: HabitForm) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, {
        ...data,
        description: data.description || null,
        updated_at: new Date().toISOString(),
      })
      toast.success("Habit updated")
    } else {
      addHabit({
        id: crypto.randomUUID(),
        user_id: "",
        name: data.name,
        description: data.description || null,
        category: data.category,
        color: data.color,
        icon: data.icon,
        frequency: "daily",
        target_days: [0, 1, 2, 3, 4, 5, 6],
        current_streak: 0,
        best_streak: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      toast.success("Habit created!")
    }
    setDialogOpen(false)
    reset()
  }

  const handleDelete = (id: string) => {
    deleteHabit(id)
    setDeleteConfirm(null)
    toast.success("Habit deleted")
  }

  const getHabitWeekHistory = (habitId: string) => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(today, 6 - i)
      const dayStr = format(day, "yyyy-MM-dd")
      return habitLogs.some((l) => l.habit_id === habitId && l.completed_at.startsWith(dayStr))
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Habits</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {completedToday}/{habits.length} completed today
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Habit
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--accent-sage)]">{completionRate}%</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Today&apos;s Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{habits.length}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Total Habits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--status-warning)]">
              {habits.length > 0 ? Math.max(...habits.map((h) => h.current_streak)) : 0}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Best Active Streak 🔥</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--accent-blue)]">{completedToday}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Done Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end gap-2 justify-between">
            {last7Days.map(({ day, completed, total, label }, i) => {
              const pct = total > 0 ? (completed / total) * 100 : 0
              const isToday = i === 6
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-[var(--text-muted)]">{completed}</span>
                  <div
                    className={cn(
                      "w-full rounded-sm transition-all",
                      isToday ? "bg-[var(--accent-sage)]" : pct > 0 ? "bg-[var(--accent-sage)]/50" : "bg-[var(--bg-elevated)]"
                    )}
                    style={{ height: `${Math.max(8, pct * 0.6)}px` }}
                  />
                  <span className={cn("text-[10px]", isToday ? "text-[var(--accent-sage)] font-semibold" : "text-[var(--text-muted)]")}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={filterCategory === "all" ? "default" : "secondary"}
          onClick={() => setFilterCategory("all")}
        >
          All
        </Button>
        {HABIT_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={filterCategory === cat ? "default" : "secondary"}
            onClick={() => setFilterCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="py-20 text-center">
          <Repeat className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] font-medium">No habits yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Build your daily routines</p>
          <Button onClick={openCreate} className="mt-4">
            <Plus className="h-4 w-4" /> Create First Habit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit) => {
            const isCompleted = habitLogs.some((l) =>
              l.habit_id === habit.id && l.completed_at.startsWith(todayStr)
            )
            const weekHistory = getHabitWeekHistory(habit.id)
            return (
              <Card key={habit.id} className={cn(
                "group transition-all",
                isCompleted && "border-[var(--accent-sage)]/30"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ background: habit.color + "20", border: `1px solid ${habit.color}40` }}
                      >
                        {habit.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{habit.name}</p>
                        <Badge variant="secondary" className="text-[10px] mt-0.5">{habit.category}</Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(habit)}>
                          <Edit className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteConfirm(habit.id)} className="text-[var(--status-error)]">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {habit.description && (
                    <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-2">{habit.description}</p>
                  )}

                  {/* Week dots */}
                  <div className="flex gap-1 mb-3">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={cn(
                            "w-full h-1.5 rounded-full",
                            weekHistory[i] ? "bg-[var(--accent-sage)]" : "bg-[var(--bg-elevated)]"
                          )}
                        />
                        <span className="text-[9px] text-[var(--text-muted)]">{d}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                      {habit.current_streak > 0 && (
                        <span className="flex items-center gap-0.5 text-[var(--status-warning)]">
                          🔥 {habit.current_streak}d
                        </span>
                      )}
                      {habit.best_streak > 0 && (
                        <span>Best: {habit.best_streak}d</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={isCompleted ? "secondary" : "default"}
                      onClick={() => handleToggle(habit)}
                      className={cn("text-xs h-7", isCompleted && "text-[var(--status-success)]")}
                    >
                      {isCompleted ? (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> Done</>
                      ) : (
                        <><Circle className="h-3.5 w-3.5" /> Mark Done</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHabit ? "Edit Habit" : "New Habit"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input {...register("name")} placeholder="e.g. Morning Run, Read 30 min..." />
              {errors.name && <p className="text-xs text-[var(--status-error)]">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Optional description..." rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select defaultValue={editingHabit?.category || ""} onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                <SelectContent>
                  {HABIT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-[var(--status-error)]">{errors.category.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <div className="flex gap-2 flex-wrap">
                {HABIT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setValue("icon", icon)}
                    className={cn(
                      "w-9 h-9 text-lg rounded-lg border transition-all",
                      watchIcon === icon
                        ? "border-[var(--accent-sage)] bg-[var(--accent-sage)]/15"
                        : "border-[var(--border)] hover:bg-[var(--bg-elevated)]"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue("color", color)}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 transition-all",
                      watchColor === color ? "border-white scale-110" : "border-transparent"
                    )}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingHabit ? "Save Changes" : "Create Habit"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Habit</DialogTitle></DialogHeader>
          <p className="text-sm text-[var(--text-secondary)]">This will delete the habit and all its history.</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
