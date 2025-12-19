"use client"

import { useState, useEffect } from "react"
import { ordersService } from "@/lib/services/ordersService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, CheckCircle, Clock, XCircle, Download, Phone, Mail } from "lucide-react"
import Link from "next/link"

const statusConfig = {
  placed: { label: "Placed", color: "bg-blue-500", icon: Clock },
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-500", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-purple-500", icon: Package },
  shipped: { label: "Shipped", color: "bg-orange-500", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: XCircle },
} as const

export default function OrderDetailContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await ordersService.getOrderById(orderId)
        setOrder(data)
      } catch (error) {
        console.error("Failed to fetch order:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  if (loading) return <div className="p-8 text-center text-[#8B6F47]">Loading order details...</div>
  if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>

  const StatusIcon = statusConfig[order.status.toLowerCase() as keyof typeof statusConfig]?.icon || Clock

  return (
    <div className="container mx-auto px-1 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        {/* Mobile (stacked): title / order number / buttons.
            Desktop (sm+): title+order number on left, buttons on right (unchanged). */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          {/* left: title + order number (stacked on mobile, inline on sm+) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <h1 className="text-3xl font-serif font-bold text-balance whitespace-nowrap">Order Details</h1>
            <p className="text-base max-[370px]:text-sm text-muted-foreground sm:ml-0">{/* on mobile will be below title, on sm+ inline */}Order #{order.orderNumber}</p>
          </div>

          {/* right: two buttons side-by-side — on mobile this becomes its own line below the order number */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>

            <Button asChild size="sm" className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">
              <Link href={`/account/orders/${orderId}/review`}>Write Review</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span>•</span>
          <Badge className={statusConfig[order.status?.toLowerCase() as keyof typeof statusConfig]?.color || "bg-gray-500"}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig[order.status?.toLowerCase() as keyof typeof statusConfig]?.label || order.status}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <Card className="px-1 py-6 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Track your order progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeline.map((step: any, index: number) => {
                  const StepIcon = statusConfig[step.status as keyof typeof statusConfig].icon
                  const isLast = index === order.timeline.length - 1

                  return (
                    <div key={step.status} className="flex gap-4 my-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={`rounded-full p-2 ${step.completed ? statusConfig[step.status as keyof typeof statusConfig].color : "bg-muted"
                            }`}
                        >
                          <StepIcon className={`h-4 w-4 ${step.completed ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                        {!isLast && <div className={`w-0.5 h-12 ${step.completed ? "bg-primary" : "bg-muted"}`} />}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                          {statusConfig[step.status as keyof typeof statusConfig].label}
                        </p>
                        {step.date && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(step.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {order.status === "shipped" && order.tracking && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-2">
                    <h4 className="font-medium">Tracking Information</h4>
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">
                        Carrier: <span className="text-foreground font-medium">{order.tracking.carrier}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Tracking Number:{" "}
                        <span className="text-foreground font-medium">{order.tracking.trackingNumber}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Estimated Delivery:{" "}
                        <span className="text-foreground font-medium">
                          {new Date(order.tracking.estimatedDelivery).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 bg-transparent" asChild>
                      <a
                        href={`https://www.bluedart.com/tracking/${order.tracking.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Track Shipment
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="py-6 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{order.items.length} items in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.variant}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="py-6 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.summary?.subtotal?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>₹{order.summary?.shipping?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{order.summary?.tax?.toLocaleString("en-IN")}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>₹{order.summary?.total?.toLocaleString("en-IN") || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="py-6 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.address?.fullName || 'N/A'}</p>
                <p className="text-muted-foreground">{order.address?.addressLine1}{order.address?.addressLine2 ? ', ' + order.address.addressLine2 : ''}</p>
                <p className="text-muted-foreground">
                  {order.address?.city}, {order.address?.state} - {order.address?.postalCode}
                </p>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{order.address?.phone || 'N/A'}</span>
                </div>
                {/* Email in address might not be available, use user email if needed, or skip */}
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="py-6 border-2 border-[#E8DCC8]" >
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Have questions about your order? Our customer support team is here to help.
              </p>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  )
}
