// File: components/auth-provider.tsx
"use client"

import type React from "react"
import { createContext, useContext, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import type { User, UserRole } from "@/types/user"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ExtendedUser extends User {
  id: string;
  role: UserRole;
}

type AuthContextType = {
  user: ExtendedUser | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  adminLogin: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  isAdmin: boolean
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Define these constants outside the component or at the top level of the component function
const publicLandingPages = ["/", "/demo"];
const authPages = ["/login", "/register", "/admin/login"];
const adminDashboardRoute = "/admin/dashboard";
const userDashboardRoute = "/dashboard";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isLoading = status === "loading";
  const appUser = session?.user as ExtendedUser | null;
  const isAdmin = appUser?.role === "admin";

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
      // Moved constants to the component's top level
      // const publicLandingPages = ["/", "/demo"];
      // const authPages = ["/login", "/register", "/admin/login"];
      // const adminDashboardRoute = "/admin/dashboard";
      // const userDashboardRoute = "/dashboard";

      console.log("AuthProvider Protection useEffect:", { status, pathname, user: appUser, isLoading });

      if (status === "authenticated" && appUser) {
        console.log("AuthProvider: Authenticated. Role:", appUser.role, "Path:", pathname);
        if (appUser.role === "admin") {
          if (authPages.includes(pathname)) {
            console.log("AuthProvider: Admin on auth page, redirecting to admin dashboard.");
            router.push(adminDashboardRoute);
          } else if (!pathname.startsWith('/admin/') && !publicLandingPages.some(p => pathname.startsWith(p)) && pathname !== "/dashboard") {
             if(pathname === userDashboardRoute) {
                console.log("AuthProvider: Admin on user dashboard, redirecting to admin dashboard.");
                router.push(adminDashboardRoute);
             }
          }
        } else { // appUser.role === "user"
          if (authPages.includes(pathname)) {
            console.log("AuthProvider: User on auth page, redirecting to user dashboard.");
            router.push(userDashboardRoute);
          } else if (pathname.startsWith('/admin/')) {
            console.log("AuthProvider: User trying to access admin area, redirecting to user dashboard.");
            toast({
              title: "Access Denied",
              description: "You don't have permission to access this admin page.",
              variant: "destructive",
            });
            router.push(userDashboardRoute);
          }
        }
      } else if (status === "unauthenticated") {
        const isAuthPage = authPages.includes(pathname);
        const isPublicLandingPage = publicLandingPages.some(p => pathname.startsWith(p));

        if (!isAuthPage && !isPublicLandingPage && !pathname.startsWith('/api/')) {
          console.log("AuthProvider: Unauthenticated on protected route, redirecting to appropriate login. Path:", pathname);
          if (pathname.startsWith('/admin/')) {
            router.push("/admin/login");
          } else {
            router.push("/login");
          }
        }
      }
    }
  }, [status, appUser, isLoading, pathname, router, toast]);

  const login = async (email: string, password: string) => {
    console.log("AuthProvider: Attempting NextAuth login for email:", email);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    console.log("AuthProvider Login: signIn result:", result);

    if (result?.error) {
      console.error("AuthProvider: NextAuth Login failed:", result.error);
      toast({
        title: "Login Failed",
        description: result.error === "CredentialsSignin" ? "Invalid email or password." : result.error,
        variant: "destructive",
      });
      throw new Error(result.error);
    } else if (result?.ok) {
      toast({ title: "Login successful!" });
    }
  };

  const adminLogin = async (email: string, password: string) => {
    console.log("AuthProvider: Attempting NextAuth adminLogin for email:", email);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    console.log("AuthProvider AdminLogin: signIn result:", result);

    if (result?.error) {
      console.error("AuthProvider: NextAuth Admin Login failed:", result.error);
      toast({
        title: "Admin Login Failed",
        description: result.error === "CredentialsSignin" ? "Invalid admin credentials." : result.error,
        variant: "destructive",
      });
      throw new Error(result.error);
    } else if (result?.ok) {
      toast({ title: "Admin Login Attempt Successful!" });
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log("AuthProvider: Attempting registration for email:", email);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed.");
      toast({
        title: "Registration Successful",
        description: data.message || "Please log in with your new account.",
      });
      router.push("/login");
    } catch (error) {
      console.error("AuthProvider: Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    console.log("AuthProvider: Attempting NextAuth logout.");
    const CurerntPathisadmin = pathname.startsWith('/admin')
    await signOut({ redirect: false });
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    if (CurerntPathisadmin){
      router.push("/admin/login");
    } else {
       router.push("/");
    }
  };

  // This is the loading spinner logic that caused the error
  // Ensure `authPages` and `publicLandingPages` are in scope here
  if (isLoading && typeof window !== 'undefined' && !authPages.includes(pathname) && !publicLandingPages.some(p => pathname.startsWith(p)) ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user: appUser, login, register, adminLogin, logout, isLoading, isAdmin, status }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}