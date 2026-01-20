"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Star,
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
  Share2,
  Check,
  Edit3,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/product-card"
import { useCartStore } from "@/lib/cart-store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Review } from "@/lib/products-data"

/**
 * Product Detail Client Component
 *
 * Displays comprehensive product information with interactive features.
 * Uses Poppins font throughout for consistent typography.
 *
 * Features:
 * - Image gallery with thumbnail navigation
 * - Quantity selector with add to cart functionality
 * - Wishlist toggle
 * - Product specifications and features tabs
 * - Customer reviews section
 * - Related products recommendations
 * - Trust badges (free shipping, authentic, returns)
 *
 * Color Scheme: Brown, Green, Orange for organic/natural brand feel
 */

interface Product {
  id: number
  name: string
  price: number
  comparePrice?: number
  images: string[]
  badge?: string
  category: string
  description: string
  shortDescription: string
  features: string[]
  specifications: Record<string, string>
  inStock: boolean
  stockQuantity?: number // Added stockQuantity
  rating: number
  reviewCount: number
}

interface RelatedProduct {
  id: number
  name: string
  price: number
  comparePrice?: number
  image: string
  badge?: string
  category: string
}

interface ProductDetailClientProps {
  product: Product
  relatedProducts: RelatedProduct[]
  reviews: Review[]
}

