"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

// Import components
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductGrid } from "@/components/product-grid"
import { ShopFilters } from "@/components/shop-filters"
import { ShopHeader } from "@/components/shop-header"
import { Category, Product } from "@/lib/services/productService"

interface ShopClientProps {
  initialCategories: Category[]
  initialProducts?: Product[]
  initialTotal?: number
  initialPages?: number
}

// ClientOnly component removed as it blocks SSR

function ShopContent({ initialCategories, initialProducts, initialTotal, initialPages }: ShopClientProps) {
  const searchParams = useSearchParams()
  
  // Initialize state from URL Params to match Server Side Render
  const [searchQuery, setSearchQuery] = useState(() => searchParams?.get('q') || "")
  const [priceRange, setPriceRange] = useState([0, 10000]) // Could also read from params
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams?.get('category');
    return cat ? [cat] : [];
  })
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  // Update search query and categories when URL changes
  useEffect(() => {
    const query = searchParams?.get('q') || ""
    setSearchQuery(query)

    const categoryParam = searchParams?.get('category')
    if (categoryParam) {
      setSelectedCategories([categoryParam])
    } else {
        // If removed, clear? Or keep user selection?
        // Usually URL drives state.
        setSelectedCategories([])
    }
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
                selectedBrands={selectedBrands}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                setSelectedBrands={setSelectedBrands}
                setSelectedCategories={setSelectedCategories}
                categories={categories}
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
                initialProducts={initialProducts}
                initialTotal={initialTotal}
                initialPages={initialPages}
              />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default function ShopClient({ initialCategories, initialProducts, initialTotal, initialPages }: ShopClientProps) {
  return (
    <ShopContent 
      initialCategories={initialCategories}
      initialProducts={initialProducts} 
      initialTotal={initialTotal}
      initialPages={initialPages}
    />
  )
}
