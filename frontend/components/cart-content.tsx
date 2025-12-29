"use client"

import Link from "next/link"
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/lib/cart-store"
import { couponService } from "@/lib/couponService"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { settingsService, AppSettings } from "@/lib/services/settingsService"

export function CartContent() {
  const { items, updateQuantity, removeItem } = useCartStore()
  const [couponCode, setCouponCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null)
  const { toast } = useToast()

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setIsValidating(true)
    try {
      // Map cart items to backend expected shape
      const cartItemsForApi = items.map(i => ({
        product_id: (i as any).productId || (i as any).id,
        category_id: (i as any).categoryId || null,
        price: i.price,
        quantity: i.quantity
      }))

      const result = await couponService.validateCoupon(couponCode, subtotal, cartItemsForApi)

      if (result.isValid) {
        setAppliedCoupon({
          code: couponCode,
          discountAmount: result.discountAmount
        })
        toast({
          title: "Coupon Applied!",
          description: `You saved ₹${result.discountAmount}`,
        })
      } else {
        setAppliedCoupon(null)
        toast({
          title: "Invalid Coupon",
          description: result.message || "This coupon code is not valid.",
          variant: "destructive"
        })
      }
    } catch (error) {
      setAppliedCoupon(null)
      toast({
        title: "Error",
        description: "Failed to validate coupon. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    toast({
      title: "Coupon Removed",
      description: " The coupon has been removed from your order."
    })
  }
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings()
        setSettings(data)
      } catch (error) {
        console.error("Failed to fetch settings", error)
      }
    }
    fetchSettings()
  }, [])

  const shippingThreshold = settings?.free_shipping_threshold ?? 500
  const flatRate = settings?.flat_rate ?? 50

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= shippingThreshold ? 0 : flatRate
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const total = subtotal + shipping - discount

  // Calculate amount needed for free shipping
  const amountForFreeShipping = shippingThreshold - subtotal

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="h-24 w-24 text-[#2D5F3F]/70 mb-4" />
        <h2 className="font-serif text-2xl font-bold mb-2 text-[#6B4423]">Your cart is empty</h2>
        <p className="text-[#8B6F47] mb-6">Add some products to get started</p>
        <Button asChild className="bg-[#2D5F3F] hover:bg-[#234A32] text-white cursor-pointer">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="rounded-2xl border-2 border-[#E8DCC8] bg-white">
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#F5F1E8] border-2 border-[#E8DCC8]">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="object-cover w-full h-full" />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-sans font-bold text-lg text-[#6B4423]">{item.name}</h3>
                      <p className="text-sm text-[#8B6F47]">{item.category}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="hover:bg-[#2D5F3F] cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 border-2 border-[#E8DCC8] rounded-xl">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-bold text-lg text-[#2D5F3F]">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" asChild className="w-full bg-transparent cursor-pointer">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24 rounded-2xl border-2 border-[#E8DCC8]">
          <CardContent className="p-6 space-y-6">
            <h2 className="font-sans text-2xl font-bold text-[#6B4423]">Order Summary</h2>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#8B6F47]">Subtotal</span>
                <span className="font-medium text-[#6B4423]">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8B6F47]">Shipping</span>
                <span className="font-medium text-[#6B4423]">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                  <span className="font-medium">-₹{discount}</span>
                </div>
              )}
              {amountForFreeShipping > 0 && (
                <p className="text-sm text-[#8B6F47]">Add ₹{amountForFreeShipping} more for free shipping</p>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between text-lg font-bold">
              <span className="text-[#6B4423]">Total</span>
              <span className="text-[#2D5F3F]">₹{total}</span>
            </div>

            <Button className="w-full bg-[#2D5F3F] hover:bg-[#234A32] text-white cursor-pointer" size="lg" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <Separator />

            {/* Coupon Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Have a coupon code?</label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-bold text-green-700">{appliedCoupon.code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="h-auto p-1 text-green-600 hover:text-green-800 hover:bg-green-100"
                  >
                    <span className="text-xs">Remove</span>
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    className="bg-transparent border-2 border-[#E8DCC8] cursor-pointer min-w-[80px]"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || isValidating}
                  >
                    {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
