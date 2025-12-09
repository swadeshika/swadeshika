"use client"

/**
 * Admin Orders List
 *
 * Purpose
 * - Displays the orders table in the Admin panel with search, filter, and export capabilities.
 * - Ensures a consistent UI with the rest of the admin area (rounded cards, subtle borders, brand colors).
 *
 * Key Features
 * - Client-side search across order number, customer name, email, and status (case-insensitive)
 * - Status filter (all/pending/processing/shipped/delivered/cancelled)
 * - CSV export of the currently filtered results
 * - Empty state messaging when no orders match
 * - Quick view action linking to the order details page
 *
 * Notes
 * - Data is mocked locally; swap to API integration later while keeping the same UI contract.
 * - Export produces a UTF-8 CSV and downloads it client-side.
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Eye, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ordersService, Order } from "@/lib/services/ordersService"
import { toast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce" // Assuming you have this or will implement simple debounce

const statusColors: Record<string, string> = {
  delivered: "bg-[#2D5F3F]/10 text-[#2D5F3F]",
  shipped: "bg-[#FF7E00]/10 text-[#FF7E00]",
  processing: "bg-[#8B6F47]/10 text-[#6B4423]",
  pending: "bg-[#FF7E00]/10 text-[#FF7E00]",
  cancelled: "bg-red-100 text-red-700",
}

export function AdminOrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })

  // Simple debounce logic if hook not valid
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await ordersService.getAllOrders({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        search: debouncedSearch
      })
      setOrders(data.orders || []) // Backend returns { orders: [], pagination: {} }
      setPagination(prev => ({ ...prev, ...data.pagination }))
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Effect to load data when filters change
  useEffect(() => {
    fetchOrders()
  }, [debouncedSearch, statusFilter, pagination.page]) // Add pagination.page dependency if implementing page buttons

  // Export the currently filtered orders as CSV
  const handleExportCsv = () => {
    const header = ["Order Number", "Customer ID", "Amount", "Status", "Date"]
    const rows = orders.map((o) => [
      o.orderNumber,
      o.user?.id || "Guest",
      o.totalAmount,
      o.status,
      new Date(o.createdAt || "").toLocaleDateString(),
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "orders.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
        <div className="mb-4 sm:mb-0">
          <h1 className="font-serif text-3xl font-bold mb-2 text-[#6B4423]">Orders</h1>
          <p className="text-[#8B6F47]">Manage and track customer orders</p>
        </div>
        <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-3 sm:mt-0">
          <Button onClick={handleExportCsv} variant="outline" className="gap-2 bg-transparent border-2 border-[#E8DCC8] hover:bg-accent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-2 border-[#E8DCC8]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F47]" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 border-2 border-[#E8DCC8] focus:ring-0">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border-2 border-[#E8DCC8] overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#6B4423]">Order Number</TableHead>
                  <TableHead className="text-[#6B4423]">Customer</TableHead>
                  <TableHead className="text-[#6B4423]">Date</TableHead>
                  {/* <TableHead className="text-[#6B4423]">Items</TableHead> */}
                  <TableHead className="text-[#6B4423]">Amount</TableHead>
                  <TableHead className="text-[#6B4423]">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2D5F3F]" />
                        </TableCell>
                    </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-[#8B6F47]">
                      No orders found. Adjust filters or search to see results.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-[#6B4423]">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#6B4423]">User #{order.user?.id || '?'}</p>
                          {/* <p className="text-sm text-[#8B6F47]">{order.user?.email}</p> */}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt || "").toLocaleDateString()}</TableCell>
                      {/* <TableCell>{order.items?.length || 0}</TableCell> */}
                      <TableCell className="font-semibold text-[#2D5F3F]">₹{order.totalAmount}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[order.status.toLowerCase()] || 'bg-gray-100'} border-0 uppercase`}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
