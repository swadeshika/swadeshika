"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * ScrollToTop Component
 *
 * Automatically scrolls the page to the top when navigating between routes.
 * This improves UX by ensuring users start at the top of each new page.
 *
 * Implementation:
 * - Uses Next.js usePathname hook to detect route changes
 * - Triggers smooth scroll animation on pathname change
 * - Renders nothing (null) - purely functional component
 *
 * Why this is needed:
 * - By default, Next.js may preserve scroll position between routes
 * - Users expect to start at the top when visiting a new page
 * - Smooth scrolling provides better visual feedback than instant jump
 */
export function ScrollToTop() {
  // Get current pathname - changes whenever user navigates
  const pathname = usePathname()

  useEffect(() => {
    // Scroll to top smoothly whenever the route changes
    // behavior: 'smooth' provides animated scrolling instead of instant jump
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [pathname]) // Re-run effect whenever pathname changes

  // This component doesn't render anything - it's purely for side effects
  return null
}
