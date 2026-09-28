#!/usr/bin/env node
/**
 * Seed demo data for local development.
 *
 *   npm run seed -- --email=nishantj0803@gmail.com   seed jobs + applications
 *   npm run seed -- --clear                          remove all seeded docs
 *
 * Seeded documents are tagged { seeded: true } so they can be removed
 * without touching real data. Re-running seed aborts if seeded docs
 * already exist (use --clear first, or --force to append anyway).
 */
import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function loadLocalEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) throw new Error("Missing .env.local (see .env.example).");
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const i = trimmed.indexOf("=");
    const key = trimmed.slice(0, i).trim();
    const val = trimmed.slice(i + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);
const daysAhead = (n) => new Date(Date.now() + n * DAY);

const JOBS = [
  { position: "Frontend Developer", company: "Razorpay", location: "Bengaluru, IN", status: "active", salary_range: "₹18-28 LPA", deadlineAhead: 21, url: "https://razorpay.com/jobs" },
  { position: "Backend Developer (Node.js)", company: "Swiggy", location: "Bengaluru, IN", status: "active", salary_range: "₹20-32 LPA", deadlineAhead: 14, url: "https://careers.swiggy.com" },
  { position: "SDE I", company: "Flipkart", location: "Bengaluru, IN", status: "active", salary_range: "₹24-36 LPA", deadlineAhead: 30, url: "https://flipkartcareers.com" },
  { position: "Full Stack Developer", company: "Zeta", location: "Hyderabad, IN", status: "active", salary_range: "₹22-34 LPA", deadlineAhead: 9, url: "https://zeta.tech/careers" },
  { position: "Software Engineer II", company: "Meta", location: "Remote", status: "active", salary_range: "$180k-240k", deadlineAhead: 45, url: "https://metacareers.com" },
  { position: "UI Engineer", company: "Airbnb", location: "Remote", status: "active", salary_range: "$160k-210k", deadlineAhead: 28, url: "https://careers.airbnb.com" },
  { position: "SDE Intern", company: "Uber", location: "Hyderabad, IN", status: "active", salary_range: "₹80k/month", deadlineAhead: 12, url: "https://uber.com/careers" },
  { position: "Product Engineer", company: "Freshworks", location: "Chennai, IN", status: "active", salary_range: "₹16-26 LPA", deadlineAhead: 18, url: "https://freshworks.com/careers" },
  { position: "Frontend Developer", company: "Stripe", location: "Remote", status: "active", salary_range: "$150k-200k", deadlineAhead: 35, url: "https://stripe.com/jobs" },
  { position: "SDE Intern", company: "Netflix", location: "Remote", status: "closed", salary_range: "$45/hr", deadlineAhead: -10, url: "https://jobs.netflix.com" },
  { position: "Data Analyst", company: "C Dot", location: "Pune, IN", status: "active", salary_range: "₹12-18 LPA", deadlineAhead: 25, url: "" },
  { position: "Backend Developer (Go)", company: "Google", location: "Hyderabad, IN", status: "active", salary_range: "₹30-45 LPA", deadlineAhead: 40, url: "https://careers.google.com" },
];

// Weighted pipeline spread across ~90 days: [status, daysAgo]
const APPLICATIONS = [
  ["applied", 2], ["applied", 4], ["applied", 6], ["applied", 9],
  ["applied", 13], ["applied", 18], ["applied", 24], ["applied", 31],
  ["screening", 5], ["screening", 11], ["screening", 20], ["screening", 33],
  ["interview", 8], ["interview", 16], ["interview", 27], ["interview", 41],
  ["offer", 22], ["offer", 55],
  ["rejected", 15], ["rejected", 29], ["rejected", 47], ["rejected", 70],
];

async function main() {
  loadLocalEnv();
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "jobtrackr_db";
  if (!uri) throw new Error("MONGODB_URI is not set.");

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
  await client.connect();
  const db = client.db(dbName);

  if (args.clear) {
    const j = await db.collection("jobs").deleteMany({ seeded: true });
    const a = await db.collection("applications").deleteMany({ seeded: true });
    console.log(`Cleared ${j.deletedCount} jobs and ${a.deletedCount} applications.`);
    await client.close();
    return;
  }

  const email = String(args.email || "nishantj0803@gmail.com").toLowerCase();
  const user = await db.collection("users_auth").findOne({ email });
  if (!user) throw new Error(`No user found for email ${email}.`);
  const admin = await db.collection("users_auth").findOne({ role: "admin" });

  const existing = await db.collection("jobs").countDocuments({ seeded: true });
  if (existing > 0 && !args.force) {
    console.log(`Found ${existing} seeded jobs already. Re-run with --clear first, or --force to append.`);
    await client.close();
    return;
  }

  const now = new Date();
  const jobDocs = JOBS.map((j) => ({
    position: j.position,
    company: j.company,
    description: `${j.position} at ${j.company} (${j.location}). Seeded demo posting.`,
    location: j.location,
    status: j.status,
    job_url: j.url || null,
    application_deadline: j.deadlineAhead >= 0 ? daysAhead(j.deadlineAhead) : daysAgo(-j.deadlineAhead),
    salary_range: j.salary_range,
    notes_private: null,
    created_at: daysAgo(60),
    updated_at: now,
    posted_by_user_id: admin ? admin._id.toString() : null,
    seeded: true,
  }));
  const inserted = await db.collection("jobs").insertMany(jobDocs);
  const jobIds = Object.values(inserted.insertedIds);

  // Mix seeded jobs with a few existing ones for realistic spread.
  const existingJobs = await db.collection("jobs").find({ seeded: { $ne: true } }).limit(6).toArray();
  const pool = [...jobIds.map((id) => new ObjectId(id)), ...existingJobs.map((j) => j._id)];

  const appDocs = APPLICATIONS.map(([status, ago], i) => ({
    jobId: pool[i % pool.length],
    userId: user._id,
    applicantName: user.name || "Nishant Jain",
    applicantEmail: user.email,
    coverLetter: "",
    appliedAt: daysAgo(ago),
    status,
    seeded: true,
  }));
  const apps = await db.collection("applications").insertMany(appDocs);

  console.log(`Seeded ${inserted.insertedCount} jobs and ${apps.insertedCount} applications for ${email}.`);
  await client.close();
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
