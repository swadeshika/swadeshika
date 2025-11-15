"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Trash2, Image as ImageIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as AlertFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type Author = {
  id: string
  name: string
  email: string
  bio: string
  avatar: string
  social: {
    twitter?: string
    facebook?: string
    instagram?: string
    linkedin?: string
  }
  createdAt: string
}

export default function BlogAuthorsPage() {
  // Initial data - replace with API integration later
  const initialAuthors: Author[] = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      email: 'priya@example.com',
      bio: 'Ayurvedic Practitioner with 10+ years of experience',
      avatar: '/default-avatar.png',
      social: {
        twitter: 'priyasharma',
        linkedin: 'in/priyasharma'
      },
      createdAt: '2023-11-12'
    },
    {
      id: '2',
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      bio: 'Nutritionist & Wellness Coach',
      avatar: '/default-avatar.png',
      social: {
        instagram: 'rahul_wellness',
        twitter: 'rahulv'
      },
      createdAt: '2023-11-12'
    }
  ]

  const { toast } = useToast()
  const [authors, setAuthors] = useState<Author[]>(initialAuthors)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Author | null>(null)
  const [form, setForm] = useState<Omit<Author, 'id' | 'createdAt'> & { id?: string }>({
    id: undefined,
    name: "",
    email: "",
    bio: "",
    avatar: "",
    social: {},
  })
  const [isSaving, setIsSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return authors
    return authors.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.bio.toLowerCase().includes(q)
    )
  }, [search, authors])

  const startCreate = () => {
    setEditing(null)
    setForm({ id: undefined, name: "", email: "", bio: "", avatar: "", social: {} })
    setDialogOpen(true)
  }

  const startEdit = (author: Author) => {
    setEditing(author)
    setForm({ id: author.id, name: author.name, email: author.email, bio: author.bio, avatar: author.avatar, social: { ...author.social } })
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
    if (!form.name.trim()) {
      toast({ title: "Name required", description: "Please enter a name.", variant: "destructive" })
      return
    }
    if (!form.email.trim()) {
      toast({ title: "Email required", description: "Please enter an email.", variant: "destructive" })
      return
    }
    setIsSaving(true)
    try {
      if (editing) {
        setAuthors(prev => prev.map(a => a.id === editing.id ? { ...a, name: form.name.trim(), email: form.email.trim(), bio: form.bio, avatar: form.avatar || a.avatar, social: form.social } : a))
        toast({ title: "Author updated" })
      } else {
        const id = Date.now().toString()
        setAuthors(prev => [...prev, { id, name: form.name.trim(), email: form.email.trim(), bio: form.bio, avatar: form.avatar || '/default-avatar.png', social: form.social, createdAt: new Date().toISOString() }])
        toast({ title: "Author added" })
      }
      setDialogOpen(false)
      setEditing(null)
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
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
                    <Input placeholder="Twitter username" value={form.social.twitter || ""} onChange={(e) => setForm(p => ({ ...p, social: { ...p.social, twitter: e.target.value || undefined } }))} />
                    <Input placeholder="LinkedIn path (in/...)" value={form.social.linkedin || ""} onChange={(e) => setForm(p => ({ ...p, social: { ...p.social, linkedin: e.target.value || undefined } }))} />
                    <Input placeholder="Instagram username" value={form.social.instagram || ""} onChange={(e) => setForm(p => ({ ...p, social: { ...p.social, instagram: e.target.value || undefined } }))} />
                    <Input placeholder="Facebook username" value={form.social.facebook || ""} onChange={(e) => setForm(p => ({ ...p, social: { ...p.social, facebook: e.target.value || undefined } }))} />
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
                      {author.social.twitter && (
                        <a href={`https://twitter.com/${author.social.twitter}`} target="_blank" rel="noopener noreferrer">
                          <span className="sr-only">Twitter</span>
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        </a>
                      )}
                      {author.social.linkedin && (
                        <a href={`https://linkedin.com/${author.social.linkedin}`} target="_blank" rel="noopener noreferrer">
                          <span className="sr-only">LinkedIn</span>
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      )}
                      {author.social.instagram && (
                        <a href={`https://instagram.com/${author.social.instagram}`} target="_blank" rel="noopener noreferrer">
                          <span className="sr-only">Instagram</span>
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
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
