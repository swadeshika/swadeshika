"use client"
import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { X, Filter } from "lucide-react"

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
}

const categories = [
  { id: "ghee", label: "Ghee" },
  { id: "spices", label: "Spices" },
  { id: "dry-fruits", label: "Dry Fruits" },
  { id: "oils", label: "Oils" },
  { id: "grains", label: "Grains & Pulses" },
  { id: "honey", label: "Honey & Sweeteners" },
]

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
}: ShopFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  /**
   * Reset all filters to default values
   * Preserves category filter if on a category page
   */
  const handleClearAll = () => {
    setPriceRange([0, 2000])
    setSelectedCategories(category ? [category] : [])
    setSelectedBrands([])
    setSelectedTags([])
  }

  // Selected chips helpers
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.label])) as Record<string, string>
  const brandMap = Object.fromEntries(brands.map((b) => [b.id, b.label])) as Record<string, string>
  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t.label])) as Record<string, string>

  const anySelected =
    (selectedCategories.length > 0 && !category) || selectedBrands.length > 0 || selectedTags.length > 0 ||
    !(priceRange[0] === 0 && priceRange[1] === 2000)

  // Reusable inner content for filters (without the outer container)
  const FiltersInner = ({ showHeading = true }: { showHeading?: boolean }) => (
    <>
      {showHeading && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg text-[#6B4423]">Filters</h2>
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="hover:bg-[#F5F1E8]">
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
          <Separator />
        </>
      )}

      {/* Selected chips */}
      {anySelected && (
        <div className="flex flex-wrap gap-2">
          {/* Price chip when changed */}
          {!(priceRange[0] === 0 && priceRange[1] === 2000) && (
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => setPriceRange([0, 2000])}
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
                className="rounded-full"
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
              className="rounded-full"
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
              className="rounded-full"
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
          <Slider value={priceRange} onValueChange={setPriceRange} max={2000} step={50} className="w-full" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">₹{priceRange[0]}</span>
            <span className="text-muted-foreground">₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Categories */}
      {!category && (
        <>
          <div className="space-y-4">
            <h3 className="font-medium">Categories</h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={cat.id}
                    checked={selectedCategories.includes(cat.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories([...selectedCategories, cat.id])
                      } else {
                        setSelectedCategories(selectedCategories.filter((c) => c !== cat.id))
                      }
                    }}
                  />
                  <Label htmlFor={cat.id} className="text-sm font-normal cursor-pointer">
                    {cat.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Brands */}
      <div className="space-y-4">
        <h3 className="font-medium">Brands</h3>
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={brand.id}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBrands([...selectedBrands, brand.id])
                  } else {
                    setSelectedBrands(selectedBrands.filter((b) => b !== brand.id))
                  }
                }}
              />
              <Label htmlFor={brand.id} className="text-sm font-normal cursor-pointer">
                {brand.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="font-medium">Tags</h3>
        <div className="space-y-3">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center space-x-2">
              <Checkbox
                id={tag.id}
                checked={selectedTags.includes(tag.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTags([...selectedTags, tag.id])
                  } else {
                    setSelectedTags(selectedTags.filter((t) => t !== tag.id))
                  }
                }}
              />
              <Label htmlFor={tag.id} className="text-sm font-normal cursor-pointer">
                {tag.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile: inline collapsible section below the button (no overlay, no scroll) */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="gap-2 w-full justify-center"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-filters"
        >
          <Filter className="h-4 w-4" /> {mobileOpen ? "Hide Filters" : "Show Filters"}
        </Button>
        {mobileOpen && (
          <div id="mobile-filters" className="mt-3 space-y-6 rounded-2xl border-2 border-[#E8DCC8] bg-white p-5">
            <FiltersInner />
          </div>
        )}
      </div>

      {/* Desktop: original sidebar panel */}
      <div className="hidden lg:block space-y-6 sticky top-24 rounded-2xl border-2 border-[#E8DCC8] bg-white p-5">
        <FiltersInner />
      </div>
    </>
  )
}
