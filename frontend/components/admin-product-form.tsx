"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
/**
 * Admin Product Form
 *
 * A comprehensive, WordPress-like product creation/editing form used across
 * the admin to create and manage products.
 *
 * Features:
 * - Basic info: name, auto-generated slug, short/long description (rich editor)
 * - Media: primary image and multi-image gallery with client-side previews
 * - Pricing: MRP & Selling with live discount, status, and conditional rules
 * - Variants: weights/sizes with per-variant pricing, SKU, stock
 * - Inventory: SKU, stock
 * - Shipping: weight and dimensions with visible units
 * - Taxonomy: category, tags
 * - SEO: meta title/description
 * - Publish: visibility toggle and consistent actions
 *
 * UX/Validation logic:
 * - Slug auto-generates from Name until manually edited
 * - Inline validation for required fields
 * - Conditional pricing: if variants exist, default (product-level) pricing is optional;
 *   otherwise, MRP and Selling are required. Selling must be ≤ MRP everywhere.
 * - Submit buttons remain disabled until the form is valid
 *
 * This component is UI-only; it does not perform real uploads or API persistence.
 * Consumers can pass initial data and mode (create/edit) to reuse the same UI.
 */
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { VariantsEditor, Variant } from "@/components/admin/variants-editor"
import { FeaturesEditor } from "@/components/admin/features-editor"
import { SpecsEditor, SpecRow } from "@/components/admin/specs-editor"
import { ImageUploader } from "@/components/admin/image-uploader"
import { ImageGalleryUploader } from "@/components/admin/image-gallery-uploader"
import { MultiSelect } from "@/components/ui/multi-select"

type Mode = "create" | "edit"

import { productService } from "@/lib/services/productService"
import { categoryService, Category } from "@/lib/services/categoryService"
import { useEffect } from "react"
import { flattenCategoryTree } from "@/lib/category-utils"

// ... imports

interface AdminProductFormProps {
  initial?: Partial<{
    name: string
    slug: string
    description: string
    shortDescription: string
    price: string
    comparePrice: string
    category: string
    status: string
    sku: string
    stock: string
    weight: string
    length: string
    width: string
    height: string
    tags: string
    metaTitle: string
    metaDescription: string
    publish: boolean
    related: string[]
    weightUnit: string
  }>
  mode?: Mode
  productId?: number
  initialVariants?: Variant[]
  initialFeatures?: string[]
  initialSpecs?: SpecRow[]
  initialPrimaryImageUrl?: string | null
  initialGalleryUrls?: string[]
}

