"use client"

/**
 * Admin Customers List
 *
 * Purpose
 * - Displays the customers table in the Admin panel with client-side search.
 * - Provides quick navigation to a customer's detail page.
 *
 * Key Features
 * - Client-side search across name, email, phone, and status (case-insensitive)
 * - Empty-state messaging when no customers match
 * - Quick view action linking to the customer detail page
 *
 * Notes
 * - Data is mocked locally; replace with API integration later while keeping the same UI contract.
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Eye, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { customersService, Customer } from "@/lib/services/customersService"
import { useDebounce } from "@/hooks/use-debounce"
import { format } from "date-fns"

export function AdminCustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch] = useDebounce(searchQuery, 500)
  const [statusFilter, setStatusFilter] = useState("All")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1
  })

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await customersService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        status: statusFilter
      })

      setCustomers(res.data)
      setPagination(prev => ({
        ...prev,
        ...res.pagination
      }))
    } catch (error) {
      console.error("Failed to fetch customers", error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, debouncedSearch, statusFilter])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [debouncedSearch, statusFilter])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  const handleExportCsv = () => {
    const header = ["Name", "Email", "Phone", "Orders", "Total Spent", "Join Date", "Status"]
    const rows = customers.map((c) => [
      `${c.first_name} ${c.last_name}`,
      c.email,
      c.phone || "",
      String(c.orders || 0),
      String(c.totalSpent || 0),
      c.join_date ? format(new Date(c.join_date), 'MMM yyyy') : '-',
      c.status,
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "customers.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
        <div className="mb-4 sm:mb-0">
          <h1 className="font-serif text-3xl font-bold mb-2 text-[#6B4423]">Customers</h1>
          <p className="text-[#8B6F47]">Manage your customer base</p>
        </div>
        <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-3 sm:mt-0">
          <Button onClick={handleExportCsv} variant="outline" className="gap-2 bg-transparent border-2 border-[#E8DCC8] hover:bg-accent">
            <Download className="h-4 w-4" />
            Export Page
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-2 border-[#E8DCC8]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F47]" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-2 border-[#E8DCC8]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border-2 border-[#E8DCC8] overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#6B4423]">Customer</TableHead>
                  <TableHead className="text-[#6B4423]">Contact</TableHead>
                  <TableHead className="text-[#6B4423]">Orders</TableHead>
                  <TableHead className="text-[#6B4423]">Total Spent</TableHead>
                  <TableHead className="text-[#6B4423]">Join Date</TableHead>
                  <TableHead className="text-[#6B4423]">Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#6B4423]" />
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-[#8B6F47]">
                      No customers found. Adjust your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{customer.first_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-[#6B4423]">{customer.first_name} {customer.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-[#6B4423]">{customer.email}</p>
                          <p className="text-sm text-[#8B6F47]">{customer.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{customer.orders || 0}</TableCell>
                      <TableCell className="font-semibold text-[#2D5F3F]">₹{(customer.totalSpent || 0).toLocaleString()}</TableCell>
                      <TableCell>{customer.join_date ? format(new Date(customer.join_date), 'MMM yyyy') : '-'}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#2D5F3F]/10 text-[#2D5F3F] border-0">{customer.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/customers/${customer.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
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
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
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
