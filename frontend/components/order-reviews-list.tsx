"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Mock: orders with items that can be reviewed
const reviewables = [
	{
		orderId: "1",
		orderNumber: "ORD-20250116-1234",
		date: "Jan 16, 2025",
		status: "Delivered",
		items: [
			{ id: "p1", name: "Premium A2 Desi Cow Ghee", variant: "1 Liter", image: "/traditional-ghee.jpg", quantity: 2 },
			{ id: "p2", name: "Organic Turmeric Powder", variant: "500g", image: "/turmeric-powder-in-bowl.jpg", quantity: 1 },
		],
	},
	{
		orderId: "2",
		orderNumber: "ORD-20250110-5678",
		date: "Jan 10, 2025",
		status: "Delivered",
		items: [
			{ id: "p3", name: "Premium Kashmiri Almonds", variant: "500g", image: "/kashmiri-almonds.jpg", quantity: 1 },
		],
	},
]

export function OrderReviewsList() {
	return (
		<div className="space-y-6">
			{reviewables.map((order) => (
				<Card key={order.orderId} className="py-6 rounded-2xl border-2 border-[#E8DCC8]">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="text-[#6B4423]">{order.orderNumber}</CardTitle>
							<p className="text-sm max-[370px]:text-xs text-[#8B6F47]">{order.date}</p>
						</div>
						<Badge className="bg-[#2D5F3F]/10 text-[#2D5F3F] border-0">{order.status}</Badge>
					</CardHeader>
					<CardContent className="space-y-4">
						{order.items.map((item) => (
							<div
								key={item.id}
								className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-2 border-[#E8DCC8] rounded-xl"
							>
								{/* content block: image then text; stacked on mobile, inline on desktop */}
								<div className="flex w-full flex-col sm:flex-row sm:items-center gap-3">
									<img
										src={item.image || "/placeholder.svg"}
										alt={item.name}
										className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
									/>
									<div className="flex-1">
										<p className="font-medium text-base max-[370px]:text-sm text-[#6B4423]">{item.name}</p>
										<p className="text-sm max-[370px]:text-xs text-[#8B6F47]">{item.variant}</p>
									</div>
								</div>

								{/* button block: appears below content on mobile, aligned right on desktop */}
								<div className="w-1/2 sm:w-auto flex-shrink-0 mt-2 sm:mt-0">
									<Button asChild className="w-full text-sm max-[370px]:text-xs sm:w-auto bg-[#2D5F3F] hover:bg-[#234A32] text-white">
										<Link href={`/account/orders/${order.orderId}/review`}>Write Review</Link>
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
