// File: app/admin/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminJobsTable } from "@/components/admin-jobs-table";
import { AdminUsersTable } from "@/components/admin-users-table";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { getAdminDashboardStats } from "@/lib/actions";
import { BriefcaseBusiness, Users, FileText, CheckCircle, Plus } from "lucide-react"; // Import Plus icon
import { Button } from "@/components/ui/button"; // Import Button
import Link from "next/link"; // Import Link

export default async function AdminDashboardPage() {
  const statsResult = await getAdminDashboardStats();
  const stats = 'error' in statsResult ? null : statsResult;

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Admin Dashboard"
        text="Manage job postings, users, and view platform activity."
      >
        {/* --- THIS IS THE ADD JOB BUTTON --- */}
        <Button asChild>
          <Link href="/admin/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Link>
        </Button>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.totalJobs : '...'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.totalUsers : '...'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.totalApplications : '...'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.activeJobs : '...'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminJobsTable />
        <AdminUsersTable />
      </div>
    </DashboardShell>
  );
}