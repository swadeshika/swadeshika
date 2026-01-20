"use client"

/**
 * AdminSettings
 *
 * Purpose:
 * - Manage store configuration in the admin panel (store details, checkout, payments, shipping, tax, analytics, locale, inventory).
 *
 * Key Features:
 * - Logo upload with preview and drag-and-drop (validates type/size).
 * - Multi-gateway support (Razorpay/Stripe/Cashfree/COD) with per-gateway credentials.
 * - Fully controlled inputs with immediate local persistence and explicit Save action with toast.
 * - Consistent brown/green theme using Tailwind/shadcn UI.
 *
 * Implementation Notes:
 * - State auto-persists via useEffect to localStorage under the "settings" key; Save button also persists and toasts.
 * - Number inputs allow empty string to prevent NaN while editing, then normalize on change.
 * - Sections removed per requirements: Policies, Email Templates, and SEO meta title/description.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { ChangePassword } from "@/components/admin-change-password"
import { api } from "@/lib/api"

type Gateway = "razorpay" | "stripe" | "cashfree" | "cod"

type Settings = {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  logoDataUrl: string | null
  guestCheckout: boolean
  defaultOrderStatus: "pending" | "confirmed" | "processing"
  currency: "inr" | "usd"
  enabledGateways: Record<Gateway, boolean>
  gatewayConfigs: {
    razorpay?: { apiKey?: string; apiSecret?: string }
    stripe?: { apiKey?: string; apiSecret?: string }
    cashfree?: { apiKey?: string; apiSecret?: string }
    cod?: { enableCOD?: boolean }
  }
  shippingMethod: "standard" | "express" | "pickup"
  freeShippingThreshold: number | ''
  flatRate: number | ''
  gstPercent: number | ''
  pricesIncludeTax: boolean
  gaId: string
  searchConsoleId: string
  timezone: "asia-kolkata" | "utc"
  units: "metric" | "imperial"
  lowStockThreshold: number | ''
  allowBackorders: boolean
  twoFactorEnabled?: boolean
}

export function AdminSettings() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [settings, setSettings] = useState<Settings>({
    storeName: "Swadeshika",
    storeEmail: "support@swadeshika.com",
    storePhone: "+91 98765 43210",
    storeAddress: "",
    logoDataUrl: null,
    guestCheckout: true,
    defaultOrderStatus: "pending",
    currency: "inr",
    enabledGateways: { razorpay: false, stripe: false, cashfree: false, cod: false },
    gatewayConfigs: {},
    shippingMethod: "standard",
    freeShippingThreshold: '',
    flatRate: '',
    gstPercent: '',
    pricesIncludeTax: false,
    gaId: "",
    searchConsoleId: "",
    timezone: "asia-kolkata",
    units: "metric",
    lowStockThreshold: 10,
    allowBackorders: false,
    twoFactorEnabled: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings')
      if (response.data.success) {
        const data = response.data.data
        // Map snake_case to camelCase
        setSettings({
          storeName: data.store_name || "Swadeshika",
          storeEmail: data.support_email || "support@swadeshika.com",
          storePhone: data.support_phone || "+91 98765 43210",
          storeAddress: data.store_address || "",
          logoDataUrl: data.logo_data_url || null,
          guestCheckout: Boolean(data.guest_checkout),
          defaultOrderStatus: data.default_order_status || "pending",
          currency: data.currency || "inr",
          enabledGateways: data.enabled_gateways || { razorpay: false, stripe: false, cashfree: false, cod: false },
          gatewayConfigs: data.gateway_configs || {},
          shippingMethod: data.shipping_method || "standard",
          freeShippingThreshold: data.free_shipping_threshold !== null ? Number(data.free_shipping_threshold) : '',
          flatRate: data.flat_rate !== null ? Number(data.flat_rate) : '',
          gstPercent: data.gst_percent !== null ? Number(data.gst_percent) : '',
          pricesIncludeTax: Boolean(data.prices_include_tax),
          gaId: data.ga_id || "",
          searchConsoleId: data.search_console_id || "",
          timezone: data.timezone || "asia-kolkata",
          units: data.units || "metric",
          lowStockThreshold: data.low_stock_threshold !== null ? Number(data.low_stock_threshold) : 10,
          allowBackorders: Boolean(data.allow_backorders),
          twoFactorEnabled: Boolean(data.two_factor_enabled),
        })
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
      toast({ title: "Error", description: "Failed to load settings.", variant: "destructive" })
    }
  }

  const handleSave = async () => {
    // Validation
    if (!settings.storeAddress.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Store address cannot be empty.", 
        variant: "destructive" 
      })
      return
    }

    // Basic phone validation: allows +, space, -, (, ) and requires at least 10 characters
    // Phone validation: MUST start with +91 and followed by exactly 10 digits
    const phoneRegex = /^\+91\d{10}$/
    // Remove spaces/dashes before checking (though UI enforces clean input now)
    const cleanPhone = settings.storePhone.replace(/\s+/g, '')
    
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      toast({ 
        title: "Validation Error", 
        description: "Please enter a valid phone number (10 digits).", 
        variant: "destructive" 
      })
      return
    }

    try {
      // Map camelCase to snake_case
      const payload = {
        store_name: settings.storeName,
        support_email: settings.storeEmail,
        support_phone: settings.storePhone,
        store_address: settings.storeAddress,
        logo_data_url: settings.logoDataUrl,
        guest_checkout: settings.guestCheckout,
        default_order_status: settings.defaultOrderStatus,
        currency: settings.currency,
        enabled_gateways: settings.enabledGateways,
        gateway_configs: settings.gatewayConfigs,
        shipping_method: settings.shippingMethod,
        free_shipping_threshold: settings.freeShippingThreshold === '' ? null : settings.freeShippingThreshold,
        flat_rate: settings.flatRate === '' ? null : settings.flatRate,
        gst_percent: settings.gstPercent === '' ? null : settings.gstPercent,
        prices_include_tax: settings.pricesIncludeTax,
        ga_id: settings.gaId,
        search_console_id: settings.searchConsoleId,
        timezone: settings.timezone,
        units: settings.units,
        low_stock_threshold: settings.lowStockThreshold === '' ? null : settings.lowStockThreshold,
        allow_backorders: settings.allowBackorders,
        two_factor_enabled: settings.twoFactorEnabled
      }

      const response = await api.put('/admin/settings', payload)
      if (response.data.success) {
        toast({ title: "Settings Saved", description: "Your changes have been saved." })
      }
    } catch (error: any) {
      toast({ 
        title: "Save Failed", 
        description: error.message || "Could not save settings.", 
        variant: "destructive" 
      })
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[#6B4423]">Settings</h1>
        <p className="text-[#8B6F47]">Manage store configuration and preferences</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Store Details */}
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Store Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input
                id="store-name"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                placeholder="Swadeshika"
                className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-email">Support Email</Label>
              <Input
                id="store-email"
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                placeholder="support@swadeshika.com"
                className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-phone">Support Phone</Label>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-12 items-center justify-center rounded-md border-2 border-[#E8DCC8] bg-muted text-sm font-medium text-[#6B4423]">
                  +91
                </div>
                <Input
                  id="store-phone"
                  value={settings.storePhone.replace(/^\+91\s?/, "")}
                  maxLength={10}
                  onChange={(e) => {
                    // Only allow digits
                    const val = e.target.value.replace(/\D/g, '')
                    setSettings({ ...settings, storePhone: `+91${val}` })
                  }}
                  placeholder="9876543210"
                  className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address">Store Address</Label>
              <Textarea
                id="store-address"
                value={settings.storeAddress}
                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                placeholder="Street, City, State, PIN"
                className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-logo">Store Logo</Label>
              <div
                className="flex items-center gap-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files?.[0]
                  if (!file) return
                  if (!file.type.startsWith("image/")) {
                    toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" })
                    return
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    toast({ title: "File too large", description: "Max 2MB allowed.", variant: "destructive" })
                    return
                  }
                  const reader = new FileReader()
                  reader.onload = () => setSettings({ ...settings, logoDataUrl: String(reader.result) })
                  reader.readAsDataURL(file)
                }}
              >
                <div className="w-24 h-24 rounded-xl border-2 border-[#E8DCC8] bg-white overflow-hidden flex items-center justify-center">
                  {settings.logoDataUrl ? (
                    <img src={settings.logoDataUrl} alt="Logo" className="object-contain w-full h-full" />
                  ) : (
                    <span className="text-sm text-[#8B6F47]">No logo</span>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    id="store-logo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (!file.type.startsWith("image/")) {
                        toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" })
                        return
                      }
                      if (file.size > 2 * 1024 * 1024) {
                        toast({ title: "File too large", description: "Max 2MB allowed.", variant: "destructive" })
                        return
                      }
                      const reader = new FileReader()
                      reader.onload = () => setSettings({ ...settings, logoDataUrl: String(reader.result) })
                      reader.readAsDataURL(file)
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <Button type="button" className="bg-[#2D5F3F] hover:bg-[#234A32] text-white" onClick={() => fileInputRef.current?.click()}>
                      Upload Logo
                    </Button>
                    {settings.logoDataUrl && (
                      <Button type="button" variant="outline" className="bg-transparent" onClick={() => setSettings({ ...settings, logoDataUrl: null })}>
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-[#8B6F47]">PNG/SVG, max 2MB. Recommended 256x256.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders & Checkout */}
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Orders & Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#6B4423]">Enable Guest Checkout</p>
                <p className="text-sm text-[#8B6F47]">Allow customers to checkout without creating an account</p>
              </div>
              <Switch checked={settings.guestCheckout} onCheckedChange={(v) => setSettings({ ...settings, guestCheckout: v })} />
            </div>
            <div className="space-y-2">
              <Label>Default Order Status</Label>
              <Select value={settings.defaultOrderStatus} onValueChange={(v) => setSettings({ ...settings, defaultOrderStatus: v as any })}>
                <SelectTrigger className="border-2 border-[#E8DCC8]">
                  <SelectValue placeholder="Pending" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(settings.enabledGateways).map((gateway) => (
              <div key={gateway} className="space-y-2">
                <Label>
                  {gateway.charAt(0).toUpperCase() + gateway.slice(1)} Gateway
                </Label>
                <Switch
                  checked={settings.enabledGateways[gateway as Gateway]}
                  onCheckedChange={(v) =>
                    setSettings({
                      ...settings,
                      enabledGateways: { ...settings.enabledGateways, [gateway]: v },
                    })
                  }
                />
                {settings.enabledGateways[gateway as Gateway] && (
                  gateway === 'cod' ? (
                    <div className="flex items-center justify-between rounded-xl border-2 border-[#E8DCC8] p-3">
                      <span className="text-[#6B4423]">Cash on Delivery enabled</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input
                        type="text"
                        value={settings.gatewayConfigs[gateway as Exclude<Gateway,'cod'>]?.apiKey ?? ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            gatewayConfigs: {
                              ...settings.gatewayConfigs,
                              [gateway]: { ...(settings.gatewayConfigs as any)[gateway], apiKey: e.target.value },
                            },
                          })
                        }
                        placeholder="Enter API Key"
                        className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                      />
                      <Label>API Secret</Label>
                      <Input
                        type="text"
                        value={settings.gatewayConfigs[gateway as Exclude<Gateway,'cod'>]?.apiSecret ?? ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            gatewayConfigs: {
                              ...settings.gatewayConfigs,
                              [gateway]: { ...(settings.gatewayConfigs as any)[gateway], apiSecret: e.target.value },
                            },
                          })
                        }
                        placeholder="Enter API Secret"
                        className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                      />
                    </div>
                  )
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Account Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Change Password */}
            <ChangePassword onSuccess={() => toast({ title: "Password Updated", description: "Your password has been changed." })} />

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between rounded-xl border-2 border-[#E8DCC8] p-3">
              <div>
                <p className="font-medium text-[#6B4423]">Two-Factor Authentication</p>
                <p className="text-sm text-[#8B6F47]">Adds an extra layer of security to your account</p>
              </div>
              <Switch
                checked={!!settings.twoFactorEnabled}
                onCheckedChange={(v) => setSettings({ ...settings, twoFactorEnabled: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Delivery */}
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Shipping & Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Shipping Method</Label>
              <Select value={settings.shippingMethod} onValueChange={(v) => setSettings({ ...settings, shippingMethod: v as any })}>
                <SelectTrigger className="border-2 border-[#E8DCC8]">
                  <SelectValue placeholder="Standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="pickup">Store Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Free Shipping Threshold (₹)</Label>
              <Input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value === '' ? '' : Number(e.target.value) })}
                placeholder="999"
                className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
            <div className="space-y-2">
              <Label>Flat Rate (₹)</Label>
              <Input
                type="number"
                value={settings.flatRate}
                onChange={(e) => setSettings({ ...settings, flatRate: e.target.value === '' ? '' : Number(e.target.value) })}
                placeholder="49"
                className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Tax Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>GST Percentage (%)</Label>
              <Input
                type="number"
                value={settings.gstPercent}
                onChange={(e) => setSettings({ ...settings, gstPercent: e.target.valueAsNumber })}
                placeholder="18"
                className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#6B4423]">Prices include tax</p>
                <p className="text-sm text-[#8B6F47]">Show prices inclusive of GST</p>
              </div>
              <Switch checked={settings.pricesIncludeTax} onCheckedChange={(v) => setSettings({ ...settings, pricesIncludeTax: v })} />
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Google Analytics ID</Label>
              <Input
                value={settings.gaId}
                onChange={(e) => setSettings({ ...settings, gaId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
            <div className="space-y-2">
              <Label>Search Console Verification ID</Label>
              <Input
                value={settings.searchConsoleId}
                onChange={(e) => setSettings({ ...settings, searchConsoleId: e.target.value })}
                placeholder="XXXXXXXXXXXX"
                className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional & Locale */}
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Regional & Locale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v as any })}>
                <SelectTrigger className="border-2 border-[#E8DCC8]">
                  <SelectValue placeholder="Asia/Kolkata (IST)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Measurement Units</Label>
              <Select value={settings.units} onValueChange={(v) => setSettings({ ...settings, units: v as any })}>
                <SelectTrigger className="border-2 border-[#E8DCC8]">
                  <SelectValue placeholder="Metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="imperial">Imperial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardHeader>
            <CardTitle className="text-[#6B4423]">Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="low-stock">Low Stock Threshold</Label>
              <Input id="low-stock" type="number" min={0} placeholder="10" value={settings.lowStockThreshold as any}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setSettings({ ...settings, lowStockThreshold: '' })
                  } else {
                    const num = Number(val);
                    if (num >= 0) {
                      setSettings({ ...settings, lowStockThreshold: num })
                    }
                  }
                }}
                className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
            </div>
            {/* <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#6B4423]">Allow Backorders</p>
                <p className="text-sm text-[#8B6F47]">Permit purchase when stock is zero</p>
              </div>
              <Switch checked={settings.allowBackorders} onCheckedChange={(v) => setSettings({ ...settings, allowBackorders: v })} />
            </div> */}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">Save Changes</Button>
      </div>
    </div>
  )
}
