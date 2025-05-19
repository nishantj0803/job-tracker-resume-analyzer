import type React from "react"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className="flex-1">
      <div className="container flex-1 items-start">
        <main className={cn("flex w-full flex-col overflow-hidden", className)}>
          <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
