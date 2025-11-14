import { notFound } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { AdminBlogEditor } from "@/components/admin-blog-editor"
import { BLOGS } from "@/lib/blogs-data"

// Map category names to editor select values (best-effort)
function mapCategoryToValue(name: string | undefined) {
  if (!name) return ""
  const n = name.toLowerCase()
  if (n.includes("health")) return "health"
  if (n.includes("ayurveda")) return "ayurveda"
  if (n.includes("nutrition")) return "nutrition"
  if (n.includes("sustainable")) return "sustainable-living"
  if (n.includes("mindful")) return "mindfulness"
  if (n.includes("recipe")) return "recipes"
  return ""
}

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const post = BLOGS.find((p) => p.id === params.id)
  if (!post) return notFound()

  // Build initial shape for AdminBlogEditor
  const initial = {
    id: post.id,
    title: post.title,
    author: post.author,
    status: post.status as 'draft' | 'published',
    publishDate: new Date(post.date),
    featuredImage: post.image,
    category: mapCategoryToValue(post.category),
    // The editor will auto-generate slug if empty and handle empty excerpt/content/tags
  }

  return (
    <AdminLayout>
      <AdminBlogEditor post={initial} isNew={false} />
    </AdminLayout>
  )
}
