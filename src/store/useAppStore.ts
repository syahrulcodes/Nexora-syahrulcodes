"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Task, Note, Transaction, Habit, HabitLog, CalendarEvent, Goal, Milestone, LearningItem, Notification, Budget } from "@/types"

interface AppState {
  // Theme
  theme: "dark" | "light"
  setTheme: (theme: "dark" | "light") => void
  toggleTheme: () => void

  // Sidebar
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void

  // Tasks
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Notes
  notes: Note[]
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, note: Partial<Note>) => void
  deleteNote: (id: string) => void

  // Transactions
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Budgets
  budgets: Budget[]
  setBudgets: (budgets: Budget[]) => void
  addBudget: (budget: Budget) => void
  updateBudget: (id: string, budget: Partial<Budget>) => void
  deleteBudget: (id: string) => void

  // Habits
  habits: Habit[]
  setHabits: (habits: Habit[]) => void
  addHabit: (habit: Habit) => void
  updateHabit: (id: string, habit: Partial<Habit>) => void
  deleteHabit: (id: string) => void

  // Habit Logs
  habitLogs: HabitLog[]
  setHabitLogs: (logs: HabitLog[]) => void
  addHabitLog: (log: HabitLog) => void
  removeHabitLog: (habitId: string, date: string) => void

  // Calendar Events
  events: CalendarEvent[]
  setEvents: (events: CalendarEvent[]) => void
  addEvent: (event: CalendarEvent) => void
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void

  // Goals
  goals: Goal[]
  setGoals: (goals: Goal[]) => void
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, goal: Partial<Goal>) => void
  deleteGoal: (id: string) => void

  // Milestones
  milestones: Milestone[]
  setMilestones: (milestones: Milestone[]) => void
  addMilestone: (milestone: Milestone) => void
  updateMilestone: (id: string, milestone: Partial<Milestone>) => void
  deleteMilestone: (id: string) => void

  // Learning Items
  learningItems: LearningItem[]
  setLearningItems: (items: LearningItem[]) => void
  addLearningItem: (item: LearningItem) => void
  updateLearningItem: (id: string, item: Partial<LearningItem>) => void
  deleteLearningItem: (id: string) => void

  // Notifications
  notifications: Notification[]
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),

      // Sidebar
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Tasks
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (id, task) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, ...task } : t)
      })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      // Notes
      notes: [],
      setNotes: (notes) => set({ notes }),
      addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
      updateNote: (id, note) => set((state) => ({
        notes: state.notes.map((n) => n.id === id ? { ...n, ...note } : n)
      })),
      deleteNote: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

      // Transactions
      transactions: [],
      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (transaction) => set((state) => ({ transactions: [transaction, ...state.transactions] })),
      updateTransaction: (id, transaction) => set((state) => ({
        transactions: state.transactions.map((t) => t.id === id ? { ...t, ...transaction } : t)
      })),
      deleteTransaction: (id) => set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),

      // Budgets
      budgets: [],
      setBudgets: (budgets) => set({ budgets }),
      addBudget: (budget) => set((state) => ({ budgets: [budget, ...state.budgets] })),
      updateBudget: (id, budget) => set((state) => ({
        budgets: state.budgets.map((b) => b.id === id ? { ...b, ...budget } : b)
      })),
      deleteBudget: (id) => set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) })),

      // Habits
      habits: [],
      setHabits: (habits) => set({ habits }),
      addHabit: (habit) => set((state) => ({ habits: [habit, ...state.habits] })),
      updateHabit: (id, habit) => set((state) => ({
        habits: state.habits.map((h) => h.id === id ? { ...h, ...habit } : h)
      })),
      deleteHabit: (id) => set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),

      // Habit Logs
      habitLogs: [],
      setHabitLogs: (logs) => set({ habitLogs: logs }),
      addHabitLog: (log) => set((state) => ({ habitLogs: [log, ...state.habitLogs] })),
      removeHabitLog: (habitId, date) => set((state) => ({
        habitLogs: state.habitLogs.filter((l) =>
          !(l.habit_id === habitId && l.completed_at.startsWith(date))
        )
      })),

      // Calendar Events
      events: [],
      setEvents: (events) => set({ events }),
      addEvent: (event) => set((state) => ({ events: [event, ...state.events] })),
      updateEvent: (id, event) => set((state) => ({
        events: state.events.map((e) => e.id === id ? { ...e, ...event } : e)
      })),
      deleteEvent: (id) => set((state) => ({ events: state.events.filter((e) => e.id !== id) })),

      // Goals
      goals: [],
      setGoals: (goals) => set({ goals }),
      addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
      updateGoal: (id, goal) => set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, ...goal } : g)
      })),
      deleteGoal: (id) => set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),

      // Milestones
      milestones: [],
      setMilestones: (milestones) => set({ milestones }),
      addMilestone: (milestone) => set((state) => ({ milestones: [milestone, ...state.milestones] })),
      updateMilestone: (id, milestone) => set((state) => ({
        milestones: state.milestones.map((m) => m.id === id ? { ...m, ...milestone } : m)
      })),
      deleteMilestone: (id) => set((state) => ({ milestones: state.milestones.filter((m) => m.id !== id) })),

      // Learning Items
      learningItems: [],
      setLearningItems: (items) => set({ learningItems: items }),
      addLearningItem: (item) => set((state) => ({ learningItems: [item, ...state.learningItems] })),
      updateLearningItem: (id, item) => set((state) => ({
        learningItems: state.learningItems.map((i) => i.id === id ? { ...i, ...item } : i)
      })),
      deleteLearningItem: (id) => set((state) => ({ learningItems: state.learningItems.filter((i) => i.id !== id) })),

      // Notifications
      notifications: [],
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, is_read: true } : n)
      })),
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true }))
      })),
    }),
    {
      name: "nexora-store",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        tasks: state.tasks,
        notes: state.notes,
        transactions: state.transactions,
        budgets: state.budgets,
        habits: state.habits,
        habitLogs: state.habitLogs,
        events: state.events,
        goals: state.goals,
        milestones: state.milestones,
        learningItems: state.learningItems,
        notifications: state.notifications,
      }),
    }
  )
)
