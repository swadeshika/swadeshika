"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { VariantsEditor, Variant } from "@/components/admin/variants-editor"
import { FeaturesEditor } from "@/components/admin/features-editor"
import { SpecsEditor, SpecRow } from "@/components/admin/specs-editor"
import { ImageUploader } from "@/components/admin/image-uploader"
import { ImageGalleryUploader } from "@/components/admin/image-gallery-uploader"

export function AdminProductForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: "",
    comparePrice: "",
    category: "",
    status: "active",
    sku: "",
    stock: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    image1: "",
    image2: "",
    image3: "",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    publish: true,
    related: "",
  })

  const [variants, setVariants] = useState<Variant[]>([])
  const [features, setFeatures] = useState<string[]>([])
  const [specs, setSpecs] = useState<SpecRow[]>([])
  const [primaryImage, setPrimaryImage] = useState<{ file: File | null; url: string | null }>({ file: null, url: null })
  const [galleryImages, setGalleryImages] = useState<{ files: File[]; urls: string[] }>({ files: [], urls: [] })

  const update = (key: keyof typeof form, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

  const errors = {
    name: !form.name ? "Name is required" : "",
    price: !form.price ? "Price is required" : "",
    category: !form.category ? "Category is required" : "",
  }
  const isValid = !errors.name && !errors.price && !errors.category

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category) {
      toast({ title: "Missing fields", description: "Name, Price and Category are required." })
      return
    }
    try {
      setSubmitting(true)
      await new Promise((r) => setTimeout(r, 800))
      toast({ title: "Product created", description: `${form.name} has been added.` })
      router.push("/admin/products")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#6B4423]">Add Product</h1>
          <p className="text-[#8B6F47]">Create a new product and manage its details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="border-2 border-[#E8DCC8] hover:bg-[#F5F1E8]" onClick={() => router.push("/admin/products")}>Cancel</Button>
          <Button type="submit" className="bg-[#2D5F3F] hover:bg-[#234A32] text-white" disabled={submitting || !isValid}>{submitting ? "Saving..." : "Save Product"}</Button>
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
                  <Label htmlFor="name">Product Name</Label>
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
              <VariantsEditor value={variants} onChange={setVariants} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price (₹)</Label>
                  <Input id="price" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
                  {errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comparePrice">MRP (₹)</Label>
                  <Input id="comparePrice" type="number" value={form.comparePrice} onChange={(e) => update("comparePrice", e.target.value)} className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
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
              <p className="text-xs text-[#8B6F47]">Tip: Enter MRP and Selling Price to auto-show discount on product page.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">Inventory</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={form.sku} onChange={(e) => update("sku", e.target.value)} className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" value={form.stock} onChange={(e) => update("stock", e.target.value)} className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="organic, premium" className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
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
                  <Label htmlFor="weight">Weight</Label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <Input id="weight" type="number" value={form.weight} onChange={(e) => update("weight", e.target.value)} className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
                    <div className="rounded-xl border-2 border-[#E8DCC8] bg-white px-3 py-2">g</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <Input id="length" type="number" value={form.length} onChange={(e) => update("length", e.target.value)} className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
                    <div className="rounded-xl border-2 border-[#E8DCC8] bg-white px-3 py-2">cm</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <Input id="width" type="number" value={form.width} onChange={(e) => update("width", e.target.value)} className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
                    <div className="rounded-xl border-2 border-[#E8DCC8] bg-white px-3 py-2">cm</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <Input id="height" type="number" value={form.height} onChange={(e) => update("height", e.target.value)} className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
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
                  onChange={(file, url) => {
                    setPrimaryImage({ file, url })
                  }}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Gallery Images</Label>
                <ImageGalleryUploader
                  label="Upload gallery images"
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
              <Label htmlFor="related">Related product IDs (comma separated)</Label>
              <Input id="related" value={form.related} onChange={(e) => update("related", e.target.value)} placeholder="12, 15, 27" className="border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]" />
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
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger id="category" className="border-2 border-[#E8DCC8]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ghee">Ghee</SelectItem>
                    <SelectItem value="spices">Spices</SelectItem>
                    <SelectItem value="dry-fruits">Dry Fruits</SelectItem>
                    <SelectItem value="oils">Oils</SelectItem>
                    <SelectItem value="grains">Grains & Pulses</SelectItem>
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
        <Button type="submit" className="bg-[#2D5F3F] hover:bg-[#234A32] text-white" disabled={submitting || !isValid}>{submitting ? "Saving..." : "Publish"}</Button>
      </div>
    </form>
  )
}
