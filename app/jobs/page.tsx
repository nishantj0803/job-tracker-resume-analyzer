// File: app/jobs/page.tsx
"use client"; // Add this if not present

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Plus } from "lucide-react"; // No longer needed here
import { Search } from "lucide-react";
import Link from "next/link";
import { JobsTable } from "@/components/jobs-table";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { MainNav } from "@/components/main-nav";
import { useAuth } from "@/components/auth-provider"; // Import useAuth


export default function JobsPage() {
  const { user, isAdmin } = useAuth(); // Get user and isAdmin status

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <DashboardShell>
        <DashboardHeader 
          heading="Job Listings" 
          text="Browse and apply for available job positions."
        >
          {/* "Add Job" button removed for regular users. Admins add jobs via their dashboard. */}
        </DashboardHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search jobs..." className="w-full pl-8" />
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {/* These statuses might not be relevant if users are only viewing open jobs */}
                  <SelectItem value="open">Open</SelectItem> 
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <JobsTable />
        </div>
      </DashboardShell>
    </div>
  )
}
