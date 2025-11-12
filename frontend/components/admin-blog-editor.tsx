"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Image as ImageIcon, Tag as TagIcon, Calendar as CalendarIcon } from "lucide-react"
import Link from "next/link"
import { format } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { RichTextEditor } from "@/components/admin/rich-text-editor"

type BlogPost = {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  authorImage: string
  category: string
  status: 'draft' | 'published'
  publishDate: Date
  featuredImage: string
  tags: string[]
}

export function AdminBlogEditor({ post: initialPost, isNew = false }: { post?: Partial<BlogPost>, isNew?: boolean }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [newTag, setNewTag] = useState('')
  
  // Track if slug has been manually modified
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

  // Function to generate URL-friendly slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
  }

  const [post, setPost] = useState<Partial<BlogPost>>(initialPost || {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Admin User',
    authorImage: '/default-avatar.png',
    category: '',
    status: 'draft',
    publishDate: new Date(),
    featuredImage: '',
    tags: []
  })

  // Update post with automatic slug generation
  const updatePost = (updates: Partial<BlogPost>) => {
    setPost(prev => {
      const newPost = { ...prev, ...updates }
      
      // Auto-generate slug if title changes and slug wasn't manually edited
      if (updates.title !== undefined && !isSlugManuallyEdited) {
        newPost.slug = generateSlug(updates.title)
      }
      
      return newPost
    })
  }

  // Handle slug input change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value
    setPost(prev => ({ ...prev, slug: newSlug }))
    // Mark as manually edited if not empty
    if (newSlug.trim() !== '') {
      setIsSlugManuallyEdited(true)
    } else {
      setIsSlugManuallyEdited(false)
    }
  }

  // Handle title change with auto-slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    updatePost({ title: newTitle })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!post.title) {
      alert('Please enter a title for the post')
      return
    }
    
    // Ensure slug is generated if empty
    const finalPost = {
      ...post,
      slug: post.slug || generateSlug(post.title)
    }
    
    setIsSaving(true)
    
    try {
      // TODO: Implement actual form submission
      console.log('Saving post:', finalPost)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message
      alert('Post saved successfully!')
      
      // Redirect to blog list after successful save
      router.push('/admin/blog')
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Failed to save post. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault()
      if (!post.tags?.includes(newTag.trim())) {
        setPost({
          ...post,
          tags: [...(post.tags || []), newTag.trim()]
        })
      }
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setPost({
      ...post,
      tags: post.tags?.filter(tag => tag !== tagToRemove) || []
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPost({
          ...post,
          featuredImage: reader.result as string
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link href="/admin/blog">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold mb-2 text-[#6B4423]">
              {isNew ? 'New Blog Post' : 'Edit Blog Post'}
            </h1>
          </div>
          <p className="text-sm text-[#8B6F47] ml-10">
            {isNew ? 'Create and publish a new blog post' : 'Edit and update this blog post'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="publish-status" 
              checked={post.status === 'published'}
              onCheckedChange={(checked) => setPost({...post, status: checked ? 'published' : 'draft'})}
            />
            <Label htmlFor="publish-status">
              {post.status === 'published' ? 'Published' : 'Draft'}
            </Label>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-[#2D5F3F] hover:bg-[#1e4a30]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Post'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="py-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter post title" 
                      required 
                      className="text-lg font-medium"
                      value={post.title}
                      onChange={handleTitleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input 
                      id="slug" 
                      placeholder="post-url-slug" 
                      value={post.slug}
                      onChange={handleSlugChange}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      This is how your post will appear in the URL
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea 
                      id="excerpt" 
                      placeholder="A short summary of your post" 
                      rows={3} 
                      required 
                      value={post.excerpt}
                      onChange={(e) => updatePost({ excerpt: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <div className="border-2 border-[#E8DCC8] rounded-lg overflow-hidden p-6">
                      <RichTextEditor
                        value={post.content}
                        onChange={(content) => setPost({...post, content})}
                        placeholder="Write your post content here..."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className='py-6'>
              <CardHeader>
                <CardTitle className="text-lg">Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={post.status}
                    onValueChange={(value: 'draft' | 'published') => setPost({...post, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Publish Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !post.publishDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {post.publishDate ? (
                          format(new Date(post.publishDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(post.publishDate || new Date())}
                        onSelect={(date) => date && setPost({...post, publishDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#2D5F3F] hover:bg-[#1e4a30]"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save and Publish'}
                </Button>
              </CardContent>
            </Card>

            <Card className='py-6'>
              <CardHeader>
                <CardTitle className="text-lg">Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer border-[#E8DCC8] hover:bg-[#F5F1E8] transition-colors">
                  {post.featuredImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={post.featuredImage}
                        alt="Featured"
                        className="object-cover w-full h-full rounded-md"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.preventDefault()
                          setPost({...post, featuredImage: ''})
                        }}
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <ImageIcon className="w-8 h-8 mb-2 text-[#8B6F47]" />
                      <p className="text-sm text-center text-[#6B4423]">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className='py-6'>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={post.category}
                  onValueChange={(value) => setPost({...post, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health & Wellness</SelectItem>
                    <SelectItem value="ayurveda">Ayurveda</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="recipes">Recipes</SelectItem>
                    <SelectItem value="sustainable-living">Sustainable Living</SelectItem>
                    <SelectItem value="mindfulness">Mindfulness</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className='py-6'>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TagIcon className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags?.map((tag) => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8DCC8] text-[#6B4423]"
                      >
                        {tag}
                        <button 
                          type="button" 
                          className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#D4C8B8] text-[#6B4423] hover:bg-[#C4B8A8]"
                          onClick={(e) => {
                            e.preventDefault()
                            removeTag(tag)
                          }}
                        >
                          <span className="sr-only">Remove tag</span>
                          <svg className="h-2 w-2" fill="currentColor" viewBox="0 0 8 8">
                            <path d="M8 0.8L7.2 0L4 3.2L0.8 0L0 0.8L3.2 4L0 7.2L0.8 8L4 4.8L7.2 8L8 7.2L4.8 4L8 0.8Z" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input 
                    placeholder="Add a tag and press Enter" 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className='py-6'>
              <CardHeader>
                <CardTitle className="text-lg">Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden border">
                    <img
                      src={post.authorImage}
                      alt={post.author}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{post.author}</p>
                    <p className="text-sm text-muted-foreground">Author</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
