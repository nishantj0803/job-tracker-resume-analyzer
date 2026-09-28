// File: app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  FileText,
  Trophy,
  Users,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { MainNav } from "@/components/main-nav";
import { useAuth } from "@/components/auth-provider";
import { getUserDashboardData, type UserDashboardData } from "@/lib/actions";
import { StatusStamp } from "@/components/status-stamp";
import { EmptyState } from "@/components/empty-state";
import { FlowerDoodle, SunDoodle, RainbowDoodle } from "@/components/doodles";

function greeting(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function deadlineLabel(iso: string): string {
  const days = Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

const STAT_CARDS = [
  {
    key: "totalApplications",
    title: "Applications",
    icon: BriefcaseBusiness,
    fill: "bg-white",
  },
  {
    key: "interviewing",
    title: "Interviewing",
    icon: Users,
    fill: "bg-[#CFE6F5]",
  },
  {
    key: "offers",
    title: "Offers",
    icon: Trophy,
    fill: "bg-[#FFB800]",
  },
] as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeScore, setResumeScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const result = await getUserDashboardData();
      if (result && !("error" in result)) {
        setData(result);
      }
      setIsLoading(false);
    };

    try {
      const storedResult = localStorage.getItem("resumeAnalysisResult");
      if (storedResult) {
        const analysisData = JSON.parse(storedResult);
        const score = analysisData.score ?? analysisData.overall_score ?? null;
        if (typeof score === "number") setResumeScore(score);
      }
    } catch {
      // No stored analysis; the resume card shows its empty state.
    }

    fetchDashboardData();
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <DashboardShell>
        <div className="flex items-start justify-between gap-4 px-2">
          <DashboardHeader
            heading={`${greeting(new Date())}, ${firstName}.`}
            text={`${today}. Here is where the hunt stands.`}
            className="px-0"
          />
          <FlowerDoodle className="hidden h-16 w-16 shrink-0 sm:block" />
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="h-[132px] animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {STAT_CARDS.map((card) => (
                <Card
                  key={card.key}
                  className={`border-2 border-[#141414] shadow-[4px_4px_0_#141414] dark:border-[#F3F3EF] dark:shadow-[4px_4px_0_#F3F3EF] ${card.fill} dark:bg-card`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold">
                      {card.title}
                    </CardTitle>
                    <card.icon className="h-4 w-4" strokeWidth={2.5} />
                  </CardHeader>
                  <CardContent>
                    <div className="font-display tnum text-4xl font-bold">
                      {data?.stats[card.key] ?? 0}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-2 border-[#141414] bg-[#CDEBD9] shadow-[4px_4px_0_#141414] dark:border-[#F3F3EF] dark:bg-card dark:shadow-[4px_4px_0_#F3F3EF]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">
                    Resume score
                  </CardTitle>
                  <FileText className="h-4 w-4" strokeWidth={2.5} />
                </CardHeader>
                <CardContent>
                  {resumeScore !== null ? (
                    <>
                      <div className="font-display tnum text-4xl font-bold">
                        {resumeScore}
                        <span className="text-lg text-muted-foreground">/100</span>
                      </div>
                      <Progress value={resumeScore} className="mt-2 h-2" />
                    </>
                  ) : (
                    <Link
                      href="/resume"
                      className="text-sm font-medium underline decoration-[#FFB800] decoration-[3px] underline-offset-4"
                    >
                      Grade a resume
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-lg font-bold">
                    Pipeline
                  </CardTitle>
                  <Link
                    href="/analytics"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Full analytics
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  {(data?.statusBreakdown ?? []).map((stage) => (
                    <span
                      key={stage.status}
                      className="inline-flex items-center gap-2 rounded-[10px] border-2 border-[#141414] bg-white px-3 py-1.5 text-sm dark:border-[#F3F3EF] dark:bg-card"
                    >
                      <StatusStamp status={stage.status} />
                      <span className="tnum font-bold">{stage.count}</span>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="border-2 lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-lg font-bold">
                        Recent applications
                      </CardTitle>
                      <CardDescription>
                        Your 5 most recent moves.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/jobs">Browse jobs</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {data?.recentApplications &&
                  data.recentApplications.length > 0 ? (
                    <ul className="divide-y divide-border">
                      {data.recentApplications.map((app) => (
                        <li
                          key={app.id}
                          className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <Link
                              href={`/jobs/${app.id}`}
                              className="block truncate font-semibold hover:underline"
                            >
                              {app.position}
                            </Link>
                            <p className="truncate text-sm text-muted-foreground">
                              {app.company}, applied{" "}
                              {new Date(app.appliedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <StatusStamp status={app.applicationStatus ?? "applied"} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState
                      doodle={<SunDoodle className="h-14 w-14" />}
                      title="No applications yet"
                      body="Log the first one. The pipeline, stats, and deadlines all build from there."
                      action={
                        <Button asChild>
                          <Link href="/jobs">Find a role</Link>
                        </Button>
                      }
                    />
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-2 border-[#141414] bg-[#FBD9C0] shadow-[4px_4px_0_#141414] dark:border-[#F3F3EF] dark:bg-card dark:shadow-[4px_4px_0_#F3F3EF]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <CalendarClock className="h-4 w-4" strokeWidth={2.5} />
                      Closing soon
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data?.upcomingDeadlines &&
                    data.upcomingDeadlines.length > 0 ? (
                      <ul className="space-y-3">
                        {data.upcomingDeadlines.map((job) => (
                          <li key={job.id} className="text-sm">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="block font-semibold leading-snug hover:underline"
                            >
                              {job.position}
                            </Link>
                            <p className="mt-0.5 text-muted-foreground">
                              {job.company}, closes {deadlineLabel(job.deadline)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No open deadlines right now. New postings land on the
                        jobs board.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <RainbowDoodle className="h-12 w-16 shrink-0" />
                    <div>
                      <p className="font-semibold leading-snug">
                        Keep the streak going
                      </p>
                      <Link
                        href="/resume"
                        className="mt-1 inline-block text-sm font-medium underline decoration-[#FFB800] decoration-[3px] underline-offset-4"
                      >
                        Match against a new role
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </DashboardShell>
    </div>
  );
}
