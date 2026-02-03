"use client"

/**
 * Variants Editor
 *
 * A lightweight grid editor to manage product variants such as weights or sizes.
 *
 * Features:
 * - Add/remove variant rows
 * - Edit fields per variant: Label, Weight, Size, Selling Price, MRP, SKU, Stock
 * - Emits the variant list back to parent via onChange
 *
 * Notes:
 * - Validation (e.g., Selling ≤ MRP) is enforced in the parent form to keep this
 *   component focused on editing only.
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface Variant {
  name?: string
  weight?: string
  size?: string
  price?: string
  salePrice?: string
  sku?: string
  stock?: string
}

interface VariantsEditorProps {
  value: Variant[]
  onChange: (variants: Variant[]) => void
}

export function VariantsEditor({ value, onChange }: VariantsEditorProps) {
  const add = () => onChange([...value, { name: "", weight: "", size: "", price: "", salePrice: "", sku: "", stock: "" }])
  const update = (idx: number, key: keyof Variant, v: string) => {
    const next = [...value]
    next[idx] = { ...next[idx], [key]: v }
    onChange(next)
  }
  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx))

  return (
    <div className="space-y-4">
      {value.map((v, i) => (
        <div key={i} className="grid sm:grid-cols-2 gap-3 p-3 rounded-xl border-2 border-[#E8DCC8] bg-white">
          <div className="space-y-1">
            <Label>Label <span className="text-red-500 ml-1">*</span></Label>
            <Input value={v.name || ""} onChange={(e) => update(i, "name", e.target.value)} placeholder="e.g. 500g" className="border-2 border-[#E8DCC8]" />
          </div>
          <div className="space-y-1">
            <Label>Attribute 1 <span className="text-xs text-gray-500">(Optional, e.g., Weight)</span></Label>
            <Input value={v.weight || ""} onChange={(e) => update(i, "weight", e.target.value)} placeholder="e.g., 500g, 1kg" className="border-2 border-[#E8DCC8]" />
          </div>
          <div className="space-y-1">
            <Label>Attribute 2 <span className="text-xs text-gray-500">(Optional, e.g., Size/Color)</span></Label>
            <Input value={v.size || ""} onChange={(e) => update(i, "size", e.target.value)} placeholder="e.g., Small, Red" className="border-2 border-[#E8DCC8]" />
          </div>
          <div className="space-y-1">
            <Label>Selling Price (₹) <span className="text-red-500 ml-1">*</span></Label>
            <Input type="number" value={v.price || ""} onChange={(e) => update(i, "price", e.target.value)} className="border-2 border-[#E8DCC8]" />
          </div>
          <div className="space-y-1">
            <Label>MRP (₹) <span className="text-red-500 ml-1">*</span></Label>
            <Input type="number" value={v.salePrice || ""} onChange={(e) => update(i, "salePrice", e.target.value)} className="border-2 border-[#E8DCC8]" />
          </div>
          <div className="space-y-1">
            <Label>SKU</Label>
            <Input value={v.sku || ""} onChange={(e) => update(i, "sku", e.target.value)} className="border-2 border-[#E8DCC8]" />
          </div>
          <div className="space-y-1">
            <Label>Stock</Label>
            <Input type="number" value={v.stock || ""} onChange={(e) => update(i, "stock", e.target.value)} className="border-2 border-[#E8DCC8]" />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" className="border-2 border-[#E8DCC8]" onClick={() => remove(i)}>Remove</Button>
          </div>
        </div>
      ))}
      <Button type="button" onClick={add} className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">Add Variant</Button>
    </div>
  )
}
