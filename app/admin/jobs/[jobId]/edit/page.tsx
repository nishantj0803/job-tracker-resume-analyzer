// File: app/admin/jobs/[jobId]/edit/page.tsx
"use client"

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { getJobById, updateJob, type Job } from "@/lib/actions"; // Import your actions and Job type
import { AdminNav } from "@/components/admin-nav"; // Assuming AdminNav is appropriate here or handled by a layout
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

// Helper to format date string for input type="date"
const formatDateForInput = (dateString?: string | Date | null): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    // Check if date is valid before trying to format
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  } catch (e) {
    return ""; // Return empty if date parsing fails
  }
};

export default function EditAdminJobPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state - initialize with empty strings or defaults
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [status, setStatus] = useState<Job['status']>("draft");
  const [deadline, setDeadline] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (jobId) {
      setIsLoadingJob(true);
      getJobById(jobId)
        .then((data) => {
            console.log("EditPage: Data received from getJobById:", data); 
          if (data) {
            
            setJob(data);
            // Populate form fields
            setPosition(data.position || "");
            setCompany(data.company || "");
            setLocation(data.location || "");
            setSalary(data.salary_range || "");
            setStatus(data.status || "draft");
            setDeadline(formatDateForInput(data.application_deadline));
            setUrl(data.job_url || "");
            setDescription(data.description || "");
            setNotes(data.notes_private || "");
          } else {
            toast({ title: "Error", description: "Job not found.", variant: "destructive" });
            router.push("/admin/dashboard"); // Or admin jobs list
          }
        })
        .catch((error) => {
          console.error("Failed to fetch job details:", error);
          toast({ title: "Error", description: "Failed to load job details.", variant: "destructive" });
        })
        .finally(() => {
          setIsLoadingJob(false);
        });
    }
  }, [jobId, router, toast]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);

    const result = await updateJob(jobId, formData);

    if (result.error) {
      console.error("Error updating job:", result.error);
      toast({
        title: "Error Updating Job",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.job) {
      toast({
        title: "Job Updated Successfully",
        description: `"${result.job.position}" at ${result.job.company} has been updated.`,
      });
      router.push("/admin/dashboard"); // Or /admin/jobs or /jobs/[jobId]
      // router.refresh(); // May not be needed if revalidatePath works
    }
    setIsSubmitting(false);
  }

  if (isLoadingJob) {
    return (
      <div className="flex min-h-screen flex-col">
        {/* <AdminNav /> */}
        <DashboardShell>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading job details...</p>
          </div>
        </DashboardShell>
      </div>
    );
  }

  if (!job) {
    // This case should ideally be handled by the redirect in useEffect if job isn't found
    return (
       <div className="flex min-h-screen flex-col">
        {/* <AdminNav /> */}
        <DashboardShell>
          <DashboardHeader heading="Job Not Found" text="The job you are trying to edit does not exist." />
           <Button onClick={() => router.push('/admin/dashboard')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Dashboard
          </Button>
        </DashboardShell>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Consider if AdminNav should be here or in a layout for /admin/* routes */}
      {/* <AdminNav /> */}
      <DashboardShell>
        <DashboardHeader 
          heading={`Edit Job: ${job.position}`}
          text={`Modify the details for this job listing.`} 
        />
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Update the job information below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input id="position" name="position" value={position} onChange={(e) => setPosition(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input id="company" name="company" value={company} onChange={(e) => setCompany(e.target.value)} required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input id="salary" name="salary" value={salary} onChange={(e) => setSalary(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Posting Status</Label>
                  <Select name="status" value={status || "draft"} onValueChange={(value) => setStatus(value as Job['status'])}>
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
                  <Input id="deadline" name="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Job Posting URL (Original)</Label>
                <Input id="url" name="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Admin Notes (Private)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              {/* TODO: Add fields for company_logo_url, responsibilities, qualifications, benefits if needed */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild>
                  <Link href="/admin/dashboard">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DashboardShell>
    </div>
  );
}