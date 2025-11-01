"use client"

/**
 * ProductGrid
 *
 * Purpose:
 * - Renders a responsive grid/list of products with sorting, view toggle, and optional filtering integration.
 *
 * Key Features:
 * - Grid and list views with consistent card layout.
 * - Accepts a filteredProducts array from parent; this component focuses on presentation.
 * - Uses Tailwind/shadcn styles aligned to the brand palette.
 *
 * Implementation Notes:
 * - Ensure each ProductCard gets a stable key (product.id).
 * - When adding infinite scroll or pagination, wrap the mapped section appropriately.
 */

import { useState, useMemo } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutGrid, List, Search } from "lucide-react"
import { Product, allProducts } from "@/data/products"

interface ProductGridProps {
  category?: string
  priceRange?: number[]
  selectedCategories?: string[]
  selectedBrands?: string[]
  selectedTags?: string[]
  searchQuery?: string
}

export function ProductGrid({
  category,
  priceRange = [0, 2000],
  selectedCategories = [],
  selectedBrands = [],
  selectedTags = [],
  searchQuery = ""
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")

  const filteredProducts = useMemo(() => {
    let filtered: Product[] = [...allProducts]

    // Filter by category (from URL or selected categories)
    if (category) {
      filtered = filtered.filter((p) => p.category.toLowerCase().replace(" ", "-") === category)
    } else if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category.toLowerCase().replace(" ", "-")))
    }

    // Filter by price range
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Filter by search query (name, category)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
      )
    }

    // Filter by brands (if implemented in product data)
    if (selectedBrands.length > 0) {
      // Add brand filtering logic when product data includes brands
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((p) => selectedTags.includes(p.badge?.toLowerCase() || ""))
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        // Assuming newer products have higher IDs
        filtered.sort((a, b) => Number(b.id) - Number(a.id))
        break
      default:
        // Featured - keep original order
        break
    }

    return filtered
  }, [category, priceRange, selectedCategories, selectedBrands, selectedTags, sortBy, searchQuery])

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-2xl border-2 border-[#E8DCC8] bg-white p-4">
        {filteredProducts.length > 0 ? (
          <p className="text-sm text-[#8B6F47]">
            {searchQuery ? (
              <>
                Showing <span className="font-semibold text-[#6B4423]">{filteredProducts.length}</span> results for
                <span className="ml-1 font-semibold text-[#6B4423]">"{searchQuery}"</span>
              </>
            ) : (
              <>
                Showing <span className="font-semibold text-[#6B4423]">{filteredProducts.length}</span> products
              </>
            )}
          </p>
        ) : (
          <p className="text-sm text-[#8B6F47] w-full text-center">
            {searchQuery ? (
              <>
                We couldn't find any products matching "<span className="font-semibold text-[#6B4423]">{searchQuery}</span>"
              </>
            ) : (
              "No products found matching the selected filters"
            )}
          </p>
        )}

        <div className="flex items-center gap-4">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 border-2 border-[#E8DCC8] bg-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="hidden sm:flex items-center gap-1 border-2 border-[#E8DCC8] rounded-xl p-1 bg-[#F5F1E8]">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Products */}
      {filteredProducts.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id}
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
              className={viewMode === 'list' ? 'flex-row' : ''}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#E8DCC8] p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F1E8]">
            <Search className="h-6 w-6 text-[#6B4423]" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-[#6B4423]">No products found</h3>
          <p className="mt-2 text-sm text-[#8B6F47]">
            {searchQuery 
              ? `We couldn't find any products matching "${searchQuery}". Try checking your spelling or use more general terms.`
              : 'No products match the selected filters. Try adjusting your search or filter criteria.'}
          </p>
          <div className="mt-6">
            <Link 
              href="/shop" 
              className="inline-flex items-center rounded-md bg-[#6B4423] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#5A3A1F] focus:outline-none focus:ring-2 focus:ring-[#6B4423] focus:ring-offset-2"
            >
              Back to shop
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
