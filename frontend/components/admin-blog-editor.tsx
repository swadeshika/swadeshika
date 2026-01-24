"use client"

import { useState, useEffect, useMemo } from 'react'
import { blogService, BlogPost, BlogCategory } from '@/lib/blogService'
import { blogAuthorService, BlogAuthor } from '@/lib/blogAuthorService'
import { uploadService } from '@/lib/services/uploadService'
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
import dynamic from 'next/dynamic'
import { useToast } from "@/hooks/use-toast"

// Dynamically import RichTextEditor to avoid SSR issues with Quill
const RichTextEditor = dynamic(
  () => import('@/components/admin/rich-text-editor').then(mod => mod.RichTextEditor),
  { ssr: false }
)

export function AdminBlogEditor({ post: initialPost, isNew = false }: { post?: Partial<BlogPost>, isNew?: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [newTag, setNewTag] = useState('')
  
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [authors, setAuthors] = useState<BlogAuthor[]>([])
  const [isLoadingMeta, setIsLoadingMeta] = useState(true)
  
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
    author_id: undefined,
    category_id: undefined,
    status: 'draft',
    published_at: new Date().toISOString(),
    featured_image: '',
    tags: []
  })

  // Fetch blog categories and authors
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        setIsLoadingMeta(true)
        const [cats, auths] = await Promise.all([
          blogService.getActiveCategories(),
          blogAuthorService.getAllAuthors()
        ])
        setCategories(cats)
        setAuthors(auths)
        
        // If isNew and no author selected, default to first author or admin
        if (isNew && !post.author_id && auths.length > 0) {
            setPost(prev => ({ ...prev, author_id: typeof auths[0].id === 'string' ? parseInt(auths[0].id) : auths[0].id as number }))
        }
      } catch (error) {
        toast({ title: "Failed to load metadata", variant: "destructive" })
      } finally {
        setIsLoadingMeta(false)
      }
    }

    fetchMetaData()
  }, [isNew])

  // Sync prop post data with state (for edit mode)
  useEffect(() => {
    if (initialPost && !isNew) {
      setPost(prev => ({
        ...prev,
        ...initialPost
      }))
    }
  }, [initialPost, isNew])

  // Update post with automatic slug generation
  const updatePost = (updates: Partial<BlogPost>) => {
    setPost(prev => {
      const newPost = { ...prev, ...updates }
      if (updates.title !== undefined && !isSlugManuallyEdited) {
        newPost.slug = generateSlug(updates.title)
      }
      return newPost
    })
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value
    setPost(prev => ({ ...prev, slug: newSlug }))
    setIsSlugManuallyEdited(newSlug.trim() !== '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePost({ title: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!post.title) {

        toast({ title: "Title is required", variant: "destructive" })
      return
    }
    
    // Ensure slug is generated if empty
    const finalPost = {
      ...post,
      slug: post.slug || generateSlug(post.title || ''),
      // Ensure arrays are arrays? Typescript handles this.
      // Date handling: Ensure published_at is string ISO
    }
    

    
    setIsSaving(true)
    
    try {
      if (isNew) {
        const result = await blogService.createPost(finalPost)

        toast({ title: "Post created successfully" })
      } else if (post.id) {

        const result = await blogService.updatePost(post.id, finalPost)

        toast({ title: "Post updated successfully" })
      }

      router.push('/admin/blog')
    } catch (error: any) {
        console.error("Failed to save blog post:", error);
        const msg = error.message || "Something went wrong";
        toast({ title: "Failed to save post", description: msg, variant: "destructive" })
    } finally {

      setIsSaving(false)
    }
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault()
    //   Handle both string (JSON) or array tags
    //   Our BlogPost type says tags?: string[] | string
    //   Let's assume we work with array locally
      const currentTags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? JSON.parse(post.tags) : [])
      
      if (!currentTags.includes(newTag.trim())) {
        setPost({
          ...post,
          tags: [...currentTags, newTag.trim()]
        })
      }
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
      const currentTags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? JSON.parse(post.tags) : [])
    setPost({
      ...post,
      tags: currentTags.filter((tag: string) => tag !== tagToRemove)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log('[IMAGE UPLOAD] File selected:', file?.name, file?.size)
    
    if (file) {
      try {
        // Store old image URL to delete later
        const oldImageUrl = post.featured_image
        console.log('[IMAGE UPLOAD] Old image URL:', oldImageUrl)

        // Show loading state
        const reader = new FileReader()
        reader.onloadend = () => {
          console.log('[IMAGE UPLOAD] FileReader complete, showing preview')
          // Temporarily show preview while uploading
          setPost({
            ...post,
            featured_image: reader.result as string
          })
        }
        reader.readAsDataURL(file)

        // Upload using centralized service
        console.log('[IMAGE UPLOAD] Uploading to server via uploadService...')
        const uploadedUrl = await uploadService.uploadImage(file)
        
        console.log('[IMAGE UPLOAD] Upload successful, URL:', uploadedUrl)
        
        setPost(prev => {
          const updated = {
            ...prev,
            featured_image: uploadedUrl
          }
          console.log('[IMAGE UPLOAD] Updated post state:', updated)
          return updated
        })
        
        toast({ title: "Image uploaded successfully" })
      } catch (error) {
        console.error('[IMAGE UPLOAD] Error occurred:', error)
        toast({ 
          title: "Image upload failed", 
          description: "Please try again",
          variant: "destructive" 
        })
        // Clear the failed image
        setPost({
          ...post,
          featured_image: ''
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start w-full md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link href="/admin/blog">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold mb-2 text-[#6B4423]">{isNew ? 'New Blog Post' : 'Edit Blog Post'}</h1>
          </div>
          <p className="text-sm text-[#8B6F47] mt-1">{isNew ? 'Create and publish a new blog post' : 'Edit and update this blog post'}</p>
        </div>

        <div className="flex flex-col items-start gap-4 mt-4 md:mt-0 md:flex-row md:items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="publish-status"
              checked={post.status === 'published'}
              onCheckedChange={(checked) => setPost({ ...post, status: checked ? 'published' : 'draft' })}
            />
            <Label htmlFor="publish-status">{post.status === 'published' ? 'Published' : 'Draft'}</Label>
          </div>
          <Button 
            onClick={(e) => {
              // Manually trigger submit if outside form
              handleSubmit(e as any)
            }} 
            disabled={isSaving} 
            className="w-full md:w-auto mt-2 md:mt-0 bg-[#2D5F3F] hover:bg-[#1e4a30]"
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
                    <div className="border-0 px-0 rounded-lg overflow-hidden sm:border-2 sm:border-[#E8DCC8] sm:p-6">
                      <RichTextEditor
                        value={post.content ?? ""}
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
                          !post.published_at && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {post.published_at ? (
                          format(new Date(post.published_at), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(post.published_at || new Date())}
                        onSelect={(date) => date && setPost({...post, published_at: date.toISOString()})}
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
                  {post.featured_image ? (
                    <div className="relative w-full h-full">
                      <img
                        src={post.featured_image.startsWith('http') || post.featured_image.startsWith('data:') 
                          ? post.featured_image 
                          : `http://127.0.0.1:5000${post.featured_image}`}
                        alt="Featured"
                        className="object-cover w-full h-full rounded-md"
                        onError={(e) => {
                          console.error('Image failed to load:', post.featured_image);
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/600x400?text=Image+Error';
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.preventDefault()
                          setPost({...post, featured_image: ''})
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
                  value={post.category_id?.toString()}
                  onValueChange={(value) => setPost({...post, category_id: parseInt(value)})}
                  disabled={isLoadingMeta}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingMeta ? "Loading categories..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 && !isLoadingMeta && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No categories available</div>
                    )}
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
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
                    {(() => {
                        const tags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : []);
                        return tags.map((tag: string) => (
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
                    ))})()}
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
                <Select
                  value={post.author_id?.toString()}
                  onValueChange={(value) => setPost({...post, author_id: parseInt(value)})}
                  disabled={isLoadingMeta}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingMeta ? "Loading authors..." : "Select an author"} />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.length === 0 && !isLoadingMeta && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No authors available</div>
                    )}
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id!.toString()}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
