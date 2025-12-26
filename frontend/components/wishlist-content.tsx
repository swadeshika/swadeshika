"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Heart, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { useWishlistStore } from "@/lib/wishlist-store"
import { useAuthStore } from "@/lib/auth-store"

export function WishlistContent() {
  const { items, isLoading, fetchWishlist, removeFromWishlist, moveToCart } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Heart className="h-24 w-24 text-muted-foreground/30 mb-4" />
        <h2 className="font-serif text-2xl font-bold mb-2 text-[#6B4423]">Please Log In</h2>
        <p className="text-[#8B6F47] mb-6">You need to be logged in to view your wishlist</p>
        <Button asChild className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[#2D5F3F]" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Heart className="h-24 w-24 text-[#2D5F3F]/70 mb-4" />
        <h2 className="font-serif text-2xl font-bold mb-2 text-[#6B4423]">Your wishlist is empty</h2>
        <p className="text-[#8B6F47] mb-6">Save your favorite products for later</p>
        <Button asChild className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">
          <Link href="/shop">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <div key={item.wishlist_id} className="relative group">
          <ProductCard
            id={item.product_id}
            name={item.name}
            slug={item.slug}
            price={item.price}
            comparePrice={item.compare_price || undefined}
            image={item.image_url}
            // badge={item.badge}
            category=""
            showWishlistAction={false}
            onAddToCart={() => moveToCart(item)}
          />
          <Button
            aria-label="Remove from wishlist"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white hover:text-red-500 shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault()
              removeFromWishlist(item.product_id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
