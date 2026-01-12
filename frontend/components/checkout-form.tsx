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
import { ordersService } from "@/lib/services/ordersService"
import { useToast } from "@/hooks/use-toast"

import { useCartStore } from "@/lib/cart-store"
import { useAuthStore } from "@/lib/auth-store"
import { addressService, Address } from "@/lib/services/addressService"
import { settingsService, AppSettings } from "@/lib/services/settingsService"
import { useEffect } from "react"

export function CheckoutForm() {
  const router = useRouter()
  const { toast } = useToast()

  // Stores
  const { items: cartItems, getTotalPrice } = useCartStore()
  const { user } = useAuthStore()

  // State
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [placing, setPlacing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Data
  const [addresses, setAddresses] = useState<Address[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)

  // Derived state
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0]

  // Calculate Totals
  const subtotal = getTotalPrice()
  const shippingThreshold = Number(settings?.free_shipping_threshold ?? 500)
  const flatRate = Number(settings?.flat_rate ?? 50)

  const shipping = subtotal > 0
    ? (subtotal >= shippingThreshold ? 0 : flatRate)
    : 0

  // Tax logic (can be enhanced later based on settings)
  const gstPercent = Number(settings?.gst_percent ?? 0)
  const tax = Math.round(subtotal * (gstPercent / 100))

  const total = subtotal + shipping + tax;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedAddresses, fetchedSettings] = await Promise.all([
          addressService.getAddresses().catch(() => []),
          settingsService.getSettings().catch(() => null)
        ])
        setAddresses(fetchedAddresses || [])
        setSettings(fetchedSettings)
      } catch (error) {
        console.error("Failed to load checkout data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPlacing(true)

    const formData = new FormData(e.currentTarget)

    // Construct Address Objects
    const shippingAddress = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      addressLine1: formData.get("address1"),
      addressLine2: formData.get("address2"),
      city: formData.get("city"),
      state: formData.get("state"),
      postalCode: formData.get("pincode"),
      country: "India"
    }

    const billingAddress = sameAsBilling ? shippingAddress : {
      fullName: formData.get("billingName"),
      phone: formData.get("phone"),
      addressLine1: formData.get("billingAddress1"),
      addressLine2: formData.get("billingAddress2"),
      city: formData.get("billingCity"),
      state: formData.get("billingState"),
      postalCode: formData.get("billingPincode"),
      country: "India"
    }

    const orderData = {
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.name,
        variantId: item.variantId,
        quantity: item.quantity,
        price: Number(item.price),
        image: item.image
      })),
      shippingAddress,
      billingAddress,
      paymentMethod,
      subtotal: Number(subtotal),
      tax: Number(tax),
      shippingCost: Number(shipping),
      totalAmount: Number(total),
      phone: formData.get("phone"),
      email: formData.get("email"),
      couponCode: null,
      notes: formData.get("notes")
    }

    try {
      const response = await ordersService.createOrder(orderData as any);
      toast({
        title: "Order Placed Successfully",
        description: "Thank you for your purchase!",
      })
      // response is the data payload from ordersService
      // which returns res.data.
      // And backend returns { success: true, message:..., data: { orderId ... } }
      // Wait, ordersService code:
      // const res = await api.post...
      // return res.data;
      // Backend returns: { success: true, data: { orderId ... } }
      // So response.data.orderId

      router.push(`/order-confirmation/${response.data.orderId}`)
    } catch (error: any) {
      console.error("Order creation failed", error);

      const errorMessage = error.response?.data?.message || error.message || "Something went wrong. Please try again.";

      // Check for Stale/Unavailable Items Error
      const match = errorMessage.match(/IDs: ([0-9, ]+)/);
      if (match && match[1]) {
           const badIds = match[1].split(',').map((id: string) => Number(id.trim()));
           
           if (badIds.length > 0) {
              const { items, removeItem } = useCartStore.getState();
              
              // Find items where productId matches the bad IDs
              badIds.forEach((badId: number) => {
                  const itemToRemove = items.find(item => item.productId === badId);
                  if (itemToRemove) {
                      removeItem(itemToRemove.id); 
                  }
              });

              toast({
                  title: "Cart Updated",
                  description: `Removed ${badIds.length} unavailable items from your cart. Please place your order again.`,
                  variant: "default", 
              });
              
              setPlacing(false);
              return;
           }
      }

      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-[#6B4423]" /></div>
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
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    defaultValue={user?.email || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 1234567890"
                    required
                    defaultValue={user?.phone || defaultAddress?.phone || ""}
                  />
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
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  required
                  defaultValue={defaultAddress?.name || user?.name || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address1">Address Line 1 *</Label>
                <Input
                  id="address1"
                  name="address1"
                  placeholder="Street address"
                  required
                  defaultValue={defaultAddress?.addressLine1 || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2">Address Line 2</Label>
                <Input
                  id="address2"
                  name="address2"
                  placeholder="Apartment, suite, etc. (optional)"
                  defaultValue={defaultAddress?.addressLine2 || ""}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Mumbai"
                    required
                    defaultValue={defaultAddress?.city || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Maharashtra"
                    required
                    defaultValue={defaultAddress?.state || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code *</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    placeholder="400001"
                    required
                    defaultValue={defaultAddress?.postalCode || ""}
                  />
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
                    <Input id="billingName" name="billingName" placeholder="John Doe" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingAddress1">Address Line 1 *</Label>
                    <Input id="billingAddress1" name="billingAddress1" placeholder="Street address" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingAddress2">Address Line 2</Label>
                    <Input id="billingAddress2" name="billingAddress2" placeholder="Apartment, suite, etc. (optional)" />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingCity">City *</Label>
                      <Input id="billingCity" name="billingCity" placeholder="Mumbai" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingState">State *</Label>
                      <Input id="billingState" name="billingState" placeholder="Maharashtra" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingPincode">PIN Code *</Label>
                      <Input id="billingPincode" name="billingPincode" placeholder="400001" required />
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
              <Textarea name="notes" placeholder="Any special instructions for your order?" rows={4} />
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
                        Qty: {item.quantity}
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
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">GST ({gstPercent}%)</span>
                  <span className="font-medium">₹{tax}</span>
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
