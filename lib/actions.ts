// lib/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";
import {
  normalizeApplicationStatus,
  type ApplicationStatus,
} from "@/lib/application-status";
import { computePipelineMetrics } from "@/lib/match";

type SessionUser = {
  id?: string;
  role?: string;
};

async function requireUser(): Promise<SessionUser> {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) throw new Error("User not authenticated.");
  return user;
}

async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Admin privileges required.");
  return user;
}

const jobSchema = z.object({
  position: z.string().trim().min(1, "Position is required").max(200),
  company: z.string().trim().min(1, "Company is required").max(200),
  description: z.string().max(20000).nullish(),
  location: z.string().max(200).nullish(),
  status: z.string().max(50).nullish(),
  url: z.string().max(2000).nullish(),
  deadline: z.string().max(50).nullish(),
  salary: z.string().max(200).nullish(),
  notes: z.string().max(20000).nullish(),
});

export interface Job {
  _id?: ObjectId; // Keep for internal DB use if necessary
  id: string;     // Always ensure this is a string for client
  position: string;
  company: string;
  description?: string | null;
  location?: string | null;
  status?: "draft" | "active" | "closed" | string | null;
  job_url?: string | null;
  application_deadline?: string | null; // Ensure this is a string (e.g., ISO date string)
  salary_range?: string | null;
  notes_private?: string | null;
  posted_by_user_id?: string | null;
  created_at: string; // Ensure this is a string (e.g., ISO date string)
  updated_at?: string | null; // Ensure this is a string (e.g., ISO date string)
  company_logo_url?: string | null;
  responsibilities?: string[] | null;
  qualifications?: string[] | null;
  benefits?: string[] | null;
}

// Updated helper to ensure all fields are serializable
function mongoDocToSerializableJob(doc: Record<string, unknown> | null | undefined): Job | null {
  if (!doc || !doc._id) return null;
  const { _id, created_at, updated_at, application_deadline, ...rest } = doc as Record<string, unknown> & {
    _id: ObjectId;
    created_at: unknown;
    updated_at: unknown;
    application_deadline: unknown;
  };
  const toISO = (v: unknown): string | null => {
    if (v === null || v === undefined) return null;
    if (v instanceof Date) return v.toISOString();
    if (typeof v === "string") return v;
    return String(v);
  };
  const serializableJob: Job = {
    ...(rest as Omit<Job, "id" | "created_at" | "updated_at" | "application_deadline">),
    id: _id.toString(),
    created_at: toISO(created_at) ?? new Date().toISOString(),
    updated_at: toISO(updated_at),
    application_deadline: toISO(application_deadline),
  };
  return serializableJob;
}

