"use client"

import { X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

/**
 * AnnouncementBar Component
 *
 * Displays a dismissible promotional banner at the top of the site.
 * Used for highlighting special offers, sales, or important announcements.
 *
 * Features:
 * - Dismissible with close button
 * - Persists visibility state in component state
 * - Responsive text display (hides emoji on mobile)
 * - Prominent primary color background for visibility
 *
 * UX Considerations:
 * - Can be dismissed by users who don't want to see it
 * - Positioned at the very top for maximum visibility
 * - Clear, concise messaging with visual elements (emojis)
 */
export function AnnouncementBar() {
  // Track visibility state - when dismissed, component returns null
  const [isVisible, setIsVisible] = useState(true)

  // Don't render anything if user has dismissed the banner
  if (!isVisible) return null

  return (
    <div className="relative bg-primary text-white py-2.5 px-4">
      <div className="container mx-auto flex items-center justify-center gap-4 text-sm font-medium">
        {/* Decorative emoji - hidden on small screens to save space */}
        <span className="hidden sm:inline">🎉</span>

        {/* Main announcement message with bold emphasis on key text */}
        <p className="text-center">
          <span className="font-bold">Diwali Dhamaka!</span> Biggest Sale of the Year 🪔 - Limited Stock | Up to 25% OFF
          + Free Ghee Sample
        </p>

        {/* Close button - positioned absolutely in top right */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 h-6 w-6 text-white hover:bg-white/20"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
