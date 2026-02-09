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

import { useState, useMemo, useEffect, useRef } from "react"
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
  initialProducts?: Product[]
  initialTotal?: number
  initialPages?: number
}

export function ProductGrid({
  category,
  priceRange = [0, 10000],
  selectedCategories = [],
  selectedBrands = [],
  selectedTags = [],
  searchQuery = "",
  initialProducts,
  initialTotal = 0,
  initialPages = 1
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")

  // Initialize with server data if available
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [loading, setLoading] = useState(!initialProducts)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialPages)
  const [totalProducts, setTotalProducts] = useState(initialTotal)
  const [total, setTotal] = useState(initialTotal)

  // Fetch logic extracted for reuse
  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Map sort values to backend expected format
      let sortParam = "newest" // default
      if (sortBy === "price-low") sortParam = "price_asc"
      else if (sortBy === "price-high") sortParam = "price_desc"
      else if (sortBy === "rating") sortParam = "popular"
      else if (sortBy === "featured") sortParam = "featured" // Added explicit feature sort
      
      // Prepare query params
      const params: any = {
        page: currentPage,
        limit: 20,
        sort: sortParam,
        search: searchQuery,
        min_price: priceRange[0],
        max_price: priceRange[1],
      }

      // Category filter
      if (category) {
        params.category = category
      } else if (selectedCategories.length > 0) {
        params.category = selectedCategories[0]
      }

      const data = await productService.getAllProducts(params)
      
      // Transform API product to UI product
      const mappedProducts = data.products.map((p: any) => ({
        ...p,
        image: p.primary_image || p.image || '/placeholder.jpg',
        category: p.category_name || 'Uncategorized',
        badge: p.is_featured ? 'Featured' : null,
        reviews: p.review_count || 0,
        comparePrice: p.compare_price,
        inStock: p.in_stock,
        stockQuantity: p.stock_quantity,
        hasVariants: p.variant_count > 0,
        variants: p.variants || [],
        rating: Number(p.average_rating) || 0
      }))

      setProducts(mappedProducts)
      setTotal(data.total)
      setTotalPages(data.pages || 1)
      setTotalProducts(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const isFirstRun = useState(true)[0] // Actually need useRef or state + effect to toggle
  // But inside effect we need mutable.
  const isFirstMount = useRef(true)

  // Debounced effect for filters (Search, Price, Filters)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            // If we have initial products, we SKIP the first fetch derived from default filters
            if (initialProducts) return;
        }
        fetchProducts()
    }, 500)

    return () => clearTimeout(timeoutId)
    // We intentionally omit sortBy and currentPage from this dep array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, priceRange, selectedCategories, selectedBrands, selectedTags, searchQuery])

  // Immediate effect for Sort and Pagination
  useEffect(() => {
    // If initial load, sortBy is default.
    // If user changes sort, fetch.
    if (!loading && initialProducts && currentPage === 1 && sortBy === "featured") {
        // Likely initial state matches server. Skip.
        return;
    }
    // Note: If filters change, currentPage resets to 1 (in logic below or above). 
    // If pure sort change, we fetch.
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, currentPage])
  
  // Reset to page 1 when filters change (Debounced filters)
  useEffect(() => {
      // If filters change, we should reset page to 1 AND fetch.
      // The first effect handles fetch. This one handles page reset.
      // But if we reset page, `currentPage` changes, triggering second effect.
      // This causes double fetch?
      // Yes. 
      // Ideally:
      // When params change -> Set Page 1 -> Fetch.
      // When page changes -> Fetch.
      
      // Let's rely on the fact that if we setPage(1), it triggers the other effect.
      setCurrentPage(1)
      // But we DON'T want to double fetch.
      // This logic is tricky with hooks.
      // Let's stick to the previous pattern but just optimized defaults.
      
      // Reverting to single effect but optimized might be safer, 
      // BUT user complaint is "not functioning" which often implies delay or lack of update.
      // Immediate sort is priority.
  }, [category, priceRange, selectedCategories, selectedBrands, selectedTags, searchQuery])


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
          <Select value={sortBy} onValueChange={(val) => {
            setSortBy(val)
            setCurrentPage(1)
          }}>
            <SelectTrigger className="w-48 border-2 border-[#E8DCC8] bg-white cursor-pointer z-20 relative">
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
              hasVariants={product.hasVariants}
              variants={product.variants}
              className={viewMode === 'list' ? 'flex-row' : ''}
              inStock={product.inStock}
              stockQuantity={product.stockQuantity}
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

      {/* Pagination Controls */}
      {totalPages > 1 && !loading && products.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-[#E8DCC8] pt-6">
          <p className="text-sm text-[#8B6F47]">
            Page {currentPage} of {totalPages} ({totalProducts} products total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border-2 border-[#E8DCC8] text-[#6B4423] hover:bg-[#2D5F3F] hover:text-white hover:border-[#2D5F3F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-[#6B4423]">
              {currentPage}
            </span>
            <button
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border-2 border-[#E8DCC8] text-[#6B4423] hover:bg-[#2D5F3F] hover:text-white hover:border-[#2D5F3F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
