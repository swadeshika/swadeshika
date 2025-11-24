"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, MapPin, Edit, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

type Address = {
  id: string
  name: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  isDefault: boolean
}

const STORAGE_KEY = "account_addresses"

export function AddressesList() {
  const { toast } = useToast()
  const [items, setItems] = useState<Address[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [form, setForm] = useState<Omit<Address, "id">>({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    isDefault: false,
  })

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  const persist = (next: Address[]) => {
    setItems(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  const hasAny = items.length > 0

  const startAdd = () => {
    setEditing(null)
    setForm({ name: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", isDefault: !hasAny })
    setOpen(true)
  }

  const startEdit = (addr: Address) => {
    setEditing(addr)
    const { id, ...rest } = addr
    setForm(rest)
    setOpen(true)
  }

  const validate = () => {
    if (!form.name.trim()) return "Full name is required"
    if (!/^\+?\d[\d\s-]{7,}$/.test(form.phone.trim())) return "Enter a valid phone number"
    if (!form.addressLine1.trim()) return "Address Line 1 is required"
    if (!form.city.trim()) return "City is required"
    if (!form.state.trim()) return "State is required"
    if (!/^\d{5,6}$/.test(form.postalCode.trim())) return "Enter a valid postal/ZIP code"
    return null
  }

  const handleSubmit = () => {
    const err = validate()
    if (err) {
      toast({ title: "Invalid details", description: err, variant: "destructive" })
      return
    }

    const normalized: Address = {
      id: editing?.id || String(Date.now()),
      ...form,
    }

    let next = [...items]

    // If set default, clear others
    if (normalized.isDefault) {
      next = next.map((a) => ({ ...a, isDefault: false }))
    }

    if (editing) {
      next = next.map((a) => (a.id === editing.id ? normalized : a))
      toast({ title: "Address updated" })
    } else {
      next.unshift(normalized)
      toast({ title: "Address added" })
    }

    persist(next)
    setOpen(false)
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    const confirm = window.confirm("Delete this address?")
    if (!confirm) return
    const next = items.filter((a) => a.id !== id)
    persist(next)
    toast({ title: "Address deleted" })
  }

  const setDefault = (id: string) => {
    const next = items.map((a) => ({ ...a, isDefault: a.id === id }))
    persist(next)
    toast({ title: "Default address updated" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-[#8B6F47]">Manage your saved addresses</p>
        <Button
          onClick={startAdd}
          className="gap-2 bg-[#2D5F3F] hover:bg-[#234A32] text-white w-3/5 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {!hasAny ? (
        <Card className="rounded-2xl border-2 border-dashed border-[#E8DCC8] py-16">
          <CardContent className="text-center space-y-4">
            <p className="text-[#8B6F47]">You have no saved addresses yet.</p>
            <Button onClick={startAdd} className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">Add Address</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {items.map((address) => (
            <Card key={address.id} className="rounded-2xl border-2 border-[#E8DCC8]">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#2D5F3F] mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#6B4423]">{address.name}</p>
                      <p className="text-sm text-[#8B6F47]">{address.phone}</p>
                    </div>
                  </div>
                  {address.isDefault && (
                    <Badge className="bg-[#FF7E00]/10 text-[#FF7E00] border-0">Default</Badge>
                  )}
                </div>

                <div className="text-sm text-[#6B4423]">
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8]"
                    onClick={() => startEdit(address)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 text-destructive hover:text-destructive bg-transparent border-2 border-[#E8DCC8]"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>

                {!address.isDefault && (
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setDefault(address.id)} className="text-[#2D5F3F] hover:text-[#234A32]">
                      Make Default
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#6B4423]">{editing ? "Edit Address" : "Add New Address"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr1">Address Line 1</Label>
              <Input id="addr1" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr2">Address Line 2 (optional)</Label>
              <Input id="addr2" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Postal Code</Label>
                <Input id="zip" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-[#E8DCC8] p-3">
              <div>
                <p className="text-sm font-medium text-[#6B4423]">Set as default</p>
                <p className="text-xs text-[#8B6F47]">Use this address for future orders</p>
              </div>
              <Switch checked={form.isDefault} onCheckedChange={(v) => setForm({ ...form, isDefault: v })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="bg-transparent border-2 border-[#E8DCC8] hover:bg-accent" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2D5F3F] hover:bg-[#234A32] text-white" onClick={handleSubmit}>
              {editing ? "Save Changes" : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