export function ProductDetailClient({ product, relatedProducts, reviews }: ProductDetailClientProps) {
  // State management for interactive features
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Cart store for add to cart functionality
  const addItem = useCartStore((state) => state.addItem)

  /**
   * Handle quantity changes with validation
   * Ensures quantity never goes below 1 and doesn't exceed stock
   */
  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newValue = prev + delta
      
      // Minimum quantity check
      if (newValue < 1) return 1

      // Maximum quantity check (stock availability)
      if (product.stockQuantity !== undefined && newValue > product.stockQuantity) {
        toast.warning(`Only ${product.stockQuantity} items available in stock`)
        return prev
      }

      return newValue
    })
  }

  /**
   * Add product to cart with selected quantity
   * Shows success toast notification
   */
  const handleAddToCart = async () => {
    try {
      setIsAdding(true)
      await addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
      }, quantity)
      toast.success(`${product.name} added to cart!`)
    } finally {
      setIsAdding(false)
    }
  }

  /**
   * Toggle wishlist status
   * Shows appropriate toast notification
   */
  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist")
  }

  /**
   * Share product functionality
   * Uses Web Share API if available, falls back to clipboard
   */
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  // Calculate discount percentage for display
  const discountPercentage = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div className="bg-background font-sans">
      {/* Breadcrumb Navigation */}
      <div className="border-b bg-[#F5F1E8]">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-[#6B4423]">
            <Link href="/" className="hover:text-[#2D5F3F] transition-colors cursor-pointer">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#2D5F3F] transition-colors cursor-pointer">
              Shop
            </Link>
            <span>/</span>
            <Link href={`/shop/${product.category.toLowerCase()}`} className="hover:text-[#2D5F3F] transition-colors cursor-pointer">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-[#2D5F3F] font-semibold">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Details Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image Display */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F5F1E8] shadow-xl border-2 border-[#E8DCC8]">
                <img
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
                {product.badge && (
                  <Badge className="absolute top-6 left-6 bg-[#FF7E00] text-white shadow-lg text-base px-4 py-2 border-0">
                    {product.badge}
                  </Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-xl bg-[#F5F1E8] border-2 transition-all duration-200 cursor-pointer",
                      selectedImage === index
                        ? "border-[#2D5F3F] shadow-md scale-105"
                        : "border-[#E8DCC8] hover:border-[#2D5F3F]/50",
                    )}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-[#8B6F47] font-semibold mb-2 uppercase tracking-wide">{product.category}</p>
                <h1 className="font-sans text-4xl lg:text-5xl font-bold mb-4 text-balance text-[#6B4423]">
                  {product.name}
                </h1>

                {/* Rating Display */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < Math.floor(product.rating) ? "fill-[#FF7E00] text-[#FF7E00]" : "text-gray-300",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-[#6B4423]">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-bold text-[#2D5F3F]">₹{product.price}</span>
                  {product.comparePrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">₹{product.comparePrice}</span>
                      <Badge className="text-base px-3 py-1 bg-[#FF7E00] text-white border-0">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>

                <p className="text-lg text-[#6B4423] leading-relaxed">{product.shortDescription}</p>
              </div>

              <Separator className="bg-[#E8DCC8]" />

              {/* Quantity Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-lg text-[#6B4423]">Quantity:</span>
                    <div className="flex items-center border-2 border-[#E8DCC8] rounded-xl overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="h-12 w-12 rounded-none hover:bg-[#2D5F3F]/10 cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-16 text-center font-bold text-lg text-[#6B4423]">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={product.stockQuantity !== undefined && quantity >= product.stockQuantity}
                      className="h-12 w-12 rounded-none hover:bg-[#2D5F3F]/10 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Stock Status Indicator */}
                <div className="flex items-center gap-2">
                  {product.inStock ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-[#2D5F3F]" />
                      <span className="text-sm font-medium text-[#2D5F3F]">In Stock</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-red-600">Out of Stock</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1 h-14 text-base font-semibold group bg-[#2D5F3F] hover:bg-[#234A32] text-white cursor-pointer"
                  disabled={!product.inStock || isAdding}
                  onClick={handleAddToCart}
                >
                  {isAdding ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  )}
                  {isAdding ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    "h-14 w-14 border-2 cursor-pointer",
                    isWishlisted ? "bg-red-50 border-red-300" : "border-[#E8DCC8] hover:border-[#FF7E00]",
                  )}
                  onClick={handleWishlistToggle}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-red-500 text-red-500")} />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-14 border-2 border-[#E8DCC8] hover:border-[#FF7E00] bg-transparent cursor-pointer"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-[#F5F1E8]">
                  <Truck className="h-6 w-6 text-[#2D5F3F]" />
                  <span className="text-xs font-semibold text-[#6B4423]">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-[#F5F1E8]">
                  <ShieldCheck className="h-6 w-6 text-[#2D5F3F]" />
                  <span className="text-xs font-semibold text-[#6B4423]">100% Authentic</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-[#F5F1E8]">
                  <RotateCcw className="h-6 w-6 text-[#2D5F3F]" />
                  <span className="text-xs font-semibold text-[#6B4423]">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="py-12 bg-[#F5F1E8]">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-14 bg-white border-2 border-[#E8DCC8]">
              <TabsTrigger
                value="features"
                className="text-base font-semibold data-[state=active]:bg-[#2D5F3F] data-[state=active]:text-white cursor-pointer"
              >
                Features
              </TabsTrigger>
              <TabsTrigger
                value="description"
                className="text-base font-semibold data-[state=active]:bg-[#2D5F3F] data-[state=active]:text-white cursor-pointer"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="text-base font-semibold data-[state=active]:bg-[#2D5F3F] data-[state=active]:text-white cursor-pointer"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="text-base font-semibold data-[state=active]:bg-[#2D5F3F] data-[state=active]:text-white cursor-pointer"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            {/* Features Tab */}
            <TabsContent value="features" className="mt-8">
              <Card className="border-2 border-[#E8DCC8] shadow-lg">
                <CardContent className="p-8">
                  <h3 className="font-sans text-2xl font-bold mb-6 text-[#6B4423]">Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-5 w-5 rounded-full bg-[#2D5F3F]/10 flex items-center justify-center">
                            <Check className="h-3 w-3 text-[#2D5F3F]" />
                          </div>
                        </div>
                        <span className="text-base leading-relaxed text-[#6B4423]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="mt-8">
              <Card className="border-2 border-[#E8DCC8] shadow-lg">
                <CardContent className="p-8">
                  <h3 className="font-sans text-2xl font-bold mb-6 text-[#6B4423]">Product Description</h3>
                  <div className="prose max-w-none text-[#6B4423]">
                    <p className="leading-relaxed whitespace-pre-line">{product.description}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="mt-8">
              <Card className="border-2 border-[#E8DCC8] shadow-lg">
                <CardContent className="p-8">
                  <h3 className="font-sans text-2xl font-bold mb-6 text-[#6B4423]">Product Specifications</h3>
                  <div className="space-y-4">
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-4 border-b border-[#E8DCC8] last:border-0"
                      >
                        <span className="font-semibold text-base text-[#6B4423]">{key}</span>
                        <span className="text-base text-[#8B6F47]">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-8">
              <div className="space-y-8">
                <Card className="border-2 border-[#E8DCC8] shadow-lg">
                  <CardContent className="p-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Rating Summary */}
                      <div className="space-y-6">
                        <div className="text-center p-6 bg-[#F5F1E8] rounded-xl">
                          <div className="text-5xl font-bold mb-2 text-[#6B4423]">{product.rating}</div>
                          <div className="flex items-center justify-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-5 w-5",
                                  i < Math.floor(product.rating) ? "fill-[#FF7E00] text-[#FF7E00]" : "text-gray-300",
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-[#8B6F47]">Based on {product.reviewCount} reviews</p>
                        </div>

                      </div>

                      {/* Reviews List */}
                      <div className="lg:col-span-2 space-y-6">
                        <h3 className="font-sans text-2xl font-bold text-[#6B4423]">Customer Reviews</h3>
                        {reviews.length > 0 ? (
                          reviews.map((review) => (
                            <div key={review.id} className="border-b border-[#E8DCC8] pb-6 last:border-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-semibold text-lg text-[#6B4423]">{review.userName}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={cn(
                                            "h-4 w-4",
                                            i < review.rating ? "fill-[#FF7E00] text-[#FF7E00]" : "text-gray-300",
                                          )}
                                        />
                                      ))}
                                    </div>
                                    {review.verified && (
                                      <span className="text-xs text-[#2D5F3F] font-medium bg-[#2D5F3F]/10 px-2 py-1 rounded">
                                        Verified Purchase
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm text-[#8B6F47]">{review.date}</span>
                              </div>
                              <h4 className="font-semibold text-base mb-2 text-[#6B4423]">{review.title}</h4>
                              <p className="text-[#6B4423] leading-relaxed">{review.comment}</p>
                              {review.helpful > 0 && (
                                <p className="text-sm text-[#8B6F47] mt-3">
                                  {review.helpful} people found this helpful
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-[#8B6F47] text-lg">Reviews coming soon...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>


              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#FF7E00] text-white border-0">You May Also Like</Badge>
            <h2 className="font-sans text-3xl lg:text-4xl font-bold text-[#6B4423]">Related Products</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} {...relatedProduct} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
