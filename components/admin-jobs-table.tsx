// File: components/admin-jobs-table.tsx
"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox" // If needed for bulk actions
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Pencil, Search, Trash, Eye } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getJobs, deleteJob, type Job } from "@/lib/actions"; // Import Job type
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
// TODO: Import deleteJob and updateJobStatus actions when created

interface AdminJobsTableProps {
  limit?: number; // For dashboard preview
}

export function AdminJobsTable({ limit }: AdminJobsTableProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  // const [selectedJobs, setSelectedJobs] = useState<string[]>([]) // For bulk actions
  const { toast } = useToast()

  const fetchAdminJobs = async () => {
    setIsLoading(true);
    try {
      const jobsData = await getJobs(); // Fetches all jobs
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching admin jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load job listings for admin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminJobs();
  }, [toast]); // Re-fetch if toast changes (e.g. after an action) - or use a dedicated refresh function

  const filteredJobs = jobs
    .filter(
      (job) =>
        job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, limit || jobs.length);

    const handleDeleteJob = async (jobId: string, jobPosition: string) => {
      if (!confirm(`Are you sure you want to delete the job: "${jobPosition}"? This action cannot be undone.`)) {
        return;
      }
      console.log(`AdminJobsTable: Attempting to delete job ID: ${jobId}, Position: ${jobPosition}`);
      try {
        const result = await deleteJob(jobId); // Call the server action
        console.log(`AdminJobsTable: deleteJob server action result:`, result);
    
        if (result.error) {
          toast({ title: "Error Deleting Job", description: result.error, variant: "destructive" });
        } else if (result.success) {
          toast({ title: "Job Deleted", description: `"${jobPosition}" has been deleted successfully.` });
          fetchAdminJobs(); // Re-fetch jobs to update the table
        } else {
          // This case should ideally be covered by result.error or result.success
          toast({ title: "Delete Action Failed", description: "The delete operation did not complete as expected.", variant: "destructive"});
        }
      } catch (error: any) {
        console.error("AdminJobsTable: Error calling deleteJob action:", error);
        toast({ title: "Client-Side Error", description: `Failed to initiate delete: ${error.message}`, variant: "destructive" });
      }
    };
  
  const getStatusColor = (status: string | null | undefined) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "draft": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "closed": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string | null | undefined) => {
    if (!status) return "N/A";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!limit && ( // Show search only on the full jobs page, not dashboard preview
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by position or company..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Add filters for status if needed */}
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* {!limit && <TableHead className="w-12"><Checkbox /></TableHead>} */}
              <TableHead>Position</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Posted On</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  {/* {!limit && <TableCell><Checkbox /></TableCell>} */}
                  <TableCell className="font-medium">{job.position}</TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(job.status)} variant="outline">
                      {getStatusText(job.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{job.location || "N/A"}</TableCell>
                  <TableCell>{job.created_at ? new Date(job.created_at).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell>{job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Job Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/jobs/${job.id}`} target="_blank"> {/* View as user */}
                            <Eye className="mr-2 h-4 w-4" /> View Posting
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
  <Link href={`/admin/jobs/${job.id}/edit`}> {/* <<<< CHECK THIS LINE */}
    <Pencil className="mr-2 h-4 w-4" /> Edit
  </Link>
</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteJob(job.id, job.position)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={limit ? 6 : 7} className="h-24 text-center">
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

