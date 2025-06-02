// File: app/jobs/[jobId]/page.tsx
"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getJobById, type Job } from '@/lib/actions'; // Import Job type
import { MainNav } from '@/components/main-nav';
import { DashboardShell } from '@/components/dashboard-shell';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, ExternalLink, Loader2, MapPin, DollarSign, FileText, AlertCircle } from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      setIsLoading(true);
      setError(null);
      getJobById(jobId)
        .then(data => {
          if (data) {
            setJob(data);
          } else {
            setJob(null); 
            setError(`Job with ID "${jobId}" not found or is not active.`);
          }
        })
        .catch(fetchError => {
          console.error("Failed to fetch job details:", fetchError);
          setJob(null);
          setError(fetchError.message || "Failed to fetch job details.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setJob(null);
      setError("No job ID provided in the URL.");
    }
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <DashboardShell>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading job details...</p>
          </div>
        </DashboardShell>
      </div>
    );
  }

  if (error || job === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <DashboardShell>
          <DashboardHeader 
            heading={error ? "Error Loading Job" : "Job Not Found"} 
            text={error || `Sorry, we couldn't find the job you're looking for (ID: ${jobId}).`} 
          />
          <div className="flex items-center justify-center p-6 bg-destructive/10 border border-destructive/30 rounded-md text-destructive">
            <AlertCircle className="h-6 w-6 mr-3"/>
            <p>{error || `The job with ID "${jobId}" might have been removed or the link is incorrect.`}</p>
          </div>
          <Button onClick={() => router.push('/jobs')} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Job Listings
          </Button>
        </DashboardShell>
      </div>
    );
  }
  
  if (!job) { 
    return null; 
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <DashboardShell>
        <div className="mb-6">
            <Button variant="outline" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
            </Button>
            <DashboardHeader heading={job.position} text={`at ${job.company}`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                {job.description ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed">{job.description}</p>
                ) : (
                  <p className="text-muted-foreground">No description provided.</p>
                )}
              </CardContent>
            </Card>

            {job.responsibilities && job.responsibilities.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Responsibilities</CardTitle></CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {job.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </CardContent>
              </Card>
            )}

            {job.qualifications && job.qualifications.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Qualifications</CardTitle></CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {job.qualifications.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </CardContent>
              </Card>
            )}
             {job.benefits && job.benefits.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Benefits</CardTitle></CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {job.benefits.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Job Overview</CardTitle>
                {job.company_logo_url && <img src={job.company_logo_url} alt={`${job.company} logo`} className="h-10 w-10 object-contain rounded-sm"/>}
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center">
                  <BriefcaseBusiness className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{job.location || "Not specified"}</span>
                </div>
                {job.salary_range && (
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{job.salary_range}</span>
                  </div>
                )}
                {job.created_at && ( // Changed from job.date
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                )}
                {job.application_deadline && ( // Changed from job.deadline
                  <div className="flex items-center text-destructive">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <span>Apply by: {new Date(job.application_deadline).toLocaleDateString()}</span>
                  </div>
                )}
                 {job.status && (
                    <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        Status: <Badge variant="outline" className="ml-2">{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</Badge>
                    </div>
                 )}
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-3">
                <Button size="lg" asChild>
                  <Link href={`/jobs/${job.id}/apply`}>Apply Now</Link>
                </Button>
                {job.job_url && ( // Changed from job.url
                  <Button variant="outline" size="lg" asChild>
                    <a href={job.job_url} target="_blank" rel="noopener noreferrer">
                      View Original Posting <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}

