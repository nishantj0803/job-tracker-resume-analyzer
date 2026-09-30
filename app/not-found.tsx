import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CloudDoodle } from "@/components/doodles"

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div aria-hidden className="grain-overlay" />
      <CloudDoodle className="h-24 w-36" />
      <p className="font-display mt-6 text-6xl font-bold tracking-tight">404</p>
      <span className="mt-3 inline-block -rotate-2 rounded-[10px] border-2 border-[#141414] bg-[#FFB800] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#141414] shadow-[2px_2px_0_#141414] dark:border-[#F3F3EF] dark:text-[#141414] dark:shadow-[2px_2px_0_#F3F3EF]">
        Page not found
      </span>
      <p className="mt-5 max-w-[42ch] text-muted-foreground">
        That link does not lead anywhere. The jobs, resumes, and analytics are
        all still where you left them.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/jobs">Browse jobs</Link>
        </Button>
      </div>
    </div>
  )
}
