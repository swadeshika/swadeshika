"use client"

/**
 * Admin Customer Detail
 *
 * Purpose
 * - Displays a single customer's profile inside the Admin panel with a consistent layout and visual language.
 * - Provides a quick overview of identity, contact, activity summary, addresses, and recent orders.
 *
 * Key Features
 * - Breadcrumbs for navigation context (Admin / Customers / Name)
 * - Customer header: name, email, phone, and status badge
 * - Recent orders list with amount and date, plus a link to all orders
 * - Addresses section (Shipping/Billing) rendered as neat cards
 * - Sticky summary sidebar: total orders and total spent with quick navigation
 *
 * Props
 * - customerId: string — the identifier of the selected customer (mocked locally for now)
 *
 * Notes
 * - Styling follows the admin brand tokens used elsewhere: rounded-2xl, border-[#E8DCC8], and text colors.
 * - Replace mock data with an API call in the future; preserve the same UI contract.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, User } from "lucide-react"
import Link from "next/link"

// Mock customer data (replace with API data later)
const mockCustomer = {
  id: "CUST-001",
  name: "Rajesh Kumar",
  email: "rajesh@example.com",
  phone: "+91 98765 43210",
  totalOrders: 5,
  totalSpent: 12499,
  status: "active",
  addresses: [
    {
      type: "Shipping",
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      address: "123, MG Road, Koramangala",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034",
    },
    {
      type: "Billing",
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      address: "123, MG Road, Koramangala",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034",
    },
  ],
  recentOrders: [
    { id: "ORD-2024-001", date: "2024-01-15T10:30:00Z", total: 2499, status: "delivered" },
    { id: "ORD-2024-002", date: "2024-02-03T11:20:00Z", total: 1899, status: "processing" },
  ],
}

export default function AdminCustomerDetail({ customerId }: { customerId: string }) {
  const customer = { ...mockCustomer, id: customerId }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="text-sm text-[#8B6F47]">
        <Link href="/admin" className="hover:underline">Admin</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/customers" className="hover:underline">Customers</Link>
        <span className="mx-2">/</span>
        <span className="text-[#6B4423] font-medium">{customer.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#6B4423]">{customer.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#8B6F47]">
            <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> {customer.email}</span>
            <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> {customer.phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={customer.status === "active" ? "bg-[#2D5F3F]/10 text-[#2D5F3F] border-0" : "bg-red-100 text-red-700"}>
            {customer.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Orders */}
          <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Last {customer.recentOrders.length} orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customer.recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between border-b last:border-0 py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-[#F5F1E8] p-2 border border-[#E8DCC8]"><User className="h-4 w-4 text-[#6B4423]" /></div>
                      <div>
                        <p className="font-medium text-[#6B4423]">Order #{o.id}</p>
                        <p className="text-xs text-[#8B6F47]">{new Date(o.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{o.total.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-[#8B6F47] capitalize">{o.status}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <Button asChild variant="outline" className="bg-transparent">
                <Link href={`/admin/orders`}>View All Orders</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Addresses */}
          <div className="grid md:grid-cols-2 gap-6">
            {customer.addresses.map((addr, idx) => (
              <Card key={idx} className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
                <CardHeader>
                  <CardTitle>{addr.type} Address</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="font-medium">{addr.name}</p>
                  <p className="text-[#8B6F47]">{addr.address}</p>
                  <p className="text-[#8B6F47]">{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-[#8B6F47]">{addr.phone}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-8 lg:sticky lg:top-6">
          <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
            <CardHeader>
              <CardTitle>Customer Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8B6F47]">Total Orders</span>
                <span className="font-medium">{customer.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8B6F47]">Total Spent</span>
                <span className="font-medium">₹{customer.totalSpent.toLocaleString("en-IN")}</span>
              </div>
              <Button asChild className="w-full">
                <Link href={`/admin/orders?customer=${customer.id}`}>View Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
