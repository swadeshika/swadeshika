"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, TrendingUp, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const stats = [
  {
    title: "Total Revenue",
    value: "₹1,24,580",
    change: "+12.5%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Total Orders",
    value: "156",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Total Products",
    value: "48",
    change: "+3",
    trend: "up",
    icon: Package,
  },
  {
    title: "Total Customers",
    value: "892",
    change: "+15.3%",
    trend: "up",
    icon: Users,
  },
]

const recentOrders = [
  {
    id: "1",
    orderNumber: "ORD-20250116-1234",
    customer: "Priya Sharma",
    amount: 1880,
    status: "Delivered",
    date: "2 hours ago",
  },
  {
    id: "2",
    orderNumber: "ORD-20250116-5678",
    customer: "Rajesh Kumar",
    amount: 650,
    status: "Shipped",
    date: "5 hours ago",
  },
  {
    id: "3",
    orderNumber: "ORD-20250116-9012",
    customer: "Anita Desai",
    amount: 1200,
    status: "Processing",
    date: "1 day ago",
  },
  {
    id: "4",
    orderNumber: "ORD-20250115-3456",
    customer: "Vikram Singh",
    amount: 450,
    status: "Pending",
    date: "1 day ago",
  },
]

const topProducts = [
  { name: "Pure Desi Cow Ghee", sales: 124, revenue: 105400, image: "/golden-ghee-in-glass-jar.jpg" },
  { name: "Organic Turmeric Powder", sales: 89, revenue: 16020, image: "/turmeric-powder-in-bowl.jpg" },
  { name: "Premium Kashmiri Almonds", sales: 56, revenue: 36400, image: "/kashmiri-almonds.jpg" },
  { name: "Cold Pressed Coconut Oil", sales: 43, revenue: 13760, image: "/coconut-oil-in-glass-bottle.jpg" },
]

const lowStockProducts = [
  { name: "Cold Pressed Coconut Oil", stock: 5, threshold: 20, image: "/coconut-oil-in-glass-bottle.jpg" },
  { name: "Organic Honey", stock: 8, threshold: 15, image: "/golden-honey-jar.png" },
  { name: "Basmati Rice", stock: 12, threshold: 25, image: "/rice-bag.png" },
]

const statusColors: Record<string, string> = {
  Delivered: "bg-[#2D5F3F]/10 text-[#2D5F3F]",
  Shipped: "bg-[#FF7E00]/10 text-[#FF7E00]",
  Processing: "bg-[#8B6F47]/10 text-[#6B4423]",
  Pending: "bg-[#FF7E00]/10 text-[#FF7E00]",
}

export function AdminDashboard() {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-2 text-[#6B4423]">Dashboard</h1>
        <p className="text-[#8B6F47]">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="rounded-2xl border-2 border-[#E8DCC8]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-[#2D5F3F]" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#6B4423]">{stat.value}</p>
                <p className="text-sm text-[#8B6F47]">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Low Stock Alerts Section */}
      <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8] bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#FF7E00]" />
            <CardTitle className="text-[#6B4423]">Low Stock Alerts</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8]">
            <Link href="/admin/products?filter=low-stock">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {lowStockProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-[#E8DCC8]">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden rounded-md bg-[#F5F1E8] border-2 border-[#E8DCC8]">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm text-[#6B4423]">{product.name}</p>
                  <p className="text-xs text-[#8B6F47]">Threshold: {product.threshold} units</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-[#FF7E00]/10 text-[#FF7E00] border-0">
                {product.stock} left
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#6B4423]">Recent Orders</CardTitle>
            <Button variant="outline" size="sm" asChild className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8]">
              <Link href="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border-2 border-[#E8DCC8] rounded-xl">
                <div className="space-y-1">
                  <p className="font-semibold text-[#6B4423]">{order.orderNumber}</p>
                  <p className="text-sm text-[#8B6F47]">{order.customer}</p>
                  <p className="text-xs text-[#8B6F47]">{order.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-[#2D5F3F]">₹{order.amount}</p>
                    <Badge className={`${statusColors[order.status]} border-0`}>{order.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#6B4423]">Top Products</CardTitle>
            <Button variant="outline" size="sm" asChild className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8]">
              <Link href="/admin/products">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-md bg-[#F5F1E8] border-2 border-[#E8DCC8]">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-[#6B4423]">{product.name}</p>
                  <p className="text-sm text-[#8B6F47]">{product.sales} sales</p>
                </div>
                <p className="font-semibold text-[#2D5F3F]">₹{product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
