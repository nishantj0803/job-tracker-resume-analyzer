"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, ShieldCheck } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"

export function AdminNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const routes = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      active: pathname === "/admin/dashboard",
    },
    {
      href: "/admin/jobs",
      label: "Jobs",
      active: pathname === "/admin/jobs",
    },
    {
      href: "/admin/users",
      label: "Users",
      active: pathname === "/admin/users",
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      active: pathname === "/admin/analytics",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      active: pathname === "/admin/settings",
    },
  ]

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Link href={user ? "/admin/dashboard" : "/"} className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>JobTrackr</span>
            <ShieldCheck className="h-4 w-4 text-primary ml-1" />
            <span className="text-xs font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Admin</span>
          </Link>
        </div>

        {user ? (
          <>
            <nav className="hidden md:flex items-center gap-6">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    route.active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserNav />
              <MobileNav routes={routes} />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
