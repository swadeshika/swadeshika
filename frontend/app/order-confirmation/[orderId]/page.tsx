"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { CheckCircle, Package, Truck, Home, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ordersService, Order } from "@/lib/services/ordersService"
import { format } from "date-fns"

export default function OrderConfirmationPage() {
    const params = useParams()
    const orderId = params.orderId as string

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!orderId) return

        const fetchOrder = async () => {
            try {
                const data = await ordersService.getOrderById(orderId)
                setOrder(data)
            } catch (err) {
                console.error("Failed to fetch order", err)
                setError("Failed to load order details. Please check your orders page.")
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [orderId])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <SiteHeader />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-[#6B4423]" />
                </main>
                <SiteFooter />
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col">
                <SiteHeader />
                <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/30">
                    <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                    <p className="text-muted-foreground mb-6">{error || "Order not found"}</p>
                    <Button asChild className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">
                        <Link href="/shop">Continue Shopping</Link>
                    </Button>
                </main>
                <SiteFooter />
            </div>
        )
    }

    const orderDate = order.createdAt ? format(new Date(order.createdAt), "MMMM d, yyyy") : "N/A"
    
    const estimatedDate = order.estimatedDeliveryDate 
        ? format(new Date(order.estimatedDeliveryDate), "MMMM d, yyyy")
        : (order.createdAt
            ? format(new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 5)), "MMMM d, yyyy")
            : "Soon")

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />

            <main className="flex-1 bg-muted/30">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {/* Success Message */}
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                            </div>
                            <h1 className="font-serif text-4xl font-bold">Order Confirmed!</h1>
                            <p className="text-xl text-muted-foreground">
                                Thank you for your order. We'll send you a confirmation email shortly.
                            </p>
                        </div>

                        {/* Order Details */}
                        <Card>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid sm:grid-cols-3 gap-6 text-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                                        <p className="font-semibold">{order.orderNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                                        <p className="font-semibold">{orderDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                                        <p className="font-semibold">{estimatedDate}</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Order Items */}
                                <div className="space-y-4">
                                    <h2 className="font-semibold text-lg">Order Items</h2>
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="flex gap-4">
                                            {/* Placeholder for image if not available in API response yet */}
                                            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center border">
                                                {/* 
                           Since OrderItem interface in ordersService doesn't have image by default (unless I added it), 
                           I should handle it. 
                           However, `Order.getCartItems` joins products, but `createOrder` saves to `order_items` which might not have image URL unless saved or joined.
                           `Order.findById` joins `order_items`. `order_items` usually doesn't have image.
                           For now, use placeholder or if backend provided it.
                           Backend `getOrderById` controller MAPS `item.image` but comments say it might not be there.
                           I'll use placeholder.
                        */}
                                                <Package className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.variantName ? `${item.variantName} × ` : ""} {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-medium">₹{item.subtotal}</p>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                {/* Order Summary */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">₹{order.summary?.subtotal || order.items?.reduce((a, b) => a + Number(b.subtotal), 0)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="font-medium">
                                            {!order.summary?.shipping || Number(order.summary.shipping) === 0 ? "FREE" : `₹${order.summary.shipping}`}
                                        </span>
                                    </div>

                                    {(Number(order.summary?.tax) > 0) && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Tax</span>
                                            <span className="font-medium">₹{order.summary?.tax}</span>
                                        </div>
                                    )}

                                    <Separator />
                                    <div className="flex items-center justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>₹{order.summary?.total || order.totalAmount}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Tracking Steps */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-semibold text-lg mb-6">What's Next?</h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Order Confirmed</p>
                                            <p className="text-sm text-muted-foreground">
                                                We've received your order and will start processing it soon.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                                            <Truck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Shipped</p>
                                            <p className="text-sm text-muted-foreground">
                                                You'll receive a tracking number once your order ships.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                                            <Home className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Delivered</p>
                                            <p className="text-sm text-muted-foreground">Your order will be delivered to your doorstep.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">
                                <Link href="/orders">View My Orders</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="bg-transparent border-2 border-[#E8DCC8]">
                                <Link href="/shop">Continue Shopping</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    )
}
