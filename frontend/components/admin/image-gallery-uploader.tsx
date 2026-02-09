"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { uploadService, BACKEND_ORIGIN } from "@/lib/services/uploadService"
import { Loader2 } from "lucide-react"

// Multi-image uploader with real file upload
// - Uploads files to backend when selected
// - Returns real URLs instead of blob URLs
// - Shows upload progress
interface FilePreview {
  file?: File
  url: string
}

interface ImageGalleryUploaderProps {
  label?: string
  onChange: (files: File[], previewUrls: string[]) => void
  initialUrls?: string[]
}

export function ImageGalleryUploader({ label = "Upload gallery images", onChange, initialUrls }: ImageGalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<FilePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Initialize from provided initialUrls (useful in edit mode)
  useEffect(() => {
    if (initialUrls && initialUrls.length) {
      const next: FilePreview[] = initialUrls.map((u) => ({ url: u }))
      setItems(next)
      onChange([], initialUrls)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrls?.join("|")])

  const pick = () => inputRef.current?.click()

  // Handle files selected and upload them
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    
    setUploading(true)
    setUploadError(null)
    
    try {
      // Upload all files to backend
      const uploadedUrls = await uploadService.uploadImages(files)
      
      // Add to existing items
      const next: FilePreview[] = [
        ...items,
        ...uploadedUrls.map((url) => ({ url })),
      ]
      setItems(next)
      // Only pass actual File objects, not URL-only items
      const filesWithData = next.filter((i): i is FilePreview & { file: File } => !!i.file);
      onChange(filesWithData.map((i) => i.file), next.map((i) => i.url))
      
      // Clear input
      if (inputRef.current) inputRef.current.value = ""
    } catch (error: any) {
      console.error('Upload failed:', error)
      setUploadError(error.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Remove a preview at index and emit the updated files/URLs
  const removeAt = async (idx: number) => {
    const item = items[idx];
    
    // Delete file from server if it's an uploaded file
    if (item.url && (item.url.startsWith(`${BACKEND_ORIGIN}/uploads/`) || item.url.startsWith(`${BACKEND_ORIGIN}/api/v1/images/`))) {
      try {
        await uploadService.deleteImage(item.url);
        // console.log('[ImageGalleryUploader] File deleted from server');
      } catch (error) {
        console.error('[ImageGalleryUploader] Failed to delete file:', error);
        // Continue anyway - file might already be deleted or not exist
      }
    }
    
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    // Only pass actual File objects, not URL-only items
    const filesWithData = next.filter((i): i is FilePreview & { file: File } => !!i.file);
    onChange(filesWithData.map((i) => i.file), next.map((i) => i.url));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          className="border-2 border-[#E8DCC8]" 
          onClick={pick}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            label
          )}
        </Button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handle} disabled={uploading} />
      
      {/* Upload error */}
      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}
      
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((it, idx) => (
            <div key={idx} className="rounded-md border-2 border-[#E8DCC8] overflow-hidden bg-white relative">
              <img src={it.url} alt={`gallery-${idx}`} className="w-full h-32 object-cover" />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                disabled={uploading}
                className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md bg-white/95 border-2 border-[#E8DCC8] disabled:opacity-50"
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
