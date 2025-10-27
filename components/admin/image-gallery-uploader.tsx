"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface FilePreview {
  file: File
  url: string
}

interface ImageGalleryUploaderProps {
  label?: string
  onChange: (files: File[], previewUrls: string[]) => void
}

export function ImageGalleryUploader({ label = "Upload gallery images", onChange }: ImageGalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<FilePreview[]>([])

  const pick = () => inputRef.current?.click()

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    const next = [
      ...items,
      ...files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    ]
    setItems(next)
    onChange(next.map((i) => i.file), next.map((i) => i.url))
  }

  const removeAt = (idx: number) => {
    const next = items.filter((_, i) => i !== idx)
    setItems(next)
    onChange(next.map((i) => i.file), next.map((i) => i.url))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" className="border-2 border-[#E8DCC8]" onClick={pick}>{label}</Button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handle} />
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((it, idx) => (
            <div key={idx} className="rounded-md border-2 border-[#E8DCC8] overflow-hidden bg-white relative">
              <img src={it.url} alt={`gallery-${idx}`} className="w-full h-32 object-cover" />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md bg-white/95 border-2 border-[#E8DCC8]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
