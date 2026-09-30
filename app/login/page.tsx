// File: app/login/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      // Success and failure toasts are raised inside login().
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/40 px-4 py-12">
      <div aria-hidden className="grain-overlay" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 font-semibold"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border-2 border-[#141414] bg-[#FFB800] text-[#141414] shadow-[2px_2px_0_#141414] dark:border-[#F3F3EF] dark:shadow-[2px_2px_0_#F3F3EF]">
            <span className="font-display text-sm font-bold">JT</span>
          </span>
          <span className="font-display text-2xl font-bold tracking-tight">
            JobTrackr
          </span>
        </Link>

        <div className="mb-4 text-center">
          <span className="inline-block -rotate-2 rounded-[10px] border-2 border-[#141414] bg-[#CDEBD9] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#141414] shadow-[2px_2px_0_#141414] dark:border-[#F3F3EF] dark:text-[#141414] dark:shadow-[2px_2px_0_#F3F3EF]">
            Welcome back
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Log in</CardTitle>
            <CardDescription>
              Pick up where the search left off.
            </CardDescription>
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
                <Label htmlFor="password">Password</Label>
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
                  "Log in"
                )}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium underline decoration-[#FFB800] decoration-[3px] underline-offset-4">
                  Sign up
                </Link>
              </div>
              <div className="text-center text-sm">
                <Link
                  href="/admin/login"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Admin login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
