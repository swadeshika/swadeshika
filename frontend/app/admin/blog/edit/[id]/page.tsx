"use client"

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { AdminBlogEditor } from "@/components/admin-blog-editor"
import { blogService, BlogPost } from "@/lib/blogService"

export default function EditBlogPage() {
  const params = useParams()
  const id = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true)
        // Fetch all posts and find by ID (since we don't have getById endpoint)
        const posts = await blogService.getAllPosts({ limit: 1000 })
        const foundPost = posts.find(p => p.id?.toString() === id)
        
        if (!foundPost) {
          setError(true)
          return
        }
        
        setPost(foundPost)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading post...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error || !post) {
    return notFound()
  }

  return (
    <AdminLayout>
      <AdminBlogEditor post={post} isNew={false} />
    </AdminLayout>
  )
}
