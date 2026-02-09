"use client"
import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { X, Filter } from "lucide-react"

import { Category } from "@/lib/services/productService"
import { buildCategoryTree } from "@/lib/category-utils"

interface ShopFiltersProps {
  category?: string
  priceRange: number[]
  setPriceRange: (value: number[]) => void
  selectedCategories: string[]
  setSelectedCategories: (value: string[]) => void
  selectedBrands: string[]
  setSelectedBrands: (value: string[]) => void
  selectedTags: string[]
  setSelectedTags: (value: string[]) => void
  categories?: Category[] // Made optional to avoid breaking existing usage immediately
}

// Static fallback/legacy lists
const brands = [
  { id: "swadeshika", label: "Swadeshika" },
  { id: "organic", label: "Organic Select" },
  { id: "premium", label: "Premium Choice" },
]

const tags = [
  { id: "organic", label: "Organic" },
  { id: "traditional", label: "Traditional" },
  { id: "premium", label: "Premium" },
  { id: "bestseller", label: "Bestseller" },
]

export function ShopFilters({
  category,
  priceRange,
  setPriceRange,
  selectedCategories,
  setSelectedCategories,
  selectedBrands,
  setSelectedBrands,
  selectedTags,
  setSelectedTags,
  categories = [] // Default to empty if not provided
}: ShopFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [localPrice, setLocalPrice] = useState(priceRange)
  
  // console.log('ShopFilters Categories:', categories);
  // console.log('Built Tree:', buildCategoryTree(categories));

  // Sync local price when prop changes (e.g. Clear All)
  // We only want to sync if the prop is significantly different to avoid fighting with the slider
  useEffect(() => {
     // Only update if external prop is different from local state to avoid loops
     // and only if the difference is not just due to the slider moving (handled by onValueChange)
     if (priceRange[0] !== localPrice[0] || priceRange[1] !== localPrice[1]) {
        setLocalPrice(priceRange)
     }
  }, [priceRange])

  /**
   * Reset all filters to default values
   * Preserves category filter if on a category page
   */
  const handleClearAll = () => {
    setPriceRange([0, 10000])
    setSelectedCategories(category ? [category] : [])
    setSelectedBrands([])
    setSelectedTags([])
  }

  // Selected chips helpers
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.name])) as Record<string, string>
  const brandMap = Object.fromEntries(brands.map((b) => [b.id, b.label])) as Record<string, string>
  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t.label])) as Record<string, string>

  const anySelected =
    (selectedCategories.length > 0 && !category) || selectedBrands.length > 0 || selectedTags.length > 0 ||
    !(priceRange[0] === 0 && priceRange[1] === 10000)

  return (
    <>
      {/* Mobile: inline collapsible section */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="gap-2 w-full justify-center cursor-pointer"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-filters"
        >
          <Filter className="h-4 w-4" /> {mobileOpen ? "Hide Filters" : "Show Filters"}
        </Button>
        {mobileOpen && (
          <div id="mobile-filters" className="mt-3 space-y-6 rounded-2xl border-2 border-[#E8DCC8] bg-white p-5">
             {/* Inline Content for Mobile */}
             <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg text-[#6B4423]">Filters</h2>
                {anySelected && (
                  <Button variant="ghost" size="sm" onClick={handleClearAll} className="hover:bg-[#2D5F3F] cursor-pointer">
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
              <Separator />
              {renderFilters()}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block space-y-6 sticky top-24 rounded-2xl border-2 border-[#E8DCC8] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg text-[#6B4423]">Filters</h2>
            {anySelected && (
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="hover:bg-[#2D5F3F] cursor-pointer">
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
          <Separator />
          {renderFilters()}
      </div>
    </>
  )

  function renderFilters() {
    return (
      <>
        {/* Selected chips */}
        {anySelected && (
          <div className="flex flex-wrap gap-2">
            {/* Price chip when changed */}
            {!(priceRange[0] === 0 && priceRange[1] === 10000) && (
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full cursor-pointer"
                onClick={() => setPriceRange([0, 10000])}
              >
                ₹{priceRange[0]} - ₹{priceRange[1]} <X className="ml-1 h-3 w-3" />
              </Button>
            )}
            {/* Category chips (hidden on category page) */}
            {!category &&
              selectedCategories.map((c) => (
                <Button
                  key={`c-${c}`}
                  variant="secondary"
                  size="sm"
                  className="rounded-full cursor-pointer"
                  onClick={() => setSelectedCategories(selectedCategories.filter((x) => x !== c))}
                >
                  {categoryMap[c] || c} <X className="ml-1 h-3 w-3" />
                </Button>
              ))}
            {/* Brand chips */}
            {selectedBrands.map((b) => (
              <Button
                key={`b-${b}`}
                variant="secondary"
                size="sm"
                className="rounded-full cursor-pointer"
                onClick={() => setSelectedBrands(selectedBrands.filter((x) => x !== b))}
              >
                {brandMap[b] || b} <X className="ml-1 h-3 w-3" />
              </Button>
            ))}
            {/* Tag chips */}
            {selectedTags.map((t) => (
              <Button
                key={`t-${t}`}
                variant="secondary"
                size="sm"
                className="rounded-full cursor-pointer"
                onClick={() => setSelectedTags(selectedTags.filter((x) => x !== t))}
              >
                {tagMap[t] || t} <X className="ml-1 h-3 w-3" />
              </Button>
            ))}
          </div>
        )}

        {/* Price Range */}
        <div className="space-y-4">
          <h3 className="font-medium">Price Range</h3>
          <div className="space-y-4">
            <Slider 
               value={localPrice} 
               onValueChange={setLocalPrice} 
               onValueCommit={setPriceRange} 
               max={10000} 
               step={100} 
               className="w-full cursor-pointer" 
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">₹{localPrice[0]}</span>
              <span className="text-muted-foreground">₹{localPrice[1]}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Categories */}
        {!category && (
          <>
            <div className="space-y-4">
              <h3 className="font-medium">Categories</h3>
              <div className="space-y-1">
                 <CategoryTree 
                    tree={buildCategoryTree(categories)}
                    selectedCategories={selectedCategories}
                    onToggle={(slug, checked) => {
                       if (checked) {
                         setSelectedCategories([...selectedCategories, slug])
                       } else {
                         setSelectedCategories(selectedCategories.filter((c) => c !== slug))
                       }
                    }}
                 />
              </div>
            </div>
            <Separator />
          </>
        )}
      </>
    )
  }
}

// Recursive Category Tree Component
function CategoryTree({ 
  tree, 
  selectedCategories, 
  onToggle,
  level = 0
}: { 
  tree: any[], 
  selectedCategories: string[], 
  onToggle: (slug: string, checked: boolean) => void,
  level?: number
}) {
  if (!tree || tree.length === 0) return null;

  return (
    <div className="space-y-1">
      {tree.map((category) => (
        <div key={category.id} className="space-y-1">
          <div 
             className="flex items-center space-x-2"
             style={{ paddingLeft: `${Math.max(0, level * 16)}px` }}
          >
            <Checkbox
              id={String(category.id)}
              checked={selectedCategories.includes(category.slug)}
              className="cursor-pointer"
              onCheckedChange={(checked) => onToggle(category.slug, checked === true)}
            />
            <Label htmlFor={String(category.id)} className="text-sm font-normal cursor-pointer text-[#6B4423]">
               {category.name}
            </Label>
          </div>
          
          {/* Render Children */}
          {category.children && category.children.length > 0 && (
             <CategoryTree 
                tree={category.children} 
                selectedCategories={selectedCategories} 
                onToggle={onToggle}
                level={level + 1}
             />
          )}
        </div>
      ))}
    </div>
  )
}
