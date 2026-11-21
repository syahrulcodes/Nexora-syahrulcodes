export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Priority = "low" | "medium" | "high"
export type TaskStatus = "todo" | "in_progress" | "completed"

export type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  due_time: string | null
  priority: Priority
  status: TaskStatus
  category: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export type CalendarEvent = {
  id: string
  user_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  category: string
  color: string
  created_at: string
  updated_at: string
}

export type TransactionType = "income" | "expense"

export type Transaction = {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string
  payment_method: string | null
  created_at: string
  updated_at: string
}

export type Budget = {
  id: string
  user_id: string
  category: string
  amount: number
  month: number
  year: number
  created_at: string
  updated_at: string
}

export type Habit = {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string
  color: string
  icon: string
  frequency: "daily" | "weekly"
  target_days: number[]
  current_streak: number
  best_streak: number
  created_at: string
  updated_at: string
}

export type HabitLog = {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  note: string | null
  created_at: string
}

export type Note = {
  id: string
  user_id: string
  title: string
  content: string
  category: string | null
  tags: string[]
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export type GoalStatus = "not_started" | "in_progress" | "completed"

export type Goal = {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  target_date: string | null
  progress: number
  status: GoalStatus
  created_at: string
  updated_at: string
}

export type Milestone = {
  id: string
  goal_id: string
  user_id: string
  title: string
  is_completed: boolean
  due_date: string | null
  created_at: string
  updated_at: string
}

export type LearningItem = {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  resource_url: string | null
  progress: number
  status: "not_started" | "in_progress" | "completed"
  notes: string | null
  created_at: string
  updated_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: "task" | "event" | "habit" | "finance" | "goal" | "system"
  is_read: boolean
  link: string | null
  created_at: string
}

export type SearchResult = {
  id: string
  type: "task" | "note" | "event" | "transaction" | "goal" | "habit"
  title: string
  subtitle?: string
  link: string
}
