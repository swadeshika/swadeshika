"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Heart, Share2, Star, Truck, ShieldCheck, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ProductDetailsProps {
  slug: string
}

// Mock product data
const productData: Record<string, any> = {
  "pure-desi-cow-ghee": {
    id: "1",
    name: "Pure Desi Cow Ghee",
    price: 850,
    comparePrice: 1000,
    rating: 4.8,
    reviews: 124,
    category: "Ghee",
    badge: "Bestseller",
    inStock: true,
    images: ["/golden-ghee-in-glass-jar.jpg", "/traditional-ghee.jpg", "/golden-ghee-in-glass-jar.jpg"],
    description:
      "Made from the milk of grass-fed cows using traditional bilona method. Rich in vitamins A, D, E, and K. Perfect for cooking, baking, and Ayurvedic remedies. Our ghee is prepared in small batches to ensure the highest quality and authentic taste.",
    variants: [
      { id: "1", name: "500g", price: 450, inStock: true },
      { id: "2", name: "1kg", price: 850, inStock: true },
      { id: "3", name: "2kg", price: 1600, inStock: true },
    ],
    features: [
      "100% Pure Desi Cow Ghee",
      "Traditional Bilona Method",
      "Rich in Vitamins A, D, E, K",
      "No Preservatives or Additives",
      "Grass-Fed Cow Milk",
      "Small Batch Production",
    ],
  },
}

export function ProductDetails({ slug }: ProductDetailsProps) {
  const product = productData[slug] || productData["pure-desi-cow-ghee"]
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(product.variants[1].id)
  const [quantity, setQuantity] = useState(1)

  const currentVariant = product.variants.find((v: any) => v.id === selectedVariant)

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
          Back to Shop
        </Link>
      </Button>

      {/* Product Info */}
      <div className="grid lg:grid-cols-2 gap-12">
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
          <div className="grid grid-cols-4 gap-4">
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
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
            <h1 className="font-serif text-4xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">₹{currentVariant.price}</span>
              {product.comparePrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">₹{product.comparePrice}</span>
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
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Size</Label>
            <RadioGroup value={selectedVariant} onValueChange={setSelectedVariant}>
              <div className="grid grid-cols-3 gap-3">
                {product.variants.map((variant: any) => (
                  <div key={variant.id}>
                    <RadioGroupItem value={variant.id} id={variant.id} className="peer sr-only" />
                    <Label
                      htmlFor={variant.id}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
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
          <div className="space-y-3">
            <Label className="text-base font-semibold">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="outline" size="icon" className="cursor-pointer" onClick={() => setQuantity(quantity + 1)}>
                +
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button size="lg" className="flex-1 cursor-pointer">
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent cursor-pointer">
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent cursor-pointer">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <Separator />

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Key Features</h3>
            <ul className="space-y-2">
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
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium">Free Shipping</p>
              <p className="text-xs text-muted-foreground">On orders above ₹999</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium">100% Authentic</p>
              <p className="text-xs text-muted-foreground">Certified products</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <RotateCcw className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="text-xs text-muted-foreground">7-day return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-serif text-2xl font-bold mb-4">Product Description</h2>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </CardContent>
      </Card>
    </div>
  )
}
