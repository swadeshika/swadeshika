"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { newsletterService } from "@/lib/services/newsletterService"
import { useToast } from "@/hooks/use-toast"
import { Category, productService } from "@/lib/services/productService"

/**
 * Footer Navigation Links Configuration
 */
const footerLinks = {

  // Company information pages
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
    // { name: "Careers", href: "/careers" },
  ],
  // Customer support resources
  support: [
    { name: "Track Order", href: "/track-order" },
    { name: "Shipping Policy", href: "/policies/shipping" },
    { name: "Return Policy", href: "/policies/returns" },
    { name: "FAQs", href: "/faqs" },
  ],
  // Legal and policy pages
  legal: [
    { name: "Privacy Policy", href: "/policies/privacy" },
    { name: "Terms of Service", href: "/policies/terms" },
    { name: "Refund Policy", href: "/policies/refund" },
  ],
}

/**
 * SiteFooter Component
 *
 * Comprehensive footer with multiple sections:
 * - Brand information and newsletter signup
 * - Navigation links organized by category
 * - Contact information
 * - Social media links
 * - Legal links and copyright
 *
 * Layout:
 * - Responsive grid that adapts from 1 to 5 columns
 * - Brand section spans 2 columns on large screens
 * - Clear visual hierarchy with borders and spacing
 */
export function SiteFooter() {
  const [email, setEmail] = useState("")
  const [subscribing, setSubscribing] = useState(false)
  const [visitorCount, setVisitorCount] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Track visitor and get count on mount
    const trackAndFetchVisitors = async () => {
      try {
        // Track visit
        const response = await api.post('/analytics/visitors/track', { path: window.location.pathname })
        if (response.data.success) {
          setVisitorCount(response.data.data.count)
        }
      } catch (error) {
        console.error("Failed to track visitor", error)
        // Fallback to just getting count if tracking fails
        try {
          const countRes = await api.get('/analytics/visitors/count')
          if (countRes.data.success) {
            setVisitorCount(countRes.data.data.count)
          }
        } catch (e) { }
      }
    }

    const fetchCategories = async () => {
      try {
        const cats = await productService.getAllCategories()
        if (cats) {
          // Filter only base categories (where parent_id is null or undefined)
          const baseCats = cats.filter(c => !c.parent_id)
          // Sort by product_count (descending) and take top 4
          const topCats = baseCats
            .sort((a, b) => (b.product_count || 0) - (a.product_count || 0))
            .slice(0, 4)

          setCategories(topCats)
        }
      } catch (error) {
        console.error("Failed to fetch footer categories", error)
      }
    }

    trackAndFetchVisitors()
    fetchCategories()
  }, [])

  const handleSubscribe = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" })
      return
    }

    setSubscribing(true)
    try {
      const response = await newsletterService.subscribe(email)
      if (response.data.success) {
        toast({ title: "Subscribed!", description: response.data.message })
        setEmail("")
      }
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message || "Could not subscribe. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer grid - responsive from 1 to 5 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section - spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            {/* Logo and brand name */}
            <Link href="/" className="flex items-center gap-2 mb-4 cursor-pointer">
              <img src="/logo.png" alt="logo" className=" w-[180px]" />
            </Link>

            {/* Brand description */}
            <p className="text-muted-foreground mb-6 max-w-sm">
              Bringing you the finest quality ghee, spices, and dry fruits. Traditional authenticity meets modern
              convenience.
            </p>

            {/* Newsletter subscription form */}
            {/* <div className="space-y-2">
              <h3 className="font-semibold">Subscribe to our newsletter</h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="max-w-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={handleSubscribe} disabled={subscribing} className="cursor-pointer">
                  {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                </Button>
              </div>
            </div> */}

            {/* Social media links with icons */}
            <div className="flex gap-4 mt-6">
              <Link href="https://www.facebook.com/share/19ZcPQy7N5/" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://www.instagram.com/swadeshika.official?igsh=MzU3YTd0aWxkMHZy" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              {/* <Link href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link> */}
            </div>
          </div>

          {/* Shop links column */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/shop/${cat.slug}`}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links column */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links column */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section with contact info and legal links */}
        <div className="mt-12 pt-8 border-t">
          {/* Contact information grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Call Us</p>
                <p className="text-muted-foreground">+91 7300039429, +91 8150976411</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Email Us</p>
                <p className="text-muted-foreground">official.swadeshika@gmail.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 min-w-[24px] text-primary mt-0.5" />
              <div>
                <p className="font-medium">Visit Us</p>
                <p className="text-muted-foreground">98, 99 Swavalamban Kendra, Karni Nagar, Kudi - Madhuban Main Link Road, Near Kisan Gas Godam, Jodhpur</p>
              </div>
            </div>
          </div>

          {/* Legal links - horizontal list */}
          <div className="flex flex-wrap gap-6 mb-6 justify-center">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Copyright notice with dynamic year */}
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Swadeshika. All rights reserved. |
            👥 Visitors: <span id="visitorCount">{visitorCount !== null ? visitorCount.toLocaleString() : '...'}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}