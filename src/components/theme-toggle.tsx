"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Monitor, Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const themes = [
    { name: "system", icon: Monitor, label: "System" },
    { name: "light", icon: Sun, label: "Light" },
    { name: "dark", icon: Moon, label: "Dark" },
  ]

  return (
    <div className="glass-pill flex items-center space-x-1">
      {themes.map(({ name, icon: Icon, label }) => (
        <Button
          key={name}
          variant={theme === name ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme(name)}
          className={`h-8 w-8 p-0 rounded-full transition-all ${
            theme === name
              ? "bg-primary text-primary-foreground shadow-md"
              : "hover:bg-white/20"
          }`}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  )
}
