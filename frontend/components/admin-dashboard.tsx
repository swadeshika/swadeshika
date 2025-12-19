"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, TrendingUp, ArrowUp, ArrowDown, AlertTriangle, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ReportService } from "@/lib/reportService"
import { toast } from "sonner"

const iconMap: Record<string, any> = {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  TrendingUp
}

const statusColors: Record<string, string> = {
  delivered: "bg-[#2D5F3F]/10 text-[#2D5F3F]",
  shipped: "bg-[#FF7E00]/10 text-[#FF7E00]",
  processing: "bg-[#8B6F47]/10 text-[#6B4423]",
  pending: "bg-[#FF7E00]/10 text-[#FF7E00]",
  cancelled: "bg-red-100 text-red-600"
}

export function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ReportService.getOverview()
        if (res.data.success) {
          setData(res.data.data)
        }
      } catch (error) {
        console.error("Dashboard fetch error", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-center text-[#8B6F47]">Loading dashboard...</div>
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load data</div>

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold mb-2 text-[#6B4423]">Dashboard</h1>
        <p className="text-[#8B6F47] text-sm md:text-base">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats.map((stat: any) => {
          const Icon = iconMap[stat.icon] || BarChart3
          return (
            <Card key={stat.title} className="rounded-2xl border-2 border-[#E8DCC8]">
              <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
                      <Icon className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                        stat.trend === "up" ? "text-[#2D5F3F]" : "text-red-600"
                      }`}>
                      {stat.trend === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      {stat.change}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-[#6B4423]">{stat.value}</p>
                  <p className="text-xs md:text-sm text-[#8B6F47]">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Low Stock Alerts Section */}
      <Card className="rounded-2xl py-2 md: py-4 border-2 border-[#E8DCC8] bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#FF7E00]" />
            <CardTitle className="text-[#6B4423]">Low Stock Alerts</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild className="bg-transparent border-2 border-[#E8DCC8] hover:bg-accent">
            <Link href="/admin/products?filter=low-stock">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 md:space-y-3">
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No low stock alerts.</p>
          ) : (
            data.lowStockProducts.map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-white rounded-xl border-2 border-[#E8DCC8]">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0 overflow-hidden rounded-md bg-[#F5F1E8] border-2 border-[#E8DCC8]">
                    <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="object-cover w-full h-full"
                    />
                    </div>
                    <div>
                    <p className="font-medium text-xs md:text-sm text-[#6B4423]">{product.name}</p>
                    <p className="text-[10px] md:text-xs text-[#8B6F47]">Threshold: {product.threshold} units</p>
                    </div>
                </div>
                <Badge variant="outline" className="bg-[#FF7E00]/10 text-[#FF7E00] border-0 text-xs md:text-sm">
                    {product.stock} left
                </Badge>
                </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="rounded-2xl py-2 md:px- 3 py-4 border-2 border-[#E8DCC8]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#6B4423]">Recent Orders</CardTitle>
            <Button variant="outline" size="sm" asChild className="bg-transparent border-2 border-[#E8DCC8] hover:bg-accent">
              <Link href="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-4">
            {data.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent orders.</p>
            ) : (
                data.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-2 md:p-4 border-2 border-[#E8DCC8] rounded-xl">
                    <div className="space-y-0 md:space-y-1">
                    <p className="font-semibold text-sm md:text-base text-[#6B4423]">{order.order_number || order.orderNumber}</p>
                    <p className="text-xs md:text-sm text-[#8B6F47]">{order.customer}</p>
                    <p className="text-[10px] md:text-xs text-[#8B6F47]">{order.date}</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                    <div className="text-right">
                        <p className="font-semibold text-sm md:text-base text-[#2D5F3F]">₹{order.amount}</p>
                        <Badge className={`${statusColors[order.status?.toLowerCase()] || statusColors.pending} border-0 text-xs md:text-sm`}>{order.status}</Badge>
                    </div>
                    </div>
                </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="rounded-2xl py-2 md: px-3 py-4 border-2 border-[#E8DCC8]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#6B4423]">Top Products</CardTitle>
            <Button variant="outline" size="sm" asChild className="bg-transparent border-2 border-[#E8DCC8] hover:bg-accent">
              <Link href="/admin/products">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-4">
            {data.topProducts.length === 0 ? (
                 <p className="text-sm text-muted-foreground text-center py-4">No top products.</p>
            ) : (
                data.topProducts.map((product: any, index: number) => (
                <div key={index} className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
                    <div className="relative w-8 h-8 md:w-12 md:h-12 flex-shrink-0 overflow-hidden rounded-md bg-[#F5F1E8] border-2 border-[#E8DCC8]">
                    <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="object-cover w-full h-full"
                    />
                    </div>
                    <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm md:text-base max-w-[10rem] md:max-w-none whitespace-normal text-[#6B4423]">{product.name}</p>
                    <p className="text-xs md:text-sm text-[#8B6F47]">{product.sales} sales</p>
                    </div>
                    <p className="font-semibold text-sm md:text-base text-[#2D5F3F]">₹{product.revenue.toLocaleString()}</p>
                </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
