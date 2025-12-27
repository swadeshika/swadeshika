"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Heart, Share2, Star, Truck, ShieldCheck, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import useEmblaCarousel from 'embla-carousel-react'
import { productService, Product } from "@/lib/services/productService"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductDetailsProps {
  slug: string
}



export function ProductDetails({ slug }: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | number>("")
  const [quantity, setQuantity] = useState(1)
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: true
  })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await productService.getProduct(slug)
        setProduct(data)
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch product:", error)
        toast.error("Failed to load product details")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  const currentVariant = product?.variants?.find((v: any) => v.id === selectedVariant) || { price: product?.price }

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', () => {
        setCurrentSlide(emblaApi.selectedScrollSnap())
      })
    }
  }, [emblaApi])

  const scrollTo = (index: number) => {
    emblaApi?.scrollTo(index)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors cursor-pointer">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground transition-colors cursor-pointer">
          Shop
        </Link>
        <span>/</span>
        <Link href={`/shop/${product.category.toLowerCase()}`} className="hover:text-foreground transition-colors cursor-pointer">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      {/* Back button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/shop" className="cursor-pointer">
          <ChevronLeft className="h-4 w-4" />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to Shop</span>
        </Link>
      </Button>

      {loading ? (
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-12">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : !product ? (
        <div className="text-center py-12">
           <h2 className="text-2xl font-bold">Product Not Found</h2>
           <Button asChild className="mt-4"><Link href="/shop">Back to Shop</Link></Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              className="object-cover w-full h-full"
            />
            {product.badge && <Badge className="absolute top-4 left-4">{product.badge}</Badge>}
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {product.images.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square overflow-hidden rounded-md bg-muted border-2 transition-colors cursor-pointer ${
                  selectedImage === index ? "border-primary" : "border-transparent"
                }`}
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

        {/* Details */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 sm:h-5 w-4 sm:w-5 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-bold">₹{currentVariant.price}</span>
              {product.comparePrice && (
                <>
                  <span className="text-lg sm:text-xl text-muted-foreground line-through">₹{product.comparePrice}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Save {Math.round(((product.comparePrice - currentVariant.price) / product.comparePrice) * 100)}%
                  </Badge>
                </>
              )}
            </div>

            {/* Stock status */}
            {product.inStock ? (
              <p className="text-green-600 font-medium mb-6">In Stock</p>
            ) : (
              <p className="text-red-600 font-medium mb-6">Out of Stock</p>
            )}
          </div>

          <Separator />

          {/* Variants */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-base font-semibold">Select Size</Label>
            <RadioGroup value={selectedVariant} onValueChange={setSelectedVariant}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {product.variants.map((variant: any) => (
                  <div key={variant.id}>
                    <RadioGroupItem value={variant.id} id={variant.id} className="peer sr-only" />
                    <Label
                      htmlFor={variant.id}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-background p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                    >
                      <span className="font-semibold">{variant.name}</span>
                      <span className="text-sm text-muted-foreground">₹{variant.price}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Quantity */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-base font-semibold">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="hover:bg-primary hover:text-white transition-colors"
              >
                -
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setQuantity(quantity + 1)}
                className="hover:bg-primary hover:text-white transition-colors cursor-pointer"
              >
                +
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="w-full sm:flex-1 cursor-pointer">
              Add to Cart
            </Button>
            <div className="flex gap-3 sm:gap-2">
              <Button size="lg" variant="outline" className="flex-1 sm:flex-initial gap-2 bg-transparent cursor-pointer">
                <Heart className="h-5 w-5" />
                <span className="sm:hidden">Add to Wishlist</span>
              </Button>
              <Button size="lg" variant="outline" className="flex-1 sm:flex-initial gap-2 bg-transparent cursor-pointer">
                <Share2 className="h-5 w-5" />
                <span className="sm:hidden">Share</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Key Features</h3>
              <div className="flex gap-2 sm:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => emblaApi?.scrollPrev()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => emblaApi?.scrollNext()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Mobile Carousel */}
            <div className="block sm:hidden">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {product.features.map((feature: string, index: number) => (
                    <div 
                      key={index} 
                      className="flex-[0_0_85%] min-w-0 mr-4 first:ml-4"
                    >
                      <div className="bg-accent/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-primary mt-1 flex-shrink-0">✓</span>
                          <span className="text-muted-foreground text-sm">
                            {feature}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {product.features.map((_: string, index: number) => (
                  <button
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      currentSlide === index ? "bg-primary w-3" : "bg-muted"
                    }`}
                    onClick={() => scrollTo(index)}
                  />
                ))}
              </div>
            </div>

            {/* Desktop List */}
            <ul className="hidden sm:block space-y-2">
              {product.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Trust badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 text-left sm:text-center">
              <Truck className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders above ₹999</p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 text-left sm:text-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium">100% Authentic</p>
                <p className="text-xs text-muted-foreground">Certified products</p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 text-left sm:text-center">
              <RotateCcw className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">7-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="font-serif text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Product Description</h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{product.description}</p>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
