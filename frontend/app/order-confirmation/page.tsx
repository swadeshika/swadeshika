import Link from "next/link"
import { CheckCircle, Package, Truck, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function OrderConfirmationPage() {
  // Mock order data
  const orderNumber = "ORD-20250116-1234"
  const orderDate = "January 16, 2025"
  const estimatedDelivery = "January 20-22, 2025"

  const orderItems = [
    {
      id: "1",
      name: "Pure Desi Cow Ghee",
      variant: "1kg",
      price: 850,
      quantity: 2,
      image: "/golden-ghee-in-glass-jar.jpg",
    },
    {
      id: "2",
      name: "Organic Turmeric Powder",
      variant: "250g",
      price: 180,
      quantity: 1,
      image: "/turmeric-powder-in-bowl.jpg",
    },
  ]

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 0
  const total = subtotal + shipping

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
                    <p className="font-semibold">{orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                    <p className="font-semibold">{orderDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                    <p className="font-semibold">{estimatedDelivery}</p>
                  </div>
                </div>

                <Separator />

                {/* Order Items */}
                <div className="space-y-4">
                  <h2 className="font-semibold text-lg">Order Items</h2>
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.variant} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total}</span>
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
              <Button size="lg" asChild>
                <Link href="/orders">View Order Details</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-transparent">
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
