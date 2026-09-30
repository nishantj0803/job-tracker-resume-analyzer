// File: app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import NextAuthSessionProvider from "@/components/nextauth-session-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "JobTrackr — Turn applications into interviews",
  description:
    "Track every job application from applied to offer, grade your resume against each job description, and see exactly which keywords you're missing.",
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
};

export const viewport: Viewport = {
  themeColor: "#FFFDF7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${bricolage.variable}`}>
        <NextAuthSessionProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
            ><a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-[10px] focus:border-2 focus:border-[#141414] focus:bg-[#FFB800] focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[#141414]"
            >
              Skip to content
            </a>
              <div id="main-content" tabIndex={-1} className="flex-1 p-4 md:p-8">
              {children}
              </div>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}