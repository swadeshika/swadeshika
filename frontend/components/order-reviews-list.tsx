"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ordersService, Order } from "@/lib/services/ordersService"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

// Mock removed

export function OrderReviewsList() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				setLoading(true)
				const res = await ordersService.getMyOrders({ status: 'delivered' })
				setOrders(res.orders || [])
			} catch (error) {
				console.error("Failed to fetch reviewable orders:", error)
			} finally {
				setLoading(false)
			}
		}
		fetchOrders()
	}, [])

	if (loading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-48 w-full rounded-2xl" />
				<Skeleton className="h-48 w-full rounded-2xl" />
			</div>
		)
	}

	if (orders.length === 0) {
		return (
			<Card className="py-12 rounded-2xl border-2 border-[#E8DCC8] text-center">
				<p className="text-[#8B6F47]">No completed orders found for review.</p>
				<Button asChild className="mt-4 bg-[#2D5F3F]"><Link href="/shop">Shop Now</Link></Button>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			{orders.map((order) => (
				<Card key={order.id} className="py-6 rounded-2xl border-2 border-[#E8DCC8]">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="text-[#6B4423]">{order.orderNumber}</CardTitle>
							<p className="text-sm max-[370px]:text-xs text-[#8B6F47]">
								{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
							</p>
						</div>
						<Badge className="bg-[#2D5F3F]/10 text-[#2D5F3F] border-0">{order.status}</Badge>
					</CardHeader>
					<CardContent className="space-y-4">
						{(order.items || []).map((item, index) => (
							<div
								key={`${order.id}-${item.id || item.product_id || item.productId || 'item'}-${index}`}
								className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-2 border-[#E8DCC8] rounded-xl"
							>
								{/* content block: image then text; stacked on mobile, inline on desktop */}
								<div className="flex w-full flex-col sm:flex-row sm:items-center gap-3">
									<img
										src={item.image_url || item.image || "/placeholder.svg"}
										alt={item.productName}
										className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
									/>
									<div className="flex-1">
										<p className="font-medium text-base max-[370px]:text-sm text-[#6B4423]">{item.productName}</p>
										<p className="text-sm max-[370px]:text-xs text-[#8B6F47]">{item.variantName}</p>
									</div>
								</div>

								{/* button block: appears below content on mobile, aligned right on desktop */}
								<div className="w-1/2 sm:w-auto flex-shrink-0 mt-2 sm:mt-0">
									<Button asChild className="w-full text-sm max-[370px]:text-xs sm:w-auto bg-[#2D5F3F] hover:bg-[#234A32] text-white">
										<Link href={`/account/orders/${order.id}/review`}>Write Review</Link>
									</Button>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			))}
		</div>
	)
}
