"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Truck, CheckCircle, Package, Clock, MapPin, XCircle, AlertCircle } from "lucide-react"
import { ordersService } from "@/lib/services/ordersService"

type TimelineStep = {
  status: "placed" | "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "pending" | "cancelled" | "refunded"
  label: string
  location?: string
  date?: string | null
  completed: boolean
}

type TrackingData = {
  orderId: string
  status: TimelineStep["status"]
  estimatedDelivery: string
  carrier: string
  trackingNumber: string
  currentLocation: string
  timeline: TimelineStep[]
  items?: any[]
}

const statusIcon: Record<TimelineStep["status"], any> = {
  placed: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle,
  pending: Clock,
  cancelled: XCircle,
  refunded: AlertCircle,
}

const statusBadge: Record<TimelineStep["status"], { label: string; className: string }> = {
  placed: { label: "Placed", className: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Confirmed", className: "bg-indigo-100 text-indigo-700" },
  processing: { label: "Processing", className: "bg-purple-100 text-purple-700" },
  shipped: { label: "Shipped", className: "bg-orange-100 text-orange-700" },
  out_for_delivery: { label: "Out for delivery", className: "bg-amber-100 text-amber-700" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-700" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  refunded: { label: "Refunded", className: "bg-gray-100 text-gray-700" },
}

export default function TrackOrderContent() {
  const [orderId, setOrderId] = useState("")
  const [orderIdError, setOrderIdError] = useState("")
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [loading, setLoading] = useState(false)
  const [tracking, setTracking] = useState<TrackingData | null>(null)

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailValue)
  }

  const validateOrderId = (id: string) => {
    // Matches ORD- followed by any alphanumeric/dash characters
    return /^ORD-[\w-]+$/.test(id)
  }

  const handleTrack = async () => {
    setOrderIdError("")
    // setEmailError("")

    // Validate orderId
    if (!orderId.trim()) {
      setOrderIdError("Order ID is required")
      return
    }
    if (!validateOrderId(orderId)) {
      setOrderIdError("Order ID must start with ORD-")
      return
    }

    // Email validation removed as per request

    setLoading(true)
    try {
      const response: any = await ordersService.trackOrder(orderId);
      
      // The backend returns { order: { ... } } inside the data object
      const orderData = response.order || response; // Handle both structures if backend changes

      // ... rest of logic
      
      if (!orderData) {
        throw new Error("Invalid response format");
      }

      // Map backend fields to frontend TrackingData structure
      const mappedData: TrackingData = {
        orderId: orderData.orderNumber || orderData.id || orderData.orderId,
        status: orderData.status,
        estimatedDelivery: orderData.estimatedDelivery || orderData.estimatedDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: orderData.carrier || "Standard Shipping",
        trackingNumber: orderData.trackingNumber || "Pending",
        currentLocation: orderData.currentLocation || "Processing Center",
        timeline: orderData.timeline || [],
        items: orderData.items || []
      };

      setTracking(mappedData);
    } catch (error) {
      setOrderIdError("Could not find order with provided details");
      setTracking(null);
    } finally {
      setLoading(false);
    }
  }

  const progressPercent = (() => {
    if (!tracking) return 0
    const total = tracking.timeline.length
    const completed = tracking.timeline.filter((s) => s.completed).length
    return Math.round((completed / total) * 100)
  })()

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Hero */}
      <div className="text-center mb-10">
        <Badge className="mb-3 bg-[#FF7E00] text-white border-0">Track your package</Badge>
        <h1 className="font-sans text-3xl lg:text-4xl font-bold text-[#6B4423]">Track Order</h1>
        <p className="text-[#8B6F47] mt-2">Check real-time status and delivery timeline</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-1 rounded-2xl border-2 border-[#E8DCC8] py-6">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Find your order</CardTitle>
            <CardDescription>Enter your Order ID to track status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID *</Label>
              <Input id="orderId" placeholder="ORD-2025-00001" value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
              {orderIdError && <p className="text-sm text-red-500">{orderIdError}</p>}
            </div>
            
            <Button onClick={handleTrack} disabled={loading} className="w-full bg-[#2D5F3F] hover:bg-[#234A32] text-white">
              <Search className="h-4 w-4 mr-2" /> {loading ? "Tracking..." : "Track Order"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {!tracking ? (
            <Card className="rounded-2xl border-2 border-dashed border-[#E8DCC8] py-16">
              <CardContent className="text-center text-[#8B6F47]">
                Enter your details to view tracking information
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary */}
              <Card className="rounded-2xl border-2 border-[#E8DCC8] py-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[#6B4423]">Order #{tracking.orderId}</CardTitle>
                      <CardDescription>
                        Estimated delivery:{" "}
                        {new Date(tracking.estimatedDelivery).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    <Badge className={statusBadge[tracking.status].className}>{statusBadge[tracking.status].label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="h-2 w-full bg-[#F5F1E8] rounded">
                      <div className="h-2 bg-[#2D5F3F] rounded" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="text-xs mt-1 text-[#8B6F47]">{progressPercent}% completed</p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Carrier</p>
                      <p className="font-medium">{tracking.carrier}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tracking Number</p>
                      <p className="font-medium">{tracking.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Location</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-primary" />
                        <p className="font-medium">{tracking.currentLocation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              {tracking.items && tracking.items.length > 0 && (
                <Card className="rounded-2xl border-2 border-[#E8DCC8] py-6">
                  <CardHeader>
                    <CardTitle className="text-[#6B4423]">Order Items</CardTitle>
                    <CardDescription>Items in this shipment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(tracking.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#F5F1E8] border border-[#E8DCC8]">
                          <img src={item.image || "/placeholder.svg"} alt={item.name} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[#6B4423]">{item.name}</p>
                          {item.variantName && <p className="text-sm text-[#8B6F47]">{item.variantName}</p>}
                          <p className="text-sm text-[#8B6F47]">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <Card className="rounded-2xl border-2 border-[#E8DCC8] py-6">
                <CardHeader>
                  <CardTitle className="text-[#6B4423]">Tracking History</CardTitle>
                  <CardDescription>Latest shipment updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {tracking.timeline.map((step, idx) => {
                      const Icon = statusIcon[step.status]
                      const isLast = idx === tracking.timeline.length - 1
                      const dotClass = step.completed ? "bg-[#2D5F3F] text-white" : "bg-muted text-muted-foreground"
                      const barClass = step.completed ? "bg-[#2D5F3F]" : "bg-muted"
                      return (
                        <div key={`${step.status}-${idx}`} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`rounded-full p-2 ${dotClass}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            {!isLast && <div className={`w-0.5 flex-1 ${barClass}`} />}
                          </div>
                          <div className="flex-1 pb-8">
                            <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                            {step.location && <p className="text-sm text-muted-foreground">{step.location}</p>}
                            {step.date && (
                              <p className="text-sm text-muted-foreground mt-1">
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
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
