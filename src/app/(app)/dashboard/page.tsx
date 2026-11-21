"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckSquare, DollarSign, Flame, TrendingUp, Plus,
  ArrowRight, Calendar, FileText, Target, Clock, AlertCircle,
  Repeat
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { useAppStore } from "@/store/useAppStore"
import { formatCurrency, formatDate, getGreeting, getMotivationalMessage } from "@/lib/utils"
import { cn } from "@/lib/utils"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"
import { format, startOfWeek, addDays, isToday, isBefore, startOfDay } from "date-fns"
import { toast } from "sonner"

export default function DashboardPage() {
  const router = useRouter()
  const { tasks, updateTask, transactions, habits, habitLogs, addHabitLog, removeHabitLog, events } = useAppStore()

  const today = new Date()
  const greeting = getGreeting()
  const motivation = getMotivationalMessage()

  // Task stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const todayTasks = tasks.filter((t) => {
    if (!t.due_date) return false
    return isToday(new Date(t.due_date))
  })
  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date || t.status === "completed") return false
    return isBefore(new Date(t.due_date), startOfDay(today))
  })

  // Finance stats
  const thisMonth = today.getMonth()
  const thisYear = today.getFullYear()
  const monthlyTransactions = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })
  const monthlyIncome = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const balance = monthlyIncome - monthlyExpenses

  // Habit stats
  const todayStr = format(today, "yyyy-MM-dd")
  const completedHabitsToday = habits.filter((h) =>
    habitLogs.some((l) => l.habit_id === h.id && l.completed_at.startsWith(todayStr))
  ).length
  const habitRate = habits.length > 0 ? Math.round((completedHabitsToday / habits.length) * 100) : 0

  // Weekly chart data
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i)
    const dayStr = format(day, "yyyy-MM-dd")
    const completed = tasks.filter(
      (t) => t.status === "completed" && t.updated_at?.startsWith(dayStr)
    ).length
    return {
      day: format(day, "EEE"),
      completed,
      isToday: isToday(day),
    }
  })

  // Upcoming events
  const upcomingEvents = events
    .filter((e) => new Date(e.start_time) >= today)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 4)

  const handleTaskToggle = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed"
    updateTask(taskId, { status: newStatus, updated_at: new Date().toISOString() })
    toast.success(newStatus === "completed" ? "Task completed!" : "Task reopened")
  }

  const handleHabitToggle = (habitId: string) => {
    const isCompleted = habitLogs.some((l) => l.habit_id === habitId && l.completed_at.startsWith(todayStr))
    if (isCompleted) {
      removeHabitLog(habitId, todayStr)
      toast.success("Habit unmarked")
    } else {
      addHabitLog({
        id: crypto.randomUUID(),
        habit_id: habitId,
        user_id: "",
        completed_at: new Date().toISOString(),
        note: null,
        created_at: new Date().toISOString(),
      })
      toast.success("Habit completed! 🎉")
    }
  }

  const priorityColors = {
    low: "text-[var(--accent-teal)] bg-[var(--accent-teal)]/10",
    medium: "text-[var(--status-warning)] bg-[var(--status-warning)]/10",
    high: "text-[var(--status-error)] bg-[var(--status-error)]/10",
  }

  const statCards = [
    {
      title: "Total Tasks",
      value: totalTasks,
      sub: `${completedTasks} completed`,
      icon: CheckSquare,
      color: "text-[var(--accent-sage)]",
      bg: "bg-[var(--accent-sage)]/10",
    },
    {
      title: "Monthly Income",
      value: formatCurrency(monthlyIncome),
      sub: `Balance: ${formatCurrency(balance)}`,
      icon: TrendingUp,
      color: "text-[var(--status-success)]",
      bg: "bg-[var(--status-success)]/10",
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(monthlyExpenses),
      sub: "This month",
      icon: DollarSign,
      color: "text-[var(--status-warning)]",
      bg: "bg-[var(--status-warning)]/10",
    },
    {
      title: "Habit Completion",
      value: `${habitRate}%`,
      sub: `${completedHabitsToday}/${habits.length} today`,
      icon: Flame,
      color: "text-[var(--status-error)]",
      bg: "bg-[var(--status-error)]/10",
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--text-muted)] mb-1">
            {format(today, "EEEE, d MMMM yyyy")}
          </p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {greeting}, Nexora! 👋
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 italic">
            &ldquo;{motivation}&rdquo;
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => router.push("/tasks")}>
            <Plus className="h-4 w-4" /> Add Task
          </Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/notes")}>
            <FileText className="h-4 w-4" /> New Note
          </Button>
          <Button size="sm" variant="outline" onClick={() => router.push("/finance")}>
            <DollarSign className="h-4 w-4" /> Record Transaction
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--text-muted)] mb-1">{card.title}</p>
                    <p className="text-xl font-bold text-[var(--text-primary)] truncate">{card.value}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{card.sub}</p>
                  </div>
                  <div className={cn("p-2 rounded-lg shrink-0", card.bg)}>
                    <Icon className={cn("h-4 w-4", card.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Today&apos;s Tasks</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/tasks")} className="text-xs gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {overdueTasks.length > 0 && (
                <div className="mb-3 flex items-center gap-2 text-xs text-[var(--status-error)] bg-[var(--status-error)]/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}
                </div>
              )}
              {todayTasks.length === 0 && overdueTasks.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckSquare className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-muted)]">No tasks for today</p>
                  <Button size="sm" variant="ghost" onClick={() => router.push("/tasks")} className="mt-2 text-xs">
                    Add a task
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...overdueTasks, ...todayTasks].slice(0, 6).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors group"
                    >
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => handleTaskToggle(task.id, task.status)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          task.status === "completed"
                            ? "line-through text-[var(--text-muted)]"
                            : "text-[var(--text-primary)]"
                        )}>
                          {task.title}
                        </p>
                        {task.due_time && (
                          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" /> {task.due_time}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "warning" : "teal"}
                        className="text-[10px] shrink-0"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {tasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-sm text-[var(--text-muted)]">
                  Complete tasks to see your weekly activity
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "var(--text-primary)",
                      }}
                      cursor={{ fill: "var(--bg-elevated)" }}
                    />
                    <Bar
                      dataKey="completed"
                      fill="var(--accent-sage)"
                      radius={[4, 4, 0, 0]}
                      name="Completed"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Upcoming Events</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/calendar")} className="text-xs gap-1">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {upcomingEvents.length === 0 ? (
                <div className="py-6 text-center">
                  <Calendar className="h-7 w-7 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-xs text-[var(--text-muted)]">No upcoming events</p>
                  <Button size="sm" variant="ghost" onClick={() => router.push("/calendar")} className="mt-1.5 text-xs">
                    Schedule event
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors"
                      onClick={() => router.push("/calendar")}
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: event.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{event.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {format(new Date(event.start_time), "d MMM · HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Habit Progress */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Today&apos;s Habits</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/habits")} className="text-xs gap-1">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {habits.length === 0 ? (
                <div className="py-6 text-center">
                  <Repeat className="h-7 w-7 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-xs text-[var(--text-muted)]">No habits yet</p>
                  <Button size="sm" variant="ghost" onClick={() => router.push("/habits")} className="mt-1.5 text-xs">
                    Create habit
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[var(--text-muted)]">{completedHabitsToday}/{habits.length} completed</span>
                    <span className="text-xs font-medium text-[var(--accent-sage)]">{habitRate}%</span>
                  </div>
                  <Progress value={habitRate} className="mb-3 h-1.5" />
                  <div className="space-y-1.5">
                    {habits.slice(0, 5).map((habit) => {
                      const isCompleted = habitLogs.some(
                        (l) => l.habit_id === habit.id && l.completed_at.startsWith(todayStr)
                      )
                      return (
                        <div
                          key={habit.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors"
                          onClick={() => handleHabitToggle(habit.id)}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                            isCompleted
                              ? "bg-[var(--accent-sage)] border-[var(--accent-sage)]"
                              : "border-[var(--border)]"
                          )}>
                            {isCompleted && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={cn(
                            "text-sm truncate",
                            isCompleted ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"
                          )}>
                            {habit.name}
                          </span>
                          {habit.current_streak > 0 && (
                            <span className="ml-auto text-xs text-[var(--status-warning)] flex items-center gap-0.5 shrink-0">
                              🔥 {habit.current_streak}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Finance Overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Finance</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/finance")} className="text-xs gap-1">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Income</span>
                <span className="font-medium text-[var(--status-success)]">{formatCurrency(monthlyIncome)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Expenses</span>
                <span className="font-medium text-[var(--status-error)]">{formatCurrency(monthlyExpenses)}</span>
              </div>
              <div className="border-t border-[var(--border)] pt-2 flex justify-between text-sm">
                <span className="text-[var(--text-secondary)] font-medium">Balance</span>
                <span className={cn(
                  "font-semibold",
                  balance >= 0 ? "text-[var(--status-success)]" : "text-[var(--status-error)]"
                )}>
                  {formatCurrency(balance)}
                </span>
              </div>
              <Button size="sm" variant="secondary" className="w-full mt-1 text-xs" onClick={() => router.push("/finance")}>
                <Plus className="h-3.5 w-3.5" /> Record Transaction
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
