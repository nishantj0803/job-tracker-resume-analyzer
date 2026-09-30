// File: components/dashboard-shell.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface DashboardShellProps extends React.HTMLAttributes<HTMLElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <main className={cn("flex flex-col gap-8", className)} {...props}>
      {children}
    </main>
  )
}
