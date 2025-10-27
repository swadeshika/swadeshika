"use client"

import { Editor } from "primereact/editor"
import { useRef } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const imgInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const headerTemplate = (
    <span className="ql-formats">
      <select className="ql-header" defaultValue="">
        <option value="">P</option>
        <option value="2">H2</option>
        <option value="3">H3</option>
        <option value="4">H4</option>
      </select>
      <button className="ql-bold" />
      <button className="ql-italic" />
      <button className="ql-list" value="ordered" />
      <button className="ql-list" value="bullet" />
      <select className="ql-align" defaultValue="">
        <option value="" />
        <option value="center" />
        <option value="right" />
      </select>
      <button className="ql-link" />
      <button className="ql-image" />
      <button className="ql-video" />
      <button className="ql-clean" />
    </span>
  )

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1 text-sm rounded-md border-2 border-[#E8DCC8] bg-white"
          onClick={() => imgInputRef.current?.click()}
        >
          Insert Image
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm rounded-md border-2 border-[#E8DCC8] bg-white"
          onClick={() => videoInputRef.current?.click()}
        >
          Insert Video
        </button>
        <input
          ref={imgInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              const src = String(reader.result || "")
              const next = (value || "") + `<p><img src="${src}" alt="image"/></p>`
              onChange(next)
              if (imgInputRef.current) imgInputRef.current.value = ""
            }
            reader.readAsDataURL(file)
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              const src = String(reader.result || "")
              const next = (value || "") + `<p><video controls src="${src}" style="max-width:100%"></video></p>`
              onChange(next)
              if (videoInputRef.current) videoInputRef.current.value = ""
            }
            reader.readAsDataURL(file)
          }}
        />
      </div>
      <div className="rounded-xl border-2 border-[#E8DCC8] overflow-hidden bg-white">
        <Editor
          value={value}
          onTextChange={(e) => onChange(e.htmlValue || "")}
          headerTemplate={headerTemplate}
          placeholder={placeholder}
          style={{ minHeight: 220 }}
          className="richtext"
        />
      </div>
    </div>
  )
}
