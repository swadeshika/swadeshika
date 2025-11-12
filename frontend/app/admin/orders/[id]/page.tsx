import AdminOrderDetailContent from "@/components/admin-order-detail"
import { AdminLayout } from "@/components/admin-layout"

export const metadata = {
  title: "Order Details - Admin - Swadeshika",
  description: "Manage order details and status",
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout>
      <AdminOrderDetailContent orderId={params.id} />
    </AdminLayout>
  )
}
