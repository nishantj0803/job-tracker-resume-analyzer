// File: app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, BarChart3, BriefcaseBusiness, Calendar, Clock, FileText, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { MainNav } from "@/components/main-nav";
import { useAuth } from "@/components/auth-provider";
import { getUserDashboardData, type UserDashboardData } from "@/lib/actions"; // Import action and type
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useAuth(); // Get user
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [resumeInsights, setResumeInsights] = useState<string[]>([]);

  useEffect(() => {
    // Fetch dashboard data from the server action
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const result = await getUserDashboardData();
      if (result && !('error' in result)) {
        setData(result);
      } else {
        console.error("Failed to fetch dashboard data:", result?.error);
      }
      setIsLoading(false);
    };

    // Fetch resume score and insights from localStorage
    const getResumeDataFromStorage = () => {
      try {
        const storedResult = localStorage.getItem("resumeAnalysisResult");
        if (storedResult) {
          const analysisData = JSON.parse(storedResult);
          const score = analysisData.score ?? analysisData.overall_score ?? null;
          if (typeof score === 'number') {
            setResumeScore(score);
          }
          // Assuming insights are an array of strings in the analysis result
          if (Array.isArray(analysisData.feedback?.suggestions)) {
            setResumeInsights(analysisData.feedback.suggestions.slice(0, 3)); // Take top 3 insights
          }
        }
      } catch (error) {
        console.error("Failed to parse resume analysis from localStorage", error);
      }
    };

    fetchDashboardData();
    getResumeDataFromStorage();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <DashboardShell>
        <DashboardHeader
          heading="Dashboard"
          text="Track your job applications and resume performance."
        />
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {/* You can re-enable these tabs when you build them out */}
            {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
            {/* <TabsTrigger value="upcoming">Upcoming</TabsTrigger> */}
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                      <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{data?.stats.totalApplications ?? 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Interviewing</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{data?.stats.interviewing ?? 0}</div>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {resumeScore !== null ? (
                        <>
                          <div className="text-2xl font-bold">{resumeScore}/100</div>
                          <div className="mt-2">
                            <Progress value={resumeScore} className="h-2" />
                          </div>
                        </>
                      ) : (
                         <p className="text-sm text-muted-foreground">Analyze your resume to see your score.</p>
                      )}
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Offers Received</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{data?.stats.offers ?? 0}</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Recent Applications</CardTitle>
                      <CardDescription>Your 5 most recent job applications.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data?.recentApplications && data.recentApplications.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Position</TableHead>
                              <TableHead>Company</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.recentApplications.map(app => (
                              <TableRow key={app.id}>
                                <TableCell className="font-medium">
                                   <Link href={`/jobs/${app.id}`} className="hover:underline">{app.position}</Link>
                                </TableCell>
                                <TableCell>{app.company}</TableCell>
                                <TableCell><Badge variant="outline">{app.applicationStatus}</Badge></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-muted-foreground p-4 text-center">No recent applications to show.</p>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Resume Insights</CardTitle>
                      <CardDescription>AI-powered suggestions to improve your resume.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {resumeInsights.length > 0 ? (
                          resumeInsights.map((insight, index) => (
                             <div key={index} className="flex items-start gap-4">
                              <div className="rounded-full bg-primary/10 p-2">
                                <FileText className="h-4 w-4 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{insight}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center">No insights found. Analyze your resume for suggestions.</p>
                        )}

                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/resume">
                            View Full Analysis
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </div>
  );
}