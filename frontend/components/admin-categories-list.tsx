"use client"

/**
 * Admin Categories List Component
 * Manages product categories and subcategories with CRUD operations
 */

import { useState } from "react"
import { Plus, Search, Edit, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const categories = [
  { id: "1", name: "Ghee", slug: "ghee", parent: null, productCount: 12, order: 1 },
  { id: "2", name: "Spices", slug: "spices", parent: null, productCount: 24, order: 2 },
  { id: "3", name: "Turmeric", slug: "turmeric", parent: "Spices", productCount: 8, order: 1 },
  { id: "4", name: "Chili Powder", slug: "chili-powder", parent: "Spices", productCount: 6, order: 2 },
  { id: "5", name: "Dry Fruits", slug: "dry-fruits", parent: null, productCount: 18, order: 3 },
  { id: "6", name: "Oils", slug: "oils", parent: null, productCount: 15, order: 4 },
]

export function AdminCategoriesList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState(categories)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState<{ name: string; parent: string } | null>({ name: "", parent: "none" })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<{ id: string; name: string; parent: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const { toast } = useToast()

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

  const topLevelOptions = items.filter((c) => c.parent === null)

  const filtered = items.filter((c) => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.parent ? String(c.parent).toLowerCase().includes(q) : false)
    )
  })

  const handleAddCategory = () => {
    if (!newCategory) return
    const name = newCategory.name.trim()
    if (!name) {
      toast({ title: "Name required", description: "Please enter a category name.", variant: "destructive" })
      return
    }
    const slug = slugify(name)
    const parentSlug = newCategory.parent && newCategory.parent !== "none" ? newCategory.parent : ""
    const parentName = parentSlug ? items.find((i) => i.slug === parentSlug)?.name ?? null : null
    const newItem = {
      id: Date.now().toString(),
      name,
      slug,
      parent: parentName,
      productCount: 0,
      order: (items.filter((i) => i.parent === parentName).length || 0) + 1,
    }
    setItems((prev) => [
      ...prev,
      newItem,
    ])
    toast({ title: "Category Added", description: `${name} has been added successfully.` })
    setIsAddDialogOpen(false)
    setNewCategory({ name: "", parent: "none" })
  }

  const openEdit = (id: string) => {
    const found = items.find((i) => i.id === id)
    if (!found) return
    const parentSlug = found.parent ? items.find((i) => i.name === found.parent)?.slug ?? "none" : "none"
    setEditCategory({ id: found.id, name: found.name, parent: parentSlug })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editCategory) return
    const name = editCategory.name.trim()
    if (!name) {
      toast({ title: "Name required", description: "Please enter a category name.", variant: "destructive" })
      return
    }
    const slug = slugify(name)
    const parentSlug = editCategory.parent && editCategory.parent !== "none" ? editCategory.parent : ""
    const parentName = parentSlug ? items.find((i) => i.slug === parentSlug)?.name ?? null : null
    setItems((prev) =>
      prev.map((i) => (i.id === editCategory.id ? { ...i, name, slug, parent: parentName } : i))
    )
    toast({ title: "Category Updated", description: `${name} has been updated.` })
    setIsEditDialogOpen(false)
    setEditCategory(null)
  }

  const confirmDelete = (id: string, name: string) => setDeleteTarget({ id, name })
  const handleDelete = () => {
    if (!deleteTarget) return
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    toast({ title: "Category Deleted", description: `${deleteTarget.name} has been removed.` })
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left md:space-x-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#6B4423]">Categories</h1>
          <p className="text-[#8B6F47]">Organize your products into categories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#2D5F3F] hover:bg-[#2D5F3F]/90 mt-3 md:mt-0">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new category or subcategory for your products</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  placeholder="e.g., Organic Spices"
                  value={newCategory?.name ?? ""}
                  onChange={(e) => setNewCategory((prev) => ({ ...(prev as any), name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-category">Parent Category (Optional)</Label>
                <Select
                  value={newCategory?.parent ?? "none"}
                  onValueChange={(value) => setNewCategory((prev) => ({ ...(prev as any), parent: value }))}
                >
                  <SelectTrigger id="parent-category">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {topLevelOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.slug}>{opt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory} className="bg-[#2D5F3F] hover:bg-[#2D5F3F]/90">
                Add Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F47]" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#E8DCC8] overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="text-[#6B4423]">Name</TableHead>
                  <TableHead className="text-[#6B4423]">Slug</TableHead>
                  <TableHead className="text-[#6B4423]">Parent</TableHead>
                  <TableHead className="text-[#6B4423]">Products</TableHead>
                  <TableHead className="w-[100px] text-[#6B4423]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-[#8B6F47]">
                      No categories found. Add a category to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                filtered.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="cursor-move">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium text-[#6B4423]">{category.name}</TableCell>
                    <TableCell className="text-[#8B6F47]">{category.slug}</TableCell>
                    <TableCell>
                      {category.parent ? (
                        <Badge variant="outline" className="bg-[#F5F1E8] border-2 border-[#E8DCC8] text-[#6B4423]">{category.parent}</Badge>
                      ) : (
                        <span className="text-[#8B6F47] text-sm">Top Level</span>
                      )}
                    </TableCell>
                    <TableCell>{category.productCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(category.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete(category.id, category.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Category Name</Label>
              <Input
                id="edit-category-name"
                placeholder="e.g., Organic Spices"
                value={editCategory?.name ?? ""}
                onChange={(e) => setEditCategory((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent-category">Parent Category (Optional)</Label>
              <Select
                value={editCategory?.parent ?? "none"}
                onValueChange={(value) => setEditCategory((prev) => (prev ? { ...prev, parent: value } : prev))}
              >
                <SelectTrigger id="edit-parent-category">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {topLevelOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.slug}>{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-[#2D5F3F] hover:bg-[#2D5F3F]/90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
