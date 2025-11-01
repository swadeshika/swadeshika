"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/cart-store"
import { ProductCard } from "@/components/product-card"

// Mock wishlist data
const initialWishlistItems = [
  {
    id: "1",
    productId: "1",
    name: "Pure Desi Cow Ghee",
    slug: "pure-desi-cow-ghee",
    price: 850,
    comparePrice: 1000,
    image: "/golden-ghee-in-glass-jar.jpg",
    badge: "Bestseller",
    category: "Ghee",
    inStock: true,
  },
  {
    id: "3",
    productId: "3",
    name: "Premium Kashmiri Almonds",
    slug: "premium-kashmiri-almonds",
    price: 650,
    image: "/kashmiri-almonds.jpg",
    badge: "Premium",
    category: "Dry Fruits",
    inStock: true,
  },
]

export function WishlistContent() {
  const [wishlistItems, setWishlistItems] = useState(initialWishlistItems)
  const addItem = useCartStore((state) => state.addItem)

  const removeItem = (id: string) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id))
  }

  if (wishlistItems.length === 0) {
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
      {wishlistItems.map((item) => (
        <div key={item.id} className="relative">
          <ProductCard
            id={Number(item.productId)}
            name={item.name}
            slug={item.slug}
            price={item.price}
            comparePrice={item.comparePrice}
            image={item.image}
            badge={item.badge}
            category={item.category}
          />
          <Button
            aria-label="Remove from wishlist"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 hover:bg-[#F5F1E8]"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
