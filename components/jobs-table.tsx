// File: components/jobs-table.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, CalendarClock, Loader2 } from "lucide-react";
import { getJobs, type Job } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";
import { StatusStamp } from "@/components/status-stamp";
import { EmptyState } from "@/components/empty-state";
import { SunDoodle } from "@/components/doodles";

export type JobSort = "newest" | "oldest" | "deadline" | "company";
export type JobFilter = "all" | "open" | "closed";

const MONOGRAM_FILLS = [
  "bg-[#CFE6F5]",
  "bg-[#FBD9C0]",
  "bg-[#CDEBD9]",
  "bg-[#FFB800]",
];

function monogram(company: string): { initials: string; fill: string } {
  const initials =
    company
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase() || "?";
  let hash = 0;
  for (const ch of company) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return { initials, fill: MONOGRAM_FILLS[hash % MONOGRAM_FILLS.length] };
}

function JobTicket({ job }: { job: Job }) {
  const { initials, fill } = monogram(job.company || "?");
  const isOpen = job.status === "active";
  return (
    <article className="flex flex-col rounded-[10px] border-2 border-[#141414] bg-white p-5 shadow-[4px_4px_0_#141414] transition-transform duration-150 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_#141414] dark:border-[#F3F3EF] dark:bg-card dark:shadow-[4px_4px_0_#F3F3EF]">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border-2 border-[#141414] text-base font-bold text-[#141414] dark:border-[#F3F3EF] ${fill}`}
        >
          {initials}
        </span>
        <div className="min-w-0">
          <h3 className="font-display truncate text-lg font-bold leading-snug">
            <Link href={`/jobs/${job.id}`} className="hover:underline">
              {job.position || "Untitled role"}
            </Link>
          </h3>
          <p className="truncate text-sm text-muted-foreground">{job.company}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        )}
        {job.application_deadline && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            Closes {new Date(job.application_deadline).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t-2 border-dashed border-[#D8D2C2] pt-4 dark:border-muted">
        <span
          className={`inline-block shrink-0 rounded-md border-2 border-[#141414] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] dark:border-[#F3F3EF] ${
            isOpen ? "bg-[#CDEBD9] text-[#141414]" : "bg-[#EFEFE8] text-[#6B6259]"
          }`}
        >
          {isOpen ? "Open" : "Closed"}
        </span>
        <span className="tnum text-xs text-muted-foreground">
          {isOpen ? "Open" : "Closed"}, posted{" "}
          {job.created_at
            ? new Date(job.created_at).toLocaleDateString()
            : "recently"}
        </span>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/jobs/${job.id}`}>Details</Link>
        </Button>
      </div>
    </article>
  );
}

export function JobsTable({
  query,
  filter,
  sort,
}: {
  query: string;
  filter: JobFilter;
  sort: JobSort;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchJobs() {
      setIsLoading(true);
      try {
        setJobs(await getJobs());
      } catch {
        toast({
          title: "Error",
          description: "Failed to load job listings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, [toast]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = jobs.filter((job) => {
      if (filter === "open" && job.status !== "active") return false;
      if (filter === "closed" && job.status === "active") return false;
      if (!q) return true;
      return [job.position, job.company, job.location ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    const byTime = (j: Job) => new Date(j.created_at).getTime();
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return byTime(a) - byTime(b);
        case "company":
          return (a.company || "").localeCompare(b.company || "");
        case "deadline":
          return (
            (a.application_deadline
              ? new Date(a.application_deadline).getTime()
              : Number.MAX_SAFE_INTEGER) -
            (b.application_deadline
              ? new Date(b.application_deadline).getTime()
              : Number.MAX_SAFE_INTEGER)
          );
        case "newest":
        default:
          return byTime(b) - byTime(a);
      }
    });
  }, [jobs, query, filter, sort]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p>Loading job listings...</p>
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        doodle={<SunDoodle className="h-14 w-14" />}
        title={jobs.length === 0 ? "No open roles right now" : "Nothing matches that search"}
        body={
          jobs.length === 0
            ? "New postings appear here as soon as they go live. Check back soon."
            : "Try a different keyword, or clear the filters to see everything."
        }
      />
    );
  }

  return (
    <div>
      <p className="tnum mb-3 text-sm text-muted-foreground">
        {visible.length} {visible.length === 1 ? "role" : "roles"}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((job) => (
          <JobTicket key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
