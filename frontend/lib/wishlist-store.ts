import { create } from "zustand"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { toast } from "@/hooks/use-toast"

export interface WishlistItem {
     wishlist_id: number
     product_id: number
     added_at: string
     name: string
     slug: string
     price: number
     compare_price: number | null
     in_stock: boolean // backend returns 0 or 1, might need conversion if typed strictly, but let's see
     image_url: string
}

interface WishlistState {
     items: WishlistItem[]
     isLoading: boolean
     fetchWishlist: () => Promise<void>
     addToWishlist: (productId: number) => Promise<boolean>
     removeFromWishlist: (productId: number) => Promise<boolean>
     moveToCart: (item: WishlistItem) => Promise<boolean>
     isInWishlist: (productId: number) => boolean
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
     items: [],
     isLoading: false,

     fetchWishlist: async () => {
          // Only fetch if authenticated
          if (!useAuthStore.getState().isAuthenticated) {
               set({ items: [] })
               return
          }

          set({ isLoading: true })
          try {
               const response = await api.get<any>("/wishlist")
               // Extract data from the standardized { success, data } format
               const items = response.data.data || []
               set({ items: Array.isArray(items) ? items : [] })
          } catch (error) {
               console.error("Failed to fetch wishlist:", error)
          } finally {
               set({ isLoading: false })
          }
     },

     addToWishlist: async (productId: number) => {
          if (!useAuthStore.getState().isAuthenticated) {
               toast({ title: "Please login", description: "You need to be logged in to add to wishlist" })
               return false
          }

          // Optimistic update? Or wait for success?
          // Let's wait for success to get the correct wishlist_id if we needed it, 
          // but actually we just need to know it's there.

          try {
               await api.post("/wishlist", { productId })
               // Refresh list to get full details (images etc)
               await get().fetchWishlist()
               toast({ title: "Added to wishlist" })
               return true
          } catch (error: any) {
               if (error.message === 'Product already in wishlist') {
                    toast({ title: "Already in wishlist" })
                    return true
               }
               console.error("Failed to add to wishlist:", error)
               toast({ title: "Error", description: "Failed to add to wishlist", variant: "destructive" })
               return false
          }
     },

     removeFromWishlist: async (productId: number) => {
          if (!useAuthStore.getState().isAuthenticated) return false

          // Optimistic update
          const previousItems = get().items
          set({ items: previousItems.filter((i) => i.product_id !== productId) })

          try {
               await api.delete(`/wishlist/${productId}`)
               toast({ title: "Removed from wishlist" })
               return true
          } catch (error) {
               console.error("Failed to remove from wishlist:", error)
               set({ items: previousItems }) // Revert
               toast({ title: "Error", description: "Failed to remove from wishlist", variant: "destructive" })
               return false
          }
     },

     moveToCart: async (item: WishlistItem) => {
          // Import useCartStore dynamically to avoid circular dependencies if any
          const { useCartStore } = await import("./cart-store")
          const cartStore = useCartStore.getState()

          // 1. Add to cart
          cartStore.addItem({
               id: item.product_id,
               name: item.name,
               price: item.price,
               image: item.image_url,
               category: "", // Or item.category if available
          })

          // 2. Remove from wishlist
          const success = await get().removeFromWishlist(item.product_id)

          if (success) {
               toast({
                    title: "Moved to cart",
                    description: `${item.name} has been moved to your shopping cart.`,
               })
          }

          return success
     },

     isInWishlist: (productId: number) => {
          return get().items.some((item) => item.product_id === productId)
     },
}))
