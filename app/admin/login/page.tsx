// File: app/login/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, Loader2, ShieldCheck } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth() // This comes from AuthProvider
  const { toast } = useToast() // useToast is likely from your UI library

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // This is important to prevent default form submission
    console.log("LoginPage: handleSubmit called with email:", email); // <-- ADD THIS LOG

    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("LoginPage: Calling login function from useAuth..."); // <-- ADD THIS LOG
      await login(email, password);
      console.log("LoginPage: login function call completed."); // <-- ADD THIS LOG
      // Success toast is now handled within the login function in AuthProvider
    } catch (error) {
      console.error("LoginPage: Error caught after calling login function:", error); // <-- ADD THIS LOG
      // Failure toast is now handled within the login function in AuthProvider
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-2xl">JobTrackr</span>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {/* <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link> */}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
              <div className="mt-4 text-center text-sm">
                <Link href="/login" className="inline-flex items-center text-muted-foreground hover:text-primary">
                  <ShieldCheck className="mr-1 h-4 w-4" />
                  User Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
