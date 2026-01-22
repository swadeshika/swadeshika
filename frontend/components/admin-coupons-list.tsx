"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Tag, Copy, Loader2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { couponService, Coupon } from "@/lib/couponService"

const defaultForm = {
  code: "",
  description: "",
  type: "percentage",
  value: "",
  minOrder: "",
  usageLimit: "",
  expiryDate: "",
  isActive: true,
}

export function AdminCouponsList() {
  const { toast } = useToast()

  const [items, setItems] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Restriction Data
  const [products, setProducts] = useState<{ id: number, name: string }[]>([])
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([])

  const [isCREATEOpen, setIsCREATEOpen] = useState(false)
  const [isEDITOpen, setIsEDITOpen] = useState(false)
  const [isDELETEOpen, setIsDELETEOpen] = useState(false)

  const [form, setForm] = useState({
    ...defaultForm,
    appliesTo: "all" as "all" | "products" | "categories",
    productIds: [] as string[],
    categoryIds: [] as string[]
  })

  const [currentId, setCurrentId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number, code: string } | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Run promises in parallel but catch individual errors if needed, or grouped.
      const [couponsData, productsData, categoriesData] = await Promise.all([
        couponService.getAllCoupons(),
        couponService.getProducts().catch(e => { console.error("Prod error", e); return [] }),
        couponService.getCategories().catch(e => { console.error("Cat error", e); return [] })
      ])

      setItems(couponsData || [])
      setProducts(productsData || [])
      setCategories(categoriesData || [])
    } catch (error) {
      console.error("Load Data Error", error)
      toast({
        title: "Error",
        description: "Failed to load initial data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const reloadCoupons = async () => {
    try {
      const data = await couponService.getAllCoupons()
      setItems(data)
    } catch (e) {
      console.error("Failed to reload coupons", e)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast({
      title: "Copied!",
      description: `Coupon code ${code} copied to clipboard.`
    })
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const openCreate = () => {
    setForm({
      ...defaultForm,
      appliesTo: "all",
      productIds: [],
      categoryIds: []
    })
    setIsCREATEOpen(true)
  }

  const openEdit = (id: number) => {
    // Loose comparison in case string/number mismatch from server
    const coupon = items.find(c => c.id == id)
    if (!coupon) return

    let appliesTo: "all" | "products" | "categories" = "all"
    if (coupon.product_ids && coupon.product_ids.length > 0) appliesTo = "products"
    if (coupon.category_ids && coupon.category_ids.length > 0) appliesTo = "categories"

    setForm({
      code: coupon.code,
      description: coupon.description || "",
      type: coupon.discount_type,
      value: coupon.discount_value.toString(),
      minOrder: coupon.min_order_amount?.toString() || "",
      usageLimit: coupon.usage_limit?.toString() || "",
      expiryDate: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split('T')[0] : "",
      isActive: coupon.is_active,
      appliesTo: appliesTo,
      productIds: coupon.product_ids?.map(String) || [],
      categoryIds: coupon.category_ids?.map(String) || []
    })
    setCurrentId(id)
    setIsEDITOpen(true)
  }

  const getPayload = () => {
    const payload: Partial<Coupon> = {
      code: form.code.toUpperCase(),
      description: form.description,
      discount_type: form.type as 'percentage' | 'fixed',
      discount_value: parseFloat(form.value),
      min_order_amount: form.minOrder ? parseFloat(form.minOrder) : 0,
      usage_limit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
      valid_until: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
      is_active: form.isActive,
      product_ids: form.appliesTo === "products" ? form.productIds.map(Number) : [],
      category_ids: form.appliesTo === "categories" ? form.categoryIds.map(Number) : []
    }
    return payload
  }

  const handleCreate = async () => {
    if (!form.code) {
      toast({ title: "Code required", description: "Please enter a coupon code.", variant: "destructive" })
      return
    }
    if (!form.value) {
      toast({ title: "Value required", description: "Please enter a discount value.", variant: "destructive" })
      return
    }

    try {
      await couponService.createCoupon(getPayload())

      toast({ title: "Success", description: "Coupon created successfully." })
      setIsCREATEOpen(false)
      reloadCoupons()
    } catch (error: any) {
      // Parse validation errors from API
      let errorMessage = "Failed to create coupon";
      
      // FIRST: Check if error.errors array exists (preferred)
      if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        errorMessage = error.errors.map((e: any) => `• ${e.message}`).join('\n');
      } 
      // FALLBACK: Try to parse JSON array from error.message string
      else if (error.message) {
        try {
          // Check if message contains a JSON array (look for [{...}])
          const jsonMatch = error.message.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (jsonMatch) {
            const errors = JSON.parse(jsonMatch[0]);
            if (Array.isArray(errors) && errors.length > 0) {
              errorMessage = errors.map((e: any) => `• ${e.message}`).join('\n');
            }
          } else {
            // No JSON found, use the plain message
            errorMessage = error.message;
          }
        } catch (parseError) {
          // If parsing fails, use original message
          errorMessage = error.message;
        }
      }

      toast({
        title: "Validation Error",
        description: <div className="whitespace-pre-line">{errorMessage}</div>,
        variant: "destructive"
      })
    }
  }

  const handleUpdate = async () => {
    if (!currentId) return

    try {
      await couponService.updateCoupon(currentId, getPayload())

      toast({ title: "Success", description: "Coupon updated successfully." })
      setIsEDITOpen(false)
      reloadCoupons()
    } catch (error: any) {
      // Parse validation errors from API
      let errorMessage = "Failed to update coupon";
      
      // FIRST: Check if error.errors array exists (preferred)
      if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        errorMessage = error.errors.map((e: any) => `• ${e.message}`).join('\n');
      } 
      // FALLBACK: Try to parse JSON array from error.message string
      else if (error.message) {
        try {
          // Check if message contains a JSON array (look for [{...}])
          const jsonMatch = error.message.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (jsonMatch) {
            const errors = JSON.parse(jsonMatch[0]);
            if (Array.isArray(errors) && errors.length > 0) {
              errorMessage = errors.map((e: any) => `• ${e.message}`).join('\n');
            }
          } else {
            // No JSON found, use the plain message
            errorMessage = error.message;
          }
        } catch (parseError) {
          // If parsing fails, use original message
          errorMessage = error.message;
        }
      }

      toast({
        title: "Validation Error",
        description: <div className="whitespace-pre-line">{errorMessage}</div>,
        variant: "destructive"
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      await couponService.deleteCoupon(deleteTarget.id)

      toast({ title: "Deleted", description: `Coupon ${deleteTarget.code} has been removed.` })
      setIsDELETEOpen(false)
      reloadCoupons()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive"
      })
    }
  }

  const filtered = items.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Reusable form fields for both Dialogs
  const renderFormFields = () => (
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Coupon Code</Label>
          <Input
            id="code"
            placeholder="e.g. SUMMER25"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="font-mono uppercase"
          />
          <p className="text-xs text-muted-foreground">3-50 characters required.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Discount Type</Label>
          <Select
            value={form.type}
            onValueChange={(val) => setForm({ ...form, type: val as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Input
          id="desc"
          placeholder="e.g. Summer Sale Discount"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">Discount Value</Label>
          <Input
            id="value"
            type="number"
            placeholder="e.g. 20"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minOrder">Min Order Amount (₹)</Label>
          <Input
            id="minOrder"
            type="number"
            placeholder="e.g. 500"
            value={form.minOrder}
            onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
          <Input
            id="usageLimit"
            type="number"
            placeholder="e.g. 100"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiry">Expiry Date</Label>
          <Input
            id="expiry"
            type="date"
            min={new Date().toISOString().split('T')[0]} // Disable past dates
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Applies To</Label>
        <Select
          value={form.appliesTo}
          onValueChange={(val) => setForm({ ...form, appliesTo: val as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="products">Specific Products</SelectItem>
            <SelectItem value="categories">Specific Categories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.appliesTo === "products" && (
        <div className="space-y-2">
          <Label className="mb-2 block">Select Products</Label>
          <div className="border rounded-md p-2 h-32 overflow-y-auto space-y-1">
            {products.map(p => (
              <div key={p.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`prod-${p.id}`}
                  checked={form.productIds.includes(String(p.id))}
                  onChange={(e) => {
                    const pid = String(p.id)
                    setForm(prev => ({
                      ...prev,
                      productIds: e.target.checked
                        ? [...prev.productIds, pid]
                        : prev.productIds.filter(id => id !== pid)
                    }))
                  }}
                  className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                />
                <Label htmlFor={`prod-${p.id}`} className="text-sm font-normal cursor-pointer select-none">{p.name}</Label>
              </div>
            ))}
            {products.length === 0 && <p className="text-xs text-muted-foreground p-1">No products found.</p>}
          </div>
        </div>
      )}

      {form.appliesTo === "categories" && (
        <div className="space-y-2">
          <Label className="mb-2 block">Select Categories</Label>
          <div className="border rounded-md p-2 h-32 overflow-y-auto space-y-1">
            {categories.map(c => (
              <div key={c.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`cat-${c.id}`}
                  checked={form.categoryIds.includes(String(c.id))}
                  onChange={(e) => {
                    const cid = String(c.id)
                    setForm(prev => ({
                      ...prev,
                      categoryIds: e.target.checked
                        ? [...prev.categoryIds, cid]
                        : prev.categoryIds.filter(id => id !== cid)
                    }))
                  }}
                  className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                />
                <Label htmlFor={`cat-${c.id}`} className="text-sm font-normal cursor-pointer select-none">{c.name}</Label>
              </div>
            ))}
            {categories.length === 0 && <p className="text-xs text-muted-foreground p-1">No categories found.</p>}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="active"
          checked={form.isActive}
          onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
        />
        <Label htmlFor="active">Is Active?</Label>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#2D5F3F]">Coupons & Discounts</h2>
          <p className="text-sm text-[#6B4423] mt-1">Manage promotional codes and special offers</p>
        </div>
        <Button onClick={openCreate} className="bg-[#6B4423] hover:bg-[#5A3A1F] text-white">
          <Plus className="mr-2 h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coupons..."
            className="pl-8 bg-white border-[#E8DCC8]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border border-[#E8DCC8] bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F9F5F0]">
            <TableRow className="border-b-[#E8DCC8]">
              <TableHead className="text-[#6B4423] font-semibold">Code</TableHead>
              <TableHead className="text-[#6B4423] font-semibold">Type</TableHead>
              <TableHead className="text-[#6B4423] font-semibold">Value</TableHead>
              <TableHead className="text-[#6B4423] font-semibold">Min Order</TableHead>
              <TableHead className="text-[#6B4423] font-semibold">Usage</TableHead>
              <TableHead className="text-[#6B4423] font-semibold">Expiry</TableHead>
              <TableHead className="text-[#6B4423] font-semibold">Restrictions</TableHead>
              <TableHead className="text-[#6B4423] font-semibold">Status</TableHead>
              <TableHead className="text-right text-[#6B4423] font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-[#6B4423]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading coupons...
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-[#8B6F47]">
                  No coupons found. Create your first coupon.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((coupon) => (
                <TableRow key={coupon.id} className="border-b-[#E8DCC8] hover:bg-[#F9F5F0]/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#8B6F47]" />
                      <button
                        className="font-mono font-semibold bg-[#F5F1E8] border border-[#E8DCC8] text-[#6B4423] px-2 py-1 rounded cursor-copy hover:border-[#6B4423] transition-colors flex items-center gap-1 group"
                        onClick={() => handleCopyCode(coupon.code)}
                      >
                        {coupon.code}
                        {copiedCode === coupon.code ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </div>
                    {coupon.description && (
                      <p className="text-xs text-[#8B6F47] mt-1 truncate max-w-[150px]">{coupon.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{coupon.discount_type}</TableCell>
                  <TableCell className="font-semibold">{coupon.discount_value}{coupon.discount_type === 'percentage' ? '%' : ''}</TableCell>
                  <TableCell className="font-semibold text-[#6B4423]">₹{coupon.min_order_amount}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs">
                        {coupon.used_count}/{coupon.usage_limit || '∞'}
                      </span>
                      {coupon.usage_limit && (
                        <div className="h-1.5 w-full bg-[#E8DCC8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2D5F3F]"
                            style={{ width: `${Math.min((coupon.used_count / coupon.usage_limit) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'No Expiry'}
                  </TableCell>
                  <TableCell>
                    {coupon.product_ids && coupon.product_ids.length > 0 ? (
                      <Badge variant="outline">Products ({coupon.product_ids.length})</Badge>
                    ) : coupon.category_ids && coupon.category_ids.length > 0 ? (
                      <Badge variant="outline">Cats ({coupon.category_ids.length})</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">All</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        coupon.is_active
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }
                    >
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(coupon.id)}>
                        <Edit className="h-4 w-4 text-[#6B4423]" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                        setDeleteTarget({ id: coupon.id, code: coupon.code })
                        setIsDELETEOpen(true)
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCREATEOpen} onOpenChange={setIsCREATEOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Coupon</DialogTitle>
            <DialogDescription>Configure a new coupon code</DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCREATEOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-[#6B4423]">Create Coupon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEDITOpen} onOpenChange={setIsEDITOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>Update coupon details</DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEDITOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} className="bg-[#6B4423]">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDELETEOpen} onOpenChange={setIsDELETEOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold">{deleteTarget?.code}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDELETEOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
