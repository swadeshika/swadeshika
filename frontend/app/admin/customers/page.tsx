import { AdminLayout } from "@/components/admin-layout"
import { AdminCustomersList } from "@/components/admin-customers-list"

export default function AdminCustomersPage() {
  return (
    <AdminLayout>
      <AdminCustomersList />
    </AdminLayout>
  )
}
