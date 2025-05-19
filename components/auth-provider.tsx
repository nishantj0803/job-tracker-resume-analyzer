"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@/types/user"
import { useToast } from "@/components/ui/use-toast"

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  adminLogin: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Protect routes
    const publicRoutes = ["/", "/login", "/register", "/admin/login", "/demo"]
    const adminRoutes = ["/admin", "/admin/dashboard", "/admin/jobs", "/admin/users"]

    if (!user && !isLoading && !publicRoutes.includes(pathname)) {
      router.push("/login")
    }

    // Redirect non-admin users from admin routes
    if (user && !isAdmin && !isLoading && adminRoutes.some((route) => pathname.startsWith(route))) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [user, isLoading, pathname, router, isAdmin, toast])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would call an API
      // For demo, we'll simulate a successful login
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data
      const mockUser: User = {
        id: "user-1",
        name: email
          .split("@")[0]
          .replace(/\./g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        email,
        role: "user",
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const adminLogin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would call an API with admin credentials
      // For demo, we'll simulate a successful admin login
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if admin credentials are valid (for demo purposes)
      if (email === "admin@example.com" && password === "admin123") {
        const adminUser: User = {
          id: "admin-1",
          name: "Admin User",
          email,
          role: "admin",
        }

        setUser(adminUser)
        localStorage.setItem("user", JSON.stringify(adminUser))
        router.push("/admin/dashboard")
      } else {
        throw new Error("Invalid admin credentials")
      }
    } catch (error) {
      console.error("Admin login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would call an API
      // For demo, we'll simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data
      const mockUser: User = {
        id: "user-" + Date.now(),
        name,
        email,
        role: "user",
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      router.push("/dashboard")
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, adminLogin, logout, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
