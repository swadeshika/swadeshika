import { AdminLayout } from "@/components/admin-layout"
import AdminCustomerDetail from "@/components/admin-customer-detail"

export const metadata = {
  title: "Customer Details - Admin - Swadeshika",
  description: "View customer profile and recent orders",
}

export default function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout>
      <AdminCustomerDetail customerId={params.id} />
    </AdminLayout>
  )
}
