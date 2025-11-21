"use client"

/**
 * Admin Coupons List Component
 * Manages discount coupons and promotional codes
 */

import { useState } from "react"
import { Plus, Search, Edit, Trash2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { allProducts } from "@/data/products"
import { useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon } from "lucide-react"

const coupons = [
  {
    id: "1",
    code: "WELCOME10",
    discount: "10%",
    type: "Percentage",
    minOrder: 500,
    usageLimit: 100,
    used: 45,
    expiryDate: "Mar 31, 2025",
    status: "Active",
  },
  {
    id: "2",
    code: "FLAT200",
    discount: "₹200",
    type: "Fixed",
    minOrder: 1000,
    usageLimit: 50,
    used: 32,
    expiryDate: "Feb 28, 2025",
    status: "Active",
  },
  {
    id: "3",
    code: "NEWYEAR25",
    discount: "25%",
    type: "Percentage",
    minOrder: 1500,
    usageLimit: 200,
    used: 198,
    expiryDate: "Jan 31, 2025",
    status: "Expiring Soon",
  },
]

export function AdminCouponsList() {
  // Admin coupons management component.
  // - Manages local coupon list state used for display in the table.
  // - Provides Create / Edit dialogs to configure coupons, including
  //   scope (all products | specific categories | specific products).
  // - Uses `allProducts` to populate product/category selector UIs.
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState(coupons)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null)
  // `form` stores the in-progress create/edit coupon values shown in dialogs.
  // fields:
  // - code/type/value/minOrder/usageLimit/used/expiryDate/status: coupon metadata
  // - appliesTo: 'all' | 'categories' | 'products' controls scope
  // - categories/products: arrays of selected category names or product slugs
  const [form, setForm] = useState({
    code: "",
    type: "Percentage" as "Percentage" | "Fixed",
    value: 10,
    minOrder: 0,
    usageLimit: 100,
    used: 0,
    expiryDate: null as Date | null,
    status: "Active" as "Active" | "Inactive" | "Expiring Soon",
    appliesTo: "all" as "all" | "categories" | "products",
    categories: [] as string[],
    products: [] as string[],
  })
  const [editing, setEditing] = useState<string | null>(null)
  // Temporary inputs and search helpers used by the selectors.
  const [categoryInput, setCategoryInput] = useState("")
  const [productInput, setProductInput] = useState("")
  const [categorySearch, setCategorySearch] = useState("")
  const [productSearch, setProductSearch] = useState("")
  // Derive available category list from `allProducts` (de-duplicated and sorted).
  const availableCategories = useMemo(() => Array.from(new Set(allProducts.map((p) => p.category))).sort(), [])
  const { toast } = useToast()

  const handleCopyCode = (code: string) => {
    // Copies coupon code to clipboard and shows a toast notification.
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast({
      title: "Code Copied",
      description: `Coupon code "${code}" copied to clipboard.`,
    })
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filtered = items.filter((c) => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      c.code.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    )
  })

  const resetForm = () => {
    // Reset the create/edit form to initial defaults.
    setForm({ 
      code: "",
      type: "Percentage",
      value: 10,
      minOrder: 0,
      usageLimit: 100,
      used: 0,
      expiryDate: null,
      status: "Active",
      appliesTo: "all",
      categories: [],
      products: [] 
    })
    setCategoryInput("")
    setProductInput("")
  }
  const openCreate = () => {
    resetForm()
    setEditing(null)
    setAddOpen(true)
  }

  const openEdit = (id: string) => {
    // Load an existing coupon into the `form` for editing.
    const c = items.find((x) => x.id === id)
    if (!c) return
    const value = c.type === "Percentage" ? parseInt(c.discount.replace("%", ""), 10) : parseInt(c.discount.replace(/[^0-9]/g, ""), 10)
    const parsedDate = (() => {
      const d = new Date(c.expiryDate)
      return isNaN(d.getTime()) ? null : d
    })()
    setForm({
      code: c.code,
      type: c.type as any,
      value: isNaN(value) ? 0 : value,
      minOrder: c.minOrder,
      usageLimit: c.usageLimit,
      used: c.used,
      expiryDate: parsedDate,
      status: (c.status as any) || "Active",
      appliesTo: ((c as any).appliesTo as any) || "all",
      categories: ((c as any).categories as any) || [],
      products: ((c as any).products as any) || [],
    })
    setEditing(c.id)
    setEditOpen(true)
  }

  const addCategoryToForm = (value?: string) => {
    // Adds a category to `form.categories` (deduplicated). Accepts an optional
    // `value` argument (used by click-to-add in the popover) or falls back
    // to the free-text `categoryInput` value.
    const val = (value ?? categoryInput).trim()
    if (!val) return
    setForm((prev) => ({ ...prev, categories: Array.from(new Set([...(prev.categories || []), val])) }))
    setCategoryInput("")
    setCategorySearch("")
  }

  const removeCategoryFromForm = (val: string) => {
    // Remove a category from the `form.categories` array.
    setForm((prev) => ({ ...prev, categories: prev.categories?.filter((c) => c !== val) || [] }))
  }

  const addProductToForm = (value?: string) => {
    // Adds a product slug to `form.products` (deduplicated). The popover
    // passes a product slug via `value` when an item is clicked.
    const val = (value ?? productInput).trim()
    if (!val) return
    setForm((prev) => ({ ...prev, products: Array.from(new Set([...(prev.products || []), val])) }))
    setProductInput("")
    setProductSearch("")
  }

  const removeProductFromForm = (val: string) => {
    // Remove a product slug from `form.products`.
    setForm((prev) => ({ ...prev, products: prev.products?.filter((p) => p !== val) || [] }))
  }

  const validateForm = () => {
    if (!form.code.trim()) {
      toast({ title: "Code required", description: "Please enter a coupon code.", variant: "destructive" })
      return false
    }
    if (!form.expiryDate) {
      toast({ title: "Expiry required", description: "Please enter an expiry date.", variant: "destructive" })
      return false
    }
    if (form.value <= 0) {
      toast({ title: "Invalid discount", description: "Discount must be greater than 0.", variant: "destructive" })
      return false
    }
    if (form.usageLimit < form.used) {
      toast({ title: "Usage limit error", description: "Used cannot exceed usage limit.", variant: "destructive" })
      return false
    }
    return true
  }
  const toDisplayDiscount = () => (form.type === "Percentage" ? `${form.value}%` : `₹${form.value}`)
  const formatDisplayDate = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

  const createCoupon = () => {
    // Build a new coupon object from `form` and add it to local `items`.
    // Note: this currently only updates in-memory state. Persisting to a
    // backend would require calling an API here.
    if (!validateForm()) return
    const newItem = {
      id: Date.now().toString(),
      code: form.code.trim().toUpperCase(),
      discount: toDisplayDiscount(),
      type: form.type,
      minOrder: form.minOrder,
      usageLimit: form.usageLimit,
      used: form.used,
      expiryDate: formatDisplayDate(form.expiryDate as Date),
      status: form.status,
      appliesTo: form.appliesTo,
      categories: form.categories,
      products: form.products,
    }
    setItems((prev) => [newItem, ...prev])
    toast({ title: "Coupon Created", description: `${newItem.code} has been created.` })
    setAddOpen(false)
    resetForm()
  }

  const saveEdit = () => {
    // Save edited coupon data back into the `items` list (in-memory).
    if (!validateForm() || !editing) return
    const updated = {
      code: form.code.trim().toUpperCase(),
      discount: toDisplayDiscount(),
      type: form.type,
      minOrder: form.minOrder,
      usageLimit: form.usageLimit,
      used: form.used,
      expiryDate: formatDisplayDate(form.expiryDate as Date),
      status: form.status,
      appliesTo: form.appliesTo,
      categories: form.categories,
      products: form.products,
    }
    setItems((prev) => prev.map((c) => (c.id === editing ? { ...c, ...updated } : c)))
    toast({ title: "Coupon Updated", description: `${updated.code} has been updated.` })
    setEditOpen(false)
    setEditing(null)
  }

  const confirmDelete = (id: string, code: string) => setDeleteTarget({ id, code })
  const doDelete = () => {
    // Remove the coupon with id stored in `deleteTarget` from `items`.
    if (!deleteTarget) return
    setItems((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    toast({ title: "Coupon Deleted", description: `${deleteTarget.code} has been removed.` })
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#6B4423]">Coupons & Discounts</h1>
          <p className="text-[#8B6F47]">Create and manage promotional codes</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-[#2D5F3F] hover:bg-[#2D5F3F]/90">
          <Plus className="h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F47]" />
              <Input
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#E8DCC8] overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#6B4423]">Code</TableHead>
                  <TableHead className="text-[#6B4423]">Discount</TableHead>
                  <TableHead className="text-[#6B4423]">Min. Order</TableHead>
                  <TableHead className="text-[#6B4423]">Usage</TableHead>
                  <TableHead className="text-[#6B4423]">Expiry</TableHead>
                  <TableHead className="text-[#6B4423]">Status</TableHead>
                  <TableHead className="w-[100px] text-[#6B4423]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-[#8B6F47]">
                      No coupons found. Create your first coupon.
                    </TableCell>
                  </TableRow>
                ) : (
                filtered.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-semibold bg-[#F5F1E8] border-2 border-[#E8DCC8] text-[#6B4423] px-2 py-1 rounded">{coupon.code}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyCode(coupon.code)}
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{coupon.discount}</TableCell>
                    <TableCell className="font-semibold text-[#6B4423]">₹{coupon.minOrder}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {coupon.used}/{coupon.usageLimit}
                        </span>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2D5F3F]"
                            style={{ width: `${(coupon.used / coupon.usageLimit) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{coupon.expiryDate}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          coupon.status === "Active"
                            ? "bg-[#2D5F3F]/10 text-[#2D5F3F] border-0"
                            : "bg-[#FF7E00]/10 text-[#FF7E00] border-0"
                        }
                      >
                        {coupon.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(coupon.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete(coupon.id, coupon.code)}>
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
        </CardContent>
      </Card>

      {/* Create Coupon Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Coupon</DialogTitle>
            <DialogDescription>Configure a new coupon code</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" placeholder="e.g., WELCOME10" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount {form.type === "Percentage" ? "%" : "(₹)"}</Label>
              <Input type="number" min={0} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Min Order (₹)</Label>
              <Input type="number" min={0} value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Usage Limit</Label>
              <Input type="number" min={0} value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Used</Label>
              <Input type="number" min={0} value={form.used} onChange={(e) => setForm({ ...form, used: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.expiryDate ? formatDisplayDate(form.expiryDate) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.expiryDate ?? undefined}
                    onSelect={(d) => setForm({ ...form, expiryDate: d ?? null })}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      return date < today
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Applies To</Label>
              <Select value={form.appliesTo} onValueChange={(v) => setForm({ ...form, appliesTo: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="categories">Specific Categories</SelectItem>
                  <SelectItem value="products">Specific Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.appliesTo === 'categories' && (
              <div className="space-y-2 md:col-span-2">
                <Label>Categories</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {form.categories && form.categories.length > 0 ? `${form.categories.length} selected` : 'Select categories'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <Input placeholder="Search categories..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="mb-2" />
                    <div className="max-h-48 overflow-auto" onWheel={(e) => { (e.currentTarget as HTMLElement).scrollTop += e.deltaY; }}>
                      {availableCategories.filter((c) => c.toLowerCase().includes(categorySearch.trim().toLowerCase())).map((cat) => (
                        <div key={cat} className="p-2 cursor-pointer hover:bg-slate-50" onClick={() => addCategoryToForm(cat)}>
                          {cat}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.categories?.map((cat) => (
                    <span key={cat} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8DCC8] text-[#6B4423]">
                      {cat}
                      <button type="button" className="ml-2 text-sm" onClick={() => removeCategoryFromForm(cat)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {form.appliesTo === 'products' && (
              <div className="space-y-2 md:col-span-2">
                <Label>Products</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {form.products && form.products.length > 0 ? `${form.products.length} selected` : 'Select products'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <Input placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="mb-2" />
                    <div className="max-h-48 overflow-auto" onWheel={(e) => { (e.currentTarget as HTMLElement).scrollTop += e.deltaY; }}>
                      {allProducts.filter((p) => (p.name + ' ' + p.slug).toLowerCase().includes(productSearch.trim().toLowerCase())).map((prod) => (
                        <div key={prod.id} className="p-2 cursor-pointer hover:bg-slate-50 flex justify-between" onClick={() => addProductToForm(prod.slug)}>
                          <div>
                            <div className="font-medium">{prod.name}</div>
                            <div className="text-xs text-muted-foreground">{prod.category}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">{prod.price ? `₹${prod.price}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.products?.map((p) => {
                    const prod = allProducts.find((x) => x.slug === p)
                    return (
                      <span key={p} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8DCC8] text-[#6B4423]">
                        {prod ? prod.name : p}
                        <button type="button" className="ml-2 text-sm" onClick={() => removeProductFromForm(p)}>×</button>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-[#2D5F3F] hover:bg-[#2D5F3F]/90" onClick={createCoupon}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>Update coupon details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-code">Code</Label>
              <Input id="edit-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount {form.type === "Percentage" ? "%" : "(₹)"}</Label>
              <Input type="number" min={0} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Min Order (₹)</Label>
              <Input type="number" min={0} value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Usage Limit</Label>
              <Input type="number" min={0} value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Used</Label>
              <Input type="number" min={0} value={form.used} onChange={(e) => setForm({ ...form, used: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.expiryDate ? formatDisplayDate(form.expiryDate as Date) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.expiryDate ?? undefined}
                    onSelect={(d) => setForm({ ...form, expiryDate: d ?? null })}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      return date < today
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {form.appliesTo === 'categories' && (
              <div className="space-y-2 md:col-span-2">
                <Label>Categories</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {form.categories && form.categories.length > 0 ? `${form.categories.length} selected` : 'Select categories'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <Input placeholder="Search categories..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="mb-2" />
                    <div className="max-h-48 overflow-auto" onWheel={(e) => { (e.currentTarget as HTMLElement).scrollTop += e.deltaY; }}>
                      {availableCategories.filter((c) => c.toLowerCase().includes(categorySearch.trim().toLowerCase())).map((cat) => (
                        <div key={cat} className="p-2 cursor-pointer hover:bg-slate-50" onClick={() => addCategoryToForm(cat)}>
                          {cat}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.categories?.map((cat) => (
                    <span key={cat} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8DCC8] text-[#6B4423]">
                      {cat}
                      <button type="button" className="ml-2 text-sm" onClick={() => removeCategoryFromForm(cat)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {form.appliesTo === 'products' && (
              <div className="space-y-2 md:col-span-2">
                <Label>Products</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {form.products && form.products.length > 0 ? `${form.products.length} selected` : 'Select products'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <Input placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="mb-2" />
                    <div className="max-h-48 overflow-auto" onWheel={(e) => { (e.currentTarget as HTMLElement).scrollTop += e.deltaY; }}>
                      {allProducts.filter((p) => (p.name + ' ' + p.slug).toLowerCase().includes(productSearch.trim().toLowerCase())).map((prod) => (
                        <div key={prod.id} className="p-2 cursor-pointer hover:bg-slate-50 flex justify-between" onClick={() => addProductToForm(prod.slug)}>
                          <div>
                            <div className="font-medium">{prod.name}</div>
                            <div className="text-xs text-muted-foreground">{prod.category}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">{prod.price ? `₹${prod.price}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.products?.map((p) => {
                    const prod = allProducts.find((x) => x.slug === p)
                    return (
                      <span key={p} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8DCC8] text-[#6B4423]">
                        {prod ? prod.name : p}
                        <button type="button" className="ml-2 text-sm" onClick={() => removeProductFromForm(p)}>×</button>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="space-y-2 md:col-span-2">
              <Label>Applies To</Label>
              <Select value={form.appliesTo} onValueChange={(v) => setForm({ ...form, appliesTo: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="categories">Specific Categories</SelectItem>
                  <SelectItem value="products">Specific Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="bg-[#2D5F3F] hover:bg-[#2D5F3F]/90" onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.code}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={doDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
