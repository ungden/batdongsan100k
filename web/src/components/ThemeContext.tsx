"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (t: Theme) => void
  resolved: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  resolved: "light",
})

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return getSystemTheme()
  return theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolved, setResolved] = useState<"light" | "dark">("light")

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null
    if (saved && ["light", "dark", "system"].includes(saved)) {
      setThemeState(saved)
    }
  }, [])

  // Apply theme to DOM
  useEffect(() => {
    const r = resolveTheme(theme)
    setResolved(r)
    document.documentElement.classList.toggle("dark", r === "dark")
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", r === "dark" ? "#0f172a" : "#ffffff")
  }, [theme])

  // Listen for system changes
  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      const r = getSystemTheme()
      setResolved(r)
      document.documentElement.classList.toggle("dark", r === "dark")
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem("theme", t)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
