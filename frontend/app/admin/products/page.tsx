import { AdminLayout } from "@/components/admin-layout"
import { AdminProductsList } from "@/components/admin-products-list"

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <AdminProductsList />
    </AdminLayout>
  )
}
