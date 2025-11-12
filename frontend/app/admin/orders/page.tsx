import { AdminLayout } from "@/components/admin-layout"
import { AdminOrdersList } from "@/components/admin-orders-list"

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <AdminOrdersList />
    </AdminLayout>
  )
}
