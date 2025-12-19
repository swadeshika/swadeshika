
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ordersService } from "@/lib/services/ordersService"

const statusClasses: Record<string, string> = {
	Delivered: "bg-[#2D5F3F]/10 text-[#2D5F3F]",
	Shipped: "bg-[#FF7E00]/10 text-[#FF7E00]",
	Processing: "bg-[#8B6F47]/10 text-[#6B4423]",
	Cancelled: "bg-red-100 text-red-700",
}

export function OrdersList() {
	const [orders, setOrders] = useState<any[]>([]); // Use appropriate type if available or define one locally
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const data = await ordersService.getMyOrders();
				setOrders(data.orders);
			} catch (error) {
				console.error("Failed to fetch orders:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, []);

	if (loading) {
		return <div className="text-center py-10 text-[#8B6F47]">Loading orders...</div>;
	}

	if (orders.length === 0) {
		return <div className="text-center py-10 text-[#8B6F47]">No orders found.</div>;
	}

	return (
		<div className="space-y-6">
			{orders.map((order) => (
				<Card key={order.id} className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
					<CardContent className="p-6 space-y-4">
						{/* Order Header */}
						<div className="flex items-start justify-between">
							<div>
								<h3 className="font-semibold text-lg mb-1 text-[#6B4423]">{order.orderNumber}</h3>
								<p className="text-sm text-[#8B6F47]">Placed on {new Date(order.createdAt || '').toLocaleDateString()}</p>
							</div>
							<Badge className={`${statusClasses[order.status] || 'bg-gray-100'} border - 0`}>{order.status}</Badge>
						</div>

						{/* Order items would typically need a separate fetch or included in list response. 
						    For now, list response doesn't include items array in getAll/getMyOrders 
						    based on controller logic. We might show just summary or fetch details.
						    The design shows items. I should check if backend returns items in getMyOrders.
						    Looking at controller getMyOrders -> findAll, it returns orders from `SELECT * FROM orders`.
						    It DOES NOT join order_items. 
						    So items are missing. 
						    For now I will show a summary or "View Details to see items" to be safe, 
						    OR I should update backend to include items.
						    Design shows items images... 
						    Let's stick to View Details for MVP integration to verify API first.
						*/}
						<div className="text-sm text-[#8B6F47]">
							<p>Total Items: {order.items ? order.items.length : 'View details to see items'}</p>
						</div>

						{/* Order Footer */}
						<div className="flex items-center justify-between pt-4 border-t-2 border-[#E8DCC8]">
							<div>
								<p className="text-sm text-[#8B6F47]">Total Amount</p>
								<p className="font-bold text-lg text-[#2D5F3F]">₹{order.totalAmount}</p>
							</div>

							{/* Buttons: stacked on mobile (Write Review under View), inline on sm+ */}
							<div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									asChild
									className="bg-transparent border-2 border-[#E8DCC8] hover:bg-accent"
								>
									<Link href={`/account/orders/${order.id}`}>View Details</Link>
								</Button>

								{order.status === "Delivered" && (
									<Button
										size="sm"
										asChild
										className="bg-[#2D5F3F] hover:bg-[#234A32] text-white"
									>
										<Link href={`/account/orders/${order.id}/review`}>Write Review</Link>
									</Button >
								)}
							</div >
						</div >
					</CardContent >
				</Card >
			))}
		</div >
	)
}

