import { AdminLayout } from "@/components/admin-layout"
import AdminCustomerDetail from "@/components/admin-customer-detail"

export const metadata = {
  title: "Customer Details - Admin - Swadeshika",
  description: "View customer profile and recent orders",
}

export default async function AdminCustomerDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <AdminLayout>
      <AdminCustomerDetail customerId={params.id} />
    </AdminLayout>
  )
}
