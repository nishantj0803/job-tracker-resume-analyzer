// File: components/dashboard-shell.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    // FIX: Changed from "grid items-start gap-8" to "flex flex-col gap-8"
    // This makes the shell a flexible vertical container for its children.
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      {children}
    </div>
  )
}