"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { MainNav } from "@/components/main-nav"
import { BarChart, LineChart, PieChart } from "@/components/ui/chart"

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <DashboardShell>
        <DashboardHeader
          heading="Analytics"
          text="Track your job search progress and identify patterns to improve your strategy."
        />
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Application Trends</CardTitle>
                  <CardDescription>Number of applications over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <LineChart
                    data={[
                      { name: "Jan", value: 5 },
                      { name: "Feb", value: 8 },
                      { name: "Mar", value: 12 },
                      { name: "Apr", value: 10 },
                      { name: "May", value: 15 },
                      { name: "Jun", value: 18 },
                    ]}
                    index="name"
                    categories={["value"]}
                    colors={["primary"]}
                    valueFormatString="{value} applications"
                    className="h-[300px]"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>Distribution of application statuses</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <PieChart
                    data={[
                      { name: "Applied", value: 15 },
                      { name: "Interview", value: 5 },
                      { name: "Offer", value: 2 },
                      { name: "Rejected", value: 8 },
                    ]}
                    index="name"
                    categories={["value"]}
                    colors={["primary", "secondary", "success", "destructive"]}
                    valueFormatter={(value) => `${value} applications`}
                    className="h-[300px]"
                  />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Response Rate by Company</CardTitle>
                <CardDescription>Interview invitations by company</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BarChart
                  data={[
                    { name: "TechCorp", value: 4 },
                    { name: "WebSolutions", value: 3 },
                    { name: "DesignHub", value: 2 },
                    { name: "InnovateTech", value: 5 },
                    { name: "CloudSystems", value: 1 },
                  ]}
                  index="name"
                  categories={["value"]}
                  colors={["primary"]}
                  valueFormatter={(value) => `${value} responses`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Success Rate</CardTitle>
                <CardDescription>Percentage of applications that lead to interviews</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <LineChart
                  data={[
                    { name: "Jan", value: 20 },
                    { name: "Feb", value: 25 },
                    { name: "Mar", value: 30 },
                    { name: "Apr", value: 28 },
                    { name: "May", value: 32 },
                    { name: "Jun", value: 35 },
                  ]}
                  index="name"
                  categories={["value"]}
                  colors={["primary"]}
                  valueFormatter={(value) => `${value}%`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Applications by Industry</CardTitle>
                  <CardDescription>Distribution across different industries</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <PieChart
                    data={[
                      { name: "Tech", value: 12 },
                      { name: "Finance", value: 5 },
                      { name: "Healthcare", value: 3 },
                      { name: "Education", value: 2 },
                      { name: "Retail", value: 2 },
                    ]}
                    index="name"
                    categories={["value"]}
                    colors={["primary", "secondary", "success", "warning", "destructive"]}
                    valueFormatter={(value) => `${value} applications`}
                    className="h-[300px]"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Applications by Job Type</CardTitle>
                  <CardDescription>Full-time, part-time, contract, etc.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <PieChart
                    data={[
                      { name: "Full-time", value: 18 },
                      { name: "Contract", value: 4 },
                      { name: "Part-time", value: 1 },
                      { name: "Freelance", value: 1 },
                    ]}
                    index="name"
                    categories={["value"]}
                    colors={["primary", "secondary", "success", "warning"]}
                    valueFormatter={(value) => `${value} applications`}
                    className="h-[300px]"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="resume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resume Score Over Time</CardTitle>
                <CardDescription>Track improvements in your resume score</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <LineChart
                  data={[
                    { name: "Jan", value: 65 },
                    { name: "Feb", value: 68 },
                    { name: "Mar", value: 72 },
                    { name: "Apr", value: 75 },
                    { name: "May", value: 78 },
                    { name: "Jun", value: 80 },
                  ]}
                  index="name"
                  categories={["value"]}
                  colors={["primary"]}
                  valueFormatter={(value) => `${value}/100`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resume Section Scores</CardTitle>
                <CardDescription>Comparison of different resume sections</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BarChart
                  data={[
                    { name: "Summary", value: 70 },
                    { name: "Experience", value: 85 },
                    { name: "Skills", value: 75 },
                    { name: "Education", value: 90 },
                    { name: "Projects", value: 80 },
                  ]}
                  index="name"
                  categories={["value"]}
                  colors={["primary"]}
                  valueFormatter={(value) => `${value}/100`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </div>
  )
}
