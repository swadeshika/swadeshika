"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  User,
  Menu,
  Heart,
  MapPin,
  ChevronDown,
  LogIn,
  UserPlus,
  Package2,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { CartButton } from "@/components/cart-button"
import { AnnouncementBar } from "@/components/announcement-bar"
import { useAuthStore } from "@/lib/auth-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Navigation data
const mainNav = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  {
    name: "Categories",
    href: "#",
    submenu: [
      { name: "Ghee & Butter", href: "/shop/ghee" },
      { name: "Spices & Masalas", href: "/shop/spices" },
      { name: "Dry Fruits & Nuts", href: "/shop/dry-fruits" },
      { name: "Cold-Pressed Oils", href: "/shop/oils" },
      { name: "Flours & Grains", href: "/shop/flours" },
    ],
  },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
]

const utilityNav = [
  { name: "Track Order", href: "/track-order", icon: MapPin },
  { name: "FAQs", href: "/faqs", icon: null },
]

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [mobileSearchValue, setMobileSearchValue] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // State for dynamic navigation
  const [navItems, setNavItems] = useState(mainNav)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { productService } = await import("@/lib/services/productService");
        const categories = await productService.getAllCategories();
        
        // Map backend categories to submenu items
        // Filter out empty or invalid categories if needed
        const categorySubmenu = categories
            .filter(c => c.is_active !== false) // Assuming is_active exists, or just show all
            .slice(0, 10) // Limit to top 10 to clear UI
            .map(c => ({
                name: c.name,
                href: `/shop/${c.slug || c.id}` // Fallback to ID if slug missing
            }));

        if (categorySubmenu.length > 0) {
            setNavItems(prev => prev.map(item => {
                if (item.name === "Categories") {
                    return { ...item, submenu: categorySubmenu };
                }
                return item;
            }));
        }
      } catch (error) {
        console.error("Failed to fetch menu categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const searchParams = useSearchParams()

  useEffect(() => {
    const q = searchParams.get('q') || ""
    setSearchValue(q)
    setMobileSearchValue(q)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent, isMobile = false) => {
    e.preventDefault()
    const query = isMobile ? mobileSearchValue.trim() : searchValue.trim()
    if (query) {
      router.push(`/shop?q=${encodeURIComponent(query)}`)
      if (isMobile) {
        // Option A: Close search bar but keep value
        setIsSearchOpen(false) 
        // Option B: Keep it open? Standard behavior is usually to close mobile search overlay after submit
        // But user asked about "input clear ho jata h".
        // If I close it, they won't see it anyway until they reopen.
        // But simply NOT clearing it means next time they open, it's there.
        // Desktop search is always visible so it MUST not be clear.
      }
      // Removed setSearchValue("") to keep the input filled
    }
  }

  // Use navItems instead of mainNav in render


  return (
    <>
      <AnnouncementBar />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        {/* Reduced left & right padding */}
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
          {/* Top Bar */}
          <div className="h-14 flex items-center justify-between w-full">
            {/* Logo + Navigation */}
            <div className="flex items-center flex-1 min-w-0">
              <Link href="/" className="flex-shrink-0 cursor-pointer">
                <div className="h-10 w-28 sm:w-40 relative">
                  <Image
                    src="/logo.png"
                    alt="Swadeshika"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex ml-4 sm:ml-6 lg:ml-10 space-x-6">
                {navItems.map((item) => (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className="flex items-center px-1 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors cursor-pointer"
                    >
                      {item.name}
                      {item.submenu && (
                        <ChevronDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-primary" />
                      )}
                    </Link>

                    {/* Submenu */}
                    {item.submenu && (
                      <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="py-1">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-primary cursor-pointer"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Desktop Search */}
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

              {/* User Dropdown */}
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-white hover:bg-primary cursor-pointer"
                    >
                      <User className="h-5 w-5" />
                      <span className="sr-only">User Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center justify-start p-2">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/account" className="w-full cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>My Account</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/account/orders" className="w-full cursor-pointer">
                            <Package2 className="mr-2 h-4 w-4" />
                            <span>My Orders</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/account/wishlist" className="w-full cursor-pointer">
                            <Heart className="mr-2 h-4 w-4" />
                            <span>Wishlist</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Logout</span>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/login" className="w-full cursor-pointer">
                            <LogIn className="mr-2 h-4 w-4" />
                            <span>Sign In</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/signup" className="w-full cursor-pointer">
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span>Create Account</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Wishlist */}
              <Link
                href="/account/wishlist"
                className="lg:hidden p-2 text-gray-600 hover:text-white hover:bg-primary rounded-full transition-colors relative cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <div className="relative">
                <CartButton />
              </div>

              {/* Mobile Menu Button */}
              <Button
                type="button"
                className="lg:hidden p-2 text-white bg-[#2D5F3F] hover:bg-[#234A32] hover:scale-105 transform transition-all shadow-sm cursor-pointer"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          {isSearchOpen && (
            <div className="lg:hidden py-3">
              <form onSubmit={(e) => handleSearch(e, true)} className="flex">
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
                  onClick={(e) => handleSearch(e, true)}
                >
                  Search
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-full max-w-xs sm:max-w-md p-0">
            <div className="h-full overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <Link
                  href="/"
                  className="flex items-center cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="h-8 w-32 relative">
                    <Image
                      src="/logo.png"
                      alt="Swadeshika"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>
              </div>

              <div className="p-4">
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <div key={item.name} className="border-b border-gray-100">
                      <Link
                        href={item.href}
                        className="flex items-center justify-between py-3 text-base font-medium text-gray-900 hover:text-primary cursor-pointer"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                        {item.submenu && (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </Link>
                      {item.submenu && (
                        <div className="pl-4 py-2 space-y-2">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block py-2 text-sm text-gray-600 hover:text-primary cursor-pointer"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="space-y-4">
                    {utilityNav.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center text-base font-medium text-gray-900 hover:text-primary cursor-pointer"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.icon && <item.icon className="mr-2 h-5 w-5" />}
                        {item.name}
                      </Link>
                    ))}
                    
                    {isAuthenticated ? (
                      <>
                        <div className="py-2 px-1">
                          <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link
                          href="/account"
                          className="flex items-center text-base font-medium text-gray-900 hover:text-primary cursor-pointer"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="mr-2 h-5 w-5" />
                          My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          className="flex items-center text-base font-medium text-gray-900 hover:text-primary cursor-pointer"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Package2 className="mr-2 h-5 w-5" />
                          My Orders
                        </Link>
                        <button
                          className="flex items-center w-full text-left text-base font-medium text-red-600 hover:text-red-700 cursor-pointer"
                          onClick={() => {
                            handleLogout()
                            setMobileMenuOpen(false)
                          }}
                        >
                          <LogOut className="mr-2 h-5 w-5" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="flex items-center text-base font-medium text-gray-900 hover:text-primary cursor-pointer"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LogIn className="mr-2 h-5 w-5" />
                          Sign In
                        </Link>
                        <Link
                          href="/signup"
                          className="flex items-center text-base font-medium text-gray-900 hover:text-primary cursor-pointer"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserPlus className="mr-2 h-5 w-5" />
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  )
}