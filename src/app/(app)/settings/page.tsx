"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAppStore } from "@/store/useAppStore"
import { toast } from "sonner"
import { Sun, Moon, Bell, Shield, Database, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const { theme, setTheme, notifications } = useAppStore()

  const handleClearData = (type: string) => {
    toast.error(`Clear ${type}? This action cannot be undone.`)
  }

  const handleExport = () => {
    const store = useAppStore.getState()
    const data = {
      tasks: store.tasks,
      notes: store.notes,
      habits: store.habits,
      transactions: store.transactions,
      events: store.events,
      goals: store.goals,
      learningItems: store.learningItems,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `nexora-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Data exported successfully!")
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Customize your NEXORA experience</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-[var(--text-primary)]">Theme</Label>
              <p className="text-xs text-[var(--text-muted)]">Choose between dark and light mode</p>
            </div>
            <div className="flex items-center gap-2 border border-[var(--border)] rounded-lg p-1">
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  theme === "dark" ? "bg-[var(--accent-sage)]/15 text-[var(--accent-sage)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <Moon className="h-3.5 w-3.5" /> Dark
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  theme === "light" ? "bg-[var(--accent-sage)]/15 text-[var(--accent-sage)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <Sun className="h-3.5 w-3.5" /> Light
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Task reminders", desc: "Get reminded about upcoming tasks" },
            { label: "Habit reminders", desc: "Daily habit completion reminders" },
            { label: "Budget alerts", desc: "Alerts when approaching budget limits" },
            { label: "Goal milestones", desc: "Notifications for completed milestones" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-[var(--text-primary)]">{item.label}</Label>
                <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" /> Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-[var(--text-primary)]">Auto-lock</Label>
              <p className="text-xs text-[var(--text-muted)]">Lock app after inactivity</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-[var(--text-primary)]">Analytics</Label>
              <p className="text-xs text-[var(--text-muted)]">Help improve NEXORA with usage data</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" /> Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Export Data</p>
              <p className="text-xs text-[var(--text-muted)]">Download all your data as JSON</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExport}>Export</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--status-error)]">Clear All Data</p>
              <p className="text-xs text-[var(--text-muted)]">Remove all tasks, notes, and history</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => handleClearData("all data")}>
              <Trash2 className="h-4 w-4" /> Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">NEXORA – Personal Life OS</p>
              <p className="text-xs text-[var(--text-muted)]">Version 1.0.0 · Built with Next.js, Supabase, Tailwind</p>
            </div>
            <span className="text-xs text-[var(--accent-sage)] font-medium">Organize Better. Live Smarter.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
