"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, MoreVertical, FileText as BlogIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

const posts = [
  {
    id: "1",
    title: "The Health Benefits of Pure Desi Ghee",
    author: "Dr. Anjali Sharma",
    category: "Health & Wellness",
    status: "published",
    date: "2025-10-15",
    views: 1245,
    image: "/golden-ghee-in-glass-jar.jpg",
  },
  {
    id: "2",
    title: "Organic Farming: Why It Matters",
    author: "Rahul Verma",
    category: "Sustainable Living",
    status: "published",
    date: "2025-10-10",
    views: 892,
    image: "/organic-farming.jpg",
  },
  {
    id: "3",
    title: "The Art of Mindful Eating",
    author: "Priya Patel",
    category: "Health & Wellness",
    status: "draft",
    date: "2025-10-05",
    views: 0,
    image: "/mindful-eating.jpg",
  },
  {
    id: "4",
    title: "Ayurvedic Herbs for Daily Wellness",
    author: "Dr. Rajesh Kumar",
    category: "Ayurveda",
    status: "published",
    date: "2025-09-28",
    views: 1560,
    image: "/ayurvedic-herbs.jpg",
  },
  {
    id: "5",
    title: "5 Traditional Indian Superfoods",
    author: "Ananya Gupta",
    category: "Nutrition",
    status: "published",
    date: "2025-09-20",
    views: 2034,
    image: "/indian-superfoods.jpg",
  },
]

export function AdminBlogList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPost, setSelectedPost] = useState<string | null>(null)

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteClick = (postId: string) => {
    setSelectedPost(postId)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    // TODO: Implement actual delete logic
    console.log("Deleting post:", selectedPost)
    setShowDeleteDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#6B4423]">Blog Posts</h1>
          <p className="text-[#8B6F47]">
            Manage your blog content and articles
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl gap-0  py-5 border-2 border-[#E8DCC8]">
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F47]" />
              <Input
                placeholder="Search posts..."
                className="pl-9 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-[#E8DCC8] hover:bg-[#F5F1E8]">
                All Posts
              </Button>
              <Button variant="ghost" size="sm">
                Published
              </Button>
              <Button variant="ghost" size="sm">
                Drafts
              </Button>
            </div>
          </div>
        </div>
        
        <CardContent>
          <div className="rounded-2xl border-2 border-[#E8DCC8] overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="line-clamp-1">{post.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{post.author}</TableCell>
                    <TableCell>{post.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant={post.status === 'published' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(post.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/blog/edit/${post.id}`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => handleDeleteClick(post.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPosts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No posts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the post and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
