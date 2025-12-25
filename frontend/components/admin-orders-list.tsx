"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Search, Eye, Download, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ordersService, Order } from "@/lib/services/ordersService"
import { toast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"

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
  const [exporting, setExporting] = useState(false)

  const [debouncedSearch] = useDebounce(searchQuery, 500)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await ordersService.getAllOrders({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        search: debouncedSearch
      })

      setOrders(data.orders || [])
      setPagination(prev => ({ ...prev, ...data.pagination }))
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, debouncedSearch])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [debouncedSearch, statusFilter])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  const handleExportCsv = async () => {
    try {
      setExporting(true)
      await ordersService.exportOrders()
      toast({ title: "Success", description: "Orders exported successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to export orders", variant: "destructive" })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
        <div className="mb-4 sm:mb-0">
          <h1 className="font-serif text-3xl font-bold mb-2 text-[#6B4423]">Orders</h1>
          <p className="text-[#8B6F47]">Manage and track customer orders</p>
        </div>
        <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-3 sm:mt-0">
          <Button onClick={handleExportCsv} disabled={exporting} variant="outline" className="gap-2 bg-transparent border-2 border-[#E8DCC8] hover:bg-accent">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-2 border-[#E8DCC8]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F47]" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-2 border-[#E8DCC8] focus:ring-0">
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
                  <TableHead className="text-[#6B4423]">Amount</TableHead>
                  <TableHead className="text-[#6B4423]">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2D5F3F]" />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-[#8B6F47]">
                      No orders found. Adjust filters or search to see results.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-[#6B4423]">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#6B4423]">
                            {order.customer?.name || order.user?.name || 'Guest'}
                          </p>
                          <p className="text-sm text-[#8B6F47]">
                            {order.customer?.email || order.user?.email || 'No email'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt || "").toLocaleDateString()}</TableCell>
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

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {pagination.page} of {pagination.pages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
