/**
 * Breadcrumb Navigation Component
 *
 * Displays hierarchical navigation path to help users understand their current location
 * in the site structure and easily navigate back to parent pages.
 *
 * Features:
 * - Shows navigation path (Home > Shop > Category)
 * - Clickable links for easy navigation
 * - Current page highlighted
 * - Responsive design
 *
 * Usage:
 * <Breadcrumb currentCategory="ghee" />
 *
 * Props:
 * @param currentCategory - Optional category slug to display in breadcrumb
 */

import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbProps {
  currentCategory?: string
}

// Category display names mapping
const categoryNames: Record<string, string> = {
  ghee: "Ghee",
  spices: "Spices",
  "dry-fruits": "Dry Fruits",
  oils: "Oils",
  grains: "Grains & Pulses",
  honey: "Honey & Sweeteners",
}

export function Breadcrumb({ currentCategory }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      {/* Home Link */}
      <Link href="/" className="hover:text-foreground transition-colors cursor-pointer">
        Home
      </Link>

      <ChevronRight className="h-4 w-4" />

      {/* Shop Link */}
      <Link href="/shop" className="hover:text-foreground transition-colors cursor-pointer">
        Shop
      </Link>

      {/* Current Category (if provided) */}
      {currentCategory && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{categoryNames[currentCategory] || currentCategory}</span>
        </>
      )}
    </nav>
  )
}
