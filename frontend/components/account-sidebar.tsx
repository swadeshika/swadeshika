"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { User, Package, MapPin, Heart, Settings, LogOut, Star } from "lucide-react"
import { authService } from "@/lib/authService"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const menuItems = [
	{ icon: User, label: "Account Overview", href: "/account" },
	{ icon: Package, label: "My Orders", href: "/account/orders" },
	{ icon: Star, label: "Write Reviews", href: "/account/reviews" },
	{ icon: MapPin, label: "Addresses", href: "/account/addresses" },
	{ icon: Heart, label: "Wishlist", href: "/account/wishlist" },
	{ icon: Settings, label: "Settings", href: "/account/settings" },
]

export function AccountSidebar() {
	const pathname = usePathname()
	const [user, setUser] = useState<{ name: string; email: string } | null>(null)

	useEffect(() => {
		const loadUser = async () => {
			try {
				const userData = await authService.getCurrentUser()
				if (userData) {
					setUser(userData)
				}
			} catch (error) {
				console.error("Failed to load user for sidebar", error)
			}
		}
		loadUser()
	}, [])

	return (
		// make sidebar full-width on small screens and fixed-width on md+ to avoid overflow
		<Card className="w-full md:w-auto sticky top-24 rounded-2xl border-2 border-[#E8DCC8] box-border">
			<CardContent className="p-4 sm:p-6 max-[370px]:p-3 space-y-6 box-border">
				<div className="space-y-1">
					<h3 className="font-semibold text-lg max-[370px]:text-base text-[#6B4423] truncate">
						{user ? user.name : "Loading..."}
					</h3>
					<p className="text-sm max-[370px]:text-sm text-[#8B6F47] truncate">
						{user ? user.email : "..."}
					</p>
				</div>

				<Separator className="bg-[#E8DCC8]" />

				<nav className="space-y-1 w-full">
					{menuItems.map((item) => {
						const isActive = pathname === item.href
						return (
							// keep each menu item on its own line (full width) but responsive
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors border-2 w-full min-w-0 ${isActive
										? "bg-[#2D5F3F] text-white border-[#2D5F3F]"
										: "border-[#E8DCC8] hover:bg-[#F5F1E8] text-[#6B4423]"
									}`}
								aria-current={isActive ? "page" : undefined}
							>
								<item.icon className="h-5 w-5 max-[370px]:h-4 max-[370px]:w-4 flex-shrink-0" />
								<span className="text-sm max-[370px]:text-sm font-medium truncate">
									{item.label}
								</span>
							</Link>
						)
					})}
				</nav>
				<Separator className="bg-[#E8DCC8]" />

				<Button
					variant="ghost"
					className="w-full justify-start gap-3 text-destructive hover:text-white"
				>
					<LogOut className="h-5 w-5 max-[370px]:h-4 max-[370px]:w-4" />
					<span className="text-sm max-[370px]:text-sm font-medium truncate">Sign Out</span>
				</Button>
			</CardContent>
		</Card>
	)
}
