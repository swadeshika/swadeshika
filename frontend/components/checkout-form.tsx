"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { User, MapPin, FileText, CreditCard, CheckCircle, Loader2 } from "lucide-react"

// Mock cart data
const cartItems = [
  {
    id: "1",
    name: "Pure Desi Cow Ghee",
    variant: "1kg",
    price: 850,
    quantity: 2,
  },
  {
    id: "2",
    name: "Organic Turmeric Powder",
    variant: "250g",
    price: 180,
    quantity: 1,
  },
]

export function CheckoutForm() {
  const router = useRouter()
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [placing, setPlacing] = useState(false)

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 0
  const total = subtotal + shipping

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPlacing(true)
    // Simulate processing and ensure spinner visible
    await new Promise((r) => setTimeout(r, 600))
    router.push("/order-confirmation")
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" type="tel" placeholder="+91 1234567890" required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" placeholder="John Doe" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address1">Address Line 1 *</Label>
                <Input id="address1" placeholder="Street address" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2">Address Line 2</Label>
                <Input id="address2" placeholder="Apartment, suite, etc. (optional)" />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="Mumbai" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" placeholder="Maharashtra" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code *</Label>
                  <Input id="pincode" placeholder="400001" required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sameAsBilling"
                  checked={sameAsBilling}
                  onCheckedChange={(checked) => setSameAsBilling(checked as boolean)}
                />
                <Label htmlFor="sameAsBilling" className="cursor-pointer">
                  Same as shipping address
                </Label>
              </div>

              {!sameAsBilling && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="billingName">Full Name *</Label>
                    <Input id="billingName" placeholder="John Doe" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingAddress1">Address Line 1 *</Label>
                    <Input id="billingAddress1" placeholder="Street address" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingAddress2">Address Line 2</Label>
                    <Input id="billingAddress2" placeholder="Apartment, suite, etc. (optional)" />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingCity">City *</Label>
                      <Input id="billingCity" placeholder="Mumbai" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingState">State *</Label>
                      <Input id="billingState" placeholder="Maharashtra" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingPincode">PIN Code *</Label>
                      <Input id="billingPincode" placeholder="400001" required />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 border-2 border-[#E8DCC8] rounded-xl p-4">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border-2 border-[#E8DCC8] rounded-xl p-4">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="flex-1 cursor-pointer">
                    <div className="font-medium">Online Payment</div>
                    <div className="text-sm text-muted-foreground">UPI, Cards, Net Banking</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Order Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Any special instructions for your order?" rows={4} />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 py-5">
          <Card className="sticky py-5 top-24 rounded-2xl border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.variant} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-[#6B4423]">Total</span>
                <span className="text-[#2D5F3F]">₹{total}</span>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#2D5F3F] hover:bg-[#234A32] text-white"
                size="lg"
                disabled={placing}
              >
                {placing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Placing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
