"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useAuthStore } from "@/lib/auth-store"
import { useToast } from "@/hooks/use-toast"

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const register = useAuthStore((state) => state.register)
  const [isLoading, setIsLoading] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords are the same.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const { success, role, error } = await register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.phone
      )

      if (success) {
        toast({
          title: "Account Created!",
          description: "Welcome to Swadeshika. Redirecting...",
        })
        
        // Brief delay to show toast
        setTimeout(() => {
          if (role === "admin") {
            router.push("/admin")
          } else {
            router.push("/account")
          }
        }, 1000)
      } else {
        toast({
          title: "Registration Failed",
          description: error || "Could not create account. Please try again or use a different email.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
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
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              placeholder="John Doe" 
              value={formData.fullName}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="your@email.com" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+91</span>
              <Input 
                id="phone" 
                type="tel" 
                maxLength={10}
                className="pl-12"
                placeholder="9876543210" 
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                  setFormData((prev) => ({ ...prev, phone: val }));
                }}
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Create a password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Must be at least 8 characters and include upper, lower, number and special character.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="Confirm your password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="terms" required />
            <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
