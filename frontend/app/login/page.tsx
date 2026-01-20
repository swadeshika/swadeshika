/**
 * Login Page
 *
 * User authentication page for existing customers to sign in.
 * Provides access to account features, order history, and saved addresses.
 *
 * Features:
 * - Email and password authentication
 * - Remember me functionality
 * - Password reset link
 * - Link to signup page for new users
 * - Social login options (future enhancement)
 *
 * Layout: Centered form with muted background
 * UX: Clean, focused design to minimize distractions during login
 */

import { Suspense } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-[#F5F1E8]">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Brand/Benefits Panel */}
            <div className="hidden md:flex rounded-2xl border-2 border-[#E8DCC8] bg-white p-8 flex-col justify-center">
              <h1 className="font-sans text-4xl font-extrabold text-[#6B4423] mb-4">Welcome Back</h1>
              <p className="text-[#8B6F47] mb-6">Sign in to access your orders, wishlist, and faster checkout.</p>
              <ul className="space-y-3 text-[#6B4423]">
                <li>• Track orders and manage addresses</li>
                <li>• Exclusive member deals</li>
                <li>• Faster, secure checkout</li>
              </ul>
            </div>

            {/* Form Panel */}
            <div className="rounded-2xl border-2 border-[#E8DCC8] bg-white p-6 md:p-8">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="font-sans text-3xl font-bold text-[#6B4423]">Sign In</h2>
                <p className="text-[#8B6F47] mt-1">Use your email and password to continue</p>
              </div>

              <Suspense fallback={<div>Loading form...</div>}>
                <LoginForm />
              </Suspense>

              <p className="text-center text-sm text-[#8B6F47] mt-6">
                Don't have an account?{" "}
                <Link href="/signup" className="text-[#2D5F3F] font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
