"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface ImageUploaderProps {
  label?: string
  onChange: (file: File | null, previewUrl: string | null) => void
  initialUrl?: string
}

export function ImageUploader({ label = "Upload image", onChange, initialUrl }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(initialUrl || null)

  const pick = () => inputRef.current?.click()
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange(file, url)
  }
  const clear = () => {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ""
    onChange(null, null)
  }

  return (
    <div className="space-y-3">
      <Button type="button" variant="outline" className="border-2 border-[#E8DCC8]" onClick={pick}>{label}</Button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} />
      {preview && (
        <div className="rounded-md border-2 border-[#E8DCC8] overflow-hidden bg-white relative">
          <img src={preview} alt="preview" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md bg-white/95 border-2 border-[#E8DCC8]"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}
