"use client"

/**
 * Admin Categories List Component
 * Manages product categories and subcategories with CRUD operations
 */

import { useState, useEffect } from "react"
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
import { categoryService, Category } from "@/lib/services/categoryService"
import { ImageUploader } from "@/components/admin/image-uploader"

export function AdminCategoriesList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState<{ name: string; parent: string; image: string | null }>({ name: "", parent: "none", image: null })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<{ id: number; name: string; parent: string; slug: string; image: string | null } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
  const { toast } = useToast()

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setItems(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast({ title: "Error", description: "Failed to load categories.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

  const topLevelOptions = items.filter((c) => !c.parent_id);

  // Helper to get parent name from ID
  const getParentName = (parentId: number | null | undefined) => {
    if (!parentId) return null;
    return items.find(i => i.id === parentId)?.name || null;
  }

  const filtered = items.filter((c) => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    const parentName = getParentName(c.parent_id)?.toLowerCase() || ""
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      parentName.includes(q)
    )
  })

  const handleAddCategory = async () => {
    if (!newCategory) return
    const name = newCategory.name.trim()
    if (!name) {
      toast({ title: "Name required", description: "Please enter a category name.", variant: "destructive" })
      return
    }
    
    try {
        const payload: Partial<Category> = {
            name,
            slug: slugify(name),
            parent_id: newCategory.parent && newCategory.parent !== "none" ? parseInt(newCategory.parent) : null,
            image_url: newCategory.image || undefined
        };
        
        await categoryService.createCategory(payload);
        toast({ title: "Category Added", description: `${name} has been added successfully.` })
        setIsAddDialogOpen(false)
        setNewCategory({ name: "", parent: "none", image: null })
        fetchCategories(); // Refresh list
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to create category", variant: "destructive" })
    }
  }

  const openEdit = (id: number) => {
    const found = items.find((i) => i.id === id)
    if (!found) return
    // Parent select stores ID as string
    const parentVal = found.parent_id ? String(found.parent_id) : "none"
    setEditCategory({ id: found.id, name: found.name, slug: found.slug, parent: parentVal, image: found.image_url || null })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editCategory) return
    const name = editCategory.name.trim()
    if (!name) {
      toast({ title: "Name required", description: "Please enter a category name.", variant: "destructive" })
      return
    }

    try {
        const payload: Partial<Category> = {
            name,
            slug: slugify(name), // Optionally update slug or keep original? Let's auto-update for now
            parent_id: editCategory.parent && editCategory.parent !== "none" ? parseInt(editCategory.parent) : null,
            image_url: editCategory.image || "" // Send empty string if null to allow removal depending on backend logic, or backend handles null
        };

        if (editCategory.image === null) {
            // explicit removal intent or no change? 
            // If it was null and is still null, undefined might be better.
            // But if we want to clear it, we should send null/empty.
            // My backend logic: if (data.image_url) upload. if data.image_url === undefined, ignore. 
            // if data.image_url === "", set to null.
            // So if I want to clear, I should send "".
             payload.image_url = editCategory.image || ""
        }

        await categoryService.updateCategory(editCategory.id, payload);
        toast({ title: "Category Updated", description: `${name} has been updated.` })
        setIsEditDialogOpen(false)
        setEditCategory(null)
        fetchCategories();
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to update category", variant: "destructive" })
    }
  }

  const confirmDelete = (id: number, name: string) => setDeleteTarget({ id, name })
  
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
        await categoryService.deleteCategory(deleteTarget.id);
        toast({ title: "Category Deleted", description: `${deleteTarget.name} has been removed.` })
        fetchCategories(); 
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to delete category", variant: "destructive" })
    } finally {
        setDeleteTarget(null)
    }
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
                <Label>Category Image</Label>
                <div className="flex justify-center border-2 border-dashed border-[#E8DCC8] rounded-xl p-4">
                    <ImageUploader 
                        label="Upload Image"
                        onChange={(_, url) => setNewCategory(prev => ({ ...prev, image: url }))}
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  placeholder="e.g., Organic Spices"
                  value={newCategory?.name ?? ""}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-category">Parent Category (Optional)</Label>
                <Select
                  value={newCategory?.parent ?? "none"}
                  onValueChange={(value) => setNewCategory((prev) => ({ ...prev, parent: value }))}
                >
                  <SelectTrigger id="parent-category">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {topLevelOptions.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>{opt.name}</SelectItem>
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
                  <TableHead className="w-[80px] text-[#6B4423]">Image</TableHead>
                  <TableHead className="text-[#6B4423]">Name</TableHead>
                  <TableHead className="text-[#6B4423]">Slug</TableHead>
                  <TableHead className="text-[#6B4423]">Parent</TableHead>
                  <TableHead className="text-[#6B4423]">Products</TableHead>
                  <TableHead className="w-[100px] text-[#6B4423]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-[#8B6F47]">Loading...</TableCell>
                    </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-[#8B6F47]">
                      No categories found. Add a category to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                          {category.image_url ? (
                              <img src={category.image_url} alt={category.name} className="w-10 h-10 object-cover rounded-md border border-[#E8DCC8]" />
                          ) : (
                              <div className="w-10 h-10 bg-[#F5F5F5] rounded-md border border-[#E8DCC8] flex items-center justify-center text-xs text-[#8B6F47]">No Img</div>
                          )}
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>
                        {category.parent_id ? (
                          <span className="text-[#6B4423]">{getParentName(category.parent_id)}</span>
                        ) : (
                          <span className="text-[#8B6F47] text-sm">Top Level</span>
                        )}
                      </TableCell>
                    <TableCell>{category.product_count || 0}</TableCell>
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
                <Label>Category Image</Label>
                <div className="flex justify-center border-2 border-dashed border-[#E8DCC8] rounded-xl p-4">
                    <ImageUploader 
                        label="Change Image"
                        initialUrl={editCategory?.image || undefined}
                        onChange={(_, url) => setEditCategory((prev) => (prev ? { ...prev, image: url } : prev))}
                    />
                </div>
              </div>
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
                  {topLevelOptions.filter(o => o.id !== editCategory?.id).map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>{opt.name}</SelectItem>
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
