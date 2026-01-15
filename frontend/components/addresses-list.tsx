"use client"

import { useEffect, useState } from "react"
import { Plus, MapPin, Edit, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { addressService, type Address } from "@/lib/services/addressService"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function AddressesList() {
  const { toast } = useToast()
  const [items, setItems] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form state matches the fields we support editing in the UI
  const [form, setForm] = useState<{
    name: string
    phone: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    postalCode: string
    isDefault: boolean
  }>({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    isDefault: false,
  })

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const data = await addressService.getAddresses()
      setItems(data)
    } catch (error) {
      console.error("Failed to fetch addresses:", error)
      toast({ title: "Error", description: "Failed to load addresses", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const hasAny = items.length > 0

  const startAdd = () => {
    setEditing(null)
    setForm({ name: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", isDefault: !hasAny })
    setOpen(true)
  }

  const startEdit = (addr: Address) => {
    setEditing(addr)
    setForm({
      name: addr.name,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault
    })
    setOpen(true)
  }

  const validate = () => {
    if (!form.name.trim()) return "Full name is required"
    if (!/^\d{10}$/.test(form.phone.trim())) return "Enter a valid 10-digit phone number"
    if (!form.addressLine1.trim()) return "Address Line 1 is required"
    if (!form.city.trim()) return "City is required"
    if (!form.state.trim()) return "State is required"
    if (!/^\d{5,6}$/.test(form.postalCode.trim())) return "Enter a valid postal/ZIP code"
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) {
      toast({ title: "Invalid details", description: err, variant: "destructive" })
      return
    }

    try {
      if (editing) {
        await addressService.updateAddress(editing.id, {
          ...form,
          country: editing.country || "India", // Preserve or default
          addressType: editing.addressType || "home"
        })
        toast({ title: "Address updated" })
      } else {
        // New address
        await addressService.createAddress({
          ...form,
          country: "India",
          addressType: "home",
        })
        toast({ title: "Address added" })
      }
      await fetchAddresses()
      setOpen(false)
      setEditing(null)
    } catch (error: any) {
      console.error("Operation failed:", error)
      toast({ title: "Error", description: error.message || "Operation failed", variant: "destructive" })
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      await addressService.deleteAddress(deleteId)
      toast({ title: "Address deleted" })
      await fetchAddresses()
    } catch (error: any) {
      console.error("Delete failed:", error)
      toast({ title: "Error", description: "Failed to delete address", variant: "destructive" })
    } finally {
      setDeleteId(null)
    }
  }

  const setDefault = async (id: string) => {
    try {
      await addressService.updateAddress(id, { isDefault: true })
      toast({ title: "Default address updated" })
      await fetchAddresses()
    } catch (error: any) {
      console.error("Set default failed:", error)
      toast({ title: "Error", description: "Failed to set default address", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#2D5F3F]" />
      </div>
    )
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
                    className="flex-1 gap-2 bg-transparent border-2 border-[#E8DCC8] hover:bg-accent"
                    onClick={() => startEdit(address)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 text-destructive hover:text-white bg-transparent border-2 border-[#E8DCC8]"
                    onClick={() => setDeleteId(address.id)}
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
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+91</span>
                  <Input 
                    id="phone" 
                    value={form.phone} 
                    maxLength={10}
                    className="pl-12"
                    placeholder="9876543210"
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                      setForm({ ...form, phone: val });
                    }} 
                  />
                </div>
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#6B4423]">Delete Address?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this address from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-2 border-[#E8DCC8] hover:bg-accent">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
