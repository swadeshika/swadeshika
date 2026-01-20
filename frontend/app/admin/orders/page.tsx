import { Suspense } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { AdminOrdersList } from "@/components/admin-orders-list"

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div>Loading orders...</div>}>
         <AdminOrdersList />
      </Suspense>
    </AdminLayout>
  )
}
