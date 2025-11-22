"use client"

import { Editor } from "primereact/editor"
import { useRef, useCallback, memo, useEffect, useState } from "react"
import Quill from "quill"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

function RichTextEditorComponent({ value, onChange, placeholder }: RichTextEditorProps) {
  // Hidden file inputs for client-side image/video insertion as data URLs
  const imgInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<Editor | null>(null)

  // State for URL-based video insert via ql-video button
  const [showVideoUrlBar, setShowVideoUrlBar] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null)

  // Register a custom video blot that renders a <video> element
  useEffect(() => {
    if (typeof window === "undefined") return
    if ((Quill as any).__swadeshika_video_blot_registered) return

    try {
      const BlockEmbed = Quill.import("blots/block/embed")
      class VideoBlot extends BlockEmbed {
        static create(value: string) {
          const node: HTMLElement = super.create()
          node.setAttribute("controls", "true")
          node.setAttribute("src", value)
          node.setAttribute(
            "style",
            "width:100%;max-width:100%;height:auto;display:block;margin:0 auto;"
          )
          return node
        }
        static value(node: HTMLElement) {
          return node.getAttribute("src") || ""
        }
      }
      ;(VideoBlot as any).blotName = "video"
      ;(VideoBlot as any).tagName = "video"
      Quill.register(VideoBlot, true)
      ;(Quill as any).__swadeshika_video_blot_registered = true
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Could not register custom VideoBlot", err)
    }
  }, [])

  // Attach custom handler to toolbar .ql-video button (we'll show our URL bar instead of Quill prompt)
  useEffect(() => {
    let cancelled = false

    const attachHandler = () => {
      if (cancelled) return
      const quill = editorRef.current?.getQuill()
      if (!quill) {
        // Try again shortly until Quill is ready
        setTimeout(attachHandler, 50)
        return
      }
      const toolbar = quill.getModule("toolbar")
      if (!toolbar) return

      toolbar.addHandler("video", () => {
        try {
          quill.focus()
        } catch {}
        setVideoUrlError(null)
        setShowVideoUrlBar(true)
      })
    }

    attachHandler()
    return () => {
      cancelled = true
    }
  }, [])

  // Memoize the header template to prevent unnecessary re-renders
  const headerTemplate = useCallback(
    () => (
      <span className="ql-formats flex flex-wrap items-center gap-1">
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
    ),
    []
  )

  // Get current cursor position and insert content at that position
  const insertAtCursor = (content: string) => {
    const editor = editorRef.current?.getQuill()
    if (editor) {
      try {
        editor.focus()
      } catch {}
      const range = editor.getSelection()
      if (range) {
        editor.clipboard.dangerouslyPasteHTML(range.index, content)
        editor.setSelection(range.index + 1, 0)
        try {
          editor.focus()
        } catch {}
      } else {
        const length = editor.getLength()
        editor.clipboard.dangerouslyPasteHTML(length, content)
        editor.setSelection(length + 1, 0)
        try {
          editor.focus()
        } catch {}
      }
      onChange(editor.root.innerHTML)
    } else {
      const newContent = value ? `${value}${content}` : content
      onChange(newContent)
    }
  }

  // Handle image upload
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        const src = String(reader.result || "")
        const imgTag = `<p><img src="${src}" alt="image" style="max-width:100%;height:auto;display:block;margin:0 auto;"/></p>`
        insertAtCursor(imgTag)
        if (imgInputRef.current) imgInputRef.current.value = ""
      }
      reader.readAsDataURL(file)
    },
    [value, onChange]
  )

  // Handle local video upload (file → blob URL)
  const handleVideoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const blobUrl = URL.createObjectURL(file)
        const quill = editorRef.current?.getQuill()
        if (quill) {
          try {
            quill.focus()
          } catch {}
          const range = quill.getSelection()
          const index = range ? range.index : quill.getLength()
          quill.insertEmbed(index, "video", blobUrl)
          quill.setSelection(index + 1, 0)
          try {
            quill.focus()
          } catch {}

          const html = quill.root.innerHTML || ""
          if (!html.includes("video") && !html.includes("iframe")) {
            const link = `<p><a href="${blobUrl}" target="_blank" rel="noreferrer">Open video</a></p>`
            quill.clipboard.dangerouslyPasteHTML(index, link)
            quill.setSelection(index + 1, 0)
          }
          onChange(quill.root.innerHTML)
        } else {
          const videoTag = `<p><video controls src="${blobUrl}" style="width:100%;max-width:100%;height:auto;display:block;margin:0 auto;"></video></p>`
          insertAtCursor(videoTag)
        }
        if (videoInputRef.current) videoInputRef.current.value = ""
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Video insert failed", err)
      }
    },
    [value, onChange]
  )

  // Handle URL-based video (from ql-video toolbar or URL bar Save)
  const handleSaveVideoUrl = () => {
    const raw = videoUrl.trim()

    if (!raw) {
      setVideoUrlError("Please enter a URL.")
      return
    }

    // basic http/https URL validation
    try {
      const u = new URL(raw)
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        setVideoUrlError("URL must start with http:// or https://")
        return
      }
    } catch {
      setVideoUrlError("Please enter a valid URL.")
      return
    }

    setVideoUrlError(null)

    const quill = editorRef.current?.getQuill()
    const url = raw

    if (!quill) {
      // fallback: plain <video> tag
      const videoTag = `<p><video controls src="${url}" style="width:100%;max-width:100%;height:auto;display:block;margin:0 auto;"></video></p>`
      insertAtCursor(videoTag)
      setVideoUrl("")
      setShowVideoUrlBar(false)
      return
    }

    try {
      quill.focus()
    } catch {}
    const range = quill.getSelection()
    const index = range ? range.index : quill.getLength()

    quill.insertEmbed(index, "video", url)
    quill.setSelection(index + 1, 0)
    onChange(quill.root.innerHTML)

    setVideoUrl("")
    setShowVideoUrlBar(false)
  }

  const handleTextChange = useCallback(
    (e: { htmlValue: string | null }) => {
      if (e.htmlValue !== null) {
        onChange(e.htmlValue)
      }
    },
    [onChange]
  )

  return (
    <div className="space-y-2 w-full">
      {/* Client-only insertion controls (local file uploads) */}
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="w-full sm:w-auto rounded-md border-2 border-[#E8DCC8] bg-white px-3 py-1 text-xs sm:text-sm transition-colors hover:bg-gray-50"
          onClick={() => {
            try {
              editorRef.current?.getQuill()?.focus()
            } catch {}
            imgInputRef.current?.click()
          }}
        >
          Insert Image
        </button>
        <button
          type="button"
          className="w-full sm:w-auto rounded-md border-2 border-[#E8DCC8] bg-white px-3 py-1 text-xs sm:text-sm transition-colors hover:bg-gray-50"
          onClick={() => {
            try {
              editorRef.current?.getQuill()?.focus()
            } catch {}
            videoInputRef.current?.click()
          }}
        >
          Insert Video
        </button>
        <input
          ref={imgInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleVideoUpload}
        />
      </div>

      {/* URL bar for ql-video (inline, won't cut off screen) */}
      {showVideoUrlBar && (
        <div className="space-y-1">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 rounded-lg border border-[#E8DCC8] bg-white px-3 py-2 text-xs sm:text-sm">
            <span className="whitespace-nowrap">Enter video:</span>
            <input
              className={`h-8 flex-1 min-w-0 rounded border px-2 text-xs sm:text-sm ${
                videoUrlError ? "border-red-500" : ""
              }`}
              placeholder="Embed URL"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value)
                if (videoUrlError) setVideoUrlError(null)
              }}
            />
            <button
              type="button"
              onClick={handleSaveVideoUrl}
              className="h-8 w-full sm:w-auto whitespace-nowrap rounded border px-2 text-xs sm:text-sm"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setVideoUrl("")
                setVideoUrlError(null)
                setShowVideoUrlBar(false)
              }}
              className="h-8 w-full sm:w-auto whitespace-nowrap rounded border px-2 text-xs sm:text-sm"
            >
              Cancel
            </button>
          </div>
          {videoUrlError && (
            <p className="text-xs text-red-600">{videoUrlError}</p>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border-2 border-[#E8DCC8] bg-white w-full">
        <Editor
          ref={editorRef}
          value={value}
          onTextChange={handleTextChange}
          headerTemplate={headerTemplate()}
          placeholder={placeholder}
          style={{ minHeight: "250px" }}
          className="richtext w-full text-sm sm:text-base"
        />
      </div>
    </div>
  )
}

export const RichTextEditor = memo(RichTextEditorComponent)
