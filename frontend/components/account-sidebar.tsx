"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Package, MapPin, Heart, Settings, LogOut, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const menuItems = [
  { icon: User, label: "Account Overview", href: "/account" },
  { icon: Package, label: "My Orders", href: "/account/orders" },
  { icon: Star, label: "Write Reviews", href: "/account/reviews" },
  { icon: MapPin, label: "Addresses", href: "/account/addresses" },
  { icon: Heart, label: "Wishlist", href: "/account/wishlist" },
  { icon: Settings, label: "Settings", href: "/account/settings" },
]

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <Card className="sticky top-24 rounded-2xl border-2 border-[#E8DCC8]">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg text-[#6B4423]">John Doe</h3>
          <p className="text-sm text-[#8B6F47]">john@example.com</p>
        </div>

        <Separator className="bg-[#E8DCC8]" />

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors border-2 ${
                  isActive
                    ? "bg-[#2D5F3F] text-white border-[#2D5F3F]"
                    : "border-[#E8DCC8] hover:bg-[#F5F1E8] text-[#6B4423]"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <Separator className="bg-[#E8DCC8]" />

        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive">
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </Button>
      </CardContent>
    </Card>
  )
}
