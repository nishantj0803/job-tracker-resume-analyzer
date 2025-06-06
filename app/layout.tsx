// File: app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import NextAuthSessionProvider from "@/components/nextauth-session-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JobTrackr",
  description: "Track your job applications and analyze your resume.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
            ><main className="flex-1 p-4 md:p-8">
              {children}
              </main>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}