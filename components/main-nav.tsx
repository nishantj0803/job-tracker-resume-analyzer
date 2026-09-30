"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Briefcase } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/jobs",
      label: "Jobs",
      active: pathname === "/jobs",
    },
    {
      href: "/resume",
      label: "Resume",
      active: pathname === "/resume",
    },
    {
      href: "/analytics",
      label: "Analytics",
      active: pathname === "/analytics",
    },
    {
      href: "/ai",
      label: "AI Assistant",
      active: pathname === "/ai",
    },
  ]

  return (
    <header className="sticky top-0 z-10 border-b-2 border-[#141414] bg-background/95 backdrop-blur dark:border-[#F3F3EF]">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
              <Briefcase className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">JobTrackr</span>
          </Link>
        </div>

        {user ? (
          <>
            <nav className="hidden md:flex items-center gap-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  aria-current={route.active ? "page" : undefined}
                  className={cn(
                    "rounded-[8px] px-3 py-1.5 text-sm font-medium transition-all",
                    route.active
                      ? "border-2 border-[#141414] bg-[#FFB800] font-bold text-[#141414] shadow-[2px_2px_0_#141414] dark:border-[#F3F3EF] dark:shadow-[2px_2px_0_#F3F3EF]"
                      : "border-2 border-transparent text-muted-foreground hover:text-foreground",
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
