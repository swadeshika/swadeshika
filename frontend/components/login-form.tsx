"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/lib/auth-store"
import { useToast } from "@/hooks/use-toast"

/**
 * Login Form Component
 *
 * Purpose: Handles user authentication with role-based routing
 *
 * Features:
 * - Email and password authentication
 * - Role-based redirection (admin → /admin, customer → /account)
 * - Remember me functionality
 * - Loading states and error handling
 *
 * Demo Credentials:
 * - Admin: admin@swadeshika.com / admin123
 * - Customer: customer@example.com / customer123
 * - Any other email/password combination will be treated as a customer
 */
export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  // Show session expired message if redirected
  useEffect(() => {
    if (searchParams.get("sessionExpired") === "true") {
      // Small delay to ensure toast shows after render
      setTimeout(() => {
        toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
        })
      }, 100)
      
      
      // Clean up the URL helper without triggering a navigation/refresh
      // This ensures the Toast remains visible
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams, toast])
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // ---------------------------------------------------------
      // 1. Call Login Action
      // ---------------------------------------------------------
      // Calls the `login` function from `auth-store.ts`.
      // This sends a POST request to `/api/auth/login` with email & password.
      const { success, role, error } = await login(email, password)

      // ---------------------------------------------------------
      // 2. Handle Response
      // ---------------------------------------------------------
      if (success) {
        // A. SUCCESS:
        // - Show success toast
        // - Redirect user based on their role (Admin -> /admin, User -> /account)
        toast({
          title: "Login Successful",
          description: `Welcome back! Redirecting to ${role === "admin" ? "admin dashboard" : "your account"}...`,
        })

        if (role === "admin") {
          router.push("/admin")
        } else {
          router.push("/account")
        }
      } else {
        // B. FAILURE:
        // - Show error toast with the message from backend (e.g., "Invalid credentials")
        toast({
          title: "Login Failed",
          description: error || "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      // C. UNEXPECTED ERROR:
      // - Network issues or client-side crashes
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 cursor-pointer" />
                ) : (
                  <Eye className="h-4 w-4 cursor-pointer" />
                )}
                <span className="sr-only">Toggle password visibility</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                Remember me
              </Label>
            </div>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
