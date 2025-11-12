"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductGrid } from "@/components/product-grid"
import { ShopFilters } from "@/components/shop-filters"
import { ShopHeader } from "@/components/shop-header"
import { Breadcrumb } from "@/components/breadcrumb"

/**
 * Category Page - Filtered Product Listing
 *
 * Dynamic route page that displays products filtered by a specific category.
 * The category is passed as a URL parameter and used to filter the product grid.
 *
 * Features:
 * - Category-specific product display
 * - Dynamic page title and description based on category
 * - Category-aware filters in sidebar
 * - Breadcrumb navigation support
 *
 * Route: /shop/[category] (e.g., /shop/ghee, /shop/spices)
 *
 * @param params - Contains the category slug from the URL
 */

const categoryInfo: Record<string, { title: string; description: string }> = {
  ghee: {
    title: "Pure Ghee",
    description: "Traditional bilona ghee made from grass-fed cow milk",
  },
  spices: {
    title: "Premium Spices",
    description: "Authentic Indian spices for your kitchen",
  },
  "dry-fruits": {
    title: "Dry Fruits & Nuts",
    description: "Fresh and nutritious dry fruits",
  },
  oils: {
    title: "Cold Pressed Oils",
    description: "Traditional oils for healthy cooking",
  },
}

export default function CategoryPage() {
  const params = useParams<{ category: string | string[] }>()
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category
  const info = categoryInfo[categoryParam] || { title: "Products", description: "Browse our collection" }

  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([categoryParam])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb currentCategory={categoryParam} />

          <ShopHeader title={info.title} description={info.description} />

          <div className="grid lg:grid-cols-4 gap-8 mt-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <ShopFilters
                category={categoryParam}
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
                category={categoryParam}
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
