"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function DesktopSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    const q = searchParams.get('q') || ""
    setSearchValue(q)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchValue.trim()
    if (query) {
      router.push(`/shop?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="hidden lg:block relative w-64">
      <form onSubmit={handleSearch}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search products..."
          className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>
    </div>
  )
}

interface MobileSearchProps {
  onSearchSubmit?: () => void
}

export function MobileSearch({ onSearchSubmit }: MobileSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileSearchValue, setMobileSearchValue] = useState("")

  useEffect(() => {
    const q = searchParams.get('q') || ""
    setMobileSearchValue(q)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = mobileSearchValue.trim()
    if (query) {
      router.push(`/shop?q=${encodeURIComponent(query)}`)
      if (onSearchSubmit) {
        onSearchSubmit()
      }
    }
  }

  return (
    <div className="lg:hidden py-3">
      <form onSubmit={handleSearch} className="flex">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            value={mobileSearchValue}
            onChange={(e) => setMobileSearchValue(e.target.value)}
            autoFocus
          />
        </div>
        <Button
          type="submit"
          variant="ghost"
          className="ml-2 text-primary hover:bg-primary hover:text-white"
        >
          Search
        </Button>
      </form>
    </div>
  )
}
