
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ordersService, Order } from "@/lib/services/ordersService"
import { Heart, Loader2, RotateCcw } from "lucide-react"
import { useWishlistStore } from "@/lib/wishlist-store"
import { toast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth-store"
import { cn } from "@/lib/utils"

const statusClasses: Record<string, string> = {
	delivered: "bg-[#2D5F3F]/10 text-[#2D5F3F]",
	shipped: "bg-[#FF7E00]/10 text-[#FF7E00]",
	processing: "bg-[#8B6F47]/10 text-[#6B4423]",
	pending: "bg-yellow-100 text-yellow-700",
	cancelled: "bg-red-100 text-red-700",
}

export function OrdersList() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore()
	const { isAuthenticated } = useAuthStore()
	const [togglingId, setTogglingId] = useState<number | string | null>(null)

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const data = await ordersService.getMyOrders();
			setOrders(data.orders || []);
		} catch (error) {
			console.error("Failed to fetch orders:", error);
			toast({ title: "Error", description: "Failed to load orders. Please try again.", variant: "destructive" })
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	const handleWishlistToggle = async (productId: number | string, e: React.MouseEvent) => {
		e.preventDefault()
		if (!isAuthenticated) {
			toast({ title: "Please login", description: "You need to be logged in to manage your wishlist" })
			return
		}

		setTogglingId(productId)
		try {
			if (isInWishlist(Number(productId))) {
				await removeFromWishlist(Number(productId))
			} else {
				await addToWishlist(Number(productId))
			}
		} finally {
			setTogglingId(null)
		}
	}

	if (loading) {
		return <div className="text-center py-10 text-[#8B6F47] flex items-center justify-center gap-2">
			<Loader2 className="h-5 w-5 animate-spin" />
			Loading orders...
		</div>;
	}

	if (orders.length === 0 && !loading) {
		return (
			<div className="text-center py-10 text-[#8B6F47] space-y-4">
				<p>No orders found.</p>
				<Button 
					variant="outline" 
					onClick={fetchOrders}
					className="border-[#E8DCC8] hover:bg-[#F5F1E8]"
				>
					Refresh Orders
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold text-[#6B4423]">My Orders ({orders.length})</h2>
				<Button 
					variant="ghost" 
					size="sm" 
					onClick={fetchOrders}
					disabled={loading}
					className="text-[#2D5F3F] hover:bg-[#2D5F3F]/10"
				>
					{loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
					Refresh
				</Button>
			</div>
			{orders.map((order) => (
				<Card key={order.id} className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
					<CardContent className="p-6 space-y-4">
						{/* Order Header */}
						<div className="flex items-start justify-between">
							<div>
								<h3 className="font-semibold text-lg mb-1 text-[#6B4423]">{order.orderNumber}</h3>
								<p className="text-sm text-[#8B6F47]">Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
							</div>
							<Badge className={cn(statusClasses[order.status] || 'bg-gray-100', "border-0 capitalize")}>{order.status}</Badge>
						</div>

						{/* Order Items */}
						<div className="space-y-3">
							{(order.items || []).map((item, index) => (
								<div key={`${order.id}-${item.id || item.product_id || 'item'}-${index}`} className="flex gap-4">
									<div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md bg-[#F5F1E8] border-2 border-[#E8DCC8]">
										<img
											src={item.image || item.image_url || "/placeholder.svg"}
											alt={item.productName}
											className="object-cover w-full h-full"
										/>
									</div>
									<div className="flex-1 flex items-start justify-between">
										<div>
											<p className="font-medium text-[#6B4423]">{item.productName}</p>
											<p className="text-sm text-[#8B6F47]">
												{item.variantName} × {item.quantity}
											</p>
										</div>
										<button
											onClick={(e) => handleWishlistToggle(item.product_id || (index + 1), e)}
											className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
											title={isInWishlist(Number(item.product_id || (index + 1))) ? "Remove from wishlist" : "Add to wishlist"}
										>
											{togglingId === (item.product_id || (index + 1)) ? (
												<Loader2 className="h-4 w-4 animate-spin text-gray-400" />
											) : (
												<Heart
													className={cn(
														"h-4 w-4 transition-colors",
														isInWishlist(Number(item.product_id || (index + 1)))
															? "fill-red-500 text-red-500"
															: "text-gray-400 hover:text-red-500"
													)}
												/>
											)}
										</button>
									</div>
								</div>
							))}
						</div>

						{/* Order Footer */}
						<div className="flex items-center justify-between pt-4 border-t-2 border-[#E8DCC8]">
							<div>
								<p className="text-sm text-[#8B6F47]">Total Amount</p>
								<p className="font-bold text-lg text-[#2D5F3F]">₹{order.totalAmount || order.summary?.total || 0}</p>
							</div>

							<div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									asChild
									className="bg-transparent border-2 border-[#E8DCC8] hover:bg-accent"
								>
									<Link href={`/account/orders/${order.id}`}>View Details</Link>
								</Button>

								{order.status === "delivered" && (
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
