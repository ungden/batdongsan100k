"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Property } from "@/lib/types"

const MAX_COMPARE = 4

interface CompareContextType {
  items: Property[]
  addItem: (p: Property) => boolean
  removeItem: (id: string) => void
  clearAll: () => void
  isInCompare: (id: string) => boolean
  canAddMore: boolean
}

const CompareContext = createContext<CompareContextType>({
  items: [],
  addItem: () => false,
  removeItem: () => {},
  clearAll: () => {},
  isInCompare: () => false,
  canAddMore: true,
})

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Property[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("compare-items")
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("compare-items", JSON.stringify(items))
  }, [items])

  const addItem = useCallback((p: Property) => {
    let added = false
    setItems((prev) => {
      if (prev.length >= MAX_COMPARE) return prev
      if (prev.some((x) => x.id === p.id)) return prev
      added = true
      return [...prev, p]
    })
    return added
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const clearAll = useCallback(() => setItems([]), [])

  const isInCompare = useCallback((id: string) => items.some((x) => x.id === id), [items])

  return (
    <CompareContext.Provider value={{ items, addItem, removeItem, clearAll, isInCompare, canAddMore: items.length < MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  return useContext(CompareContext)
}
