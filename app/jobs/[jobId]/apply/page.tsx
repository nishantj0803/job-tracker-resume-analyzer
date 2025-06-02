// File: app/jobs/[jobId]/apply/page.tsx
"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getJobById, submitJobApplication } from '@/lib/actions'; // Assuming submitJobApplication action
import { MainNav } from '@/components/main-nav';
import { DashboardShell } from '@/components/dashboard-shell';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, BriefcaseBusiness, Loader2, Send } from 'lucide-react';

interface Job {
  id: string;
  position: string;
  company: string;
  // Add other fields if needed for display on this page
}

interface ApplicationFormData {
    name: string;
    email: string;
    phone: string;
    resumeFile?: File | null; // For file upload
    resumeLink?: string; // Or link to stored resume
    coverLetter: string;
    jobTitle?: string; // To pass along with submission
    companyName?: string; // To pass along with submission
}

export default function JobApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    resumeFile: null,
    coverLetter: "",
  });

  useEffect(() => {
    if (jobId) {
      setIsLoadingJob(true);
      getJobById(jobId)
        .then(data => {
          setJob(data);
          if (data) {
            setFormData(prev => ({ ...prev, jobTitle: data.position, companyName: data.company }));
          }
        })
        .catch(error => {
          console.error("Failed to fetch job details for application:", error);
          setJob(null);
        })
        .finally(() => {
          setIsLoadingJob(false);
        });
    }
  }, [jobId]);

 useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, resumeFile: e.target.files![0] }));
    } else {
      setFormData(prev => ({ ...prev, resumeFile: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!job) return;
    setIsSubmitting(true);

    // In a real app, you'd use FormData for file uploads
    // For now, submitJobApplication is a placeholder
    const applicationDataToSubmit = { ...formData, jobId: job.id };
    // Remove file object if you're not handling actual uploads in submitJobApplication yet
    // delete applicationDataToSubmit.resumeFile; 

    try {
      const result = await submitJobApplication(job.id, applicationDataToSubmit);
      if (result.success) {
        toast({
          title: "Application Submitted!",
          description: result.message || `Your application for ${job.position} has been submitted.`,
        });
        // Potentially add this job to user's tracked applications
        // For now, redirect back to job detail or jobs list
        router.push(`/jobs/${job.id}`); 
      } else {
        throw new Error(result.message || "Failed to submit application.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Could not submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingJob) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <DashboardShell>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </DashboardShell>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <DashboardShell>
          <DashboardHeader heading="Job Not Found" text="The job you're trying to apply for doesn't exist or is no longer available." />
           <Button onClick={() => router.push('/jobs')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Job Listings
          </Button>
        </DashboardShell>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <DashboardShell>
         <div className="mb-6">
            <Button variant="outline" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Job Details
            </Button>
            <DashboardHeader 
                heading={`Apply for ${job.position}`} 
                text={`at ${job.company}`} 
            />
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Your Application</CardTitle>
            <CardDescription>Fill out the details below to apply. Fields marked with * are required.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resumeFile">Upload Resume *</Label>
                <Input id="resumeFile" name="resumeFile" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" required />
                {formData.resumeFile && <p className="text-xs text-muted-foreground">Selected: {formData.resumeFile.name}</p>}
                <p className="text-xs text-muted-foreground">Alternatively, ensure your latest resume is analyzed via the 'Resume' tab.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter *</Label>
                <Textarea 
                    id="coverLetter" 
                    name="coverLetter" 
                    value={formData.coverLetter} 
                    onChange={handleChange} 
                    placeholder={`Briefly explain why you're a good fit for the ${job.position} role at ${job.company}...`} 
                    className="min-h-[150px]" 
                    required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Submit Application
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </DashboardShell>
    </div>
  );
}
