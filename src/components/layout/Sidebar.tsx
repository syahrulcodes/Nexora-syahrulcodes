"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  DollarSign,
  Repeat,
  FileText,
  Target,
  Sparkles,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/tasks", label: "Tasks", icon: CheckSquare },
      { href: "/calendar", label: "Calendar", icon: Calendar },
      { href: "/finance", label: "Finance", icon: DollarSign },
      { href: "/habits", label: "Habits", icon: Repeat },
    ],
  },
  {
    label: "Personal Space",
    items: [
      { href: "/notes", label: "My Notes", icon: FileText },
      { href: "/goals", label: "Goals & Learning", icon: Target },
      { href: "/ai", label: "Nexora AI", icon: Sparkles },
    ],
  },
  {
    label: "Preferences",
    items: [
      { href: "/profile", label: "My Profile", icon: User },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300 ease-in-out",
        "bg-[var(--bg-sidebar)] border-r border-[var(--border)]",
        sidebarCollapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-14 border-b border-[var(--border)] px-3",
        sidebarCollapsed ? "justify-center" : "gap-2.5"
      )}>
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--accent-sage)]/20 shrink-0">
          <Zap className="w-4 h-4 text-[var(--accent-sage)]" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
            NEXORA
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!sidebarCollapsed && (
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-all duration-150 group",
                      sidebarCollapsed ? "justify-center" : "",
                      isActive
                        ? "bg-[var(--accent-sage)]/15 text-[var(--accent-sage)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Icon className={cn(
                      "shrink-0 transition-colors",
                      sidebarCollapsed ? "w-5 h-5" : "w-4 h-4",
                      isActive ? "text-[var(--accent-sage)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                    )} />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {isActive && !sidebarCollapsed && (
                      <div className="ml-auto w-1 h-1 rounded-full bg-[var(--accent-sage)]" />
                    )}
                  </Link>
                )
              })}
            </div>
            {!sidebarCollapsed && <Separator className="mt-3 opacity-50" />}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-[var(--border)]">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          className={cn("w-full h-7", sidebarCollapsed ? "justify-center" : "justify-end pr-1")}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-[var(--text-muted)]" />
          )}
        </Button>
      </div>
    </aside>
  )
}
