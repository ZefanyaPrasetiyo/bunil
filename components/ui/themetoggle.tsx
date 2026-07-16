"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const getInitialIsDark = () => {
  if (typeof window === "undefined") return false
  const stored = localStorage.getItem("theme")
  if (stored) return stored === "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(getInitialIsDark)

  // Effect only synchronizes React state -> DOM, it never calls setState here.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}