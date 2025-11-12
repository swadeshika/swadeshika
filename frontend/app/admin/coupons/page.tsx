/**
 * Admin Coupons & Discounts Management Page
 *
 * Features:
 * - Create and manage discount coupons
 * - Set coupon rules (minimum order, usage limits, expiry)
 * - Track coupon usage statistics
 */

import { AdminLayout } from "@/components/admin-layout"
import { AdminCouponsList } from "@/components/admin-coupons-list"

export default function AdminCouponsPage() {
  return (
    <AdminLayout>
      <AdminCouponsList />
    </AdminLayout>
  )
}
