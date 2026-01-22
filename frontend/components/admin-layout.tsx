"use client"

/**
 * AdminLayout
 *
 * Purpose:
 * - Provides the shell for all admin routes with a persistent sidebar, top header, and scrollable content area.
 *
 * Key Features:
 * - Auth guard: redirects non-admin users to login after Zustand hydration.
 * - Responsive sidebar: static on desktop, drawer via Sheet on mobile.
 * - Right-aligned header actions: notifications dropdown with unread badge and user menu (settings/logout).
 * - Robust scrolling: prevents double scrollbars using min-h-0 and overflow-y-auto on the correct containers.
 *
 * Implementation Notes:
 * - Hook order is kept stable by declaring header state before early returns.
 * - Sidebar and SheetContent use overflow-y-auto to remain usable on smaller screens.
 * - Logout clears auth/cart state and localStorage fallbacks before redirect.
 */

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  BarChart3,
  Menu,
  Bell,
  LogOut,
  FileText,
  PlusCircle,
  Ghost,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/auth-store"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/hooks/useNotifications"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Reviews", href: "/admin/reviews", icon: Ghost },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Contacts", href: "/admin/contacts", icon: Users },
  // { name: "Newsletter", href: "/admin/newsletter", icon: Mail }, // Commented out - Newsletter feature disabled
  { name: "Categories", href: "/admin/categories", icon: Tag },
  {
    name: "Blog",
    icon: FileText,
    items: [
      { name: "All Posts", href: "/admin/blog" },
      { name: "Add New", href: "/admin/blog/new" },
      { name: "Categories", href: "/admin/blog/categories" },
      { name: "Authors", href: "/admin/blog/authors" },
    ],
  },
  { name: "Coupons", href: "/admin/coupons", icon: Tag },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore()
  // Track hydration state from Zustand persist to avoid redirect loops on refresh
  const [hasHydrated, setHasHydrated] = useState<boolean>(false)
  // Track open/close state of dropdowns
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  
  // Real-time notifications hook
  const { 
    notifications, 
    connected, 
    loading: notificationsLoading,
    markAsRead, 
    markAllAsRead, 
    clearAll, 
    unreadCount 
  } = useNotifications()

  useEffect(() => {
    // Immediately set current hydration status (in case it's already done)
    const initial = (useAuthStore as any).persist?.hasHydrated?.() ?? false
    setHasHydrated(initial)
    // Subscribe to finish hydration event to flip the flag when ready
    const unsub = (useAuthStore as any).persist?.onFinishHydration?.(() => setHasHydrated(true))
    return () => {
      if (typeof unsub === "function") unsub()
    }
  }, [])

  useEffect(() => {
    // Wait for both Zustand hydration and manual initialization (AuthInitializer)
    if (!hasHydrated || !isInitialized) return
    
    // Normalize role for comparison
    const normalizedRole = user?.role?.toLowerCase().trim();
    console.log(`[AdminLayout] Auth Check - Role: ${user?.role}, Normalized: ${normalizedRole}, Authenticated: ${isAuthenticated}, Initialized: ${isInitialized}`);

    if (!isAuthenticated || normalizedRole !== "admin") {
      toast({
        title: "Access Denied",
        description: `You must be logged in as an admin to access this page.`,
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [hasHydrated, isInitialized, isAuthenticated, user, router, toast])

  // Avoid flicker/redirect before hydration and initialization complete
  if (!hasHydrated || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F1E8]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-[#2D5F3F] border-t-transparent animate-spin"></div>
          <p className="text-[#6B4423] font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }
  if (!isAuthenticated || user?.role?.toLowerCase().trim() !== "admin") {
    return null
  }

  const Sidebar = () => (
    <div className="flex h-full flex-col gap-6 p-6 overflow-y-auto">
      <Link href="/admin" className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2D5F3F] text-white font-sans font-bold text-xl">
          S
        </div>
        <div>
          <span className="font-sans text-xl font-bold text-[#6B4423]">Swadeshika</span>
          <p className="text-xs text-[#8B6F47]">Admin Panel</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const isActive = item.items 
            ? item.items.some(navItem => pathname === navItem.href) 
            : pathname === item.href
          
          if (item.items) {
            const isOpen = openDropdown === item.name || isActive
            
            return (
              <div key={item.name} className="space-y-1">
                <div 
                  onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#2D5F3F] text-white border-[#2D5F3F]"
                      : "border-[#E8DCC8] hover:bg-[#F5F1E8] text-[#6B4423]"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium flex-1">{item.name}</span>
                  <svg 
                    className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {isOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                          pathname === subItem.href
                            ? 'text-[#2D5F3F] font-medium bg-[#E8F5E9]'
                            : 'text-[#6B4423] hover:bg-[#F5F1E8]'
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2 transition-colors ${
                isActive
                  ? "bg-[#2D5F3F] text-white border-[#2D5F3F]"
                  : "border-[#E8DCC8] hover:bg-[#F5F1E8] text-[#6B4423]"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <Button
        variant="outline"
        className="w-full text-red-500  justify-start gap-3 bg-transparent border-2 border-[#E8DCC8]"
        onClick={() => {
          try {
            // 1) Clear auth state
            logout()
            ;(useAuthStore as any).persist?.clearStorage?.()
            // 2) Clear cart and its persistence
            try {
              const { useCartStore } = require("@/lib/cart-store")
              useCartStore.getState().clearCart()
              ;(useCartStore as any).persist?.clearStorage?.()
            } catch {}
            // 3) As a fallback, remove known localStorage keys
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("auth-storage")
              window.localStorage.removeItem("cart-storage")
            }
          } finally {
            toast({
              title: "Logged Out",
              description: "You have been successfully logged out.",
            })
            router.replace("/login")
          }
        }}
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </Button>
    </div>
  )

  return (
    <div className="flex overflow-hidden">
      <aside className="hidden lg:flex w-64 flex-col border-r-2 border-[#E8DCC8] bg-white overflow-y-auto">
        <Sidebar />
      </aside>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <header className="border-b-2 border-[#E8DCC8] bg-white">
          <div className="flex h-16 items-center gap-4 px-6">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 h-full overflow-y-auto">
                <Sidebar />
              </SheetContent>
            </Sheet>

            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[#2D5F3F] text-white text-[10px] flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-sm text-[#8B6F47]">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem key={n.id} className="group flex flex-col items-start gap-1 hover:bg-[#2D5F3F]">
                        <span className={`text-sm ${n.read ? "text-[#8B6F47]" : "text-[#6B4423] font-medium"} group-hover:text-white`}>{n.title}</span>
                        {n.description && <span className="text-xs text-[#8B6F47] group-hover:text-white">{n.description}</span>}
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <Button variant="outline" size="sm" className="bg-transparent" onClick={markAllAsRead}>Mark all read</Button>
                    <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
                    <Avatar >
                      <AvatarFallback >{user?.name?.substring(0, 2).toUpperCase() || "AD"}</AvatarFallback>
                    </Avatar> 
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user?.name || "Admin"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/admin/settings")}>Settings</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        logout()
                        ;(useAuthStore as any).persist?.clearStorage?.()
                        try {
                          const { useCartStore } = require("@/lib/cart-store")
                          useCartStore.getState().clearCart()
                          ;(useCartStore as any).persist?.clearStorage?.()
                        } catch {}
                        if (typeof window !== "undefined") {
                          window.localStorage.removeItem("auth-storage")
                          window.localStorage.removeItem("cart-storage")
                        }
                      } finally {
                        toast({ title: "Logged Out", description: "You have been successfully logged out." })
                        router.replace("/login")
                      }
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto bg-[#F5F1E8] p-6">{children}</main>
      </div>
    </div>
  )
}
