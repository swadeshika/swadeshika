"use client"

import { AdminLayout } from "@/components/admin-layout"
import { AdminContactsList } from "@/components/admin-contacts-list"

/**
 * AdminContactsPage
 * 
 * The main page component for the Admin Contacts section.
 * Wraps the contact list in the AdminLayout.
 * 
 * Route: /admin/contacts
 */
export default function AdminContactsPage() {
  return (
    <AdminLayout>
      <AdminContactsList />
    </AdminLayout>
  )
}
