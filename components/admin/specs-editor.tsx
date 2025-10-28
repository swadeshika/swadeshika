"use client"

/**
 * Specifications Editor
 *
 * A simple key/value grid editor for product specifications such as
 * Weight, Shelf Life, Storage, Origin, etc., displayed on the PDP.
 *
 * Features:
 * - Add/remove spec rows
 * - Edit label (key) and value per row
 * - Emits the full SpecRow[] to the parent via onChange
 *
 * Note: Validation (e.g., non-empty keys) is handled by the parent form if needed
 * to keep this component focused on editing only.
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface SpecRow { key: string; value: string }

interface SpecsEditorProps {
  value: SpecRow[]
  onChange: (rows: SpecRow[]) => void
}

export function SpecsEditor({ value, onChange }: SpecsEditorProps) {
  const add = () => onChange([...(value || []), { key: "", value: "" }])
  const update = (i: number, k: keyof SpecRow, v: string) => {
    const next = [...value]
    next[i] = { ...next[i], [k]: v }
    onChange(next)
  }
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-3">
      {value.map((row, i) => (
        <div key={i} className="grid sm:grid-cols-2 gap-2 p-3 rounded-xl border-2 border-[#E8DCC8] bg-white">
          <div className="space-y-1">
            <Label className="sr-only">Label</Label>
            <Input value={row.key} onChange={(e) => update(i, "key", e.target.value)} placeholder="e.g. Weight" className="border-2 border-[#E8DCC8]" />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input value={row.value} onChange={(e) => update(i, "value", e.target.value)} placeholder="e.g. 500g" className="border-2 border-[#E8DCC8]" />
            <Button type="button" variant="outline" className="border-2 border-[#E8DCC8]" onClick={() => remove(i)}>Remove</Button>
          </div>
        </div>
      ))}
      <Button type="button" onClick={add} className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">Add Specification</Button>
    </div>
  )
}
