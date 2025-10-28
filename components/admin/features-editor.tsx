"use client"

/**
 * Features Editor
 *
 * Minimal editor for managing a list of product features (bullet points) shown
 * on the product detail page.
 *
 * Features:
 * - Add/remove feature rows
 * - Inline editing of each feature string
 * - Emits full string[] back to the parent via onChange
 *
 * Note: Validation (e.g., non-empty strings, max length) can be handled by the
 * parent form to keep this component focused on editing only.
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FeaturesEditorProps {
  value: string[]
  onChange: (features: string[]) => void
}

export function FeaturesEditor({ value, onChange }: FeaturesEditorProps) {
  const add = () => onChange([...(value || []), ""]) 
  const update = (idx: number, v: string) => {
    const next = [...value]
    next[idx] = v
    onChange(next)
  }
  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx))

  return (
    <div className="space-y-3">
      {value.map((f, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto] gap-2">
          <div className="space-y-1">
            <Label className="sr-only">Feature</Label>
            <Input value={f} onChange={(e) => update(i, e.target.value)} placeholder="e.g. 100% natural ingredients" className="border-2 border-[#E8DCC8]" />
          </div>
          <Button type="button" variant="outline" className="border-2 border-[#E8DCC8]" onClick={() => remove(i)}>Remove</Button>
        </div>
      ))}
      <Button type="button" onClick={add} className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">Add Feature</Button>
    </div>
  )
}
