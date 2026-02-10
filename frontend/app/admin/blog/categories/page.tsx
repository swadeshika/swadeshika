"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as AlertFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { blogService, BlogCategory } from "@/lib/blogService"
import { generateSlug } from "@/lib/utils"

export default function BlogCategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BlogCategory | null>(null)

  // Form State
  const [form, setForm] = useState<{ name: string; slug: string; description: string }>({
    name: "",
    slug: "",
    description: "",
  })

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const data = await blogService.getAllCategories()
      setCategories(data)
    } catch (error) {
      toast({ title: "Failed to load categories", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])



  const startCreate = () => {
    setEditing(null)
    setForm({ name: "", slug: "", description: "" })
    setDialogOpen(true)
  }

  const startEdit = (cat: BlogCategory) => {
    setEditing(cat)
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
    })
    setDialogOpen(true)
  }

  const onNameChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      name: val,
      // Auto-generate slug only when creating or when slug empty in edit
      slug: !editing || !prev.slug ? generateSlug(val) : prev.slug,
    }))
  }

  const saveCategory = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", description: "Please enter a category name.", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug || generateSlug(form.name),
        description: form.description,
      }

      if (editing) {
        await blogService.updateCategory(editing.id, payload)
        toast({ title: "Category updated" })
      } else {
        await blogService.createCategory(payload)
        toast({ title: "Category added" })
      }
      setDialogOpen(false)
      setEditing(null)
      fetchCategories()
    } catch (e: any) {
      // Show specific error if available (e.g. "Slug already exists")
      const msg = e.response?.data?.message || e.message || "Please try again."
      toast({ title: "Save failed", description: msg, variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = (id: number) => {
    setToDeleteId(id)
    setConfirmOpen(true)
  }

  const doDelete = async () => {
    if (!toDeleteId) return
    setIsDeleting(true)
    try {
      await blogService.deleteCategory(toDeleteId)
      setCategories((prev) => prev.filter((c) => c.id !== toDeleteId))
      toast({ title: "Category deleted" })
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Please try again."
      toast({ title: "Delete failed", description: msg, variant: "destructive" })
    } finally {
      setIsDeleting(false)
      setConfirmOpen(false)
      setToDeleteId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return categories
    return categories.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)),
    )
  }, [search, categories])

  return (
    <AdminLayout>
      <div className="p-3 px-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl font-bold text-[#6B4423]">Blog Categories</h1>
            <p className="text-[#8B6F47]">Manage your blog categories</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={startCreate} className="bg-[#2D5F3F] hover:bg-[#1e4a30]">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Name</Label>
                  <Input id="cat-name" value={form.name} onChange={(e) => onNameChange(e.target.value)} placeholder="e.g. Nutrition" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-slug">Slug</Label>
                  <Input
                    id="cat-slug"
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: generateSlug(e.target.value) }))}
                    placeholder="auto-generated-from-name"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-desc">Description</Label>
                  <Input id="cat-desc" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Short description" />
                </div>
                {/* Parent Category removed as backend does not support hierarchy yet */}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveCategory} disabled={isSaving} className="bg-[#2D5F3F] hover:bg-[#1e4a30]">
                  {editing ? (isSaving ? "Saving..." : "Save Changes") : (isSaving ? "Creating..." : "Create Category")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#E8DCC8] p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F47]" />
              <Input
                placeholder="Search categories..."
                className="pl-9 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Loading categories...</TableCell>
                </TableRow>
              ) : filtered.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell className="text-[#8B6F47]">{category.description}</TableCell>
                  <TableCell>
                    {category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => confirmDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">No categories found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
