import type React from "react"
import Link from "next/link"
import { BarChart3, BriefcaseBusiness, FileText, Home, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Home className="mr-2 h-4 w-4" />,
  },
  {
    title: "Jobs",
    href: "/jobs",
    icon: <BriefcaseBusiness className="mr-2 h-4 w-4" />,
  },
  {
    title: "Resume",
    href: "/resume",
    icon: <FileText className="mr-2 h-4 w-4" />,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: <BarChart3 className="mr-2 h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
  },
]

export function DashboardNav() {
  return (
    <nav className="grid items-start gap-2 p-2">
      {navItems.map((item, index) => (
        <Link key={index} href={item.href} className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