export async function addJob(formData: FormData): Promise<{ job: Job | null; error: string | null }> {
  let admin: SessionUser;
  try {
    admin = await requireAdmin();
  } catch (e) {
    return { job: null, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const parsed = jobSchema.safeParse({
    position: formData.get("position"),
    company: formData.get("company"),
    description: formData.get("description"),
    location: formData.get("location"),
    status: formData.get("status"),
    url: formData.get("url"),
    deadline: formData.get("deadline"),
    salary: formData.get("salary"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { job: null, error: parsed.error.errors[0]?.message ?? "Invalid job data." };
  }

  const deadlineString = parsed.data.deadline || null;

  // Data to be inserted into MongoDB (uses Date objects)
  const jobDataToInsert = {
    position: parsed.data.position,
    company: parsed.data.company,
    description: parsed.data.description || null,
    location: parsed.data.location || null,
    status: parsed.data.status || "draft",
    job_url: parsed.data.url || null,
    application_deadline: deadlineString ? new Date(deadlineString) : null,
    salary_range: parsed.data.salary || null,
    notes_private: parsed.data.notes || null,
    created_at: new Date(),
    updated_at: new Date(),
    posted_by_user_id: admin.id,
  };

  if (!jobDataToInsert.position || !jobDataToInsert.company) {
    return { job: null, error: "Position and Company are required fields." };
  }

  try {
    const db = await getDb();
    const result = await db.collection('jobs').insertOne(jobDataToInsert);

    if (!result.insertedId) {
      throw new Error("Failed to insert job into database.");
    }

    const newJobDoc = await db.collection('jobs').findOne({ _id: result.insertedId });
    if (!newJobDoc) return { job: null, error: "Failed to retrieve newly added job." };
    
    // Convert the MongoDB document to a serializable Job object before returning
    const serializableJob = mongoDocToSerializableJob(newJobDoc);
    
    console.log("SERVER_ACTION_LOG: Job added successfully to MongoDB:", serializableJob);

    revalidatePath("/jobs");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/jobs");
    return { job: serializableJob, error: null };

  } catch (e: any) {
    console.error("SERVER_ACTION_ERROR: Error adding job to MongoDB:", e);
    return { job: null, error: `Database error: ${e.message}` };
  }
}

// IMPORTANT: You MUST apply similar serialization logic (using mongoDocToSerializableJob or equivalent)
// in getJobs, getJobById, and updateJob if their results are passed to client components.

export async function getJobs(): Promise<Job[]> {
  console.log("SERVER_ACTION_LOG: getJobs action initiated (MongoDB/NextAuth).");
  try {
    const db = await getDb();
    const jobsDocs = await db.collection('jobs')
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    return jobsDocs.map(doc => mongoDocToSerializableJob(doc)).filter(job => job !== null) as Job[];
  } catch (error: any) {
    console.error("SERVER_ACTION_ERROR: Error fetching jobs from MongoDB:", error);
    return [];
  }
}

export async function getJobById(jobId: string): Promise<Job | null> {
  console.log(`SERVER_ACTION_LOG: getJobById for ID: ${jobId}`);
  if (!jobId || !ObjectId.isValid(jobId)) {
    console.warn("SERVER_ACTION_WARN: Invalid or missing jobId for getJobById:", jobId);
    return null;
  }
  try {
    const db = await getDb();
    const jobDoc = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });

    if (!jobDoc) {
      console.warn(`SERVER_ACTION_WARN: No job found for ID: ${jobId}`);
      return null;
    }
    
    // Crucial step: Serialize the document before returning
    const serializableJob = mongoDocToSerializableJob(jobDoc);
    console.log(`SERVER_ACTION_LOG: Returning serializable job data for ID ${jobId}:`, serializableJob);
    return serializableJob;

  } catch (error: any) {
    console.error(`SERVER_ACTION_ERROR: Error fetching job ID ${jobId} from MongoDB:`, error);
    return null;
  }
}

// ... (ensure updateJob and other actions also return serializable Job objects) ...

// For updateJob, ensure the returned 'result' from findOneAndUpdate is also passed through mongoDocToSerializableJob
export async function updateJob(jobId: string, formData: FormData): Promise<{ job: Job | null; error: string | null }> {
  try {
    await requireAdmin();
  } catch (e) {
    return { job: null, error: e instanceof Error ? e.message : "Not authorized." };
  }

  if (!ObjectId.isValid(jobId)) {
    return { job: null, error: "Invalid job ID format." };
  }

  const parsed = jobSchema.safeParse({
    position: formData.get("position"),
    company: formData.get("company"),
    description: formData.get("description"),
    location: formData.get("location"),
    status: formData.get("status"),
    url: formData.get("url"),
    deadline: formData.get("deadline"),
    salary: formData.get("salary"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { job: null, error: parsed.error.errors[0]?.message ?? "Invalid job data." };
  }

  const deadlineString = parsed.data.deadline || null;
  const updatePayload: Record<string, unknown> = {
    position: parsed.data.position,
    company: parsed.data.company,
    description: parsed.data.description || undefined,
    location: parsed.data.location || undefined,
    status: parsed.data.status || undefined,
    job_url: parsed.data.url || undefined,
    application_deadline: deadlineString ? new Date(deadlineString) : undefined,
    salary_range: parsed.data.salary || undefined,
    notes_private: parsed.data.notes || undefined,
    updated_at: new Date(),
  };

  Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

  if (!updatePayload.position || !updatePayload.company) {
    return { job: null, error: "Position and Company are required fields." };
  }

  try {
    const db = await getDb();
    const result = await db.collection('jobs').findOneAndUpdate(
      { _id: new ObjectId(jobId) },
      { $set: updatePayload },
      { returnDocument: 'after' }
    );

    // mongodb v5 returns ModifyResult<{value}>, v6 returns the document directly.
    const doc =
      result && typeof result === "object" && "value" in result
        ? (result as { value: Record<string, unknown> | null }).value
        : (result as Record<string, unknown> | null);
    if (!doc) return { job: null, error: "Job not found or update failed." };

    const updatedJob = mongoDocToSerializableJob(doc); // Serialize before returning
    // ... (revalidate paths and return) ...
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/jobs");
    return { job: updatedJob, error: null };
  } catch (e: any) {
    // ... (error handling) ...
    console.error(`SERVER_ACTION_ERROR: Error updating job ID ${jobId} in MongoDB:`, e);
    return { job: null, error: `Database error: ${e.message}` };
  }
}

// deleteJob does not return job data, so it's likely fine as is.
// lib/actions.ts
export async function deleteJob(jobId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Admin privileges required." };
  }

  if (!ObjectId.isValid(jobId)) {
    return { success: false, error: "Invalid job ID format." };
  }

  const jobObjectId = new ObjectId(jobId);

  try {
    const db = await getDb();
    const result = await db.collection('jobs').deleteOne({ _id: jobObjectId });

    if (result.deletedCount === 0) {
      return { success: false, error: "Job not found or already deleted." };
    }

    revalidatePath("/jobs");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/jobs");
    return { success: true, error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown database error";
    return { success: false, error: `Database error: ${message}` };
  }
}

const applicationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  coverLetter: z.string().max(20000).optional().default(""),
  jobTitle: z.string().max(200).optional().default(""),
});

// submitJobApplication stores a per-user application row keyed by job + user.
export async function submitJobApplication(
  jobId: string,
  applicationData: unknown
): Promise<{ success: boolean; message: string }> {
  let user: SessionUser;
  try {
    user = await requireUser();
  } catch {
    return { success: false, message: "You must be logged in to apply." };
  }
  if (!ObjectId.isValid(jobId)) return { success: false, message: "Invalid job ID." };
  if (user.id && !ObjectId.isValid(user.id)) {
    return { success: false, message: "Invalid user ID format in session." };
  }

  const parsed = applicationSchema.safeParse(applicationData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Invalid application." };
  }

  const newApplication = {
    jobId: new ObjectId(jobId),
    userId: new ObjectId(user.id),
    applicantName: parsed.data.name,
    applicantEmail: parsed.data.email,
    coverLetter: parsed.data.coverLetter,
    appliedAt: new Date(),
    status: "applied" satisfies ApplicationStatus,
  };

  try {
    const db = await getDb();
    await db.collection('applications').insertOne(newApplication);

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');

    return { success: true, message: `Successfully submitted application for ${parsed.data.jobTitle || 'job'}.` };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown database error";
    return { success: false, message: `Database error: ${message}` };
  }
}

export interface FunnelStageStat {
  stage: string;
  count: number;
  reachRate: number;
  conversionFromPrevious: number | null;
}

export interface UserApplicationStats {
  statusDistribution: { name: string; value: number }[];
  applicationsPerCompany: { name: string; value: number }[];
  applicationActivity: { name: string; value: number }[];
  totalApplications: number;
  interviewRate: number; // Percentage
  offerRate: number; // Percentage
  responseRate: number; // screening+interview+offer / total
  funnel: FunnelStageStat[];
  /** Filterable row-level data for client-side search/filter. */
  applications: {
    id: string;
    company: string;
    position: string;
    status: ApplicationStatus;
    appliedAt: string;
  }[];
}


// Add this new server action to the end of your lib/actions.ts file
export async function getUserApplicationStats(): Promise<UserApplicationStats | { error: string }> {
  let user: SessionUser;
  try {
    user = await requireUser();
  } catch {
    return { error: "User not authenticated or user ID is invalid." };
  }
  if (!user.id || !ObjectId.isValid(user.id)) {
    return { error: "User not authenticated or user ID is invalid." };
  }

  try {
    const userId = new ObjectId(user.id);
    const db = await getDb();

    // Fetch all applications for the user in one go
    const userApplications = await db.collection('applications').find({ userId }).toArray();

    if (userApplications.length === 0) {
      // Return a default empty state if the user has no applications
      return {
        statusDistribution: [],
        applicationsPerCompany: [],
        applicationActivity: [],
        totalApplications: 0,
        interviewRate: 0,
        offerRate: 0,
        responseRate: 0,
        funnel: [],
        applications: [],
      };
    }

    const normalizedStatuses = userApplications.map((a) =>
      normalizeApplicationStatus(a.status)
    );
    const pipeline = computePipelineMetrics(normalizedStatuses);

    // 1. Aggregate status distribution
    const statusCounts = normalizedStatuses.reduce((acc, status) => {
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value: value as number }));

    // 2. Aggregate applications per company using a MongoDB aggregation pipeline ($lookup)
    const applicationsPerCompany = await db.collection('applications').aggregate([
      { $match: { userId } },
      { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'jobDetails' } },
      { $unwind: { path: '$jobDetails', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ['$jobDetails.company', 'Unknown'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]).toArray();

    // 3. Aggregate application activity over time (by month)
    const applicationActivity = await db.collection('applications').aggregate([
      { $match: { userId } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$appliedAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]).toArray();

    // 4. Row-level data for filtering/search (join job details, tolerate orphaned jobs)
    const detailed = await db.collection('applications').aggregate([
      { $match: { userId } },
      { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'jobDetails' } },
      { $unwind: { path: '$jobDetails', preserveNullAndEmptyArrays: true } },
      { $sort: { appliedAt: -1 } },
      { $limit: 200 },
    ]).toArray();

    const applications = detailed.map((app) => ({
      id: String(app._id),
      company: String(app.jobDetails?.company ?? "Unknown"),
      position: String(app.jobDetails?.position ?? "Unknown role"),
      status: normalizeApplicationStatus(app.status),
      appliedAt:
        app.appliedAt instanceof Date
          ? app.appliedAt.toISOString()
          : String(app.appliedAt ?? ""),
    }));

    return {
      statusDistribution,
      applicationsPerCompany: applicationsPerCompany as { name: string; value: number }[],
      applicationActivity: applicationActivity as { name: string; value: number }[],
      totalApplications: pipeline.total,
      interviewRate: pipeline.interviewRate,
      offerRate: pipeline.offerRate,
      responseRate: pipeline.responseRate,
      funnel: pipeline.funnel.map((f) => ({
        stage: f.stage,
        count: f.count,
        reachRate: f.reachRate,
        conversionFromPrevious: f.conversionFromPrevious,
      })),
      applications,
    };

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown database error";
    return { error: `Database error: ${message}` };
  }
}
export interface AdminDashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalUsers: number;
  totalApplications: number;
}

// Action to get stats for the admin dashboard cards
export async function getAdminDashboardStats(): Promise<AdminDashboardStats | { error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Admin privileges required." };
  }

  try {
    const db = await getDb();

    // Perform all counts in parallel for efficiency
    const [totalJobs, activeJobs, totalUsers, totalApplications] = await Promise.all([
      db.collection('jobs').countDocuments(),
      db.collection('jobs').countDocuments({ status: 'active' }),
      db.collection('users_auth').countDocuments(),
      db.collection('applications').countDocuments()
    ]);

    return { totalJobs, activeJobs, totalUsers, totalApplications };

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown database error";
    return { error: `Database error: ${message}` };
  }
}


// Define the shape of the user object we want to return (without sensitive info)
export interface SafeUser {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    emailVerified: string | null; // Keep as string for serializability
}

// Action to get a list of all users for the admin user table
export async function getUsers(): Promise<SafeUser[] | { error: string }> {
    try {
      await requireAdmin();
    } catch {
      return { error: "Admin privileges required." };
    }

    try {
        const db = await getDb();
        const users = await db.collection('users_auth').find({}, {
            // Explicitly exclude the password field for security
            projection: { password: 0 }
        }).toArray();

        // Serialize the user documents to be client-safe
        return users.map(user => ({
            id: user._id.toString(),
            name: user.name || null,
            email: user.email || null,
            role: user.role,
            emailVerified: user.emailVerified ? (user.emailVerified instanceof Date ? user.emailVerified.toISOString() : String(user.emailVerified)) : null,
        }));

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown database error";
        return { error: `Database error: ${message}` };
    }
}
export interface UserDashboardData {
  stats: {
    totalApplications: number;
    interviewing: number;
    offers: number;
  };
  recentApplications: (Job & { applicationStatus?: string; appliedDate: string })[];
}

export async function getUserDashboardData(): Promise<UserDashboardData | { error: string }> {
  let user: SessionUser;
  try {
    user = await requireUser();
  } catch {
    return { error: "User not authenticated or user ID is invalid." };
  }
  if (!user.id || !ObjectId.isValid(user.id)) {
    return { error: "User not authenticated or user ID is invalid." };
  }

  try {
    const userId = new ObjectId(user.id);
    const db = await getDb();

    // Use Promise.all to fetch stats and recent applications concurrently
    const [allUserApplications, recentApplicationsRaw] = await Promise.all([
      db.collection('applications').find({ userId }).toArray(),
      db.collection('applications').aggregate([
        { $match: { userId } },
        { $sort: { appliedAt: -1 } },
        { $limit: 5 },
        {
          $lookup: { // Join with the 'jobs' collection to get job details
            from: 'jobs',
            localField: 'jobId',
            foreignField: '_id',
            as: 'jobDetails'
          }
        },
        { $unwind: { path: '$jobDetails', preserveNullAndEmptyArrays: true } }
      ]).toArray()
    ]);

    const stats = {
      totalApplications: allUserApplications.length,
      interviewing: allUserApplications.filter(app => normalizeApplicationStatus(app.status) === 'interview').length,
      offers: allUserApplications.filter(app => normalizeApplicationStatus(app.status) === 'offer').length,
    };

    const recentApplications = recentApplicationsRaw.map(app => {
      if (!app.jobDetails) return null;
      const serializedJob = mongoDocToSerializableJob(app.jobDetails);
      if (!serializedJob) return null;

      return {
        ...serializedJob,
        applicationStatus: normalizeApplicationStatus(app.status),
        appliedDate: app.appliedAt instanceof Date ? app.appliedAt.toISOString() : String(app.appliedAt),
      };
    }).filter(app => app !== null) as (Job & { applicationStatus: string; appliedDate: string })[];

    return { stats, recentApplications };

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown database error";
    return { error: `Database error: ${message}` };
  }
}