"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductCard } from "@/components/product-card"
import { HeroSlider } from "@/components/hero-slider"
import { Star, Truck, Shield, Leaf, Award } from "lucide-react"
import { productService, Product } from "@/lib/services/productService"

/**
 * Homepage Component for Swadeshika E-commerce Platform
 */

// Helper function to get icon based on category name
function getIconForCategory(name: string): string {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('ghee') || lowerName.includes('butter')) return '🧈'
  if (lowerName.includes('spice') || lowerName.includes('masala')) return '🌶️'
  if (lowerName.includes('dry fruit') || lowerName.includes('nut')) return '🥜'
  if (lowerName.includes('oil')) return '🥥'
  if (lowerName.includes('flour') || lowerName.includes('grain')) return '🌾'
  if (lowerName.includes('honey')) return '🍯'
  if (lowerName.includes('pickle')) return '🥒'
  return '🏪' // Default icon
}

// Quick links will be populated dynamically from categories

import { reviewService, Review } from "@/lib/services/reviewService"

const DEMO_REVIEWS: Review[] = [
  {
    product_id: 1,
    rating: 5,
    comment: "The ghee quality is exceptional! You can taste the purity in every spoonful. My family loves it.",
    user_name: "Priya Sharma",
    city: "Mumbai"
  },
  {
    product_id: 2,
    rating: 5,
    comment: "Best organic spices I've ever used. The aroma is incredible and they're completely authentic.",
    user_name: "Rajesh Kumar",
    city: "Delhi"
  },
  {
    product_id: 3,
    rating: 5,
    comment: "Fast delivery and excellent packaging. The dry fruits are fresh and of premium quality.",
    user_name: "Anita Patel",
    city: "Bangalore"
  }
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [quickLinks, setQuickLinks] = useState<Array<{name: string; icon: string; href: string; image?: string}>>([])

  // Fetch categories for quick links
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await productService.getAllCategories()

        const activeCategories = categories.filter(c => c.is_active !== false && !c.parent_id).slice(0, 6)
        // const activeCategories = categories.filter(c => c.is_active !== false).slice(0, 5)
        
        const links = activeCategories.map(cat => ({
          name: cat.name,
          icon: getIconForCategory(cat.name),
          image: cat.image_url,
          href: `/shop/${cat.slug || cat.id}`
        }))
        
        // Always add "All Products" at the end
        links.push({ name: "All Products", icon: "📦", href: "/shop", image: undefined })
        setQuickLinks(links)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        // Fallback to shop link only
        setQuickLinks([{ name: "All Products", icon: "📦", href: "/shop", image: undefined }])
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewService.getFeaturedReviews()
        if (data && data.length > 0) {
          setReviews(data)
        } else {
          setReviews(DEMO_REVIEWS)
        }
      } catch (error) {
        console.error("Failed to fetch featured reviews, using demo data", error)
        setReviews(DEMO_REVIEWS)
      }
    }
    fetchReviews()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await productService.getAllProducts({ 
          sort: 'popular', 
          limit: 4,
          page: 1
        })
        
        if (response && Array.isArray(response.products)) {
           // Transform API product to UI product exactly like ProductGrid
           const mappedProducts = response.products.map((p: any) => ({
              ...p,
              // Map backend fields to UI props
              image: p.primary_image || p.image || '/placeholder.jpg',
              category: p.category_name || 'Uncategorized',
              badge: p.is_featured ? 'Featured' : (p.review_count > 50 ? 'Popular' : null),
              reviews: p.review_count || 0,
              rating: p.average_rating || 0, 
              comparePrice: p.compare_price,
              inStock: p.in_stock,
              stockQuantity: p.stock_quantity,
              hasVariants: p.variant_count > 0,
              variants: p.variants || []
           }))
           setFeaturedProducts(mappedProducts)
        }
      } catch (error) {
        console.error("Failed to fetch home products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <HeroSlider />

        <section className="py-6 bg-[#F5F1E8] border-y-2 border-[#E8DCC8]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-8 lg:gap-16 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/80 border-2 border-[#E8DCC8] flex items-center justify-center">
                  <Truck className="h-6 w-6 text-[#2D5F3F]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#6B4423]">Free Shipping</p>
                  <p className="text-xs text-[#8B6F47]">On orders above ₹999</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/80 border-2 border-[#E8DCC8] flex items-center justify-center">
                  <Shield className="h-6 w-6 text-[#2D5F3F]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#6B4423]">100% Authentic</p>
                  <p className="text-xs text-[#8B6F47]">Quality Guaranteed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/80 border-2 border-[#E8DCC8] flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-[#2D5F3F]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#6B4423]">100% Organic</p>
                  <p className="text-xs text-[#8B6F47]">Farm Fresh Products</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/80 border-2 border-[#E8DCC8] flex items-center justify-center">
                  <Award className="h-6 w-6 text-[#2D5F3F]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#6B4423]">Trusted by 10K+</p>
                  <p className="text-xs text-[#8B6F47]">Happy Customers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-[#F5F1E8] border-y-2 border-[#E8DCC8]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-6 lg:gap-12 flex-wrap">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex flex-col items-center gap-3 group transition-transform hover:scale-105 cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg transition-all border-2 border-[#E8DCC8] bg-white">
                    {link.image ? (
                        <img src={link.image} alt={link.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl">{link.icon}</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-center max-w-[100px] leading-tight text-[#6B4423] group-hover:text-[#2D5F3F] transition-colors">
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-2 md:grid-rows-2 gap-6 h-auto md:h-[600px]">

              {/* Big banner - Ghee */}
              <Link
                href="/shop/ghee"
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all col-span-2 md:col-span-1 md:row-span-2 h-[260px] sm:h-80 md:h-full cursor-pointer"
              >
                <div className="absolute inset-0">
                  <img
                    src="/banner-ghee.png"
                    alt="Pure Desi Ghee"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                {/* Text container */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
                  <div className="max-w-[92%] sm:max-w-[70%] md:max-w-[520px] lg:max-w-[640px]">
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-3 text-balance leading-tight whitespace-normal break-words">
                      Pure Desi Ghee
                    </h2>

                    <p className="text-xs sm:text-sm md:text-xl text-white/95 mb-6 font-medium whitespace-normal break-words">
                      Traditional Bilona Method from Gir Cows
                    </p>

                    <Button
                      size="lg"
                      className="bg-[#FF7E00] hover:bg-[#E67300] text-white font-semibold px-4 sm:px-5 md:px-6 h-9 sm:h-10 rounded-lg shadow-lg whitespace-nowrap text-[10px] sm:text-xs md:text-sm leading-none cursor-pointer"
                    >
                      ORDER NOW
                    </Button>

                  </div>
                </div>
              </Link>

              {/* Small banner 1 - Spices */}
              <Link
                href="/shop/spices"
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all h-56 md:h-auto min-h-[220px] cursor-pointer"
              >
                <div className="absolute inset-0">
                  <img
                    src="/banner-spices.png"
                    alt="Authentic Indian Spices"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                  <div className="max-w-[92%] sm:max-w-[85%] md:max-w-[420px]">
                    <h3 className="text-sm sm:text-xl md:text-3xl font-bold mb-2 text-balance leading-tight whitespace-normal break-words">
                      Authentic Spices
                    </h3>
                    <p className="text-xs sm:text-sm md:text-lg text-white/95 mb-4 font-medium whitespace-normal break-words cursor-pointer">
                      Fresh & Aromatic
                    </p>
                    <Button
                      size="default"
                      className="bg-[#2D5F3F] hover:bg-[#234A32] text-white font-semibold px-4 sm:px-5 md:px-6 h-8 sm:h-9 rounded-lg whitespace-nowrap text-[10px] sm:text-xs md:text-sm leading-none cursor-pointer"
                    >
                      Shop Now
                    </Button>

                  </div>
                </div>
              </Link>

              {/* Small banner 2 - Oils */}
              <Link
                href="/shop/oils"
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all h-56 md:h-auto min-h-[220px] cursor-pointer"
              >
                <div className="absolute inset-0">
                   <img
                    src="/banner-oil.png"
                    alt="Cold Pressed Oils"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                
                <div className="relative h-full flex flex-col justify-end p-4 sm:p-6 md:p-6 text-white">
                  <div className="inline-block mb-3">
                    <span
                      className="bg-[#FF7E00] text-white font-bold px-3 py-1.5 rounded-md uppercase tracking-wide whitespace-nowrap leading-none inline-flex items-center"
                      style={{ fontSize: "clamp(10px, 2.2vw, 13px)" }}
                    >
                      100% ORGANIC
                    </span>
                  </div>

                  <div className="max-w-[92%] sm:max-w-[80%] md:max-w-[420px]">
                    <h3 className="text-sm sm:text-xl md:text-3xl font-bold mb-4 text-balance leading-tight whitespace-normal break-words">
                       Cold Pressed Oils
                    </h3>
                    <Button
                      size="default"
                      variant="outline"
                      className="bg-white/10 border-white/40 text-white hover:bg-white hover:text-foreground font-semibold px-4 sm:px-5 md:px-6 h-8 sm:h-9 rounded-lg backdrop-blur-sm w-fit whitespace-nowrap text-[10px] sm:text-xs md:text-sm leading-none cursor-pointer"
                    >
                      SHOP COLLECTION
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#F5F1E8]">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-10 gap-4">
              <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
                <div className="mb-2 md:mb-0">
                  <span className="inline-block bg-[#FF7E00] text-white text-sm font-bold px-3 py-2 rounded-md uppercase tracking-wide">
                    Most Loved
                  </span>
                </div>

                <div>
                  <h2 className="text-4xl sm:text-4xl md:text-4xl font-bold text-[#6B4423] mb-2">
                    Customer Favorites
                  </h2>
                  <p className="text-base sm:text-lg text-[#8B6F47]">
                    Bestsellers picked by our community
                  </p>
                </div>
              </div>

              <div className="hidden md:block">
                <Button
                  variant="default"
                  size="lg"
                  asChild
                  className="rounded-full shadow-md hover:shadow-lg transition-shadow bg-[#2D5F3F] hover:bg-[#234A32] text-white cursor-pointer"
                >
                  <Link href="/shop">View All Products</Link>
                </Button>
              </div>
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center md:justify-items-stretch">
              {loading ? (
                // Skeleton Loader
                [...Array(4)].map((_, i) => (
                   <div key={i} className="w-full h-[400px] bg-gray-200 animate-pulse rounded-lg"></div>
                ))
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product: any) => (
                  <div key={product.id} className="w-full max-w-sm md:max-w-none">
                    <ProductCard 
                      id={Number(product.id)}
                      name={product.name}
                      slug={product.slug}
                      price={product.price}
                      comparePrice={product.comparePrice}
                      image={product.image}
                      badge={product.badge}
                      category={product.category}
                      rating={product.rating}
                      reviews={product.reviews}
                      hasVariants={product.hasVariants}
                      variants={product.variants}
                      inStock={product.inStock}
                      stockQuantity={product.stockQuantity} 
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  No popular products found right now. Check back later!
                </div>
              )}
            </div>

            {/* Mobile CTA */}
            <div className="mt-10 text-center md:hidden">
              <Button
                variant="default"
                size="lg"
                asChild
                className="rounded-full shadow-md text-lg px-8 py-6 cursor-pointer"
              >
                <Link href="/shop">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#F5F1E8] border-y-2 border-[#E8DCC8]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-3">What Our Customers Say</h2>
              <p className="text-lg text-[#8B6F47]">Trusted by thousands of happy families</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 border-2 border-[#E8DCC8] hover:shadow-lg transition-shadow">
                    <div className="flex gap-1 mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-[#FF7E00] text-[#FF7E00]" />
                      ))}
                    </div>
                    <p className="mb-4 leading-relaxed text-[#6B4423]">"{review.comment}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2D5F3F]/10 flex items-center justify-center font-semibold text-[#2D5F3F]">
                        {review.user_name ? review.user_name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#6B4423]">{review.user_name || 'Verified Customer'}</p>
                        <p className="text-xs text-[#8B6F47]">{review.city || 'India'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Skeleton Loading State
                [1, 2, 3].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border-2 border-[#E8DCC8] animate-pulse">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="h-5 w-5 bg-gray-200 rounded-full" />
                      ))}
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div>
                        <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#6B4423] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Experience Authentic Indian Flavors</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto text-pretty">
              Join thousands of happy customers who trust Swadeshika for pure, organic products
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="px-8 py-3 text-base h-auto shadow-lg hover:shadow-xl rounded-full bg-[#FF7E00] hover:bg-[#E67300] text-white cursor-pointer"
              >
                <Link href="/shop">Start Shopping</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="px-8 py-3 text-base h-auto bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-sm rounded-full cursor-pointer"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
