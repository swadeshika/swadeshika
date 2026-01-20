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
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, Loader2, Check, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/lib/cart-store"
import { useWishlistStore } from "@/lib/wishlist-store"
import { useAuthStore } from "@/lib/auth-store"
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
  sizes?: string[] // Optional array of size variants (deprecated - use variants)
  variants?: Array<{id?: number, variant_name: string, price: number, compare_price?: number, stock_quantity?: number}> // Full variant objects with pricing
  showWishlistAction?: boolean // Optional logic to hide wishlist button (default: true)
  onAddToCart?: (id: number) => void // Optional custom add to cart handler
  inStock?: boolean
  stockQuantity?: number
  hasVariants?: boolean // Whether product has variants that need to be selected
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
  variants,
  showWishlistAction = true,
  onAddToCart,
  inStock = true,
  stockQuantity,
  hasVariants = false,
}: ProductCardProps) {
  // State for selected variant and dynamic pricing
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [displayPrice, setDisplayPrice] = useState(price)
  const [displayComparePrice, setDisplayComparePrice] = useState(comparePrice)

  // Initialize with first IN-STOCK variant if available, otherwise first variant
  useEffect(() => {
    if (variants && variants.length > 0 && !selectedVariant) {
      // Try to find first in-stock variant
      const firstInStock = variants.find(v => (v.stock_quantity ?? 0) > 0)
      const variantToSelect = firstInStock || variants[0]
      
      setSelectedVariant(variantToSelect)
      setDisplayPrice(variantToSelect.price)
      setDisplayComparePrice(variantToSelect.compare_price)
    }
  }, [variants])

  // Handle variant selection change
  const handleVariantChange = (variantName: string) => {
    const variant = variants?.find(v => v.variant_name === variantName)
    if (variant) {
      setSelectedVariant(variant)
      setDisplayPrice(variant.price)
      setDisplayComparePrice(variant.compare_price)
    }
  }

  // Access cart store's addItem function for adding products to cart
  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)
  const router = useRouter()

  // Access wishlist store
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)

  const inWishlist = isInWishlist(id)
  
  // Calculate stock status dynamically based on selection
  const isOutOfStock = hasVariants && selectedVariant 
    ? (selectedVariant.stock_quantity !== undefined && selectedVariant.stock_quantity <= 0)
    : (inStock === false || (stockQuantity !== undefined && stockQuantity <= 0))

  // NEW: Check stock against cart quantity for button disable state
  const maxStockForButton = hasVariants && selectedVariant 
    ? (selectedVariant.stock_quantity ?? 0)
    : (stockQuantity ?? 0)

  const existingCartItemForButton = cartItems.find(item => 
    item.productId === id && 
    item.variantId === (selectedVariant?.id || null)
  )
  const currentCartQtyForButton = existingCartItemForButton ? existingCartItemForButton.quantity : 0
  
  // Disable if adding 1 more would exceed limit
  const isStockLimitReached = !isOutOfStock && (currentCartQtyForButton + 1 > maxStockForButton)

  /**
   * Handle add to cart click
   * If product has variants, redirect to product detail page
   * Otherwise, add item to cart and show toast notification
   */
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent Link navigation when clicking button
    
    // If product has variants but none is selected, show error
    if (hasVariants && variants && variants.length > 0 && !selectedVariant) {
      toast({
        title: "Please select a variant",
        description: "Choose a size/variant before adding to cart",
        variant: "destructive"
      })
      return
    }

    // Double check just in case, though button should be disabled
    if (isStockLimitReached) {
       toast({
        title: "Stock Limit Reached",
        description: `You already have ${currentCartQtyForButton} in cart. Max available: ${maxStockForButton}`,
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsLoading(true)
      const start = Date.now()

      if (onAddToCart) {
        onAddToCart(id)
      } else {
        // Prepare cart item with variant information if applicable
        const cartItem: any = {
          id,
          productId: id,
          name,
          price: displayPrice, // Use the variant-specific price
          image,
          category
        }

        // Add variant information if a variant is selected
        if (selectedVariant) {
          cartItem.variantId = selectedVariant.id
          cartItem.variantName = selectedVariant.variant_name
          cartItem.variantSku = selectedVariant.sku
        }

        addItem(cartItem)
        toast({
          title: "Added to cart",
          description: selectedVariant 
            ? `${name} (${selectedVariant.variant_name}) has been added to your cart.`
            : `${name} has been added to your cart.`,
        })
      }

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

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to manage your wishlist",
        variant: "destructive",
      })
      return
    }

    try {
      setIsWishlistLoading(true)
      if (inWishlist) {
        await removeFromWishlist(id)
      } else {
        await addToWishlist(id)
      }
    } finally {
      setIsWishlistLoading(false)
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
          "relative overflow-hidden bg-gray-50 rounded-lg cursor-pointer block",
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
        {isOutOfStock ? (
             <Badge className="absolute top-3 left-3 bg-gray-500 hover:bg-gray-600 text-white font-medium px-3 py-1 text-xs shadow-md">
               Out of Stock
             </Badge>
        ) : badge && (
          <Badge className="absolute top-3 left-3 bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1 text-xs shadow-md">
            {badge}
          </Badge>
        )}

        {/* Wishlist Button */}
        {showWishlistAction && (
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10",
              inWishlist
                ? "bg-white text-red-500 shadow-md"
                : "bg-white/60 text-gray-600 hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100"
            )}
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            disabled={isWishlistLoading}
          >
            {isWishlistLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
            )}
          </button>
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
              ₹{displayPrice}
            </Badge>
            {/* Original Price - Strikethrough to show savings */}
            {displayComparePrice && <span className="text-sm text-gray-500 line-through">₹{displayComparePrice}</span>}
          </div>
          {/* Discount Percentage Badge - Calculated dynamically */}
          {displayComparePrice && (
            <Badge variant="outline" className="text-xs border-green-600 text-green-700">
              {Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)}% OFF
            </Badge>
          )}
        </div>

        {/* Size/Variant Selector Dropdown - Only shown if variants or sizes are provided */}
        {variants && variants.length > 0 ? (
          <select 
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white cursor-pointer"
            value={selectedVariant?.variant_name || ''}
            onChange={(e) => handleVariantChange(e.target.value)}
          >
            {variants.map((variant) => {
              const isVariantOutOfStock = variant.stock_quantity !== undefined && variant.stock_quantity <= 0;
              return (
              <option 
                key={variant.id || variant.variant_name} 
                value={variant.variant_name} 
                className={isVariantOutOfStock ? "text-gray-400 bg-gray-50" : ""}
                disabled={isVariantOutOfStock}
              >
                {variant.variant_name} {isVariantOutOfStock ? "(Out of Stock)" : ""}
              </option>
              )
            })}
          </select>
        ) : sizes && sizes.length > 0 ? (
          <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        ) : null}

        {/* Add to Cart Button - Primary CTA */}
        <div className={cn(isListView ? "flex justify-end mt-2" : "")}>
          <Button
            className={cn(
              "bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg h-11 cursor-pointer",
              isListView ? "w-auto px-6" : "w-full",
              (isOutOfStock || isStockLimitReached) && "bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-70"
            )}
            onClick={(isOutOfStock || isStockLimitReached) ? (e) => e.preventDefault() : handleAddToCart}
            disabled={isLoading || isOutOfStock || isStockLimitReached}
          >
            {isOutOfStock ? (
               "OUT OF STOCK"
            ) : isStockLimitReached ? (
               "LIMIT REACHED"
            ) : isLoading ? (
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
