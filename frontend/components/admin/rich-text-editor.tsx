"use client"

import { Editor } from "primereact/editor"
import { useRef, useCallback, memo, useEffect } from "react"
import Quill from "quill"

// RichTextEditor wraps PrimeReact's Quill-based Editor to provide a controlled
// WYSIWYG input for the product long description.
// Features configured:
// - Headings (H2/H3/H4), Paragraph
// - Bold, Italic
// - Ordered & Bullet lists
// - Alignment (left/center/right)
// - Links
// - Image & Video buttons (default Quill handlers by URL)
// Additionally, we expose client-side "Insert Image/Video" buttons that allow
// selecting local files and inserting as data URLs (no backend required).
interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

function RichTextEditorComponent({ value, onChange, placeholder }: RichTextEditorProps) {
  // Hidden file inputs for client-side image/video insertion as data URLs
  const imgInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<Editor>(null)

  // Register a custom video blot that renders a <video> element (Quill's
  // default video blot uses an <iframe> which expects external URLs like
  // YouTube). This blot allows inserting local blob URLs directly as
  // <video src="..." controls> elements.
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Avoid double registration
    if ((Quill as any).__swadeshika_video_blot_registered) return
    try {
      const BlockEmbed = Quill.import('blots/block/embed')
      class VideoBlot extends BlockEmbed {
        static create(value: string) {
          const node: HTMLElement = super.create()
          node.setAttribute('controls', 'true')
          node.setAttribute('src', value)
          node.setAttribute('style', 'max-width:100%')
          return node
        }
        static value(node: HTMLElement) {
          return node.getAttribute('src') || ''
        }
      }
      ;(VideoBlot as any).blotName = 'video'
      ;(VideoBlot as any).tagName = 'video'
      Quill.register(VideoBlot, true)
      ;(Quill as any).__swadeshika_video_blot_registered = true
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Could not register custom VideoBlot', err)
    }
  }, [])

  // Memoize the header template to prevent unnecessary re-renders
  const headerTemplate = useCallback(() => (
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
  ), [])

  // Get current cursor position and insert content at that position
  const insertAtCursor = (content: string) => {
    const editor = editorRef.current?.getQuill()
    if (editor) {
      // Ensure editor has focus so getSelection() returns a proper range and keyboard keys work
      try { editor.focus() } catch {}
      const range = editor.getSelection()
      if (range) {
        // Insert at cursor position
        editor.clipboard.dangerouslyPasteHTML(range.index, content)
        // Move cursor after the inserted content
        editor.setSelection(range.index + 1, 0)
        try { editor.focus() } catch {}
      } else {
        // If no selection, append to the end
        const length = editor.getLength()
        editor.clipboard.dangerouslyPasteHTML(length, content)
        editor.setSelection(length + 1, 0)
        try { editor.focus() } catch {}
      }
      // Trigger change event with new content
      onChange(editor.root.innerHTML)
    } else {
      // Fallback to the end if Quill editor is not available
      const newContent = value ? `${value}${content}` : content
      onChange(newContent)
    }
  }

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result || "")
      const imgTag = `<p><img src="${src}" alt="image" style="max-width:100%"/></p>`
      insertAtCursor(imgTag)
      // Reset the input to allow selecting the same file again
      if (imgInputRef.current) imgInputRef.current.value = ""
    }
    reader.readAsDataURL(file)
  }, [value, onChange])

  // Handle video upload
  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Create a temporary object URL for the selected file. Blob URLs
      // are more likely to be accepted by Quill than very large data URIs.
      const blobUrl = URL.createObjectURL(file)
      const quill = editorRef.current?.getQuill()
      if (quill) {
        // ensure focus before reading/inserting selection
        try { quill.focus() } catch {}
        const range = quill.getSelection()
        const index = range ? range.index : quill.getLength()
        // Insert video embed using the blob URL
        quill.insertEmbed(index, 'video', blobUrl)
        quill.setSelection(index + 1, 0)
        try { quill.focus() } catch {}
        // If Quill removed/sanitized the video, fall back to inserting a link
        const html = quill.root.innerHTML || ''
        if (!html.includes('video') && !html.includes('iframe')) {
          const link = `<p><a href="${blobUrl}" target="_blank" rel="noreferrer">Open video</a></p>`
          quill.clipboard.dangerouslyPasteHTML(index, link)
          quill.setSelection(index + 1, 0)
        }
        onChange(quill.root.innerHTML)
      } else {
        // Fallback: if Quill isn't available, insert a plain video tag using the blob URL
        const videoTag = `<p><video controls src="${blobUrl}" style="max-width:100%"></video></p>`
        insertAtCursor(videoTag)
      }
      // Reset the input to allow selecting the same file again
      if (videoInputRef.current) videoInputRef.current.value = ''
      // Note: we do not immediately revokeObjectURL because the editor
      // needs the URL to remain valid while the document is open. The
      // browser will release it on page unload or you can revoke later
      // if desired.
    } catch (err) {
      // If anything fails, log to console so devs can inspect in browser
      // (we keep the UI free of extra dependencies here).
      // eslint-disable-next-line no-console
      console.error('Video insert failed', err)
    }
  }, [value, onChange])

  // Handle editor text change
  const handleTextChange = useCallback((e: { htmlValue: string | null }) => {
    if (e.htmlValue !== null) {
      onChange(e.htmlValue)
    }
  }, [onChange])

  return (
    <div className="space-y-2">
      {/* Client-only insertion controls (data URL based) */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          className="px-3 py-1 text-sm rounded-md border-2 border-[#E8DCC8] bg-white hover:bg-gray-50 transition-colors"
          onClick={() => { try { editorRef.current?.getQuill()?.focus() } catch {} ; imgInputRef.current?.click() }}
        >
          Insert Image
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm rounded-md border-2 border-[#E8DCC8] bg-white hover:bg-gray-50 transition-colors"
          onClick={() => { try { editorRef.current?.getQuill()?.focus() } catch {} ; videoInputRef.current?.click() }}
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
      
      <div className="rounded-xl border-2 border-[#E8DCC8] overflow-hidden bg-white">
        <Editor
          ref={editorRef}
          value={value}
          onTextChange={handleTextChange}
          headerTemplate={headerTemplate()}
          placeholder={placeholder}
          style={{ minHeight: '400px' }}
          className="richtext"
        />
      </div>
    </div>
  )
}

export const RichTextEditor = memo(RichTextEditorComponent)
