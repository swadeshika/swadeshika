"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, User, Loader2, Edit, Save } from "lucide-react"
import Link from "next/link"
import { customersService, Customer } from "@/lib/services/customersService"
import { ordersService, Order } from "@/lib/services/ordersService"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

import { Skeleton } from "@/components/ui/skeleton"

export default function AdminCustomerDetail({ customerId }: { customerId: string }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ first_name: "", last_name: "", phone: "", status: "" })

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [customerRes, ordersData] = await Promise.all([
          customersService.getById(customerId),
          ordersService.getAllOrders({ customer: customerId, limit: 5 })
        ])
        
        // Handle potential wrapper object from service
        const customerData = (customerRes as any).data || customerRes
        setCustomer(customerData)
        setRecentOrders(ordersData.orders)

        setFormData({
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          phone: customerData.phone || "",
          status: customerData.status
        })
      } catch (error) {
        console.error("Failed to fetch customer data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [customerId])

  const handleUpdate = async () => {
    try {
      await customersService.update(customerId, formData);
      setEditing(false);
      // Refresh data
      const updatedRes = await customersService.getById(customerId);
      const updatedData = (updatedRes as any).data || updatedRes;
      setCustomer(updatedData);
    } catch (error) {
      console.error("Failed to update", error);
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to deactivate this customer?")) return;
    try {
      await customersService.delete(customerId);
      const updatedRes = await customersService.getById(customerId);
      const updatedData = (updatedRes as any).data || updatedRes;
      setCustomer(updatedData);
    } catch (error) {
      console.error("Failed to delete", error);
    }
  }

  // ... previous imports

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
             <Skeleton className="h-10 w-64" />
             <div className="flex gap-4">
               <Skeleton className="h-4 w-40" />
               <Skeleton className="h-4 w-32" />
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Skeleton className="h-6 w-20 rounded-full" />
             <Skeleton className="h-9 w-24" />
             <Skeleton className="h-9 w-24" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           {/* Left Column Skeleton */}
           <div className="lg:col-span-2 space-y-8">
             {/* Recent Orders Skeleton */}
             <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
               <CardHeader>
                 <Skeleton className="h-6 w-40 mb-2" />
                 <Skeleton className="h-4 w-32" />
               </CardHeader>
               <CardContent className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex justify-between items-center py-2">
                      <div className="flex gap-3 items-center">
                         <Skeleton className="h-10 w-10 rounded-full" />
                         <div className="space-y-1">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-3 w-24" />
                         </div>
                      </div>
                      <div className="space-y-1 text-right">
                         <Skeleton className="h-5 w-20 ml-auto" />
                         <Skeleton className="h-3 w-16 ml-auto" />
                      </div>
                   </div>
                 ))}
                 <Skeleton className="h-9 w-32 mt-4" />
               </CardContent>
             </Card>
           </div>

           {/* Right Column Skeleton */}
           <div className="space-y-8">
             <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
               <CardHeader>
                 <Skeleton className="h-6 w-40" />
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-10" />
                 </div>
                 <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-20" />
                 </div>
               </CardContent>
             </Card>
           </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return <div>Customer not found</div>
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="text-sm text-[#8B6F47]">
        <Link href="/admin" className="hover:underline">Admin</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/customers" className="hover:underline">Customers</Link>
        <span className="mx-2">/</span>
        <span className="text-[#6B4423] font-medium">{customer.first_name} {customer.last_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#6B4423]">{customer.first_name} {customer.last_name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#8B6F47]">
            <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> {customer.email}</span>
            <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> {customer.phone || 'N/A'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={customer.status === "Active" ? "bg-[#2D5F3F]/10 text-[#2D5F3F] border-0" : "bg-red-100 text-red-700"}>
            {customer.status}
          </Badge>

          <Dialog open={editing} onOpenChange={setEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your customer's profile here.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right"> First Name </Label>
                  <Input id="firstName" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right"> Last Name </Label>
                  <Input id="lastName" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right"> Phone </Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right"> Status </Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleUpdate}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
            Deactivate
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Orders */}
          <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Last {recentOrders.length} orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 ? <p className="text-center text-gray-500">No orders found.</p> :
                  recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between border-b last:border-0 py-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-[#F5F1E8] p-2 border border-[#E8DCC8]"><User className="h-4 w-4 text-[#6B4423]" /></div>
                        <div>
                          <p className="font-medium text-[#6B4423]">Order #{o.orderNumber}</p>
                          <p className="text-xs text-[#8B6F47]">{new Date(o.createdAt || new Date()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{Number(o.totalAmount).toLocaleString("en-IN")}</p>
                        <p className="text-xs text-[#8B6F47] capitalize">{o.status}</p>
                      </div>
                    </div>
                  ))}
              </div>
              <Separator className="my-4" />
              <Button asChild variant="outline" className="bg-transparent">
                <Link href={`/admin/orders?customer=${customer.id}`}>View All Orders</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Addresses - Placeholder for now as API doesn't return list yet */}
          {/* 
          <div className="grid md:grid-cols-2 gap-6">
             ... Address Cards ...
          </div> 
          */}
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
                <span className="font-medium">{customer.orders || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8B6F47]">Total Spent</span>
                <span className="font-medium">₹{(customer.totalSpent || 0).toLocaleString("en-IN")}</span>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
