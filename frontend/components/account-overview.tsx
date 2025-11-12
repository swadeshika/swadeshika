import Link from "next/link"
import { Package, MapPin, Heart, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const recentOrders = [
  {
    id: "1",
    orderNumber: "ORD-20250116-1234",
    date: "Jan 16, 2025",
    status: "Delivered",
    total: 1880,
    items: 2,
  },
  {
    id: "2",
    orderNumber: "ORD-20250110-5678",
    date: "Jan 10, 2025",
    status: "Shipped",
    total: 650,
    items: 1,
  },
]

export function AccountOverview() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-2 border-[#E8DCC8]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6B4423]">12</p>
              <p className="text-sm text-[#8B6F47]">Total Orders</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 border-[#E8DCC8]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6B4423]">3</p>
              <p className="text-sm text-[#8B6F47]">Saved Addresses</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 border-[#E8DCC8]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6B4423]">8</p>
              <p className="text-sm text-[#8B6F47]">Wishlist Items</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 border-[#E8DCC8]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6B4423]">₹8.5k</p>
              <p className="text-sm text-[#8B6F47]">Total Spent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#6B4423]">Recent Orders</CardTitle>
          <Button variant="outline" size="sm" asChild className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8]">
            <Link href="/account/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border-2 border-[#E8DCC8] rounded-xl">
              <div className="space-y-1">
                <p className="font-semibold text-[#6B4423]">{order.orderNumber}</p>
                <p className="text-sm text-[#8B6F47]">
                  {order.date} • {order.items} items
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-[#2D5F3F]">₹{order.total}</p>
                  {order.status === "Delivered" ? (
                    <Badge className="bg-[#2D5F3F]/10 text-[#2D5F3F] border-0">{order.status}</Badge>
                  ) : (
                    <Badge className="bg-[#FF7E00]/10 text-[#FF7E00] border-0">{order.status}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8]">
                    <Link href={`/account/orders/${order.id}`}>View</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">
                    <Link href={`/account/orders/${order.id}/review`}>Write Review</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#6B4423]">Account Details</CardTitle>
          <Button variant="outline" size="sm" asChild className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8]">
            <Link href="/account/settings">Edit</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-[#8B6F47] mb-1">Full Name</p>
              <p className="font-medium text-[#6B4423]">John Doe</p>
            </div>
            <div>
              <p className="text-sm text-[#8B6F47] mb-1">Email</p>
              <p className="font-medium text-[#6B4423]">john@example.com</p>
            </div>
            <div>
              <p className="text-sm text-[#8B6F47] mb-1">Phone</p>
              <p className="font-medium text-[#6B4423]">+91 1234567890</p>
            </div>
            <div>
              <p className="text-sm text-[#8B6F47] mb-1">Member Since</p>
              <p className="font-medium text-[#6B4423]">January 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
