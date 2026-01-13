"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ordersService } from "@/lib/services/ordersService"
import { useRouter } from "next/navigation"

export function AdminNotifications() {
  const { toast } = useToast()
  const router = useRouter()
  // Store the ID of the most recent order we've seen
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)

  useEffect(() => {
    // 1. Initial Check: Fetch the latest order to set the baseline
    // We don't want to notify about existing orders when the admin simply refreshes the page.
    const checkInitial = async () => {
        try {
            // Fetch 1 latest order
            const data = await ordersService.getAllOrders({ limit: 1, page: 1 })
            if (data && data.orders && data.orders.length > 0) {
                // Just set the ID, don't notify
                setLastOrderId(String(data.orders[0].id))
            }
        } catch (e) {
            console.error("Failed to init notifications", e)
        }
    }
    
    checkInitial()

    // 2. Poll every 30 seconds
    const interval = setInterval(async () => {
        try {
            const data = await ordersService.getAllOrders({ limit: 1, page: 1 })
            if (data && data.orders && data.orders.length > 0) {
                const latest = data.orders[0]
                const latestId = String(latest.id)
                
                setLastOrderId((prev) => {
                    // Only notify if we had a previous ID and the new one is different (newer)
                    if (prev && prev !== latestId) {
                        toast({
                            title: "New Order Received! 🎉",
                            description: `Order #${latest.orderNumber} - ₹${latest.totalAmount}`,
                            duration: 5000,
                            action: (
                                <button 
                                    className="bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 rounded text-sm font-medium hover:opacity-90 transition-opacity"
                                    onClick={() => router.push(`/admin/orders/${latestId}`)}
                                >
                                    View
                                </button>
                            )
                        })
                        return latestId
                    }
                    // If no prev existed yet, just set it now (first successful poll after init failed case)
                    return prev || latestId
                })
            }
        } catch (e) {
             console.error("Notification check failed", e)
        }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [toast, router])

  // This component doesn't render anything visibly itself, it just invokes toasts.
  return null
}
