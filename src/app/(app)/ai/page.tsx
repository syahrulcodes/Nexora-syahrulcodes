"use client"

import { useState } from "react"
import {
  Sparkles, Send, Copy, RefreshCw, ChevronDown,
  CheckSquare, FileText, BookOpen, BarChart2, Brain, Lightbulb
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"

const AI_PROMPTS = [
  {
    id: "daily-summary",
    title: "Daily Productivity Summary",
    description: "Get insights on your tasks and habits",
    icon: BarChart2,
    color: "var(--accent-sage)",
  },
  {
    id: "task-plan",
    title: "Task Prioritization",
    description: "Let AI help organize your tasks",
    icon: CheckSquare,
    color: "var(--accent-blue)",
  },
  {
    id: "note-summary",
    title: "Summarize Notes",
    description: "Get a concise summary of your notes",
    icon: FileText,
    color: "var(--accent-beige)",
  },
  {
    id: "learning-plan",
    title: "Learning Schedule",
    description: "Create a personalized learning plan",
    icon: BookOpen,
    color: "var(--accent-teal)",
  },
  {
    id: "habits-analysis",
    title: "Habit Analysis",
    description: "Analyze your habit consistency",
    icon: Brain,
    color: "var(--status-warning)",
  },
  {
    id: "goal-advice",
    title: "Goal Strategy",
    description: "Get strategies to achieve your goals",
    icon: Lightbulb,
    color: "var(--status-success)",
  },
]

export default function AIPage() {
  const { tasks, notes, habits, goals, habitLogs, learningItems } = useAppStore()
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const buildContext = () => {
    const today = new Date().toISOString().split("T")[0]
    const incompleteTasks = tasks.filter((t) => t.status !== "completed").slice(0, 10)
    const completedHabitsToday = habits.filter((h) =>
      habitLogs.some((l) => l.habit_id === h.id && l.completed_at.startsWith(today))
    )
    const recentNotes = notes.slice(0, 5)
    const inProgressGoals = goals.filter((g) => g.status === "in_progress").slice(0, 5)
    const learningInProgress = learningItems.filter((i) => i.status === "in_progress").slice(0, 5)

    return {
      tasks: { total: tasks.length, incomplete: incompleteTasks.map((t) => ({ title: t.title, priority: t.priority, due: t.due_date })) },
      habits: { total: habits.length, completedToday: completedHabitsToday.length, names: habits.map((h) => h.name) },
      notes: recentNotes.map((n) => ({ title: n.title, preview: n.content.slice(0, 100) })),
      goals: inProgressGoals.map((g) => ({ title: g.title, progress: g.progress, category: g.category })),
      learning: learningInProgress.map((l) => ({ title: l.title, progress: l.progress, category: l.category })),
    }
  }

  const handlePreset = async (presetId: string) => {
    setActivePreset(presetId)
    const ctx = buildContext()
    const presets: Record<string, string> = {
      "daily-summary": `Based on my current data, give me a daily productivity summary and actionable insights:
Tasks: ${ctx.tasks.total} total, ${ctx.tasks.incomplete.length} incomplete (top priorities: ${ctx.tasks.incomplete.filter((t) => t.priority === "high").map((t) => t.title).slice(0, 3).join(", ")})
Habits: ${ctx.habits.completedToday}/${ctx.habits.total} completed today
Goals in progress: ${ctx.goals.map((g) => `${g.title} (${g.progress}%)`).join(", ")}
Please give me specific, actionable suggestions for today.`,

      "task-plan": `Help me prioritize and organize my tasks:
${ctx.tasks.incomplete.map((t) => `- ${t.title} (${t.priority} priority${t.due ? `, due: ${t.due}` : ""})`).join("\n")}
Please suggest a smart order to tackle these tasks and time management tips.`,

      "note-summary": `Here are my recent notes. Please give me a concise summary and key insights:
${ctx.notes.map((n) => `Title: ${n.title}\nContent: ${n.preview}`).join("\n\n")}`,

      "learning-plan": `I'm currently learning these topics: ${ctx.learning.map((l) => `${l.title} (${l.progress}% done)`).join(", ")}.
My goals include: ${ctx.goals.map((g) => g.title).join(", ")}.
Please create a focused weekly learning schedule with specific daily tasks.`,

      "habits-analysis": `Analyze my habit consistency and give me improvement suggestions:
Habits: ${ctx.habits.names.join(", ")}
Today's completion: ${ctx.habits.completedToday}/${ctx.habits.total}
Give me specific strategies to improve consistency and build momentum.`,

      "goal-advice": `I have these goals in progress: ${ctx.goals.map((g) => `${g.title} (${g.progress}% complete, category: ${g.category})`).join("; ")}.
Give me specific strategies and next actions to make meaningful progress on each goal.`,
    }

    const presetPrompt = presets[presetId]
    if (presetPrompt) {
      setPrompt(presetPrompt)
      await sendToAI(presetPrompt)
    }
  }

  const sendToAI = async (promptText: string) => {
    if (!promptText.trim()) return
    setLoading(true)
    setResponse("")

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "AI request failed")
      }

      const data = await res.json()
      setResponse(data.response)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to get AI response"
      if (message.includes("not configured") || message.includes("API key")) {
        setResponse(`⚠️ **Nexora AI is not configured yet.**

To enable AI features, add your Gemini API key to the \`.env.local\` file:

\`\`\`
GEMINI_API_KEY=your_gemini_api_key_here
\`\`\`

You can get a free API key at [Google AI Studio](https://makersuite.google.com/app/apikey).

Once configured, Nexora AI will be able to:
• Analyze your tasks and suggest prioritization
• Summarize your notes intelligently
• Create personalized learning schedules
• Analyze your habit patterns
• Provide goal achievement strategies`)
      } else {
        toast.error(message)
        setResponse("")
      }
    } finally {
      setLoading(false)
      setActivePreset(null)
    }
  }

  const handleSend = () => sendToAI(prompt)

  const handleCopy = () => {
    navigator.clipboard.writeText(response)
    toast.success("Copied to clipboard!")
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--accent-sage)]" />
          Nexora AI
        </h1>
        <p className="text-sm text-[var(--text-muted)]">AI-powered insights and assistance for your personal productivity</p>
      </div>

      {/* Quick Presets */}
      <div>
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AI_PROMPTS.map((p) => {
            const Icon = p.icon
            return (
              <Card
                key={p.id}
                hover
                onClick={() => handlePreset(p.id)}
                className={cn(activePreset === p.id && "border-[var(--accent-sage)]/50")}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: p.color + "20" }}
                    >
                      <Icon className="h-4 w-4" style={{ color: p.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">{p.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{p.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Chat Interface */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-[var(--accent-sage)]" />
            Ask Nexora AI
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything about your tasks, habits, goals, or productivity..."
            rows={4}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Ctrl+Enter to send</span>
            <Button onClick={handleSend} disabled={!prompt.trim() || loading} loading={loading}>
              <Send className="h-4 w-4" /> Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Response */}
      {(response || loading) && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--accent-sage)]" />
                AI Response
              </CardTitle>
              {response && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setResponse("")} className="text-xs">
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex items-center gap-3 py-4">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[var(--accent-sage)] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-sm text-[var(--text-muted)]">Nexora AI is thinking...</span>
              </div>
            ) : (
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {response}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-4 text-sm text-[var(--text-muted)]">
        <p className="font-medium text-[var(--text-secondary)] mb-1">About Nexora AI</p>
        <p>Nexora AI uses Google Gemini to provide personalized productivity insights based on your actual data. Configure your Gemini API key in the environment settings to enable this feature. Your data is processed server-side and never stored externally.</p>
      </div>
    </div>
  )
}
