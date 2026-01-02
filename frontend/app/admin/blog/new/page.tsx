import { AdminLayout } from "@/components/admin-layout"
import { AdminBlogEditor } from "@/components/admin-blog-editor"

export default function NewBlogPost() {
  return (
    <AdminLayout>
      <AdminBlogEditor isNew={true} />
    </AdminLayout>
  )
}
