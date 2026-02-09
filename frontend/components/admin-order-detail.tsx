"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Truck, User, Phone, Mail } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { ordersService } from "@/lib/services/ordersService"
import { Skeleton } from "@/components/ui/skeleton"


const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  confirmed: { label: "Confirmed", color: "bg-blue-500" },
  processing: { label: "Processing", color: "bg-purple-500" },
  shipped: { label: "Shipped", color: "bg-orange-500" },
  delivered: { label: "Delivered", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
  returned: { label: "Returned", color: "bg-rose-500" },
  refunded: { label: "Refunded", color: "bg-gray-500" },
}

export default function AdminOrderDetailContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orderStatus, setOrderStatus] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [carrier, setCarrier] = useState("") // Not currently saved in backend, but UI has it
  const [adminNotes, setAdminNotes] = useState("")
  const [dialog, setDialog] = useState<{ open: boolean; title: string; description: string }>({
    open: false,
    title: "",
    description: "",
  })

  // Fetch Order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await ordersService.getOrderById(orderId)
        setOrder(data)
        setOrderStatus(data.status)
        setTrackingNumber(data.trackingNumber || "")
        setCarrier(data.carrier || "bluedart") // Default to bluedart if empty, or just empty? UI select placeholder is "Select carrier"
      } catch (error) {
        console.error("Failed to fetch order:", error)
      } finally {
        setLoading(false)
      }
    }
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const handleUpdateStatus = async () => {
    try {
      // We do not send tracking number here unless it's part of the same update flow in UI 
      // But backend supports sending it. 
      // The UI has a separate card for tracking. 
      // Let's just update status here as per UI flow.
      await ordersService.updateStatus(orderId, orderStatus)

      // Update local state
      setOrder((prev: any) => ({ ...prev, status: orderStatus }))

      setDialog({
        open: true,
        title: "Status Updated",
        description: `Order status updated to "${statusConfig[orderStatus as keyof typeof statusConfig]?.label || orderStatus}" successfully.`,
      })
    } catch (error) {
      setDialog({
        open: true,
        title: "Error",
        description: "Failed to update status",
      })
    }
  }

  const handleAddTracking = async () => {
    if (trackingNumber) {
      try {
        // Verify if we can update tracking number. Backend updateStatus accepts it.
        // We might not want to change status if just adding tracking, but updateStatus requires status.
        // So we send current status.
        await ordersService.updateStatus(orderId, orderStatus, trackingNumber, carrier)

        setDialog({
          open: true,
          title: "Tracking Added",
          description: `Tracking details saved: ${trackingNumber} (${carrier}).`,
        })

        setDialog({
          open: true,
          title: "Tracking Added",
          description: `Tracking details saved: ${trackingNumber}.`,
        })
        // setTrackingNumber("") // Keep it visible?
        // setCarrier("")
      } catch (error) {
        setDialog({
          open: true,
          title: "Error",
          description: "Failed to save tracking",
        })
      }
    } else {
      setDialog({
        open: true,
        title: "Missing Information",
        description: "Please enter a tracking number.",
      })
    }
  }

  // ... imports

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items Skeleton */}
            <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-20 w-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-5 w-20 ml-auto" />
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info Skeleton */}
            <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>

             {/* Addresses Skeleton */}
             <div className="grid md:grid-cols-2 gap-6">
               {[1, 2].map((i) => (
                 <Card key={i} className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
                   <CardHeader>
                     <Skeleton className="h-6 w-40" />
                   </CardHeader>
                   <CardContent className="space-y-2">
                     <Skeleton className="h-5 w-32" />
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-4 w-1/2" />
                   </CardContent>
                 </Card>
               ))}
             </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (!order) return <div>Order not found</div>

  return (
    <>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="text-sm text-[#8B6F47]">
          <Link href="/admin" className="hover:underline">Admin</Link>
          <span className="mx-2">/</span>
          <Link href="/admin/orders" className="hover:underline">Orders</Link>
          <span className="mx-2">/</span>
          <span className="text-[#6B4423] font-medium">{order.id}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#6B4423] text-balance">Order #{order.orderNumber}</h1>
            <p className="text-[#8B6F47] mt-1">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            <Badge className={statusConfig[order.status as keyof typeof statusConfig].color}>
              {statusConfig[order.status as keyof typeof statusConfig].label}
            </Badge>
            <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
              {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>{order.items?.length || 0} items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 py-3 border-b last:border-0 last:pb-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-[#E8DCC8]"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        {/* <p className="text-sm text-muted-foreground">SKU: {item.sku}</p> */}
                        <p className="text-sm text-muted-foreground">{item.variantName}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{order.summary?.subtotal?.toLocaleString("en-IN") || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₹{order.summary?.shipping?.toLocaleString("en-IN") || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₹{order.summary?.tax?.toLocaleString("en-IN") || 0}</span>
                  </div>
                  {order.couponCode && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="text-muted-foreground">Coupon ({order.couponCode})</span>
                      <span>-₹{order.summary?.discount?.toLocaleString("en-IN") || 0}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>₹{order.totalAmount?.toLocaleString("en-IN") || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{order.address?.fullName || 'Guest'}</p>
                    {/* <p className="text-sm text-muted-foreground">{order.customer?.totalOrders} orders</p> */}
                      <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{order.shippingAddress?.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{order.address?.phone}</span>
                      </div>
                    </div>
                    {/* <Button variant="outline" size="sm" className="mt-3 bg-transparent" asChild>
                      <Link href={`/admin/customers/${order.customer?.id}`}>View Customer</Link>
                    </Button> */}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Addresses */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="font-medium">{order.address?.fullName}</p>
                  <p className="text-muted-foreground">{order.address?.addressLine1}</p>
                  {order.address?.addressLine2 && <p className="text-muted-foreground">{order.address?.addressLine2}</p>}
                  <p className="text-muted-foreground">
                    {order.address?.city}, {order.address?.state} - {order.address?.postalCode}
                  </p>
                  <p className="text-muted-foreground">{order.address?.phone}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(() => {
                    const billing = order.billingAddress || order.address;
                    return (
                        <>
                          <p className="font-medium">{billing?.fullName}</p>
                          <p className="text-muted-foreground">{billing?.addressLine1}</p>
                          {billing?.addressLine2 && <p className="text-muted-foreground">{billing?.addressLine2}</p>}
                          <p className="text-muted-foreground">
                            {billing?.city}, {billing?.state} - {billing?.postalCode}
                          </p>
                          <p className="text-muted-foreground">{billing?.phone}</p>
                        </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Customer Notes */}
            {order.notes && (
              <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
                <CardHeader>
                  <CardTitle>Customer Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-6">
            {/* Update Status */}
            <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>Change order status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Order Status</Label>
                  <Select value={orderStatus} onValueChange={setOrderStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleUpdateStatus} className="w-full">
                  Update Status
                </Button>
              </CardContent>
            </Card>

            {/* Add Tracking */}
            <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
                <CardDescription>Add tracking information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Carrier</Label>
                  <Select value={carrier} onValueChange={setCarrier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bluedart">Blue Dart</SelectItem>
                      <SelectItem value="delhivery">Delhivery</SelectItem>
                      <SelectItem value="dtdc">DTDC</SelectItem>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="indiapost">India Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tracking Number</Label>
                  <Input
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddTracking} className="w-full bg-transparent" variant="outline">
                  <Truck className="h-4 w-4 mr-2" />
                  Add Tracking
                </Button>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                    {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-5">
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
                <CardDescription>Internal notes (not visible to customer)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add notes about this order..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                />
                <Button variant="outline" className="w-full bg-transparent">
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Success/Info Dialog */}
      <Dialog open={dialog.open} onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog.title}</DialogTitle>
            <DialogDescription>{dialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialog((d) => ({ ...d, open: false }))} className="bg-[#2D5F3F] hover:bg-[#234A32]">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
