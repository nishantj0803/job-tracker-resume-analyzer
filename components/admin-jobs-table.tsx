"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Pencil, Search, Trash } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

// Mock data for jobs
const mockJobs = [
  {
    id: "1",
    position: "Frontend Developer",
    company: "TechCorp",
    status: "active",
    location: "Remote",
    applicants: 12,
    datePosted: "2025-05-10",
  },
  {
    id: "2",
    position: "Full Stack Engineer",
    company: "WebSolutions",
    status: "active",
    location: "New York, NY",
    applicants: 8,
    datePosted: "2025-05-05",
  },
  {
    id: "3",
    position: "UX Designer",
    company: "DesignHub",
    status: "active",
    location: "San Francisco, CA",
    applicants: 5,
    datePosted: "2025-05-15",
  },
  {
    id: "4",
    position: "Product Manager",
    company: "InnovateTech",
    status: "closed",
    location: "Chicago, IL",
    applicants: 15,
    datePosted: "2025-04-28",
  },
  {
    id: "5",
    position: "DevOps Engineer",
    company: "CloudSystems",
    status: "active",
    location: "Austin, TX",
    applicants: 3,
    datePosted: "2025-04-20",
  },
  {
    id: "6",
    position: "Data Scientist",
    company: "DataCorp",
    status: "active",
    location: "Boston, MA",
    applicants: 7,
    datePosted: "2025-05-12",
  },
  {
    id: "7",
    position: "Mobile Developer",
    company: "AppWorks",
    status: "active",
    location: "Seattle, WA",
    applicants: 4,
    datePosted: "2025-05-08",
  },
  {
    id: "8",
    position: "Backend Engineer",
    company: "ServerTech",
    status: "closed",
    location: "Denver, CO",
    applicants: 9,
    datePosted: "2025-05-01",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
    case "closed":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

interface AdminJobsTableProps {
  limit?: number
}

export function AdminJobsTable({ limit }: AdminJobsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const { toast } = useToast()

  const filteredJobs = mockJobs
    .filter(
      (job) =>
        job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .slice(0, limit || mockJobs.length)

  const handleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([])
    } else {
      setSelectedJobs(filteredJobs.map((job) => job.id))
    }
  }

  const handleSelectJob = (jobId: string) => {
    if (selectedJobs.includes(jobId)) {
      setSelectedJobs(selectedJobs.filter((id) => id !== jobId))
    } else {
      setSelectedJobs([...selectedJobs, jobId])
    }
  }

  const handleDeleteJob = (jobId: string) => {
    // In a real app, this would call an API to delete the job
    toast({
      title: "Job deleted",
      description: "The job has been deleted successfully.",
    })
    // For demo, we'll just show a toast
  }

  return (
    <div className="space-y-4">
      {!limit && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {selectedJobs.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setSelectedJobs([])}>
              Delete Selected ({selectedJobs.length})
            </Button>
          )}
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {!limit && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all jobs"
                  />
                </TableHead>
              )}
              <TableHead>Position</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead>Date Posted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow key={job.id}>
                {!limit && (
                  <TableCell>
                    <Checkbox
                      checked={selectedJobs.includes(job.id)}
                      onCheckedChange={() => handleSelectJob(job.id)}
                      aria-label={`Select job ${job.position}`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{job.position}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(job.status)} variant="outline">
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>{job.applicants}</TableCell>
                <TableCell>{job.datePosted}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/jobs/${job.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteJob(job.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredJobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={limit ? 7 : 8} className="h-24 text-center">
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
