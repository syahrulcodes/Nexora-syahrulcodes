import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(date))
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Good Morning"
  if (hour >= 12 && hour < 17) return "Good Afternoon"
  if (hour >= 17 && hour < 21) return "Good Evening"
  return "Good Night"
}

export function getMotivationalMessage(): string {
  const messages = [
    "Every small step forward is progress. Keep going.",
    "Today is a great day to build something meaningful.",
    "Focus on what matters. Let go of the rest.",
    "Consistency is the bridge between goals and achievement.",
    "Your future self will thank you for the work you do today.",
    "Small disciplines repeated daily lead to great achievement.",
    "Make today count. You have everything you need.",
    "Progress, not perfection. Keep moving forward.",
  ]
  return messages[new Date().getDay() % messages.length]
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .trim()
}
