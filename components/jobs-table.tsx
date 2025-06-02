// File: components/jobs-table.tsx
"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink, Loader2 } from "lucide-react" // Removed MoreHorizontal, Pencil
import Link from "next/link"
// Removed DropdownMenu related imports as they are admin-specific for this table now
import { getJobs, type Job } from "@/lib/actions" // Import Job type
import { useToast } from "@/components/ui/use-toast"
// Removed useAuth as admin check is not primary here, but can be added if needed for conditional UI

export function JobsTable() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchJobs() {
      setIsLoading(true);
      try {
        const jobsData = await getJobs(); // This fetches all jobs by default
        // For users, you might want getJobs to internally filter for 'active' status
        // or filter here if getJobs returns all.
        // For now, assuming getJobs returns jobs appropriate for user view or will be filtered by RLS.
        setJobs(jobsData.filter(job => job.status === 'active')); // Client-side filter for active jobs
      } catch (error) {
        console.error("Error fetching jobs:", error);
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

  const getStatusColor = (status: string | null | undefined) => {
    // For user view, 'active' is primary. 'Closed' might be relevant if showing past applications.
    switch (status?.toLowerCase()) {
      case "active":
         return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "closed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default: // For other statuses like 'draft' that users shouldn't see
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  }

  const getStatusText = (status: string | null | undefined) => {
    if (!status) return "N/A";
    // User-friendly status
    if (status.toLowerCase() === 'active') return "Open";
    if (status.toLowerCase() === 'closed') return "Closed";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
  }


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading job listings...</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead> 
            <TableHead>Posted On</TableHead> {/* Changed from Deadline for user view */}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium hover:underline">
                  <Link href={`/jobs/${job.id}`}>
                    {job.position || "N/A"}
                  </Link>
                </TableCell>
                <TableCell>{job.company || "N/A"}</TableCell>
                <TableCell>{job.location || "N/A"}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(job.status)} variant="outline">
                    {getStatusText(job.status)}
                  </Badge>
                </TableCell>
                <TableCell>{job.created_at ? new Date(job.created_at).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/jobs/${job.id}`}>
                      View Details
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No active job listings found at the moment. Check back soon!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
