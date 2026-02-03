"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Twitter, Instagram, Facebook, Linkedin } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as AlertFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { blogAuthorService, BlogAuthor } from "@/lib/blogAuthorService"

type Author = {
  id: string
  name: string
  email: string
  bio: string
  avatar: string
  social_links?: {
    twitter?: string
    facebook?: string
    instagram?: string
    linkedin?: string
  }
  createdAt: string
}

export default function BlogAuthorsPage() {


  const { toast } = useToast()
  const [authors, setAuthors] = useState<Author[]>([]) // Use API data
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Author | null>(null)
  
  // Form State
  const [form, setForm] = useState<BlogAuthor>({
    name: "",
    email: "",
    bio: "",
    avatar: "",
    social_links: { twitter: "", facebook: "", instagram: "", linkedin: "" },
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState<string | number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch Authors
  const fetchAuthors = async () => {
    try {
      setIsLoading(true)
      const data = await blogAuthorService.getAllAuthors()
      // Map backend response to component state if needed, or use directly
      // Backend returns snake_case/camelCase mix. Let's ensure types match.
      // The BlogAuthor interface matches what we need mostly.
      // Need to cast or map if backend returns different structure.
      // Based on my controller, it returns arrays of objects directly from DB.
      // social_links is stored as JSON string in DB, but `mysql2` driver might auto-parse JSON columns?
      // Actually, I stored it as JSON string. Depending on driver config, it might return string or object.
      // Let's assume it might be string and parse if needed.
      
      const mapped = data.map((a: any) => ({
        ...a,
        // Backend returns social_links which might be JSON string
        social_links: typeof a.social_links === 'string' ? JSON.parse(a.social_links) : (a.social_links || {}),
        createdAt: a.created_at // Map snake_case to camelCase
      }))
      setAuthors(mapped)
    } catch (error) {
      toast({ title: "Failed to load authors", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAuthors()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return authors
    return authors.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.bio && a.bio.toLowerCase().includes(q))
    )
  }, [search, authors])

  const startCreate = () => {
    setEditing(null)
    setForm({ name: "", email: "", bio: "", avatar: "", social_links: {} })
    setDialogOpen(true)
  }

  const startEdit = (author: Author) => {
    setEditing(author)
    setForm({ 
        name: author.name, 
        email: author.email, 
        bio: author.bio, 
        avatar: author.avatar, 
        social_links: { ...author.social_links } // Use social_links
    })
    setDialogOpen(true)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, avatar: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const saveAuthor = async () => {
    // Validate name
    if (!form.name?.trim()) {
      toast({ title: "Name required", description: "Please enter a name.", variant: "destructive" })
      return
    }
    
    if (form.name.trim().length < 2) {
      toast({ title: "Invalid name", description: "Name must be at least 2 characters long.", variant: "destructive" })
      return
    }
    
    // Check for valid name characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]+$/
    if (!nameRegex.test(form.name.trim())) {
      toast({ title: "Invalid name", description: "Name can only contain letters, spaces, hyphens, and apostrophes.", variant: "destructive" })
      return
    }
    
    // Validate email
    if (!form.email?.trim()) {
      toast({ title: "Email required", description: "Please enter an email.", variant: "destructive" })
      return
    }
    
    // Check for valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" })
      return
    }
    setIsSaving(true)
    try {
      const payload = {
        ...form,
        social_links: form.social_links // backend expects social_links
      }
      
      if (editing && editing.id) {
        await blogAuthorService.updateAuthor(editing.id, payload)
        toast({ title: "Author updated" })
      } else {
        await blogAuthorService.createAuthor(payload as any)
        toast({ title: "Author added" })
      }
      setDialogOpen(false)
      setEditing(null)
      fetchAuthors()
    } catch (e) {
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = (id: string) => {
    setToDeleteId(id)
    setConfirmOpen(true)
  }

  const doDelete = async () => {
    if (!toDeleteId) return
    setIsDeleting(true)
    try {
      await blogAuthorService.deleteAuthor(toDeleteId)
      setAuthors(prev => prev.filter(a => a.id !== toDeleteId))
      toast({ title: "Author deleted" })
    } catch (e) {
      toast({ title: "Delete failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsDeleting(false)
      setConfirmOpen(false)
      setToDeleteId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="p-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl font-bold text-[#6B4423]">Blog Authors</h1>
            <p className="text-[#8B6F47]">Manage your blog authors and their profiles</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={startCreate} className="bg-[#2D5F3F] hover:bg-[#1e4a30]">
                <Plus className="mr-2 h-4 w-4" />
                Add Author
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Author" : "Add Author"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="author-name">Name</Label>
                  <Input id="author-name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Author name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author-email">Email</Label>
                  <Input id="author-email" type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author-bio">Bio</Label>
                  <Input id="author-bio" value={form.bio} onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Short biography" />
                </div>
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  {form.avatar ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={form.avatar} />
                        <AvatarFallback>{form.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" onClick={() => setForm(p => ({ ...p, avatar: "" }))}>Remove</Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-[#E8DCC8] hover:bg-[#F5F1E8]">
                      <ImageIcon className="w-8 h-8 mb-2 text-[#8B6F47]" />
                      <span className="text-sm text-[#6B4423]">Click to upload avatar</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Social Links</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input placeholder="Twitter username" value={form.social_links?.twitter || ""} onChange={(e) => setForm(p => ({ ...p, social_links: { ...p.social_links, twitter: e.target.value || undefined } }))} />
                    <Input placeholder="LinkedIn path (in/...)" value={form.social_links?.linkedin || ""} onChange={(e) => setForm(p => ({ ...p, social_links: { ...p.social_links, linkedin: e.target.value || undefined } }))} />
                    <Input placeholder="Instagram username" value={form.social_links?.instagram || ""} onChange={(e) => setForm(p => ({ ...p, social_links: { ...p.social_links, instagram: e.target.value || undefined } }))} />
                    <Input placeholder="Facebook username" value={form.social_links?.facebook || ""} onChange={(e) => setForm(p => ({ ...p, social_links: { ...p.social_links, facebook: e.target.value || undefined } }))} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveAuthor} disabled={isSaving} className="bg-[#2D5F3F] hover:bg-[#1e4a30]">
                  {editing ? (isSaving ? "Saving..." : "Save Changes") : (isSaving ? "Creating..." : "Create Author")}
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
                placeholder="Search authors..."
                className="pl-9 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Social</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((author) => (
                <TableRow key={author.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={author.avatar} />
                        <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span>{author.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{author.email}</TableCell>
                  <TableCell className="text-[#8B6F47] max-w-xs truncate">{author.bio}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {author.social_links?.twitter && (
                        <a href={`https://twitter.com/${author.social_links.twitter}`} target="_blank" rel="noopener noreferrer" className="text-[#1DA1F2] hover:text-[#1a8cd8]">
                          <span className="sr-only">Twitter</span>
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                      {author.social_links?.linkedin && (
                        <a href={`https://linkedin.com/${author.social_links.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:text-[#004182]">
                          <span className="sr-only">LinkedIn</span>
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {author.social_links?.instagram && (
                        <a href={`https://instagram.com/${author.social_links.instagram}`} target="_blank" rel="noopener noreferrer" className="text-[#E4405F] hover:text-[#d62976]">
                          <span className="sr-only">Instagram</span>
                          <Instagram className="h-4 w-4" />
                        </a>
                      )}
                      {author.social_links?.facebook && (
                        <a href={`https://facebook.com/${author.social_links.facebook}`} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:text-[#166fe5]">
                          <span className="sr-only">Facebook</span>
                          <Facebook className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(author.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(author)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => confirmDelete(author.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">No authors found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete author?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the author. This action cannot be undone.</AlertDialogDescription>
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
