// lib/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
function mongoDocToSerializableJob(doc: any): Job | null {
  if (!doc) return null;
  const { _id, created_at, updated_at, application_deadline, ...rest } = doc;
  const serializableJob: Job = {
    ...rest,
    id: _id.toString(),
    created_at: created_at instanceof Date ? created_at.toISOString() : String(created_at),
    updated_at: updated_at ? (updated_at instanceof Date ? updated_at.toISOString() : String(updated_at)) : null,
    application_deadline: application_deadline ? (application_deadline instanceof Date ? application_deadline.toISOString() : String(application_deadline)) : null,
    // Ensure any other potentially non-serializable fields (e.g., other nested ObjectIds or Dates if any) are converted here
  };
  return serializableJob;
  return {
    ...rest,
    id: _id.toString(),
    // _id: _id.toString(), // If you want to pass _id as string too
    created_at: created_at instanceof Date ? created_at.toISOString() : (typeof created_at === 'string' ? created_at : new Date(created_at).toISOString()),
    updated_at: updated_at ? (updated_at instanceof Date ? updated_at.toISOString() : (typeof updated_at === 'string' ? updated_at : new Date(updated_at).toISOString())) : null,
    application_deadline: application_deadline ? (application_deadline instanceof Date ? application_deadline.toISOString() : (typeof application_deadline === 'string' ? application_deadline : new Date(application_deadline).toISOString())) : null,
  } as Job; // Cast to Job, ensure all fields align
}

export async function addJob(formData: FormData): Promise<{ job: Job | null; error: string | null }> {
  console.log("SERVER_ACTION_LOG: addJob action initiated (MongoDB/NextAuth).");
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    console.warn("SERVER_ACTION_WARN: No authenticated user found in addJob.");
    return { job: null, error: "User not authenticated." };
  }

  // @ts-ignore
  if (session.user.role !== 'admin') {
    // @ts-ignore
    console.warn(`SERVER_ACTION_WARN: User ${session.user.id} is not an admin. Role: ${session.user.role}. Denying addJob.`);
    return { job: null, error: "User does not have admin privileges to add jobs." };
  }
  console.log("SERVER_ACTION_LOG: User confirmed as admin. Proceeding to add job (MongoDB).");

  const deadlineString = formData.get("deadline") as string | null;

  // Data to be inserted into MongoDB (uses Date objects)
  const jobDataToInsert = {
    position: formData.get("position") as string,
    company: formData.get("company") as string,
    description: (formData.get("description") as string | null) || null,
    location: (formData.get("location") as string | null) || null,
    status: (formData.get("status") as Job['status'] | null) || 'draft',
    job_url: (formData.get("url") as string | null) || null,
    application_deadline: deadlineString ? new Date(deadlineString) : null,
    salary_range: (formData.get("salary") as string | null) || null,
    notes_private: (formData.get("notes") as string | null) || null,
    created_at: new Date(),
    updated_at: new Date(),
    // @ts-ignore
    posted_by_user_id: session.user.id,
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
  // ... (auth checks and formData processing as before) ...
  // Ensure updateData results in Date objects for date fields being stored in DB

  const deadlineString = formData.get("deadline") as string | null;
  const updatePayload: Partial<Omit<Job, '_id' | 'id' | 'created_at' | 'posted_by_user_id' | 'application_deadline'> & { application_deadline?: Date | null }> = {
    position: formData.get("position") as string,
    company: formData.get("company") as string,
    description: formData.get("description") as string || undefined,
    location: formData.get("location") as string || undefined,
    status: (formData.get("status") as Job['status']) || undefined,
    job_url: formData.get("url") as string || undefined,
    application_deadline: deadlineString ? new Date(deadlineString) : undefined,
    salary_range: formData.get("salary") as string || undefined,
    notes_private: formData.get("notes") as string || undefined,
    updated_at: new Date(),
  };

  Object.keys(updatePayload).forEach(key => (updatePayload as any)[key] === undefined && delete (updatePayload as any)[key]);

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
    
    if (!result) return { job: null, error: "Job not found or update failed." };

    const updatedJob = mongoDocToSerializableJob(result); // Serialize before returning
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
  console.log(`SERVER_ACTION_LOG: deleteJob action initiated for ID: ${jobId}`);
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session?.user || session.user.role !== 'admin') {
    // @ts-ignore
    const userId = session?.user?.id || "Unauthenticated";
    // @ts-ignore
    const userRole = session?.user?.role || "N/A";
    console.warn(`SERVER_ACTION_LOG: Auth check failed for deleteJob. User: ${userId}, Role: ${userRole}. JobId: ${jobId}`);
    return { success: false, error: "Admin privileges required." };
  }
  console.log(`SERVER_ACTION_LOG: Admin user ${session.user.id} confirmed for deleteJob.`);

  if (!ObjectId.isValid(jobId)) {
    console.warn(`SERVER_ACTION_LOG: Invalid jobId for deleteJob: ${jobId}`);
    return { success: false, error: "Invalid job ID format." };
  }

  const jobObjectId = new ObjectId(jobId);
  console.log(`SERVER_ACTION_LOG: Attempting to delete job with ObjectId: ${jobObjectId.toString()}`);

  try {
    const db = await getDb();
    const result = await db.collection('jobs').deleteOne({ _id: jobObjectId });
    console.log(`SERVER_ACTION_LOG: MongoDB deleteOne result:`, result);

    if (result.deletedCount === 0) {
      console.warn(`SERVER_ACTION_LOG: Job not found or already deleted for ID ${jobId} (ObjectId: ${jobObjectId.toString()}).`);
      return { success: false, error: "Job not found or already deleted." };
    }

    console.log(`SERVER_ACTION_LOG: Job ID ${jobId} (ObjectId: ${jobObjectId.toString()}) deleted successfully from MongoDB.`);
    revalidatePath("/jobs");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/jobs");
    return { success: true, error: null };
  } catch (e: any) {
    console.error(`SERVER_ACTION_ERROR: Error deleting job ID ${jobId} from MongoDB:`, e);
    return { success: false, error: `Database error: ${e.message}` };
  }
}

