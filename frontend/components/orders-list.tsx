import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const orders = [
  {
    id: "1",
    orderNumber: "ORD-20250116-1234",
    date: "January 16, 2025",
    status: "Delivered",
    total: 1880,
    items: [
      { name: "Pure Desi Cow Ghee", variant: "1kg", quantity: 2, image: "/golden-ghee-in-glass-jar.jpg" },
      { name: "Organic Turmeric Powder", variant: "250g", quantity: 1, image: "/turmeric-powder-in-bowl.jpg" },
    ],
  },
  {
    id: "2",
    orderNumber: "ORD-20250110-5678",
    date: "January 10, 2025",
    status: "Shipped",
    total: 650,
    items: [{ name: "Premium Kashmiri Almonds", variant: "500g", quantity: 1, image: "/kashmiri-almonds.jpg" }],
  },
  {
    id: "3",
    orderNumber: "ORD-20250105-9012",
    date: "January 5, 2025",
    status: "Processing",
    total: 320,
    items: [
      { name: "Cold Pressed Coconut Oil", variant: "1L", quantity: 1, image: "/coconut-oil-in-glass-bottle.jpg" },
    ],
  },
]

const statusClasses: Record<string, string> = {
  Delivered: "bg-[#2D5F3F]/10 text-[#2D5F3F]",
  Shipped: "bg-[#FF7E00]/10 text-[#FF7E00]",
  Processing: "bg-[#8B6F47]/10 text-[#6B4423]",
  Cancelled: "bg-red-100 text-red-700",
}

export function OrdersList() {
  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id} className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
          <CardContent className="p-6 space-y-4">
            {/* Order Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1 text-[#6B4423]">{order.orderNumber}</h3>
                <p className="text-sm text-[#8B6F47]">Placed on {order.date}</p>
              </div>
              <Badge className={`${statusClasses[order.status]} border-0`}>{order.status}</Badge>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md bg-[#F5F1E8] border-2 border-[#E8DCC8]">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#6B4423]">{item.name}</p>
                    <p className="text-sm text-[#8B6F47]">
                      {item.variant} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-[#E8DCC8]">
              <div>
                <p className="text-sm text-[#8B6F47]">Total Amount</p>
                <p className="font-bold text-lg text-[#2D5F3F]">₹{order.total}</p>
              </div>

              {/* Buttons: View Details on top, Write Review below */}
              <div className="flex flex-col items-end gap-2">
                <Button variant="outline" size="sm" asChild className="bg-transparent border-2 border-[#E8DCC8] hover:bg-[#F5F1E8]">
                  <Link href={`/account/orders/${order.id}`}>View Details</Link>
                </Button>

                {order.status === "Delivered" && (
                  <Button size="sm" asChild className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">
                    <Link href={`/account/orders/${order.id}/review`}>Write Review</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
