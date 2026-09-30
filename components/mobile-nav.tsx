"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  routes: {
    href: string
    label: string
    active: boolean
  }[]
}

export function MobileNav({ routes }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[240px] sm:w-[300px]">
        <nav className="flex flex-col gap-1.5 mt-8">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              aria-current={route.active ? "page" : undefined}
              className={cn(
                "rounded-[8px] px-3 py-2 text-sm font-medium transition-all",
                route.active
                  ? "border-2 border-[#141414] bg-[#FFB800] font-bold text-[#141414] shadow-[2px_2px_0_#141414] dark:border-[#F3F3EF] dark:shadow-[2px_2px_0_#F3F3EF]"
                  : "border-2 border-transparent text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setOpen(false)}
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