// submitJobApplication likely doesn't return the job object directly to the client component
// as a prop, so it might not need this specific serialization for its return value.
// However, be mindful if you fetch and use this application data later in client components.
export async function submitJobApplication(jobId: string, applicationData: any): Promise<{ success: boolean; message: string }> {
  // ... (existing logic is likely fine if not directly passing complex objects as props) ...
  console.log(`SERVER_ACTION_LOG: submitJobApplication for job ID: ${jobId} (MongoDB/NextAuth).`);
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) { 
    return { success: false, message: "You must be logged in to apply." };
  }
  if (!ObjectId.isValid(jobId)) return { success: false, message: "Invalid job ID." };
  // @ts-ignore 
  if (session.user.id && !ObjectId.isValid(session.user.id)) {
      return { success: false, message: "Invalid user ID format in session." };
  }
  
  const newApplication = {
    jobId: new ObjectId(jobId),
    // @ts-ignore
    userId: new ObjectId(session.user.id),
    applicantName: applicationData.name,
    applicantEmail: applicationData.email,
    coverLetter: applicationData.coverLetter,
    appliedAt: new Date(),
    status: "applied",
  };

  try {
    const db = await getDb();
    await db.collection('applications').insertOne(newApplication);
    
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');

    return { success: true, message: `Successfully submitted application for ${applicationData.jobTitle || 'job'}.` };
  } catch (e: any) {
    console.error("SERVER_ACTION_ERROR: Error submitting application to MongoDB:", e);
    return { success: false, message: `Database error: ${e.message}` };
  }
}

export interface UserApplicationStats {
  statusDistribution: { name: string; value: number }[];
  applicationsPerCompany: { name: string; value: number }[];
  applicationActivity: { name: string; value: number }[];
  totalApplications: number;
  interviewRate: number; // Percentage
  offerRate: number; // Percentage
}


// Add this new server action to the end of your lib/actions.ts file
export async function getUserApplicationStats(): Promise<UserApplicationStats | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ObjectId.isValid(session.user.id)) {
    return { error: "User not authenticated or user ID is invalid." };
  }

  try {
    const userId = new ObjectId(session.user.id);
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
      };
    }

    // 1. Aggregate status distribution
    const statusCounts = userApplications.reduce((acc, app) => {
      const status = app.status ? String(app.status).charAt(0).toUpperCase() + String(app.status).slice(1) : 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // 2. Aggregate applications per company using a MongoDB aggregation pipeline ($lookup)
    const applicationsPerCompany = await db.collection('applications').aggregate([
      { $match: { userId } },
      { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'jobDetails' } },
      { $unwind: '$jobDetails' },
      { $group: { _id: '$jobDetails.company', count: { $sum: 1 } } },
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

    // 4. Calculate key metrics
    const totalApplications = userApplications.length;
    const interviewCount = userApplications.filter(app => ['interview', 'offer'].includes(app.status)).length;
    const offerCount = userApplications.filter(app => app.status === 'offer').length;
    
    const interviewRate = totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0;
    const offerRate = totalApplications > 0 ? Math.round((offerCount / totalApplications) * 100) : 0;

    return {
      statusDistribution,
      applicationsPerCompany: applicationsPerCompany as { name: string; value: number }[],
      applicationActivity: applicationActivity as { name: string; value: number }[],
      totalApplications,
      interviewRate,
      offerRate,
    };

  } catch (e: any) {
    console.error("SERVER_ACTION_ERROR: Error fetching user application stats:", e);
    return { error: `Database error: ${e.message}` };
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
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session?.user || session.user.role !== 'admin') {
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

  } catch (e: any) {
    console.error("SERVER_ACTION_ERROR: Error fetching admin dashboard stats:", e);
    return { error: `Database error: ${e.message}` };
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
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user || session.user.role !== 'admin') {
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

    } catch (e: any) {
        console.error("SERVER_ACTION_ERROR: Error fetching users:", e);
        return { error: `Database error: ${e.message}` };
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ObjectId.isValid(session.user.id)) {
    return { error: "User not authenticated or user ID is invalid." };
  }

  try {
    const userId = new ObjectId(session.user.id);
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
        { $unwind: '$jobDetails' } // Deconstruct the jobDetails array
      ]).toArray()
    ]);

    const stats = {
      totalApplications: allUserApplications.length,
      interviewing: allUserApplications.filter(app => app.status === 'interview').length,
      offers: allUserApplications.filter(app => app.status === 'offer').length,
    };

    const recentApplications = recentApplicationsRaw.map(app => {
      const serializedJob = mongoDocToSerializableJob(app.jobDetails);
      if (!serializedJob) return null;

      return {
        ...serializedJob,
        applicationStatus: app.status,
        appliedDate: app.appliedAt instanceof Date ? app.appliedAt.toISOString() : String(app.appliedAt),
      };
    }).filter(app => app !== null) as (Job & { applicationStatus: string; appliedDate: string })[];

    return { stats, recentApplications };

  } catch (e: any) {
    console.error("SERVER_ACTION_ERROR: Error fetching user dashboard data:", e);
    return { error: `Database error: ${e.message}` };
  }
}