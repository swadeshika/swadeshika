"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from 'next/dynamic'

// Import components directly since they're all client components
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductGrid } from "@/components/product-grid"
import { ShopFilters } from "@/components/shop-filters"
import { ShopHeader } from "@/components/shop-header"

// Create a client-only wrapper component
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="container mx-auto px-4 py-8">
          <div className="h-12 w-full max-w-md bg-gray-200 animate-pulse rounded"></div>
          <div className="mt-8 grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 w-full bg-gray-100 animate-pulse rounded"></div>
              ))}
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Shop Page - Main Product Listing
 *
 * This is the main shop page that displays all products across all categories.
 * Users can filter products using the sidebar filters and view products in grid/list layout.
 *
 * Features:
 * - Full product catalog display
 * - Sidebar filters for category, price, brand, and tags
 * - Responsive grid layout
 * - Integration with site header and footer
 *
 * Route: /shop
 */

function ShopContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Update search query when URL changes
  useEffect(() => {
    const query = searchParams?.get('q') || ""
    setSearchQuery(query)
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <ShopHeader title="All Products" description="Discover our complete collection of authentic products" />

          <div className="grid lg:grid-cols-4 gap-8 mt-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <ShopFilters
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <ProductGrid
                searchQuery={searchQuery}
                priceRange={priceRange}
                selectedCategories={selectedCategories}
                selectedBrands={selectedBrands}
                selectedTags={selectedTags}
              />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default function ShopPage() {
  return (
    <ClientOnly>
      <ShopContent />
    </ClientOnly>
  )
}
