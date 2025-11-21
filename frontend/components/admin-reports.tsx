"use client"

/**
 * Admin Reports
 *
 * Purpose
 * - Presents key business metrics with a date range filter and export options.
 * - Keeps data client-side with mock derivations; ready to swap with API later.
 *
 * Key Features
 * - Date range selector (7/30/90/365 days) influencing KPIs and sections
 * - CSV export (overall summary + per-section where useful)
 * - Consistent admin styling and accessible markup
 *
 * Notes
 * - All data is mock-derived deterministically from the selected range.
 * - Replace the `deriveData` function with API calls to fetch real metrics.
 */

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, BarChart3, ShoppingCart, Users, Package, CreditCard, Wallet, Percent, RotateCcw } from "lucide-react"

export function AdminReports() {
  const [range, setRange] = useState<"7" | "30" | "90" | "365">("30")

  // Helper to format currency numbers
  const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`

  // CSV export helper
  const exportCsv = (filename: string, header: string[], rows: (string | number)[][]) => {
    const csv = [header, ...rows]
      .map((r) => r.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Derive mock data from selected range
  const data = useMemo(() => {
    const days = Number(range)
    const factor = days / 30 // 30 days baseline
    const revenue = 124580 * factor
    const orders = 156 * factor
    const products = 48 // static in mock
    const customers = 892 * (factor * 0.8)

    const ordersByStatus = [
      { label: "Pending", value: Math.round(18 * factor), color: "#FF7E00" },
      { label: "Processing", value: Math.round(32 * factor), color: "#8B6F47" },
      { label: "Shipped", value: Math.round(44 * factor), color: "#2D5F3F" },
      { label: "Delivered", value: Math.round(56 * factor), color: "#2D5F3F" },
      { label: "Cancelled", value: Math.round(6 * factor), color: "#DC2626" },
    ]

    const paymentMethods = [
      { icon: CreditCard, name: "Razorpay/UPI", value: 62 },
      { icon: Wallet, name: "COD", value: 28 },
      { icon: CreditCard, name: "Cards", value: 10 },
    ]

    const salesByCategory = [
      { name: "Ghee", value: Math.round(405000 * factor) },
      { name: "Spices", value: Math.round(164000 * factor) },
      { name: "Dry Fruits", value: Math.round(254000 * factor) },
      { name: "Oils", value: Math.round(98000 * factor) },
    ]

    const topCustomers = ["Priya Sharma", "Rajesh Kumar", "Anita Desai", "Vikram Singh"].map((name, i) => ({
      name,
      spent: Math.round((100000 - i * 8500) * factor),
    }))

    const topProducts = [
      "Pure Desi Cow Ghee",
      "Organic Turmeric Powder",
      "Kashmiri Almonds",
      "Coconut Oil",
    ].map((name, i) => ({ name, sales: Math.round((120 - i * 8) * factor) }))

    const coupons = [
      { code: "WELCOME10", usage: Math.round(45 * factor), limit: 100, revenue: Math.round(54000 * factor) },
      { code: "NEWYEAR25", usage: Math.round(198 * factor), limit: 200, revenue: Math.round(82000 * factor) },
      { code: "FLAT200", usage: Math.round(32 * factor), limit: 50, revenue: Math.round(14000 * factor) },
    ]

    const returns = [
      { label: "Return Rate", value: `${(2.1 * factor).toFixed(1)}%` },
      { label: "Avg. Resolution Time", value: `${(1.8 / factor).toFixed(1)} days` },
      { label: "Refunded Amount", value: inr(12450 * factor) },
    ]

    return {
      kpis: [
        { title: "Revenue", value: inr(revenue), icon: BarChart3 },
        { title: "Orders", value: Math.round(orders).toString(), icon: ShoppingCart },
        { title: "Products", value: products.toString(), icon: Package },
        { title: "Customers", value: Math.round(customers).toString(), icon: Users },
      ],
      ordersByStatus,
      paymentMethods,
      salesByCategory,
      topCustomers,
      topProducts,
      coupons,
      returns,
    }
  }, [range])

  const exportOverview = () => {
    exportCsv("reports-overview.csv", ["Metric", "Value"], data.kpis.map((k) => [k.title, k.value]))
  }

  const exportCategories = () => {
    exportCsv("sales-by-category.csv", ["Category", "Value"], data.salesByCategory.map((r) => [r.name, r.value]))
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#6B4423]">Reports</h1>
          <p className="text-[#8B6F47]">Analyze performance across sales, products, and customers</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={range} onValueChange={(v) => setRange(v as any)}>
            <SelectTrigger className="w-40 border-2 border-[#E8DCC8]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportOverview} variant="outline" className="gap-2 bg-transparent border-2 border-[#E8DCC8] hover:bg-[#FF7E00]">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.kpis.map((kpi) => (
          <Card key={kpi.title} className="rounded-2xl border-2 border-[#E8DCC8]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#6B4423]">{kpi.value}</p>
              <p className="text-sm text-[#8B6F47]">{kpi.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders by Status and Payment Methods */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.ordersByStatus.map((s) => (
              <div key={s.label} className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-[#E8DCC8]">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{backgroundColor: s.color}} />
                  <p className="text-[#6B4423]">{s.label}</p>
                </div>
                <p className="font-semibold text-[#2D5F3F]">{s.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.paymentMethods.map((m) => (
              <div key={m.name} className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-[#E8DCC8]">
                <div className="flex items-center gap-2 text-[#6B4423]">
                  <m.icon className="h-4 w-4" />
                  <span>{m.name}</span>
                </div>
                <div className="flex items-center gap-2 w-28">
                  <div className="flex-1 h-2 bg-[#F5F1E8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#2D5F3F]" style={{width: `${m.value}%`}} />
                  </div>
                  <span className="text-sm font-medium text-[#2D5F3F]">{m.value}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sales by Category */}
      <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#6B4423]">Sales by Category</CardTitle>
          <Button onClick={exportCategories} variant="outline" size="sm" className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8]">
            Export
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.salesByCategory.map((row) => (
            <div key={row.name} className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-[#E8DCC8]">
              <p className="font-medium text-[#6B4423]">{row.name}</p>
              <p className="font-semibold text-[#2D5F3F]">₹{row.value.toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Customers & Top Products */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Top Customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topCustomers.map((row, i) => (
              <div key={row.name} className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-[#E8DCC8]">
                <p className="text-[#6B4423]">{i + 1}. {row.name}</p>
                <p className="font-semibold text-[#2D5F3F]">{inr(row.spent)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topProducts.map((row, i) => (
              <div key={row.name} className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-[#E8DCC8]">
                <p className="text-[#6B4423]">{i + 1}. {row.name}</p>
                <p className="font-semibold text-[#2D5F3F]">{row.sales} sales</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Coupon Performance & Returns */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#6B4423]">Coupon Performance</CardTitle>
            <Percent className="h-5 w-5 text-[#8B6F47]" />
          </CardHeader>
          <CardContent className="space-y-3">
            {data.coupons.map((c) => (
              <div key={c.code} className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-[#E8DCC8]">
                <div className="flex items-center gap-2">
                  <code className="font-mono font-semibold bg-[#F5F1E8] border-2 border-[#E8DCC8] text-[#6B4423] px-2 py-1 rounded">{c.code}</code>
                  <span className="text-sm text-[#8B6F47]">{c.usage}/{c.limit}</span>
                </div>
                <p className="font-semibold text-[#2D5F3F]">{inr(c.revenue)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#6B4423]">Returns & Refunds</CardTitle>
            <RotateCcw className="h-5 w-5 text-[#8B6F47]" />
          </CardHeader>
          <CardContent className="space-y-3">
            {data.returns.map((r) => (
              <div key={r.label} className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-[#E8DCC8]">
                <p className="text-[#6B4423]">{r.label}</p>
                <p className="font-semibold text-[#2D5F3F]">{r.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
