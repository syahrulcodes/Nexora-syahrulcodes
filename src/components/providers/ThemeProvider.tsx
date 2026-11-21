"use client"

import { useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-theme", theme)
  }, [theme])

  return <>{children}</>
}
