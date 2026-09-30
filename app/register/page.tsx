// File: app/register/page.tsx
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
import { useToast } from "@/components/ui/use-toast"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await register(name, email, password)
      toast({
        title: "Account created",
        description: "You are signed in. Start tracking applications.",
      })
    } catch {
      toast({
        title: "Registration failed",
        description: "We couldn't create your account. Please try again.",
        variant: "destructive",
      })
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
          <span className="inline-block rotate-2 rounded-[10px] border-2 border-[#141414] bg-[#FFB800] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#141414] shadow-[2px_2px_0_#141414] dark:border-[#F3F3EF] dark:shadow-[2px_2px_0_#141414] dark:text-[#141414]">
            Free to start
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Track every application from applied to offer.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Rhea Kapoor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="font-medium underline decoration-[#FFB800] decoration-[3px] underline-offset-4">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
