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
		// keep symmetric padding on both edges and prevent horizontal scroll
		<div className="w-full overflow-x-hidden box-border space-y-6 max-w-full lg:max-w-5xl mx-auto px-1 sm:px-6 md:px-8 lg:px-10 xl:px-12">
			{/* Quick Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="rounded-2xl border-2 border-[#E8DCC8]">
					<CardContent className="p-4 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4">
						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
							<Package className="h-6 w-6" />
						</div>
						<div className="flex-1 min-w-0 text-center sm:text-left">
							<p className="text-2xl sm:text-2xl font-semibold text-[#6B4423] truncate">
								12
							</p>
							<p className="text-xs sm:text-sm text-[#8B6F47]">
								Total Orders
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border-2 border-[#E8DCC8]">
					<CardContent className="p-4 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4">
						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
							<MapPin className="h-6 w-6" />
						</div>
						<div className="flex-1 min-w-0 text-center sm:text-left">
							<p className="text-2xl sm:text-2xl font-semibold text-[#6B4423] truncate">
								3
							</p>
							<p className="text-xs sm:text-sm text-[#8B6F47]">
								Saved Addresses
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border-2 border-[#E8DCC8]">
					<CardContent className="p-4 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4">
						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
							<Heart className="h-6 w-6" />
						</div>
						<div className="flex-1 min-w-0 text-center sm:text-left">
							<p className="text-2xl sm:text-2xl font-semibold text-[#6B4423] truncate">
								8
							</p>
							<p className="text-xs sm:text-sm text-[#8B6F47]">
								Wishlist Items
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border-2 border-[#E8DCC8]">
					<CardContent className="p-4 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4">
						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#2D5F3F]/10 text-[#2D5F3F]">
							<CreditCard className="h-6 w-6" />
						</div>
						<div className="flex-1 min-w-0 text-center sm:text-left">
							<p className="text-2xl sm:text-2xl font-semibold text-[#6B4423] truncate">
								₹8.5k
							</p>
							<p className="text-xs sm:text-sm text-[#8B6F47]">
								Total Spent
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Orders */}
			<Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
				<CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6">
					<CardTitle className="text-[#6B4423] text-center sm:text-left">
						Recent Orders
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						asChild
						className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8] w-full sm:w-auto"
					>
						<Link href="/account/orders">View All</Link>
					</Button>
				</CardHeader>

				<CardContent className="space-y-4 px-4 sm:px-6">
					{recentOrders.map((order) => (
						<div
							key={order.id}
							className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-2 border-[#E8DCC8] rounded-xl min-w-0"
						>
							{/* left: order meta */}
							<div className="min-w-0 w-full sm:w-1/2">
								<p className="font-semibold text-[#6B4423] truncate">
									{order.orderNumber}
								</p>
								<p className="text-sm text-[#8B6F47]">
									{order.date} • {order.items} items
								</p>
							</div>

							{/* right: price + buttons aligned inline (mobile and desktop) */}
							<div className="mt-3 sm:mt-0 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end min-w-0">
								<div className="flex items-center gap-3 min-w-0">
									<div className="text-left sm:text-right min-w-0">
										<p className="font-semibold text-[#2D5F3F] truncate">
											₹{order.total}
										</p>
										<div className="mt-2 sm:mt-1">
											{order.status === "Delivered" ? (
												<Badge className="bg-[#2D5F3F]/10 text-[#2D5F3F] border-0">
													{order.status}
												</Badge>
											) : (
												<Badge className="bg-[#FF7E00]/10 text-[#FF7E00] border-0">
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
										className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8] whitespace-nowrap"
									>
										<Link href={`/account/orders/${order.id}`}>View</Link>
									</Button>
									<Button
										size="sm"
										asChild
										className="bg-[#2D5F3F] hover:bg-[#234A32] text-white whitespace-nowrap"
									>
										<Link href={`/account/orders/${order.id}/review`}>
											Write Review
										</Link>
									</Button>
								</div>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Account Details */}
			<Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
				<CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6">
					<CardTitle className="text-[#6B4423] text-center sm:text-left">
						Account Details
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						asChild
						className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8] w-full sm:w-auto"
					>
						<Link href="/account/settings">Edit</Link>
					</Button>
				</CardHeader>
				<CardContent className="space-y-4 px-4 sm:px-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center sm:text-left">
						<div>
							<p className="text-sm text-[#8B6F47] mb-1">Full Name</p>
							<p className="font-medium text-[#6B4423]">John Doe</p>
						</div>
						<div>
							<p className="text-sm text-[#8B6F47] mb-1">Email</p>
							<p className="font-medium text-[#6B4423] break-words">
								john@example.com
							</p>
						</div>
						<div>
							<p className="text-sm text-[#8B6F47] mb-1">Phone</p>
							<p className="font-medium text-[#6B4423]">+91 1234567890</p>
						</div>
						<div>
							<p className="text-sm text-[#8B6F47] mb-1">Member Since</p>
							<p className="font-medium text-[#6B4423]">January 2024</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}