"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

/**
 * CartButton Component
 *
 * Displays a shopping cart icon with item count badge in the header.
 * Provides quick access to the cart and visual feedback on cart contents.
 *
 * Features:
 * - Real-time cart item count from Zustand store
 * - Badge indicator showing number of items
 * - Links to cart page when clicked
 * - Accessible with screen reader text
 *
 * State Management:
 * - Subscribes to cart store for live updates
 * - Automatically re-renders when cart changes
 * - Uses Zustand selector for optimal performance
 */
export function CartButton() {
  // Subscribe to cart store - component re-renders when total items changes
  // Using selector pattern for performance (only subscribes to getTotalItems)
  const totalItems = useCartStore((state) => state.getTotalItems())
  const fetchCart = useCartStore((state) => state.fetchCart)
  const [mounted, setMounted] = useState(false)

  // Avoid SSR/client mismatch by rendering dynamic badge only after mount
  useEffect(() => {
    setMounted(true)
    fetchCart()
  }, [fetchCart])

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href="/cart">
        {/* Shopping cart icon */}
        <ShoppingCart className="h-5 w-5" />

        {/* Badge showing item count - render only after mount to prevent hydration mismatch */}
        {mounted && totalItems > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            <span suppressHydrationWarning>{totalItems}</span>
          </Badge>
        )}

        {/* Screen reader text for accessibility */}
        <span className="sr-only" suppressHydrationWarning>
          Shopping cart with {totalItems} items
        </span>
      </Link>
    </Button>
  )
}
