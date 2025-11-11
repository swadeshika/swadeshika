/**
 * Product Card Component
 *
 * Reusable card component for displaying product information in grids and lists.
 * Designed to match the Two Brothers India Shop aesthetic with clean layout,
 * prominent pricing, and clear CTAs.
 *
 * Features:
 * - Product image with badge overlay (Best Seller, Trending, etc.)
 * - Star rating and review count for social proof
 * - Member price vs regular price comparison
 * - Discount percentage calculation
 * - Size/variant selector dropdown
 * - Add to cart functionality with toast notification
 * - Hover effects for better interactivity
 *
 * The component integrates with Zustand cart store for state management
 * and uses shadcn/ui components for consistent styling.
 */

"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Star, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/lib/cart-store"
import { toast } from "@/hooks/use-toast"

// TypeScript interface defining all product card props
// Ensures type safety and clear documentation of expected data
interface ProductCardProps {
  id: number
  name: string
  slug?: string // Optional slug for SEO-friendly URLs
  price: number
  comparePrice?: number // Optional original price for showing discounts
  image: string
  badge?: string // Optional badge text (e.g., "Best Seller", "New")
  category: string
  rating?: number // Default 4.5 if not provided
  reviews?: number // Default 120 if not provided
  className?: string // Allow custom styling from parent
  sizes?: string[] // Optional array of size variants
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  image,
  badge,
  category,
  rating = 4.5,
  reviews = 120,
  className,
  sizes,
}: ProductCardProps) {
  // Access cart store's addItem function for adding products to cart
  const addItem = useCartStore((state) => state.addItem)
  const [isLoading, setIsLoading] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  /**
   * Handle add to cart click
   * Prevents navigation to product page, adds item to cart, and shows toast notification
   */
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent Link navigation when clicking button
    try {
      setIsLoading(true)
      const start = Date.now()
      addItem({ id, name, price, image, category })
      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart.`,
      })
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1200)
      // Ensure spinner is perceptible
      const elapsed = Date.now() - start
      if (elapsed < 500) {
        await new Promise((r) => setTimeout(r, 500 - elapsed))
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Detect list view (ProductGrid passes "flex-row" class)
  const isListView = className?.includes("flex-row")

  return (
    <Card
      className={cn(
        "group overflow-hidden bg-white rounded-xl border border-border/40 shadow-sm hover:shadow-lg transition-all duration-300",
        isListView ? "flex flex-col sm:flex-row items-start gap-5 p-4" : "",
        className,
      )}
    >
      {/* Product Image Section - Clickable link to product detail page */}
      <Link
        href={`/products/${slug || name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()}`}
        className={cn(
          "relative overflow-hidden bg-gray-50 rounded-lg cursor-pointer",
          isListView ? "w-[140px] h-[140px] flex-shrink-0" : "aspect-square"
        )}
      >
        {/* Product image with zoom effect on hover */}
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge overlay (Best Seller, Trending, etc.) */}
        {badge && (
          <Badge className="absolute top-3 left-3 bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1 text-xs shadow-md">
            {badge}
          </Badge>
        )}
      </Link>

      {/* Product Information Section */}
      <CardContent
        className={cn(
          "p-4 space-y-3 w-full",
          isListView ? "p-0 flex flex-col justify-between" : ""
        )}
      >
        {/* Product Name - Clickable with hover effect */}
        <Link
          href={`/products/${slug || name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()}`}
          className="cursor-pointer"
        >
          <h3 className="font-semibold text-base text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 leading-snug">
            {name}
          </h3>
        </Link>

        {/* Rating and Reviews - Social proof element */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-900">{rating}</span>
          </div>
          <span className="text-xs text-gray-500">({reviews} Reviews)</span>
        </div>

        {/* Pricing Section - Member price, compare price, and discount badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Member/Current Price - Highlighted in green */}
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 hover:bg-green-100 font-semibold px-2 py-0.5"
            >
              ₹{price}
            </Badge>
            {/* Original Price - Strikethrough to show savings */}
            {comparePrice && <span className="text-sm text-gray-500 line-through">₹{comparePrice}</span>}
          </div>
          {/* Discount Percentage Badge - Calculated dynamically */}
          {comparePrice && (
            <Badge variant="outline" className="text-xs border-green-600 text-green-700">
              {Math.round(((comparePrice - price) / comparePrice) * 100)}% OFF
            </Badge>
          )}
        </div>

        {/* Size Selector Dropdown - Only shown if sizes are provided */}
        {sizes && sizes.length > 0 && (
          <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        )}

        {/* Add to Cart Button - Primary CTA */}
        <div className={cn(isListView ? "flex justify-end mt-2" : "")}>
          <Button
            className={cn(
              "bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg h-11 cursor-pointer",
              isListView ? "w-auto px-6" : "w-full"
            )}
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
              </>
            ) : justAdded ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Added
              </>
            ) : (
              "ADD TO CART"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
