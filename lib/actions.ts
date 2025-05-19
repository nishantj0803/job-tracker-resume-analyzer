"use server"

import { revalidatePath } from "next/cache"

// Mock data storage - in a real app, this would be a database
let mockJobs = [
  {
    id: "1",
    position: "Frontend Developer",
    company: "TechCorp",
    status: "applied",
    date: "2025-05-10",
    deadline: "2025-05-20",
    location: "Remote",
    salary: "$80,000 - $100,000",
    url: "https://example.com/job-posting",
    description: "We are looking for a Frontend Developer with experience in React, TypeScript, and CSS.",
    notes: "Applied through company website. Referred by John.",
  },
  {
    id: "2",
    position: "Full Stack Engineer",
    company: "WebSolutions",
    status: "interview",
    date: "2025-05-05",
    deadline: "2025-05-25",
    location: "New York, NY",
    salary: "$90,000 - $120,000",
    url: "https://example.com/job-posting",
    description: "Looking for a Full Stack Engineer proficient in React, Node.js, and MongoDB.",
    notes: "Had initial phone screening. Technical interview scheduled.",
  },
  {
    id: "3",
    position: "UX Designer",
    company: "DesignHub",
    status: "planning",
    date: "2025-05-15",
    deadline: "2025-05-30",
    location: "San Francisco, CA",
    salary: "$85,000 - $110,000",
    url: "https://example.com/job-posting",
    description: "Seeking a UX Designer with experience in user research and prototyping.",
    notes: "Portfolio ready. Planning to apply next week.",
  },
  {
    id: "4",
    position: "Product Manager",
    company: "InnovateTech",
    status: "rejected",
    date: "2025-04-28",
    deadline: "2025-05-15",
    location: "Chicago, IL",
    salary: "$100,000 - $130,000",
    url: "https://example.com/job-posting",
    description: "Looking for a Product Manager with experience in agile methodologies.",
    notes: "Received rejection email. Will follow up for feedback.",
  },
  {
    id: "5",
    position: "DevOps Engineer",
    company: "CloudSystems",
    status: "offer",
    date: "2025-04-20",
    deadline: "2025-05-01",
    location: "Austin, TX",
    salary: "$95,000 - $125,000",
    url: "https://example.com/job-posting",
    description: "Seeking a DevOps Engineer with experience in AWS, Docker, and CI/CD.",
    notes: "Received offer. Negotiating salary.",
  },
]

// Mock data for the resume analysis
const mockResumeAnalysis = {
  score: 78,
  contentQuality: 82,
  atsCompatibility: 75,
  keywordOptimization: 70,
  suggestions: ["Add more quantifiable achievements", "Improve your summary section", "Reorganize your skills section"],
  keywords: {
    present: ["JavaScript", "HTML", "CSS", "Git", "Agile", "UI/UX", "Testing"],
    missing: ["React", "Node.js", "MongoDB", "Express", "TypeScript", "CI/CD"],
  },
  sections: {
    summary: {
      clarity: 7,
      impact: 6,
      feedback: "Your summary is clear but could be more impactful.",
    },
    experience: {
      achievementFocus: 8,
      quantifiableResults: 6,
      feedback: "Your work experience section is achievement-focused but lacks quantifiable results.",
    },
    skills: {
      relevance: 7,
      organization: 5,
      feedback: "Your skills section includes relevant skills but could be better organized.",
    },
  },
}

// Mock data for keyword comparison
const mockKeywordComparison = {
  matching: ["JavaScript", "HTML", "CSS", "Git", "Agile", "UI/UX", "Testing"],
  missing: ["React", "Node.js", "MongoDB", "Express", "TypeScript", "CI/CD", "AWS", "Docker", "Kubernetes"],
  score: 45,
}

// Function to analyze a resume
export async function analyzeResume(file: File) {
  console.log("Analyzing resume:", file.name)

  // In a real app, this would:
  // 1. Upload the file to a server or cloud storage
  // 2. Process the file with NLP to extract text and structure
  // 3. Analyze the content for quality, keywords, etc.
  // 4. Return the analysis results

  // For demo purposes, we'll just return mock data after a delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return mockResumeAnalysis
}

// Function to compare resume keywords with a job description
export async function compareKeywords(jobDescription: string) {
  console.log("Comparing keywords with job description")

  // In a real app, this would:
  // 1. Extract keywords from the job description using NLP
  // 2. Compare with keywords from the user's resume
  // 3. Calculate a match score
  // 4. Return matching and missing keywords

  // For demo purposes, we'll just return mock data after a delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return mockKeywordComparison
}

// Function to add a new job
export async function addJob(formData: FormData) {
  // Extract form data
  const position = formData.get("position") as string
  const company = formData.get("company") as string
  const status = formData.get("status") as string
  const deadline = formData.get("deadline") as string
  const location = formData.get("location") as string
  const salary = formData.get("salary") as string
  const url = formData.get("url") as string
  const description = formData.get("description") as string
  const notes = formData.get("notes") as string

  // Create a new job object
  const newJob = {
    id: Date.now().toString(),
    position,
    company,
    status,
    date: new Date().toISOString().split("T")[0], // Today's date
    deadline,
    location,
    salary,
    url,
    description,
    notes,
  }

  console.log("Adding new job:", newJob)

  // In a real app, this would save the job to a database
  // For demo purposes, we'll add it to our mock data
  mockJobs = [newJob, ...mockJobs]

  // Revalidate the jobs page to show the new job
  revalidatePath("/jobs")

  // Return the new job for client-side updates
  return newJob
}

// Function to get all jobs
export async function getJobs() {
  // In a real app, this would fetch jobs from a database
  // For demo purposes, we'll just return mock data
  return mockJobs
}
