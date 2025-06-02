// File: app/admin/dashboard/layout.tsx
// Description: Layout for the admin dashboard. AdminNav is assumed to be handled by a parent admin layout.
"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
// import { AdminNav } from "@/components/admin-nav"; // Removed as it's assumed to be in a parent admin layout
import { Loader2 } from "lucide-react"

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/admin/login")
    }
  }, [isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    // This check is important to prevent rendering for non-admins
    // before the redirect in useEffect happens.
    return null 
  }

  return (
    // AdminNav is no longer rendered here.
    // It's assumed that if you have multiple /admin/* pages,
    // a layout at app/admin/layout.tsx would render AdminNav once.
    // If this is the ONLY admin page, then AdminNav should be here,
    // and the duplication source is elsewhere.
    <div className="flex min-h-screen flex-col">
      {/* <AdminNav />  <--- REMOVED FROM HERE */}
      {children}
    </div>
  )
}
