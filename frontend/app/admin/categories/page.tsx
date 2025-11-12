/**
 * Admin Categories Management Page
 *
 * Features:
 * - View all categories and subcategories
 * - Add new categories with parent/child relationships
 * - Edit existing categories
 * - Delete categories
 * - Reorder categories
 */

import { AdminLayout } from "@/components/admin-layout"
import { AdminCategoriesList } from "@/components/admin-categories-list"

export default function AdminCategoriesPage() {
  return (
    <AdminLayout>
      <AdminCategoriesList />
    </AdminLayout>
  )
}
