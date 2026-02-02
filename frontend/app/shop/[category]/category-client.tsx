"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductGrid } from "@/components/product-grid"
import { ShopFilters } from "@/components/shop-filters"
import { ShopHeader } from "@/components/shop-header"
import { Breadcrumb } from "@/components/breadcrumb"

interface CategoryClientProps {
  category: string
  title: string
  description: string
}

export default function CategoryClient({ category, title, description }: CategoryClientProps) {
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([category])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb currentCategory={category} />

          <ShopHeader title={title} description={description} />

          <div className="grid lg:grid-cols-4 gap-8 mt-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <ShopFilters
                category={category}
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
                category={category}
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
