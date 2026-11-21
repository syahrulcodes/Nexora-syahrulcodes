"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Search,
  Bell,
  Plus,
  Sun,
  Moon,
  ChevronRight,
  X,
  CheckSquare,
  FileText,
  Calendar,
  DollarSign,
  Target,
  Repeat,
  Loader2,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store/useAppStore"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { SearchResult } from "@/types"

const pageTitles: Record<string, { title: string; breadcrumb?: string[] }> = {
  "/dashboard": { title: "Overview" },
  "/tasks": { title: "Tasks", breadcrumb: ["Workspace"] },
  "/calendar": { title: "Calendar", breadcrumb: ["Workspace"] },
  "/finance": { title: "Finance", breadcrumb: ["Workspace"] },
  "/habits": { title: "Habits", breadcrumb: ["Workspace"] },
  "/notes": { title: "My Notes", breadcrumb: ["Personal Space"] },
  "/goals": { title: "Goals & Learning", breadcrumb: ["Personal Space"] },
  "/ai": { title: "Nexora AI", breadcrumb: ["Personal Space"] },
  "/profile": { title: "My Profile", breadcrumb: ["Preferences"] },
  "/settings": { title: "Settings", breadcrumb: ["Preferences"] },
}

const typeIcons = {
  task: CheckSquare,
  note: FileText,
  event: Calendar,
  transaction: DollarSign,
  goal: Target,
  habit: Repeat,
}

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const {
    theme, toggleTheme,
    notifications, markAllNotificationsRead,
    tasks, notes, events, transactions, goals, habits,
    sidebarCollapsed, toggleSidebar
  } = useAppStore()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const pageInfo = pageTitles[pathname] || { title: "Nexora" }
  const unreadCount = notifications.filter((n) => !n.is_read).length

  // Global search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
        setTimeout(() => searchRef.current?.focus(), 50)
      }
      if (e.key === "Escape") {
        setSearchOpen(false)
        setSearchQuery("")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const q = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    tasks.filter(t => t.title.toLowerCase().includes(q)).slice(0, 2).forEach(t => {
      results.push({ id: t.id, type: "task", title: t.title, subtitle: t.status.replace("_", " "), link: "/tasks" })
    })
    notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)).slice(0, 2).forEach(n => {
      results.push({ id: n.id, type: "note", title: n.title, subtitle: n.category || "Note", link: "/notes" })
    })
    events.filter(e => e.title.toLowerCase().includes(q)).slice(0, 2).forEach(e => {
      results.push({ id: e.id, type: "event", title: e.title, subtitle: e.category, link: "/calendar" })
    })
    transactions.filter(t => t.description.toLowerCase().includes(q)).slice(0, 2).forEach(t => {
      results.push({ id: t.id, type: "transaction", title: t.description, subtitle: t.category, link: "/finance" })
    })
    goals.filter(g => g.title.toLowerCase().includes(q)).slice(0, 2).forEach(g => {
      results.push({ id: g.id, type: "goal", title: g.title, subtitle: g.category, link: "/goals" })
    })
    habits.filter(h => h.name.toLowerCase().includes(q)).slice(0, 2).forEach(h => {
      results.push({ id: h.id, type: "habit", title: h.name, subtitle: h.category, link: "/habits" })
    })

    setSearchResults(results)
    setSelectedIndex(0)
  }, [searchQuery, tasks, notes, events, transactions, goals, habits])

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, searchResults.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && searchResults[selectedIndex]) {
      router.push(searchResults[selectedIndex].link)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    toast.success("Logged out successfully")
  }

  return (
    <>
      <header className="fixed top-0 right-0 z-30 h-14 flex items-center justify-between px-4 gap-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]"
        style={{ left: sidebarCollapsed ? "3.5rem" : "14rem", transition: "left 0.3s ease" }}>

        {/* Left: Page Title */}
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={toggleSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5 text-sm">
            {pageInfo.breadcrumb?.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[var(--text-muted)]">
                {crumb}
                <ChevronRight className="h-3 w-3" />
              </span>
            ))}
            <span className="font-semibold text-[var(--text-primary)] truncate">
              {pageInfo.title}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Search Trigger */}
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }}
            className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-xs text-[var(--text-muted)] hover:border-[var(--accent-sage)]/50 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search...</span>
            <kbd className="ml-2 text-[10px] px-1 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border)]">⌘K</kbd>
          </button>

          {/* Mobile search icon */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="sm:hidden"
            onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon-sm" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark"
              ? <Sun className="h-4 w-4 text-[var(--text-muted)]" />
              : <Moon className="h-4 w-4 text-[var(--text-muted)]" />
            }
          </Button>

          {/* Notifications */}
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="relative">
                <Bell className="h-4 w-4 text-[var(--text-muted)]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[var(--status-error)] text-white text-[10px] flex items-center justify-center font-medium">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-xs text-[var(--accent-sage)] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-sm text-[var(--text-muted)]">
                  No notifications yet
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "px-2 py-2.5 cursor-pointer hover:bg-[var(--bg-elevated)] rounded-sm transition-colors",
                        !n.is_read && "bg-[var(--accent-sage)]/5"
                      )}
                      onClick={() => {
                        const { markNotificationRead } = useAppStore.getState()
                        markNotificationRead(n.id)
                      }}
                    >
                      <p className={cn("text-sm", !n.is_read ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Add */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5 hidden sm:flex">
                <Plus className="h-4 w-4" />
                Quick Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/tasks")}>
                <CheckSquare className="h-4 w-4" /> New Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/notes")}>
                <FileText className="h-4 w-4" /> New Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/calendar")}>
                <Calendar className="h-4 w-4" /> New Event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/finance")}>
                <DollarSign className="h-4 w-4" /> New Transaction
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/habits")}>
                <Repeat className="h-4 w-4" /> New Habit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/goals")}>
                <Target className="h-4 w-4" /> New Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-[var(--accent-sage)]/30 transition-all">
                <Avatar className="h-7 w-7">
                  <AvatarFallback>N</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-[var(--status-error)]">
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => { setSearchOpen(false); setSearchQuery("") }}
        >
          <div
            className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-3 border-b border-[var(--border)]">
              <Search className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search tasks, notes, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-4 w-4 text-[var(--text-muted)]" />
                </button>
              )}
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)]">
                ESC
              </kbd>
            </div>

            {searchQuery.trim() === "" && (
              <div className="p-6 text-center text-sm text-[var(--text-muted)]">
                Type to search across tasks, notes, events, and more
              </div>
            )}

            {searchQuery.trim() !== "" && searchResults.length === 0 && (
              <div className="p-6 text-center text-sm text-[var(--text-muted)]">
                No results found for &ldquo;{searchQuery}&rdquo;
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="p-1 max-h-80 overflow-y-auto">
                {searchResults.map((result, i) => {
                  const Icon = typeIcons[result.type] || FileText
                  return (
                    <button
                      key={result.id}
                      onClick={() => {
                        router.push(result.link)
                        setSearchOpen(false)
                        setSearchQuery("")
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                        i === selectedIndex ? "bg-[var(--bg-elevated)]" : "hover:bg-[var(--bg-elevated)]"
                      )}
                    >
                      <div className="w-7 h-7 rounded-md bg-[var(--accent-sage)]/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-[var(--accent-sage)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-xs text-[var(--text-muted)] capitalize">
                            {result.type} · {result.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="border-t border-[var(--border)] px-3 py-2 flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
              <span><kbd className="px-1 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)]">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)]">↵</kbd> Open</span>
              <span><kbd className="px-1 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)]">ESC</kbd> Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
