"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { uploadService, BACKEND_ORIGIN } from "@/lib/services/uploadService"
import { Loader2 } from "lucide-react"

// Single-image uploader with real file upload
// - Uploads file to backend when selected
// - Returns real URL instead of blob URL
// - Shows upload progress
interface ImageUploaderProps {
  label?: string
  onChange: (file: File | null, previewUrl: string | null) => void
  initialUrl?: string
}

export function ImageUploader({ label = "Upload image", onChange, initialUrl }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(initialUrl || null)
  const [manualUrl, setManualUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Programmatically open hidden file input
  const pick = () => inputRef.current?.click()
  
  // Handle file selection and upload
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return
    
    setUploading(true)
    setUploadError(null)
    
    try {
      // Upload file to backend
      const uploadedUrl = await uploadService.uploadImage(file)
      
      // Set preview and notify parent
      setPreview(uploadedUrl)
      onChange(file, uploadedUrl)
    } catch (error: any) {
      console.error('Upload failed:', error)
      setUploadError(error.message || 'Upload failed')
      setPreview(null)
      onChange(null, null)
    } finally {
      setUploading(false)
    }
  }
  
  const handleManualUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value
      setManualUrl(url)
      setPreview(url)
      onChange(null, url) // No file, just URL
  }

  // Clear current selection and preview
  const clear = async () => {
    // Delete file from server if it exists (hosted on backend)
    if (preview && (preview.startsWith(`${BACKEND_ORIGIN}/uploads/`) || preview.startsWith(`${BACKEND_ORIGIN}/api/v1/images/`))) {
      try {
        await uploadService.deleteImage(preview);
        // console.log('[ImageUploader] File deleted from server');
      } catch (error) {
        console.error('[ImageUploader] Failed to delete file:', error);
        // Continue anyway - file might already be deleted or not exist
      }
    }
    
    setPreview(null);
    setManualUrl("");
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange(null, null);
  }

  return (
    <div className="space-y-3">
      {/* Trigger button */}
      <div className="flex gap-2 mb-0">
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
          <input
              type="text"
              placeholder="Or enter image URL"
              value={manualUrl}
              onChange={handleManualUrlChange}
              disabled={uploading}
              className="flex-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-[#E8DCC8] focus-visible:ring-[#2D5F3F]"
          />
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} disabled={uploading} />
      
      {/* Upload error */}
      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}
      
      {preview && (
        // Preview card with a persistent Remove button
        <div className="rounded-md border-2 border-[#E8DCC8] overflow-hidden bg-white relative">
          <img src={preview} alt="preview" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={clear}
            disabled={uploading}
            className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md bg-white/95 border-2 border-[#E8DCC8] disabled:opacity-50 cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}
