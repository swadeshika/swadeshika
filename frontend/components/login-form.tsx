"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  const { toast } = useToast()
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { success, role, error } = await login(email, password)

      if (success) {
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
        toast({
          title: "Login Failed",
          description: error || "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
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
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Demo: admin@swadeshika.com / admin123 (Admin) or customer@example.com / customer123 (Customer)
        </p>
      </CardHeader>
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
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
