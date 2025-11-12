"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"

/**
 * ChangePassword
 *
 * Purpose:
 * - Standalone password update form for the Admin Settings Security section.
 *
 * Features:
 * - Current/new/confirm fields with show/hide toggles.
 * - Client-side validation + simple strength meter.
 * - Emits toast on success; consumer can also pass onSuccess.
 */
export function ChangePassword({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast()
  const [show, setShow] = useState<{ current: boolean; next: boolean; confirm: boolean }>({
    current: false,
    next: false,
    confirm: false,
  })
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const strength = (() => {
    let score = 0
    if (next.length >= 8) score++
    if (/[A-Z]/.test(next)) score++
    if (/[a-z]/.test(next)) score++
    if (/\d/.test(next)) score++
    if (/[^A-Za-z0-9]/.test(next)) score++
    return score // 0-5
  })()

  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong", "Very strong"][strength]
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-600", "bg-green-700"][strength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!current) {
      toast({ title: "Current password required", variant: "destructive" })
      return
    }
    if (next.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" })
      return
    }
    if (next !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" })
      return
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitting(false)
    setCurrent("")
    setNext("")
    setConfirm("")
    toast({ title: "Password Updated", description: "Your password has been changed." })
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="curr-pass">Current Password</Label>
          <div className="relative">
            <Input
              id="curr-pass"
              type={show.current ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="pr-10 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6F47]" onClick={() => setShow((s) => ({ ...s, current: !s.current }))}>
              {show.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-pass">New Password</Label>
          <div className="relative">
            <Input
              id="new-pass"
              type={show.next ? "text" : "password"}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="pr-10 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6F47]" onClick={() => setShow((s) => ({ ...s, next: !s.next }))}>
              {show.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="h-1.5 w-full bg-[#F5F1E8] rounded">
            <div className={`h-1.5 rounded ${strengthColor}`} style={{ width: `${(strength / 5) * 100}%` }} />
          </div>
          <p className="text-xs text-[#8B6F47]">{strengthLabel}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-pass">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-pass"
              type={show.confirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="pr-10 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6F47]" onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}>
              {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">
          {submitting ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </form>
  )
}
