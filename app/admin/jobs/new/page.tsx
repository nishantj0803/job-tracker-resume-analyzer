// File: app/admin/jobs/new/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { addJob } from "@/lib/actions" // Import the server action
import { MainNav } from "@/components/main-nav" // Assuming AdminNav is handled by layout
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function NewAdminJobPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // This component will now call the server action directly
  // The 'action' attribute on the form will handle it if we don't preventDefault
  // Or we can call it in an async function.

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Prevent default form submission
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    // You might want to add client-side validation here before calling the action

    const result = await addJob(formData); // Call the server action

    if (result.error) {
      console.error("Error adding job:", result.error);
      toast({
        title: "Error Adding Job",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.job) {
      toast({
        title: "Job Added Successfully",
        description: `"${result.job.position}" at ${result.job.company} has been added.`,
      });
      router.push("/admin/dashboard"); // Or /admin/jobs
      // revalidatePath is called in the server action, so router.refresh() might not be needed
      // but can be added if you see stale data: router.refresh();
    }
    setIsSubmitting(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* <AdminNav /> Ensure AdminNav is in a layout if this page is part of admin section */}
      <DashboardShell>
        <DashboardHeader heading="Add New Job Listing" text="Create a new job posting for the platform." />
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Enter the details of the job to be posted.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input id="position" name="position" placeholder="e.g. Frontend Developer" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input id="company" name="company" placeholder="e.g. TechCorp" required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" placeholder="e.g. Remote, New York, NY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input id="salary" name="salary" placeholder="e.g. $80,000 - $100,000" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Posting Status</Label>
                  <Select name="status" defaultValue="draft">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active (Visible to Users)</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input id="deadline" name="deadline" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Job Posting URL (Original)</Label>
                <Input id="url" name="url" type="url" placeholder="https://example.com/job-posting" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Detailed job description..."
                  className="min-h-[150px]"
                />
              </div>
               {/* TODO: Add fields for company_logo_url, responsibilities, qualifications, benefits if needed */}
              <div className="space-y-2">
                <Label htmlFor="notes">Admin Notes (Private)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Internal notes about this job posting"
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild>
                  <Link href="/admin/dashboard">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Job...
                    </>
                  ) : (
                    "Save Job Listing"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DashboardShell>
    </div>
  )
}