export function AdminProductForm({ initial, mode = "create", productId, initialVariants = [], initialFeatures = [], initialSpecs = [], initialPrimaryImageUrl = null, initialGalleryUrls = [] }: AdminProductFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)

  const [form, setForm] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    description: initial?.description || "",
    shortDescription: initial?.shortDescription || "",
    price: initial?.price || "",
    comparePrice: initial?.comparePrice || "",
    category: initial?.category || "",
    status: initial?.status || "active",
    sku: initial?.sku || "",
    stock: initial?.stock || "",
    weight: initial?.weight || "",
    length: initial?.length || "",
    width: initial?.width || "",
    height: initial?.height || "",
    tags: initial?.tags || "",
    metaTitle: initial?.metaTitle || "",
    metaDescription: initial?.metaDescription || "",
    publish: initial?.publish ?? true,
    related: initial?.related || [],
    weightUnit: initial?.weightUnit || "kg",
  })

  const [variants, setVariants] = useState<Variant[]>(initialVariants)
  const [features, setFeatures] = useState<string[]>(initialFeatures)
  const [specs, setSpecs] = useState<SpecRow[]>(initialSpecs)
  const [primaryImage, setPrimaryImage] = useState<{ file: File | null; url: string | null }>({ file: null, url: initialPrimaryImageUrl })
  const [galleryImages, setGalleryImages] = useState<{ files: File[]; urls: string[] }>({ files: [], urls: initialGalleryUrls })
  const [categories, setCategories] = useState<Category[]>([])
  const [allProducts, setAllProducts] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    // Fetch categories
    categoryService.getAllCategories()
      .then((data) => setCategories(data))
      .catch((err) => {
        console.error("Failed to fetch categories:", err)
        toast({ title: "Error", description: "Failed to load categories", variant: "destructive" })
      })

    // Fetch all products for Related Products selector
    productService.getAllProducts({ limit: 1000, fields: 'id,name' })
      .then((data) => {
        // Filter out current product if in edit mode
        const options = data.products
          .filter(p => !productId || p.id !== productId)
          .map(p => ({ label: p.name, value: String(p.id) }))
        setAllProducts(options)
      })
      .catch(err => console.error("Failed to fetch products for selector", err))
  }, [productId])

  const update = (key: keyof typeof form, value: any) => setForm((f) => ({ ...f, [key]: value }))

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

  // ... validation logic same as before ...
  // whether user added any variants; affects pricing requirements
  const hasVariants = variants.length > 0
  const priceNum = parseFloat(form.price || "0")
  const mrpNum = parseFloat(form.comparePrice || "0")
  const priceRequired = !hasVariants
  const mrpRequired = !hasVariants
  const priceMissing = priceRequired && !form.price
  const mrpMissing = mrpRequired && !form.comparePrice
  const priceGtMrp = !!form.price && !!form.comparePrice && priceNum > mrpNum

  const variantIssues: string[] = []
  if (hasVariants) {
    variants.forEach((v, idx) => {
      const vp = parseFloat(v.price || "0")
      const vm = parseFloat(v.salePrice || "0")
      if (!v.price || !v.salePrice) {
        variantIssues.push(`Variant #${idx + 1}: Selling and MRP are required`)
        return
      }
      if (vp > vm) {
        variantIssues.push(`Variant #${idx + 1}: Selling should be ≤ MRP`)
      }
    })
  }

  const errors = {
    name: !form.name ? "Name is required" : "",
    price: priceMissing ? "Selling price is required (or add variants)" : priceGtMrp ? "Selling should be ≤ MRP" : "",
    mrp: mrpMissing ? "MRP is required (or add variants)" : "",
    category: !form.category ? "Category is required" : "",
    variants: hasVariants && variantIssues.length ? variantIssues[0] : "",
  }
  const isValid = !errors.name && !errors.category && !errors.price && !errors.mrp && !errors.variants

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) {
      const firstError = errors.name || errors.category || errors.price || errors.mrp || errors.variants
      toast({ title: "Please fix the form", description: firstError || "Check highlighted fields." })
      return
    }

    setSubmitting(true)
    try {
      const payload: any = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        short_description: form.shortDescription,
        price: parseFloat(form.price || "0") || 0,
        compare_price: parseFloat(form.comparePrice || "0") || 0,
        // category_id is now selected from the list.
        category_id: form.category ? parseInt(form.category) : null, // Send null if no category selected (allowed by DB)
        stock_quantity: parseInt(form.stock || "0") || 0,
        sku: form.sku || `SKU-${Date.now()}`, // Auto-generate SKU if missing
        weight: form.weight ? parseFloat(form.weight) : null, // Send null if empty, not 0
        length: form.length ? parseFloat(form.length) : null,
        width: form.width ? parseFloat(form.width) : null,
        height: form.height ? parseFloat(form.height) : null,
        weight_unit: 'kg', // fixed for now
        in_stock: form.status === 'active',
        // Respect explicit Publish toggle when provided; otherwise fall back to status
        is_active: typeof form.publish === 'boolean' ? form.publish : (form.status === 'active'),
        meta_title: form.metaTitle,
        meta_description: form.metaDescription,
        related_products: form.related.map(id => parseInt(id)),
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
        features: features.filter(f => f.trim().length > 0),
        specifications: specs.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}),
        images: [
          ...(primaryImage.url ? [{ url: primaryImage.url, alt_text: form.name, is_primary: true, display_order: 0 }] : []),
          ...galleryImages.urls.map((url, i) => ({ url, alt_text: `${form.name} - ${i + 1}`, is_primary: false, display_order: i + 1 }))
        ],
        variants: variants.map(v => ({
          name: v.name,
          price: parseFloat(v.price || "0"),
          compare_price: parseFloat(v.salePrice || "0"),
          sku: v.sku,
          stock_quantity: parseInt(v.stock || "0"),
          attributes: {
            weight: v.weight,
            size: v.size
          }
        }))
      }

      if (mode === 'edit' && productId) {
        await productService.updateProduct(productId, payload)
        toast({ title: "Product updated", description: `${form.name} has been updated.` })
      } else {
        await productService.createProduct(payload)
        toast({ title: "Product created", description: `${form.name} has been added.` })
      }

      router.push("/admin/products")
    } catch (error: any) {
      console.error(error)

      // Handle duplicate slug error
      if (error?.message?.includes('Duplicate entry') && error?.message?.includes('slug')) {
        // Auto-generate unique slug by appending random suffix
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const newSlug = `${form.slug}-${randomSuffix}`

        toast({
          title: "Slug already exists",
          description: `Auto-generating unique slug: ${newSlug}`,
          variant: "default"
        })

        // Update form with new slug and retry
        setForm(f => ({ ...f, slug: newSlug }))
        setSubmitting(false)
        return // Don't show error, let user retry with new slug
      }

      // Handle validation errors
      if (error?.message?.includes('Validation Failed')) {
        toast({
          title: "Validation Error",
          description: "Please check all required fields are filled correctly.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to save product",
          variant: "destructive"
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold mb-2 text-[#6B4423]">{(mode === "edit" ? "Edit Product" : "Add Product")}</h1>
          <p className="text-[#8B6F47]">{(mode === "edit" ? "Edit" : "Create")} a new product and manage its details</p>
        </div>
        <div className="flex items-center gap-2 mt-4 w-full justify-center sm:w-auto sm:justify-end sm:mt-0">
          <Button type="button" variant="outline" className="border-2 border-[#E8DCC8] hover:bg-[#FF7E00]" onClick={() => router.push("/admin/products")}>Cancel</Button>
          <Button type="submit" className="bg-[#2D5F3F] hover:bg-[#234A32] text-white" disabled={submitting || !isValid}>{submitting ? (mode === "edit" ? "Updating..." : "Saving...") : (mode === "edit" ? "Update Product" : "Save Product")}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name <span className="text-red-500 ml-1">*</span></Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => {
                      const v = e.target.value
                      update("name", v)
                      if (!slugTouched) update("slug", slugify(v))
                    }}
                    className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                  />
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true)
                      update("slug", slugify(e.target.value))
                    }}
                    placeholder="auto-generated if empty"
                    className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="short">Short Description</Label>
                <Textarea id="short" rows={3} value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Long Description</Label>
                <RichTextEditor value={form.description} onChange={(html) => update("description", html)} placeholder="Write detailed product description..." />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Variants (weights, sizes, etc.)</CardTitle>
            </CardHeader>
            <CardContent>
              {errors.variants && (
                <p className="text-xs text-red-600 mb-2">{errors.variants}</p>
              )}
              <VariantsEditor value={variants} onChange={setVariants} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasVariants && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Pricing is managed per variant above. Base pricing fields are disabled.
                  </p>
                </div>
              )}
              <div className="grid sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price (₹) <span className="text-red-500 ml-1">*</span></Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    disabled={hasVariants}
                    className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  {errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comparePrice">MRP (₹) <span className="text-red-500 ml-1">*</span></Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    value={form.comparePrice}
                    onChange={(e) => update("comparePrice", e.target.value)}
                    disabled={hasVariants}
                    className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  {errors.mrp && <p className="text-xs text-red-600">{errors.mrp}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Discount</Label>
                  <div className="rounded-xl border-2 border-[#E8DCC8] bg-white px-3 py-2 text-[#6B4423]">
                    {(() => {
                      const mrp = parseFloat(form.comparePrice || "0")
                      const sp = parseFloat(form.price || "0")
                      if (!mrp || !sp || sp >= mrp) return "—"
                      const pct = Math.round(((mrp - sp) / mrp) * 100)
                      return `Save ${pct}%`
                    })()}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(v) => update("status", v)}>
                    <SelectTrigger id="status" className="border-2 border-[#E8DCC8]">
                      <SelectValue placeholder="Active" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-[#8B6F47]">
                {hasVariants
                  ? "Pricing is managed individually for each variant above. Base pricing is optional and disabled."
                  : "Tip: Enter MRP and Selling Price to auto-show discount on product page. Both are required if you don't add variants."}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasVariants && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> SKU and Stock are managed per variant above. Base inventory fields are disabled.
                  </p>
                </div>
              )}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    onChange={(e) => update("sku", e.target.value)}
                    disabled={hasVariants}
                    className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={form.stock}
                    onChange={(e) => update("stock", e.target.value)}
                    disabled={hasVariants}
                    className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="organic, premium" className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight <span className="text-red-500 ml-1">*</span></Label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      value={form.weight}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (parseFloat(val) < 0) return;
                        update("weight", val);
                      }}
                      className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                    />
                    <div className="rounded-xl border-2 border-[#E8DCC8] bg-white px-3 py-2">g</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <Input
                      id="length"
                      type="number"
                      min="0"
                      value={form.length}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (parseFloat(val) < 0) return;
                        update("length", val);
                      }}
                      className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                    />
                    <div className="rounded-xl border-2 border-[#E8DCC8] bg-white px-3 py-2">cm</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <Input
                      id="width"
                      type="number"
                      min="0"
                      value={form.width}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (parseFloat(val) < 0) return;
                        update("width", val);
                      }}
                      className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                    />
                    <div className="rounded-xl border-2 border-[#E8DCC8] bg-white px-3 py-2">cm</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <Input
                      id="height"
                      type="number"
                      min="0"
                      value={form.height}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (parseFloat(val) < 0) return;
                        update("height", val);
                      }}
                      className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                    />
                    <div className="rounded-xl border-2 border-[#E8DCC8] bg-white px-3 py-2">cm</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#8B6F47]">These values help calculate shipping rates and show size/weight on product page.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Images</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Primary Image</Label>
                <ImageUploader
                  label="Upload primary image"
                  initialUrl={primaryImage.url || undefined}
                  onChange={(file, url) => {
                    setPrimaryImage({ file, url })
                  }}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Gallery Images</Label>
                <ImageGalleryUploader
                  label="Upload gallery images"
                  initialUrls={galleryImages.urls}
                  onChange={(files, urls) => {
                    setGalleryImages({ files, urls })
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <FeaturesEditor value={features} onChange={setFeatures} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Product Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <SpecsEditor value={specs} onChange={setSpecs} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Related Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="related">Select Related Products</Label>
              <MultiSelect
                options={allProducts}
                selected={form.related}
                onChange={(selected) => update("related", selected)}
                placeholder="Search products..."
                className="border-2 border-[#E8DCC8]"
              />
              <p className="text-xs text-[#8B6F47]">Selected products will appear in the "To match with" section.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500 ml-1">*</span></Label>
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger id="category" className="border-2 border-[#E8DCC8]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {flattenCategoryTree(categories).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {/* Add indentation using non-breaking spaces based on level */}
                        <span style={{ paddingLeft: `${(c.level || 0) * 20}px` }}>
                          {(c.level || 0) > 0 ? '└ ' : ''}{c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#6B4423]">Publish</p>
                  <p className="text-sm text-[#8B6F47]">Visible on storefront</p>
                </div>
                <Switch checked={form.publish} onCheckedChange={(v) => update("publish", v)} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Search Engine Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input id="metaTitle" value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea id="metaDescription" rows={4} value={form.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-[#2D5F3F] hover:bg-[#234A32] text-white" disabled={submitting || !isValid}>{submitting ? (mode === "edit" ? "Updating..." : "Saving...") : (mode === "edit" ? "Update" : "Publish")}</Button>
      </div>
    </form>
  )
}
