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
  const { items: cartItems, getTotalPrice, appliedCoupon } = useCartStore()
  const { user } = useAuthStore()

  // State
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [placing, setPlacing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

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

  // Coupon discount
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0

  const total = subtotal + shipping + tax - discount;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch addresses if user is logged in
        // This prevents 401 errors and login redirects for guest checkout
        const fetchedAddresses = user 
          ? await addressService.getAddresses().catch(() => [])
          : [];
        
        const fetchedSettings = await settingsService.getSettings().catch(() => null);
        
        setAddresses(fetchedAddresses || []);
        setSettings(fetchedSettings);
      } catch (error) {
        console.error("Failed to load checkout data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user])

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
        variantName: item.variantName || null, // Explicitly send variant name
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
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      notes: formData.get("notes")
    }

    try {
      const response = await ordersService.createOrder(orderData as any);
      
      // Clear cart after successful order
      const { clearCart } = useCartStore.getState();
      await clearCart();
      
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

      // Parse validation errors if present (from error.errors array)
      if (error.errors && Array.isArray(error.errors)) {
        const errors: Record<string, string> = {};
        
        // Field name mapping (backend -> frontend)
        const fieldMapping: Record<string, string> = {
          'addressLine1': 'address1',
          'addressLine2': 'address2',
          'postalCode': 'pincode'
        };
        
        error.errors.forEach((err: any) => {
          const backendFieldName = err.field?.split('.').pop() || err.field;
          const frontendFieldName = fieldMapping[backendFieldName] || backendFieldName;
          errors[frontendFieldName] = err.message;
        });
        setValidationErrors(errors);
        
        // Show user-friendly message
        toast({
          title: "Please check your form",
          description: "Some fields need your attention. Please review and correct them.",
          variant: "destructive"
        });
        
        // Scroll to first error field
        const firstBackendField = error.errors[0]?.field?.split('.').pop();
        const firstErrorField = fieldMapping[firstBackendField] || firstBackendField;
        if (firstErrorField) {
          setTimeout(() => {
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (element as HTMLInputElement)?.focus();
          }, 100);
        }
        
        setPlacing(false);
        return;
      }

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
          {/* Validation Error Alert */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Please correct the following errors:</strong>
              <ul className="mt-1 list-disc list-inside text-sm">
                {Object.entries(validationErrors).map(([field, message]) => (
                  <li key={field}>
                    {field === 'totalAmount' ? 
                      `Total Mismatch: ${message} - Please refresh the page.` : 
                      `${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`
                    }
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                    className={validationErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                    onChange={() => {
                       if (validationErrors.email) {
                         const newErrors = {...validationErrors};
                         delete newErrors.email;
                         setValidationErrors(newErrors);
                       }
                    }}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-600 flex items-start gap-1">
                      <span>⚠</span>
                      <span>{validationErrors.email}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+91</span>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="1234567890"
                      required
                      maxLength={10}
                      defaultValue={user?.phone || defaultAddress?.phone || ""}
                      className={`pl-12 ${validationErrors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 10);
                    }}
                    onChange={() => {
                       if (validationErrors.phone) {
                         const newErrors = {...validationErrors};
                         delete newErrors.phone;
                         setValidationErrors(newErrors);
                       }
                    }}
                  />
                  </div>
                  {validationErrors.phone && (
                    <p className="text-sm text-red-600 flex items-start gap-1">
                      <span>⚠</span>
                      <span>{validationErrors.phone}</span>
                    </p>
                  )}
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
                  className={validationErrors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""}
                  onChange={() => {
                     if (validationErrors.fullName) {
                       const newErrors = {...validationErrors};
                       delete newErrors.fullName;
                       setValidationErrors(newErrors);
                     }
                  }}
                />
                {validationErrors.fullName && (
                  <p className="text-sm text-red-600 flex items-start gap-1">
                    <span>⚠</span>
                    <span>{validationErrors.fullName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address1">Address Line 1 *</Label>
                <Input
                  id="address1"
                  name="address1"
                  placeholder="Street address (minimum 5 characters)"
                  required
                  defaultValue={defaultAddress?.addressLine1 || ""}
                  className={validationErrors.address1 ? "border-red-500 focus-visible:ring-red-500" : ""}
                  onChange={() => {
                    const newErrors = {...validationErrors};
                    delete newErrors.address1;
                    setValidationErrors(newErrors);
                  }}
                />
                {validationErrors.address1 && (
                  <p className="text-sm text-red-600 flex items-start gap-1">
                    <span>⚠</span>
                    <span>{validationErrors.address1}</span>
                  </p>
                )}
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
                    className={validationErrors.city ? "border-red-500 focus-visible:ring-red-500" : ""}
                    onChange={() => {
                       if (validationErrors.city) {
                         const newErrors = {...validationErrors};
                         delete newErrors.city;
                         setValidationErrors(newErrors);
                       }
                    }}
                  />
                  {validationErrors.city && (
                    <p className="text-sm text-red-600 flex items-start gap-1">
                      <span>⚠</span>
                      <span>{validationErrors.city}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Maharashtra"
                    required
                    defaultValue={defaultAddress?.state || ""}
                    className={validationErrors.state ? "border-red-500 focus-visible:ring-red-500" : ""}
                    onChange={() => {
                       if (validationErrors.state) {
                         const newErrors = {...validationErrors};
                         delete newErrors.state;
                         setValidationErrors(newErrors);
                       }
                    }}
                  />
                  {validationErrors.state && (
                    <p className="text-sm text-red-600 flex items-start gap-1">
                      <span>⚠</span>
                      <span>{validationErrors.state}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code *</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    placeholder="400001 (6 digits)"
                    required
                    defaultValue={defaultAddress?.postalCode || ""}
                    className={validationErrors.pincode ? "border-red-500 focus-visible:ring-red-500" : ""}
                    onChange={() => {
                      const newErrors = {...validationErrors};
                      delete newErrors.pincode;
                      setValidationErrors(newErrors);
                    }}
                  />
                  {validationErrors.pincode && (
                    <p className="text-sm text-red-600 flex items-start gap-1">
                      <span>⚠</span>
                      <span>{validationErrors.pincode}</span>
                    </p>
                  )}
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
                      {item.variantName && (
                        <p className="text-xs text-[#2D5F3F] font-bold">Variation: {item.variantName}</p>
                      )}
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
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-green-700">
                    <span className="font-medium">Discount ({appliedCoupon.code})</span>
                    <span className="font-medium">-₹{discount}</span>
                  </div>
                )}
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
