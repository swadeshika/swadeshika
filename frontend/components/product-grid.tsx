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

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutGrid, List, Search } from "lucide-react"
import { productService } from "@/lib/services/productService"
import { Product } from "@/lib/services/productService"

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

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        // Map sort values to backend expected format
        let sortParam = "newest" // default
        if (sortBy === "price-low") sortParam = "price_asc"
        else if (sortBy === "price-high") sortParam = "price_desc"
        else if (sortBy === "rating") sortParam = "popular"
        
        // Prepare query params
        const params: any = {
          page: 1, // TODO: Add pagination support
          limit: 100, // Fetch more for now since we don't have pagination UI yet
          sort: sortParam,
          search: searchQuery,
          min_price: priceRange[0],
          max_price: priceRange[1],
        }

        // Category filter
        // Note: Backend expects category slug or ID. 
        // If 'category' prop is present (from URL), use it.
        // If 'selectedCategories' keys are present, we might need to handle multiple.
        // For now, let's prioritize the specific category prop, or pick the first selected category.
        if (category) {
          params.category_id = undefined // Backend might accept slug via a different param or mapped, let's check. 
          // Wait, backend findAll checks 'category' param against c.slug. Perfect.
          params.category = category
        } else if (selectedCategories.length > 0) {
          // Backend currently handles single 'category' parameter in findAll. 
          // Supporting multiple categories might need backend update, or we pick the first one.
          params.category = selectedCategories[0]
        }

        // Tags - mapping 'badge' to tags if possible, or verify backend support
        // Backend has 'featured' filter which is boolean. 
        // If 'Best Seller' is a tag, backend doesn't seem to have generic tag filter in findAll yet?
        // Checked productModel.js: it checks inStock, featured, but not generic tags in findAll params.
        // We will skip tag filtering on backend for now or add it later.

        const data = await productService.getAllProducts(params)
        
        // Map backend products to frontend interface if needed, 
        // but Typescript might complain if types don't match exactly.
        // Let's rely on the returned data structure which seems compatible-ish.
        // We need to ensure the mapped Product satisfies the UI usage.
        
        // Transform API product to UI product
        const mappedProducts = data.products.map((p: any) => ({
          ...p,
          image: p.primary_image || p.image || '/placeholder.jpg',
          category: p.category_name || 'Uncategorized', // Need category name for display
          badge: p.is_featured ? 'Featured' : null,
          reviews: p.review_count || 0
        }))

        setProducts(mappedProducts)
        setTotal(data.total)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    // Debounce fetch to avoid too many requests while sliding price
    const timeoutId = setTimeout(() => {
        fetchProducts()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [category, priceRange, selectedCategories, selectedBrands, selectedTags, sortBy, searchQuery])


  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-2xl border-2 border-[#E8DCC8] bg-white p-4">
        {products.length > 0 ? (
          <p className="text-sm text-[#8B6F47]">
            {searchQuery ? (
              <>
                Showing <span className="font-semibold text-[#6B4423]">{products.length}</span> results for
                <span className="ml-1 font-semibold text-[#6B4423]">"{searchQuery}"</span>
              </>
            ) : (
              <>
                Showing <span className="font-semibold text-[#6B4423]">{products.length}</span> products
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
            <SelectTrigger className="w-48 border-2 border-[#E8DCC8] bg-white cursor-pointer">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="featured">Featured</SelectItem>
              <SelectItem className="cursor-pointer" value="price-low">Price: Low to High</SelectItem>
              <SelectItem className="cursor-pointer" value="price-high">Price: High to Low</SelectItem>
              <SelectItem className="cursor-pointer" value="newest">Newest</SelectItem>
              <SelectItem className="cursor-pointer" value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="hidden sm:flex items-center gap-1 border-2 border-[#E8DCC8] rounded-xl p-1 bg-[#F5F1E8]">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Products */}
      {loading ? (
           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
             {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-2xl"></div>
             ))}
           </div>
        ) : products.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {products.map((product: any) => (
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
              className="inline-flex items-center rounded-md bg-[#6B4423] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#5A3A1F] focus:outline-none focus:ring-2 focus:ring-[#6B4423] focus:ring-offset-2 cursor-pointer"
            >
              Back to shop
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
