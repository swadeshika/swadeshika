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

// Indian States Data
const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// Validation Patterns
const PATTERNS = {
  NAME: /^[a-zA-Z\s.-]+$/,
  PHONE: /^\d{10}$/,
  PINCODE: /^\d{6}$/,
  // Address: allow numbers, letters, standard symbols. Reject only-symbol strings.
  // We check detailed logic in handler, simplest regex for "not empty" here is broad.
  ONLY_SYMBOLS: /^[^a-zA-Z0-9]+$/ 
};

export function CheckoutForm() {
  const router = useRouter()
  const { toast } = useToast()

  // Stores
  const { items: cartItems, getTotalPrice, appliedCoupon } = useCartStore()
  const { user } = useAuthStore()

  // State
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [placing, setPlacing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Data
  const [addresses, setAddresses] = useState<Address[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)

  // Address Form State (using default values or local state to control inputs perfectly)
  const [shippingState, setShippingState] = useState("")
  const [billingState, setBillingState] = useState("")

  // Derived state
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0]

  // Initialize states when data loads
  useEffect(() => {
    if (defaultAddress?.state) setShippingState(defaultAddress.state)
  }, [defaultAddress])


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
        const fetchedAddresses = user 
          ? await addressService.getAddresses().catch(() => [])
          : [];
        
        const fetchedSettings = await settingsService.getSettings().catch(() => null);
        
        setAddresses(fetchedAddresses || []);
        setSettings(fetchedSettings);
        
        // Set default payment method
        if (fetchedSettings?.enabledGateways) {
            if (fetchedSettings.enabledGateways.cod) {
                setPaymentMethod("cod");
            } else if (fetchedSettings.enabledGateways.razorpay) {
                setPaymentMethod("razorpay");
            }
        }
      } catch (error) {
        console.error("Failed to load checkout data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user])

  // --- Real-time Validation Handler ---
  const validateField = (name: string, value: string) => {
    let error = "";
    const cleanValue = value.trim();

    if (!cleanValue) return; // Don't validate empty while typing, let required handle submit

    switch (name) {
      case 'fullName':
      case 'billingName':
      case 'city':
      case 'billingCity':
        if (!PATTERNS.NAME.test(cleanValue)) {
            error = "Only letters, spaces, and dots allowed.";
        } else if (/[@$#%^&*()_+={}\[\]|\\:;"<>\/?~`]/.test(cleanValue)) { // Double check for allowed symbols overlap
            error = "Special characters are not allowed.";
        }
        break;
      
      case 'phone':
        // Only allow numbers input, done via onInput, ensuring length here
        if (cleanValue.length > 0 && cleanValue.length !== 10) {
            error = "Phone number must be exactly 10 digits.";
        }
        break;

      case 'pincode':
      case 'billingPincode':
        if (cleanValue.length > 0 && !PATTERNS.PINCODE.test(cleanValue)) {
           error = "Pincode must be exactly 6 digits.";
        }
        break;

      case 'address1':
      case 'billingAddress1':
      case 'address2':
      case 'billingAddress2':
        // Anti-Spam: Block strings that are entirely symbols
        if (cleanValue.length > 0 && PATTERNS.ONLY_SYMBOLS.test(cleanValue)) {
            error = "Address cannot contain only symbols.";
        } else if (cleanValue.length < 3 && cleanValue.length > 0) {
            error = "Address is too short.";
        }
        break;
    }

    setValidationErrors(prev => {
        const next = { ...prev };
        if (error) next[name] = error;
        else delete next[name];
        return next;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      
      // Auto-clear error logic handled inside validateField mostly, 
      // but we need to trigger it.
      validateField(name, value);
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPlacing(true)

    const formData = new FormData(e.currentTarget)

    // Manual State Injection (since Select might not submit natively if uncontrolled properly)
    // We bind Select value to a hidden input or just merge it here.
    // Easiest: Let's assume we capture state in the Select logic, or just get it from the state variables if controlled.
    // Actually, name="state" on Select works if we use native select or shadcn select with name.
    // Shadcn Select doesn't always support 'name' prop passing to form data easily without a hidden input.
    // Let's grab it explicitly.
    
    // Construct Address Objects
    const shippingAddress = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      addressLine1: formData.get("address1"),
      addressLine2: formData.get("address2"),
      city: formData.get("city"),
      state: shippingState, // Use state variable
      postalCode: formData.get("pincode"),
      country: "India"
    }

    const billingAddress = sameAsBilling ? shippingAddress : {
      fullName: formData.get("billingName"),
      phone: formData.get("phone"),
      addressLine1: formData.get("billingAddress1"),
      addressLine2: formData.get("billingAddress2"),
      city: formData.get("billingCity"),
      state: billingState, // Use state variable
      postalCode: formData.get("billingPincode"),
      country: "India"
    }

    // Final Validation Check before submitting
    const errors: Record<string, string> = {};
    if (!shippingState) errors.state = "Please select a state.";
    if (!sameAsBilling && !billingState) errors.billingState = "Please select a billing state.";
    
    // Re-run field validations to catch empty required fields spoofing
    // (Native 'required' handles most, but let's be safe)
    if(Object.keys(validationErrors).length > 0) {
        toast({
            title: "Please fix form errors",
            description: "Some fields satisfy requirements.",
            variant: "destructive"
        });
        setPlacing(false);
        return;
    }

    if (Object.keys(errors).length > 0) {
        setValidationErrors(prev => ({ ...prev, ...errors }));
        toast({
            title: "Missing Information",
            description: "Please select your state.",
            variant: "destructive"
        });
        setPlacing(false);
        return;
    }


    const orderData = {
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.name,
        variantId: item.variantId,
        variantName: item.variantName || null,
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
      // console.log("Submitting order...", orderData);
      const response = await ordersService.createOrder(orderData as any) as any;
      // console.log("Order created response:", response);
      
      if (response.isRazorpay && response.data.razorpayOrderId) {
          const options = {
              key: response.data.key,
              amount: Number(response.data.totalAmount) * 100, // Amount is in paise
              currency: response.data.currency,
              name: "Swadeshika",
              description: "Order Payment",
              order_id: response.data.razorpayOrderId,
              handler: async function (response: any) {
                  try {
                      // Verify Payment
                      await ordersService.verifyPayment({
                          orderId: response.data.orderId,
                          razorpayOrderId: response.razorpay_order_id,
                          razorpayPaymentId: response.razorpay_payment_id,
                          razorpaySignature: response.razorpay_signature
                      });
                      
                      const { clearCart } = useCartStore.getState();
                      await clearCart();

                      toast({
                          title: "Payment Successful",
                          description: "Your order has been placed successfully!",
                      });
                      
                      router.push(`/order-confirmation/${response.data.orderId}`);
                  } catch (verifyError) {
                      console.error("Payment Verification Failed", verifyError);
                      toast({
                          title: "Payment Verification Failed",
                          description: "Please contact support if money was deducted.",
                          variant: "destructive"
                      });
                      setPlacing(false);
                  }
              },
              prefill: {
                  name: shippingAddress.fullName,
                  email: formData.get("email") as string,
                  contact: formData.get("phone") as string
              },
              theme: {
                  color: "#2D5F3F"
              },
              modal: {
                  ondismiss: function() {
                      setPlacing(false);
                      toast({
                          title: "Payment Cancelled",
                          description: "You cancelled the payment process.",
                          variant: "default"
                      });
                  }
              }
          };

          const rzp1 = new (window as any).Razorpay(options);
          rzp1.open();
          return; // Stop here, wait for handler
      }

      const { clearCart } = useCartStore.getState();
      await clearCart();
      
      toast({
        title: "Order Placed Successfully",
        description: "Thank you for your purchase!",
      })
      
      if (response && response.data && response.data.orderId) {
          // console.log("Redirecting to confirmation:", `/order-confirmation/${response.data.orderId}`);
          router.push(`/order-confirmation/${response.data.orderId}`)
      } else {
          console.error("Missing orderId in response:", response);
          toast({
              title: "Order Placed but Redirection Failed",
              description: "Please check your orders in account section.",
              variant: "destructive"
          });
      }
    } catch (error: any) {
      console.error("Order creation failed", error);

      if (error.errors && Array.isArray(error.errors)) {
        const errors: Record<string, string> = {};
        const fieldMapping: Record<string, string> = {
          'addressLine1': 'address1',
          'addressLine2': 'address2',
          'postalCode': 'pincode',
          'state': 'state',
          'city': 'city',
          'fullName': 'fullName',
          'phone': 'phone'
        };
        
        error.errors.forEach((err: any) => {
          const backendFieldName = err.field?.split('.').pop() || err.field;
          const frontendFieldName = fieldMapping[backendFieldName] || backendFieldName;
          errors[frontendFieldName] = err.message;
        });
        setValidationErrors(errors);
        
        toast({
          title: "Please check your form",
          description: "Some fields need your attention. Please review and correct them.",
          variant: "destructive"
        });
        
        const firstBackendField = error.errors[0]?.field?.split('.').pop();
        const firstErrorField = fieldMapping[firstBackendField] || firstBackendField;
        if (firstErrorField) {
          setTimeout(() => {
            const element = document.querySelector(`[name="${firstErrorField}"]`) || document.getElementById(firstErrorField); // Try ID too for Select
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (element as HTMLInputElement)?.focus();
          }, 100);
        }
        
        setPlacing(false);
        return;
      }

      const errorMessage = error.response?.data?.message || error.message || "Something went wrong. Please try again.";

      const match = errorMessage.match(/IDs: ([0-9, ]+)/);
      if (match && match[1]) {
           const badIds = match[1].split(',').map((id: string) => Number(id.trim()));
           
           if (badIds.length > 0) {
              const { items, removeItem } = useCartStore.getState();
              badIds.forEach((badId: number) => {
                  const itemToRemove = items.find(item => item.productId === badId);
                  if (itemToRemove) removeItem(itemToRemove.id); 
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
                    onChange={handleInputChange}
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
                      validateField('phone', input.value);
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    <div className="relative">
                      <select
                        id="state"
                        name="state"
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${validationErrors.state ? "border-red-500" : ""}`}
                        value={shippingState}
                        onChange={(e) => {
                            setShippingState(e.target.value);
                            if (e.target.value) {
                                setValidationErrors(prev => {
                                    const next = { ...prev };
                                    delete next.state;
                                    return next;
                                });
                            }
                        }}
                        required
                      >
                        <option value="" disabled>Select State</option>
                        {INDIAN_STATES.map((st) => (
                           <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
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
                    placeholder="400001"
                    required
                    maxLength={6}
                    defaultValue={defaultAddress?.postalCode || ""}
                    className={validationErrors.pincode ? "border-red-500 focus-visible:ring-red-500" : ""}
                    onInput={(e) => {
                       const input = e.target as HTMLInputElement;
                       input.value = input.value.replace(/[^0-9]/g, '').slice(0, 6);
                       validateField('pincode', input.value);
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
                    <Input id="billingName" name="billingName" placeholder="John Doe" required onChange={handleInputChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingAddress1">Address Line 1 *</Label>
                    <Input id="billingAddress1" name="billingAddress1" placeholder="Street address" required onChange={handleInputChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingAddress2">Address Line 2</Label>
                    <Input id="billingAddress2" name="billingAddress2" placeholder="Apartment, suite, etc. (optional)" onChange={handleInputChange} />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingCity">City *</Label>
                      <Input id="billingCity" name="billingCity" placeholder="Mumbai" required onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingState">State *</Label>
                      <select
                        id="billingState"
                        name="billingState"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={billingState}
                        onChange={(e) => setBillingState(e.target.value)}
                        required
                      >
                         <option value="" disabled>Select State</option>
                         {INDIAN_STATES.map((st) => (
                           <option key={st} value={st}>{st}</option>
                         ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingPincode">PIN Code *</Label>
                      <Input id="billingPincode" name="billingPincode" placeholder="400001" required maxLength={6} 
                        onInput={(e) => {
                             const input = e.target as HTMLInputElement;
                             input.value = input.value.replace(/[^0-9]/g, '').slice(0, 6);
                             validateField('billingPincode', input.value)
                        }} 
                       />
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
                {settings?.enabledGateways?.razorpay && (
                    <div className={`flex items-center space-x-2 border-2 rounded-xl p-4 ${paymentMethod === 'razorpay' ? 'border-[#2D5F3F] bg-green-50' : 'border-[#E8DCC8]'}`}>
                      <RadioGroupItem value="razorpay" id="razorpay" />
                      <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                        <div className="font-medium">Online Payment</div>
                        <div className="text-sm text-muted-foreground">UPI, Cards, Net Banking (Razorpay)</div>
                      </Label>
                    </div>
                )}

                {settings?.enabledGateways?.cod && (
                    <div className={`flex items-center space-x-2 border-2 rounded-xl p-4 ${paymentMethod === 'cod' ? 'border-[#2D5F3F] bg-green-50' : 'border-[#E8DCC8]'}`}>
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                      </Label>
                    </div>
                )}
                
                {(!settings?.enabledGateways?.razorpay && !settings?.enabledGateways?.cod) && (
                    <div className="text-center p-4 text-gray-500">
                        No payment methods available. Please contact support.
                    </div>
                )}
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
