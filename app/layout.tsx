// File: app/layout.tsx
import type React from "react"
import "@/app/globals.css" // Ensure this path is correct
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider" // Your custom AuthProvider
import { Toaster } from "@/components/ui/toaster"
import NextAuthSessionProvider from "@/components/nextauth-session-provider" // We will create this
const inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "JobTrackr - Job Application Tracker & Resume Analyzer",
  description: "Track job applications, analyze your resume, and get AI-powered career insights",
  generator: 'v0.dev'
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthSessionProvider> {/* Wrap with NextAuth's SessionProvider */}
          <AuthProvider>      {/* Your custom AuthProvider is now a child */}
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}

