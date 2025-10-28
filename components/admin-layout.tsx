"use client"

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
  Search,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/auth-store"
import { useToast } from "@/hooks/use-toast"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Coupons", href: "/admin/coupons", icon: Tag },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, logout } = useAuthStore()
  // Track hydration state from Zustand persist to avoid redirect loops on refresh
  const [hasHydrated, setHasHydrated] = useState<boolean>(false)

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
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You must be logged in as an admin to access this page.",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [hasHydrated, isAuthenticated, user, router, toast])

  // Avoid flicker/redirect before hydration completes
  if (!hasHydrated) {
    return null
  }
  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  const Sidebar = () => (
    <div className="flex h-full flex-col gap-6 p-6">
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
          const isActive = pathname === item.href
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
        className="w-full justify-start gap-3 bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8]"
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
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden lg:flex w-64 flex-col border-r-2 border-[#E8DCC8] bg-white">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b-2 border-[#E8DCC8] bg-white">
          <div className="flex h-16 items-center gap-4 px-6">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F47]" />
                <Input placeholder="Search..." className="pl-9 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "AD"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F5F1E8] p-6">{children}</main>
      </div>
    </div>
  )
}
