"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, Suspense } from "react"
import { useRouter, usePathname } from "next/navigation"
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
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
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
import { DesktopSearch, MobileSearch } from "./site-search"
// ... imports
import { buildCategoryTree } from "@/lib/category-utils"

// ... existing types
type NavItem = {
  name: string
  href: string
  // Changed submenu to support nesting
  submenu?: {
    name: string;
    href: string;
    children?: { name: string; href: string }[]
  }[]
}

const mainNav: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  {
    name: "Categories",
    href: "#",
    submenu: [],
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
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
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

        // Use tree builder to create nested structure
        const categoryTree = buildCategoryTree(categories || []);

        // Map tree to submenu items
        const categorySubmenu = categoryTree
          .filter(c => c.is_active !== false)
          // Showing ALL top-level categories
          .map(c => {
            const subs = c.children || [];

            // Showing ALL sub-categories
            const displayedSubs = subs.map(sub => ({
              name: sub.name,
              href: `/shop/${sub.slug}`
            }));

            // No "View All" needed if showing all

            return {
              name: c.name,
              href: `/shop/${c.slug}`,
              children: displayedSubs
            };
          });


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
              <nav className="hidden lg:flex ml-4 sm:ml-6 lg:ml-10 space-x-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                  const isMegaMenu = item.name === "Categories"

                  return (
                    <div key={item.name} className="relative group">
                      <Link
                        href={item.href}
                        className={`
                        flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer
                        ${isActive
                            ? "bg-[#2D5F3F] text-white shadow-md shadow-[#2D5F3F]/20"
                            : "text-gray-700 hover:bg-[#F4EFE6] hover:text-[#2D5F3F]"
                          }
                      `}
                      >
                        {item.name}
                        {item.submenu && (
                          <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${isActive ? "text-white/80" : "text-gray-400 group-hover:text-[#2D5F3F]"} group-hover:rotate-180`} />
                        )}
                      </Link>

                      {/* Mega Menu & Dropdown Logic */}
                      {item.submenu && item.submenu.length > 0 && (
                        <div
                          className={`
                            absolute top-full pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-20
                            ${isMegaMenu
                              ? "fixed left-1/2 -translate-x-1/2 w-[90vw] max-w-6xl mt-0 px-4"
                              : "left-0 w-72"
                            }
                          `}
                          style={isMegaMenu ? { position: 'fixed', top: '3.5rem' } : {}}
                        >
                          <div className={`
                            rounded-2xl shadow-xl bg-white border border-[#E8DCC8]/50 ring-1 ring-black/5 overflow-hidden
                            ${isMegaMenu ? "p-8 w-full" : "p-2 bg-gradient-to-b from-white to-[#FDFBF7]"}
                          `}>
                            {isMegaMenu ? (
                              // --- MEGA MENU LAYOUT ---
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
                                {item.submenu.map((category) => (
                                  <div key={category.name} className="space-y-4">
                                    <Link
                                      href={category.href}
                                      className="flex items-center justify-between text-base font-bold text-[#5C4033] hover:text-[#2D5F3F] border-b border-[#E8DCC8] pb-2 transition-colors group/cat"
                                    >
                                      {category.name}
                                      {/* <ChevronRight className="h-4 w-4 opacity-0 group-hover/cat:opacity-100 transition-opacity" /> */}
                                    </Link>
                                    <ul className="space-y-2.5">
                                      {category.children?.map((sub) => (
                                        <li key={sub.name}>
                                          <Link
                                            href={sub.href}
                                            className="text-[14px] text-[#8B6F47] hover:text-[#2D5F3F] hover:translate-x-1 transition-all duration-200 block"
                                          >
                                            {sub.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              // --- STANDARD DROPDOWN LAYOUT ---
                              item.submenu.map((subItem) => (
                                <div key={subItem.name} className="relative group/sub">
                                  <Link
                                    href={subItem.href}
                                    className="flex items-center justify-between px-4 py-3 text-[15px] font-medium text-[#5C4033] rounded-xl hover:bg-[#F4EFE6] hover:text-[#2D5F3F] transition-colors duration-200"
                                  >
                                    <span className="truncate">{subItem.name}</span>
                                    {subItem.children && subItem.children.length > 0 && (
                                      <ChevronDown className="h-4 w-4 text-[#8B6F47] -rotate-90 group-hover/sub:text-[#2D5F3F] transition-transform" />
                                    )}
                                  </Link>

                                  {/* Nested Submenu (Level 2) */}
                                  {subItem.children && subItem.children.length > 0 && (
                                    <div className="absolute left-full top-0 ml-2 w-64 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-30 before:absolute before:content-[''] before:-left-2 before:top-0 before:h-full before:w-4">
                                      <div className="rounded-2xl shadow-xl bg-white border border-[#E8DCC8]/50 overflow-hidden ring-1 ring-black/5">
                                        <div className="p-2 bg-white">
                                          {subItem.children.map(child => (
                                            <Link
                                              key={child.name}
                                              href={child.href}
                                              className="block px-4 py-2.5 text-sm font-medium text-[#6B5A4E] rounded-lg hover:bg-[#F4EFE6] hover:text-[#2D5F3F] transition-colors duration-200"
                                            >
                                              {child.name}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
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
              <Suspense fallback={<div className="hidden lg:block relative w-64 h-10 bg-gray-100 rounded-full animate-pulse" />}>
                <DesktopSearch />
              </Suspense>

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
            <Suspense fallback={<div className="lg:hidden h-12 bg-gray-100 animate-pulse my-2 rounded-lg" />}>
              <MobileSearch onSearchSubmit={() => setIsSearchOpen(false)} />
            </Suspense>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-full max-w-xs sm:max-w-md p-0">
            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
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
                            <div key={subItem.name}>
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="block py-2 text-sm text-gray-600 hover:text-primary cursor-pointer"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {subItem.name}
                              </Link>
                              {/* Mobile sub-submenu */}
                              {subItem.children && (
                                <div className="pl-4 border-l border-gray-200">
                                  {subItem.children.map(child => (
                                    <Link
                                      key={child.name}
                                      href={child.href}
                                      className="block py-1 text-sm text-gray-500 hover:text-primary cursor-pointer"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
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