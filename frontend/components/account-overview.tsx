"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Package, MapPin, Heart, CreditCard, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/lib/authService"
import { ordersService } from "@/lib/services/ordersService"
import { addressService } from "@/lib/services/addressService"
import { useWishlistStore } from "@/lib/wishlist-store"

export function AccountOverview() {
	const [user, setUser] = useState<any>(null)
	const [recentOrders, setRecentOrders] = useState<any[]>([])
	const [stats, setStats] = useState({
		totalOrders: 0,
		savedAddresses: 0,
		totalSpent: 0
	})
	const [loading, setLoading] = useState(true)
	const wishlistItems = useWishlistStore((state) => state.items)
	const fetchWishlist = useWishlistStore((state) => state.fetchWishlist)

	useEffect(() => {
		const loadData = async () => {
			try {
				// 1. User
				const userData = await authService.getCurrentUser()
				setUser(userData)

				// 2. Orders (Recent & Stats)
				// Fetch recent for list
				const recentRes = await ordersService.getMyOrders({ limit: 5 })

				// Fetch more for stats calculation (interim solution)
				const allOrdersRes = await ordersService.getMyOrders({ limit: 100 })

				const recent = recentRes.orders.map(o => ({
					id: o.id,
					orderNumber: o.orderNumber,
					date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date',
					status: o.status.charAt(0).toUpperCase() + o.status.slice(1), // Capitalize
					total: parseFloat(o.totalAmount || "0"),
					items: o.items?.length || 0 // approximate item count from list view if available, otherwise 0
				}))
				setRecentOrders(recent)

				const totalSpent = allOrdersRes.orders.reduce((acc, curr) => acc + parseFloat(curr.totalAmount || "0"), 0)

				// 3. Addresses
				const addresses = await addressService.getAddresses()

				setStats({
					totalOrders: recentRes.pagination.total,
					savedAddresses: addresses.length,
					totalSpent: totalSpent
				})

				// 4. Wishlist
				await fetchWishlist()

			} catch (e) {
				console.error("Failed to load account overview", e)
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [fetchWishlist])

	if (loading) {
		return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-[#2D5F3F]" /></div>
	}

	return (
		// keep symmetric padding and prevent horizontal scroll; overall sizes reduced
		<div className="space-y-6">
			{/* Quick Stats */}
			<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="rounded-2xl border-2 border-[#E8DCC8]">
					<CardContent className="p-6 flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
							<Package className="h-6 w-6" />
						</div>
						<div>
							<p className="text-2xl font-bold text-[#6B4423]">{stats.totalOrders}</p>
							<p className="text-sm text-[#8B6F47]">Total Orders</p>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border-2 border-[#E8DCC8]">
					<CardContent className="p-6 flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
							<MapPin className="h-6 w-6" />
						</div>
						<div>
							<p className="text-2xl font-bold text-[#6B4423]">{stats.savedAddresses}</p>
							<p className="text-sm text-[#8B6F47]">Saved Addresses</p>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border-2 border-[#E8DCC8]">
					<CardContent className="p-6 flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
							<Heart className="h-6 w-6" />
						</div>
						<div>
							<p className="text-2xl font-bold text-[#6B4423]">{wishlistItems.length}</p>
							<p className="text-sm text-[#8B6F47]">Wishlist Items</p>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border-2 border-[#E8DCC8]">
					<CardContent className="p-6 flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
							<CreditCard className="h-6 w-6" />
						</div>
						<div>
							<p className="text-2xl font-bold text-[#6B4423]">₹{stats.totalSpent.toLocaleString()}</p>
							<p className="text-sm text-[#8B6F47]">Total Spent</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Orders */}
			<Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
				{/* header: title left, small "View All" button inline at the right */}
				<CardHeader className="px-4 sm:px-6">
					<div className="flex items-center justify-between gap-4">
						<CardTitle className="text-[#6B4423] text-lg ">Recent Orders</CardTitle>
						<Button
							variant="outline"
							size="sm"
							asChild
							className="bg-transparent border-2 border-[#E8DCC8] hover:bg-accent px-2 py-1 text-sm"
						>
							<Link href="/account/orders">View All</Link>
						</Button>
					</div>
				</CardHeader>

				<CardContent className="space-y-3 px-3 sm:px-4">
					{recentOrders.length === 0 ? (
						<div className="text-center py-8 text-[#8B6F47]">No orders found.</div>
					) : (
						recentOrders.map((order) => (
							<div key={order.id} className="w-full max-w-2xl lg:max-w-none mx-auto">
								{/* mobile: stacked; large: full-width row with left meta and right price/buttons */}
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between lg:flex-row lg:items-center lg:justify-between gap-2 p-3 lg:px-6 border-2 border-[#E8DCC8] rounded-lg min-w-0">
									{/* left: order meta */}
									<div className="min-w-0 w-full sm:w-1/2 lg:w-2/3 text-center sm:text-left">
										<p className="font-semibold text-[#6B4423] truncate text-base">
											{order.orderNumber}
										</p>
										<p className="text-sm text-[#8B6F47]">
											{order.date} • {order.items} items
										</p>
									</div>

									{/* right: price + buttons (keep button alignment intact) */}
									<div className="mt-2 sm:mt-0 flex items-center gap-2 w-full sm:w-auto lg:w-1/3 justify-center sm:justify-end lg:justify-end min-w-0">
										<div className="flex items-center gap-2 min-w-0">
											<div className="text-center sm:text-right min-w-0">
												<p className="font-semibold text-[#2D5F3F] truncate text-sm">
													₹{order.total.toLocaleString()}
												</p>
												<div className="mt-1 sm:mt-1 flex justify-center sm:justify-end">
													{order.status === "Delivered" ? (
														<Badge className="bg-[#2D5F3F]/10 text-[#2D5F3F] border-0 text-[11px]">
															{order.status}
														</Badge>
													) : (
														<Badge className="bg-[#FF7E00]/10 text-[#FF7E00] border-0 text-[11px]">
															{order.status}
														</Badge>
													)}
												</div>
											</div>
										</div>

										<div className="flex flex-row gap-2 items-center flex-shrink-0">
											<Button
												variant="outline"
												size="sm"
												asChild
												className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8] whitespace-nowrap text-sm px-3 py-1 hover:bg-accent"
											>
												<Link href={`/account/orders/${order.id}`}>View</Link>
											</Button>
											<Button
												size="sm"
												asChild
												className="bg-[#2D5F3F] hover:bg-[#234A32] text-white whitespace-nowrap text-sm px-3 py-1"
											>
												<Link href={`/account/orders/${order.id}/review`}>
													Write Review
												</Link>
											</Button>
										</div>
									</div>
								</div>
							</div>
						)))}
				</CardContent>
			</Card>

			{/* Account Details */}
			<Card className="rounded-xl py-3 border-2 border-[#E8DCC8]">
				{/* keep title and edit button on same row */}
				<CardHeader className="flex items-center justify-between gap-3 px-3 sm:px-4">
					<CardTitle className="text-[#6B4423] text-base">
						Account Details
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						asChild
						className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8] text-sm px-3 py-1 hover:bg-accent"
					>
						<Link href="/account/settings">Edit</Link>
					</Button>
				</CardHeader>
				<CardContent className="space-y-3 px-3 sm:px-4">
					<div className="grid sm:grid-cols-2 gap-6">
						<div>
							<p className="text-sm text-[#8B6F47] mb-1">Full Name</p>
							<p className="font-medium text-[#6B4423]">{user?.name || "N/A"}</p>
						</div>
						<div>
							<p className="text-sm text-[#8B6F47] mb-1">Email</p>
							<p className="font-medium text-[#6B4423] break-words">
								{user?.email || "N/A"}
							</p>
						</div>
						<div>
							<p className="text-sm text-[#8B6F47] mb-1">Phone</p>
							<p className="font-medium text-[#6B4423]">{user?.phone || user?.phone_number || "N/A"}</p>
						</div>
						<div>
							<p className="text-sm text-[#8B6F47] mb-1">Member Since</p>
							<p className="font-medium text-[#6B4423]">{user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: 'long', year: 'numeric' }) : "Unknown"}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}