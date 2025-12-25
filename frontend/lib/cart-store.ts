/**
 * Shopping Cart State Management with Zustand
 *
 * This store manages the global shopping cart state across the application.
 * Uses Zustand for simple, performant state management and includes
 * persistence middleware to save cart data to localStorage.
 *
 * Features:
 * - Syncs with Backend API when user is logged in
 * - Fallback to LocalStorage for guest users
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { cartService } from "./services/cartService"

export interface CartItem {
  id: number // Cart Item ID (backend) OR Product ID (local)
  productId: number // Product ID
  name: string
  price: number
  image: string
  quantity: number
  category?: string
  variantId?: number | null
  userId?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity" | "id"> & { id?: number }, quantity?: number) => Promise<void>
  removeItem: (id: number) => Promise<void>
  updateQuantity: (id: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalItems: () => number
  getTotalPrice: () => number
  fetchCart: () => Promise<void> // New action to sync with backend
  mergeLocalCart: () => Promise<void> // Merge local items to backend after login
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      fetchCart: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
        if (!token) return

        try {
          const backendItems = await cartService.getCart()
          const mappedItems: CartItem[] = backendItems.map(item => ({
            id: item.id,
            productId: item.product_id,
            name: item.variant_name ? `${item.product_name} - ${item.variant_name}` : item.product_name,
            price: item.price,
            image: item.image_url,
            quantity: item.quantity,
            category: "Product", // Default as backend doesn't send category yet
            variantId: item.variant_id,
            userId: item.user_id as unknown as string // Map backend user_id to frontend userId
          }))
          set({ items: mappedItems })
        } catch (error) {
          console.error("Failed to fetch cart:", error)
        }
      },

      mergeLocalCart: async () => {
        // This would be called after login
        const { items, fetchCart } = get()
        if (items.length === 0) return await fetchCart()

        // Basic strategy: push local items to backend then fetch
        for (const item of items) {
          try {
            await cartService.addToCart({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity
            })
          } catch (e) {
            console.error("Merge error", e)
          }
        }
        // After merging, fetch fresh state
        await fetchCart()
      },

      addItem: async (item, quantity = 1) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
        const userData = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null
        let userId = null;
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            userId = parsed.state?.user?.id;
          } catch (e) {
            console.error("Failed to parse user data", e)
          }
        }

        const productId = item.productId || (item.id as number)

        if (token) {
          try {
            await cartService.addToCart({
              productId: productId,
              variantId: item.variantId,
              quantity: quantity,
              userId: userId // Adding userId as requested
            })
            await get().fetchCart()
          } catch (error) {
            console.error("Add to cart failed", error)
            throw error;
          }
        } else {
          // Local Logic
          const items = get().items
          const existingItem = items.find((i) => i.productId === productId && i.variantId === item.variantId)

          if (existingItem) {
            set({
              items: items.map((i) =>
                (i.productId === productId && i.variantId === item.variantId)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            })
          } else {
            set({
              items: [...items, {
                ...item,
                productId,
                id: productId, // In local mode, ID is ProductID
                quantity: quantity
              }]
            })
          }
        }
      },

      removeItem: async (id) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

        if (token) {
          try {
            await cartService.removeFromCart(id)
            await get().fetchCart()
          } catch (error) {
            console.error("Remove failed", error)
          }
        } else {
          set({ items: get().items.filter((i) => i.id !== id) })
        }
      },

      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          return get().removeItem(id)
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

        if (token) {
          try {
            await cartService.updateCartItem(id, quantity)
            await get().fetchCart()
          } catch (error) {
            console.error("Update failed", error)
          }
        } else {
          set({
            items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
          })
        }
      },

      clearCart: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
        if (token) {
          try {
            await cartService.clearCart()
            set({ items: [] })
          } catch (e) { console.error(e) }
        } else {
          set({ items: [] })
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
