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
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
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
import { Progress } from "@/components/ui/progress";

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-4/5" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-1/2" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-3/4" />
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-1/2" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-3/4" />
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
      <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No Application Data Found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
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
        <div className="flex items-center justify-center p-6 bg-destructive/10 border border-destructive/30 rounded-md text-destructive">
          <AlertCircle className="h-6 w-6 mr-3" />
          <p>Error loading analytics: {error}</p>
        </div>
      );
    }

    if (!stats || stats.totalApplications === 0) {
      return <EmptyState />;
    }

    const funnel = stats.funnel ?? [];

    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalApplications}
              </div>
              <p className="text-xs text-muted-foreground">
                Total jobs you have applied to.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Response Rate
              </CardTitle>
              <Reply className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.responseRate ?? 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Screening, interview, or offer.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Interview Rate
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.interviewRate}%</div>
              <p className="text-xs text-muted-foreground">
                From applications to interviews.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offer Rate</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.offerRate}%</div>
              <p className="text-xs text-muted-foreground">
                From applications to offers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline funnel: Applied → Screening → Interview → Offer */}
        {funnel.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Funnel</CardTitle>
              <CardDescription>
                Applied → Screening → Interview → Offer / Rejected. Counts are
                cumulative: reaching a later stage implies the earlier ones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {funnel
                .filter((f) => f.stage !== "rejected")
                .map((f) => (
                  <div key={f.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">
                        {f.stage}{" "}
                        <span className="text-muted-foreground">
                          · {f.count} ({f.reachRate}% of total)
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {f.conversionFromPrevious === null
                          ? "entry"
                          : `${f.conversionFromPrevious}% from previous`}
                      </span>
                    </div>
                    <Progress value={f.reachRate} className="h-2" />
                  </div>
                ))}
              {funnel.find((f) => f.stage === "rejected") && (
                <p className="text-xs text-muted-foreground pt-1">
                  Rejected: {funnel.find((f) => f.stage === "rejected")?.count}{" "}
                  (
                  {funnel.find((f) => f.stage === "rejected")?.reachRate}% of
                  total)
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Distribution of your application outcomes.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <PieChart
                data={stats.statusDistribution}
                index="name"
                categories={["value"]}
                valueFormatter={(value) => `${value} application(s)`}
                className="h-[300px]"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Companies Applied To</CardTitle>
              <CardDescription>
                Your most frequent application targets.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <BarChart
                data={stats.applicationsPerCompany}
                index="name"
                categories={["value"]}
                valueFormatter={(value) => `${value} application(s)`}
                className="h-[300px]"
              />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Application Activity</CardTitle>
            <CardDescription>
              Number of applications sent over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <LineChart
              data={stats.applicationActivity}
              index="name"
              categories={["value"]}
              colors={["primary"]}
              valueFormatter={(value) => `${value} application(s)`}
              className="h-[300px]"
            />
          </CardContent>
        </Card>

        {/* Filterable application list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Applications
            </CardTitle>
            <CardDescription>
              Search by company or role, filter by pipeline stage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Search company or position…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="sm:max-w-xs"
              />
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as typeof statusFilter)
                }
              >
                <SelectTrigger className="sm:w-[180px]">
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
              <p className="text-sm text-muted-foreground py-6 text-center">
                No applications match this filter.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredApplications.slice(0, 50).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {app.position}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {app.company} ·{" "}
                        {app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize shrink-0">
                      {app.status}
                    </Badge>
                  </div>
                ))}
                {filteredApplications.length > 50 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Showing 50 of {filteredApplications.length} — refine your
                    search.
                  </p>
                )}
              </div>
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
          text="Track your job search progress and identify patterns to improve your strategy."
        />
        {renderContent()}
      </DashboardShell>
    </div>
  );
}
