"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { authService } from "@/lib/authService"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

export function ForgotPasswordForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await authService.forgotPassword(email)
      setIsSubmitted(true)
      toast({
        title: "Reset link sent",
        description: "Check your email for instructions to reset your password.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="w-full border-none shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-3 pb-6 pt-8 px-8 text-center">
          <CardTitle className="text-2xl font-bold text-[#6B4423]">Check your email</CardTitle>
          <CardDescription className="text-base text-[#8B6F47]">
            We have sent password reset instructions to <br />
            <span className="font-semibold text-[#2D5F3F]">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8">
          <p className="text-sm leading-relaxed text-[#8B6F47]">
            Click the link in the email to reset your password. If you don't see the email, check your spam folder.
          </p>
          <Button variant="outline" className="w-full h-11 border-2 border-[#E8DCC8] font-medium text-[#6B4423] hover:bg-[#F5F1E8] hover:text-[#2D5F3F]" onClick={() => setIsSubmitted(false)}>
            Value typo? Try again
          </Button>
          <Link href="/login" className="block text-center text-sm font-semibold text-[#2D5F3F] hover:underline">
            Back to Sign In
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-none shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-3 pb-6 pt-8 px-8 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-[#6B4423]">Forgot Password</CardTitle>
        <CardDescription className="text-base text-[#8B6F47] max-w-sm mx-auto">
          Enter your email address and we'll send you instructions to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wide text-[#6B4423]">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 border-2 border-[#E8DCC8] px-4 text-lg bg-white/50 transition-colors focus-visible:border-[#2D5F3F] focus-visible:ring-0"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-bold bg-[#2D5F3F] hover:bg-[#234A32] text-white shadow-md transition-all hover:shadow-lg" 
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="pt-2 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-sm font-medium text-[#8B6F47] transition-colors hover:text-[#2D5F3F] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
