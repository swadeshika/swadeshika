"use client"

import { Editor } from "primereact/editor"
import { useRef, useCallback, memo } from "react"

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
      const range = editor.getSelection()
      if (range) {
        // Insert at cursor position
        editor.clipboard.dangerouslyPasteHTML(range.index, content)
        // Move cursor after the inserted content
        editor.setSelection(range.index + 1, 0)
      } else {
        // If no selection, append to the end
        const length = editor.getLength()
        editor.clipboard.dangerouslyPasteHTML(length, content)
        editor.setSelection(length + 1, 0)
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
    
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result || "")
      const videoTag = `<p><video controls src="${src}" style="max-width:100%"></video></p>`
      insertAtCursor(videoTag)
      // Reset the input to allow selecting the same file again
      if (videoInputRef.current) videoInputRef.current.value = ""
    }
    reader.readAsDataURL(file)
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
          onClick={() => imgInputRef.current?.click()}
        >
          Insert Image
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm rounded-md border-2 border-[#E8DCC8] bg-white hover:bg-gray-50 transition-colors"
          onClick={() => videoInputRef.current?.click()}
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
