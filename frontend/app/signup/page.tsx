import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SignupForm } from "@/components/signup-form"

/**
 * Signup/Registration Page
 *
 * New user registration page for creating a Swadeshika account.
 * Collects essential information to set up customer profile.
 *
 * Features:
 * - Email and password registration
 * - Name and contact information collection
 * - Terms and conditions acceptance
 * - Email verification (future enhancement)
 * - Link to login page for existing users
 *
 * Layout: Centered form with muted background
 * UX: Simple, streamlined registration process to reduce friction
 */

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-[#F5F1E8]">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Brand/Benefits Panel */}
            <div className="hidden md:flex rounded-2xl border-2 border-[#E8DCC8] bg-white p-8 flex-col justify-center">
              <h1 className="font-sans text-4xl font-extrabold text-[#6B4423] mb-4">Join Swadeshika</h1>
              <p className="text-[#8B6F47] mb-6">Create your account for a better shopping experience.</p>
              <ul className="space-y-3 text-[#6B4423]">
                <li>• Save your addresses and track orders</li>
                <li>• Access member-only offers</li>
                <li>• Faster checkout next time</li>
              </ul>
            </div>

            {/* Form Panel */}
            <div className="rounded-2xl border-2 border-[#E8DCC8] bg-white p-6 md:p-8">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="font-sans text-3xl font-bold text-[#6B4423]">Create Account</h2>
                <p className="text-[#8B6F47] mt-1">It only takes a minute</p>
              </div>

              <SignupForm />

              <p className="text-center text-sm text-[#8B6F47] mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-[#2D5F3F] font-semibold hover:underline">
                  Sign in
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
