import Link from "next/link"
import { Package, MapPin, Heart, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const recentOrders = [
	{
		id: "1",
		orderNumber: "ORD-20250116-1234",
		date: "Jan 16, 2025",
		status: "Delivered",
		total: 1880,
		items: 2,
	},
	{
		id: "2",
		orderNumber: "ORD-20250110-5678",
		date: "Jan 10, 2025",
		status: "Shipped",
		total: 650,
		items: 1,
	},
]

export function AccountOverview() {
	return (
		// keep symmetric padding and prevent horizontal scroll; overall sizes reduced
		<div className="w-full overflow-x-hidden box-border space-y-4 max-w-full lg:max-w-4xl mx-auto px-2 sm:px-4 md:px-6">
			{/* Quick Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
				<Card className="rounded-xl border-2 border-[#E8DCC8]">
					<CardContent className="p-3 flex flex-col sm:flex-row items-center gap-2">
						<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
							<Package className="h-4 w-4" />
						</div>
						<div className="flex-1 min-w-0 text-center sm:text-left">
							<p className="text-lg font-semibold text-[#6B4423] truncate">
								12
							</p>
							<p className="text-[11px] text-[#8B6F47]">
								Total Orders
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-xl border-2 border-[#E8DCC8]">
					<CardContent className="p-3 flex flex-col sm:flex-row items-center gap-2">
						<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
							<MapPin className="h-4 w-4" />
						</div>
						<div className="flex-1 min-w-0 text-center sm:text-left">
							<p className="text-lg font-semibold text-[#6B4423] truncate">
								3
							</p>
							<p className="text-[11px] text-[#8B6F47]">
								Saved Addresses
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-xl border-2 border-[#E8DCC8]">
					<CardContent className="p-3 flex flex-col sm:flex-row items-center gap-2">
						<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
							<Heart className="h-4 w-4" />
						</div>
						<div className="flex-1 min-w-0 text-center sm:text-left">
							<p className="text-lg font-semibold text-[#6B4423] truncate">
								8
							</p>
							<p className="text-[11px] text-[#8B6F47]">
								Wishlist Items
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-xl border-2 border-[#E8DCC8]">
					<CardContent className="p-3 flex flex-col sm:flex-row items-center gap-2">
						<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
							<CreditCard className="h-4 w-4" />
						</div>
						<div className="flex-1 min-w-0 text-center sm:text-left">
							<p className="text-lg font-semibold text-[#6B4423] truncate">
								₹8.5k
							</p>
							<p className="text-[11px] text-[#8B6F47]">
								Total Spent
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Orders */}
			<Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
				{/* header: title left, small "View All" button inline at the right */}
				<CardHeader className="px-4 sm:px-6">
					<div className="flex items-center justify-between gap-4">
						<CardTitle className="text-[#6B4423] text-sm">Recent Orders</CardTitle>
						<Button
							variant="outline"
							size="sm"
							asChild
							className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8] px-2 py-1 text-sm"
						>
							<Link href="/account/orders">View All</Link>
						</Button>
					</div>
				</CardHeader>

				<CardContent className="space-y-3 px-3 sm:px-4">
					{recentOrders.map((order) => (
						<div key={order.id} className="w-full max-w-2xl mx-auto">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border-2 border-[#E8DCC8] rounded-lg min-w-0">
								{/* left: order meta */}
								<div className="min-w-0 w-full sm:w-1/2 text-center sm:text-left">
									<p className="font-semibold text-[#6B4423] truncate text-sm">
										{order.orderNumber}
									</p>
									<p className="text-[11px] text-[#8B6F47]">
										{order.date} • {order.items} items
									</p>
								</div>

								{/* right: price + buttons (keep button alignment intact) */}
								<div className="mt-2 sm:mt-0 flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end min-w-0">
									<div className="flex items-center gap-2 min-w-0">
										<div className="text-center sm:text-right min-w-0">
											<p className="font-semibold text-[#2D5F3F] truncate text-sm">
												₹{order.total}
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
											className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8] whitespace-nowrap text-sm px-3 py-1"
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
					))}
				</CardContent>
			</Card>

			{/* Account Details */}
			<Card className="rounded-xl py-3 border-2 border-[#E8DCC8]">
				<CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-4">
					<CardTitle className="text-[#6B4423] text-center sm:text-left text-sm">
						Account Details
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						asChild
						className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8] w-full sm:w-auto text-sm px-3 py-1"
					>
						<Link href="/account/settings">Edit</Link>
					</Button>
				</CardHeader>
				<CardContent className="space-y-3 px-3 sm:px-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center sm:text-left text-sm">
						<div>
							<p className="text-[11px] text-[#8B6F47] mb-1">Full Name</p>
							<p className="font-medium text-[#6B4423]">John Doe</p>
						</div>
						<div>
							<p className="text-[11px] text-[#8B6F47] mb-1">Email</p>
							<p className="font-medium text-[#6B4423] break-words">
								john@example.com
							</p>
						</div>
						<div>
							<p className="text-[11px] text-[#8B6F47] mb-1">Phone</p>
							<p className="font-medium text-[#6B4423]">+91 1234567890</p>
						</div>
						<div>
							<p className="text-[11px] text-[#8B6F47] mb-1">Member Since</p>
							<p className="font-medium text-[#6B4423]">January 2024</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}