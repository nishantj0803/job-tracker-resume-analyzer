// app/analytics/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { MainNav } from "@/components/main-nav";
import {
  StageDonut,
  StageLegend,
  CompanyBars,
  ActivityArea,
  FunnelRows,
} from "@/components/analytics-charts";
import { getUserApplicationStats } from "@/lib/actions";
import type { UserApplicationStats } from "@/lib/actions";
import {
  Loader2,
  AlertCircle,
  BarChart3,
  BriefcaseBusiness,
  Trophy,
  Percent,
  Reply,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-2">
            <CardHeader>
              <Skeleton className="h-5 w-3/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-4/5" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-2">
        <CardContent className="h-[300px] pt-6">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#141414]/30 px-6 py-12 text-center dark:border-[#F3F3EF]/30">
      <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="font-display mt-4 text-xl font-bold">No application data found</h3>
      <p className="mt-2 max-w-[44ch] text-sm text-muted-foreground">
        Start tracking your job applications to see your personalized analytics
        here.
      </p>
    </div>
  );
}

const STATUS_OPTIONS = [
  "all",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
] as const;

const STAT_STYLES = [
  { fill: "bg-white dark:bg-card", icon: BriefcaseBusiness },
  { fill: "bg-[#CFE6F5] dark:bg-card", icon: Reply },
  { fill: "bg-[#FFB800] dark:bg-card", icon: Percent },
  { fill: "bg-[#CDEBD9] dark:bg-card", icon: Trophy },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<UserApplicationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]>("all");

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getUserApplicationStats();
        if ("error" in result) {
          setError(result.error);
          setStats(null);
        } else {
          setStats(result);
        }
      } catch (e: unknown) {
        setError(
          e instanceof Error
            ? e.message
            : "An unexpected error occurred while fetching your stats."
        );
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const filteredApplications = useMemo(() => {
    if (!stats) return [];
    const q = query.trim().toLowerCase();
    return (stats.applications ?? []).filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (!q) return true;
      return (
        app.company.toLowerCase().includes(q) ||
        app.position.toLowerCase().includes(q)
      );
    });
  }, [stats, query, statusFilter]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return (
        <div className="flex items-center justify-center rounded-[10px] border-2 border-destructive bg-destructive/10 p-6 text-destructive">
          <AlertCircle className="mr-3 h-6 w-6" />
          <p>Error loading analytics: {error}</p>
        </div>
      );
    }

    if (!stats || stats.totalApplications === 0) {
      return <EmptyState />;
    }

    const statDefs = [
      { title: "Total applications", value: `${stats.totalApplications}`, note: "Jobs you went after." },
      { title: "Response rate", value: `${stats.responseRate ?? 0}%`, note: "Heard back, in any form." },
      { title: "Interview rate", value: `${stats.interviewRate}%`, note: "Made it to interviews." },
      { title: "Offer rate", value: `${stats.offerRate}%`, note: "Closed with offers." },
    ];

    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statDefs.map((s, i) => {
            const style = STAT_STYLES[i % STAT_STYLES.length];
            const Icon = style.icon;
            return (
              <Card
                key={s.title}
                className={`border-2 border-[#141414] shadow-[4px_4px_0_#141414] dark:border-[#F3F3EF] dark:shadow-[4px_4px_0_#F3F3EF] ${style.fill}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">{s.title}</CardTitle>
                  <Icon className="h-4 w-4" strokeWidth={2.5} />
                </CardHeader>
                <CardContent>
                  <div className="font-display tnum text-4xl font-bold">{s.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="font-display text-lg font-bold">
              Pipeline funnel
            </CardTitle>
            <CardDescription>
              Applied to offer, with carry-over between stages. Counts are
              cumulative.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelRows funnel={stats.funnel ?? []} />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="font-display text-lg font-bold">
                Where things stand
              </CardTitle>
              <CardDescription>
                Every application, grouped by stage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StageDonut data={stats.statusDistribution} />
              <StageLegend data={stats.statusDistribution} />
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="font-display text-lg font-bold">
                Who you chase most
              </CardTitle>
              <CardDescription>
                Your most frequent application targets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyBars data={stats.applicationsPerCompany} />
            </CardContent>
          </Card>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="font-display text-lg font-bold">
              Pace over time
            </CardTitle>
            <CardDescription>
              Applications sent per month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityArea data={stats.applicationActivity} />
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-lg font-bold">
              <Filter className="h-4 w-4" /> Applications
            </CardTitle>
            <CardDescription>
              Search by company or role, filter by pipeline stage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Search company or position..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-2 sm:max-w-xs"
              />
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger className="border-2 sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === "all"
                        ? "All statuses"
                        : s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {filteredApplications.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No applications match this filter.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {filteredApplications.slice(0, 50).map((app) => (
                  <li
                    key={app.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {app.position}
                      </p>
                      <p className="tnum truncate text-xs text-muted-foreground">
                        {app.company},{" "}
                        {app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString()
                          : "date unknown"}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 capitalize">
                      {app.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            {filteredApplications.length > 50 && (
              <p className="text-center text-xs text-muted-foreground">
                Showing 50 of {filteredApplications.length}. Refine your search.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <DashboardShell>
        <DashboardHeader
          heading="Analytics"
          text="Where the search stands, and where it stalls."
        />
        {renderContent()}
      </DashboardShell>
    </div>
  );
}
