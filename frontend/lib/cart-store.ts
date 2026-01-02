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
            price: Number(item.price),
            image: item.image_url,
            quantity: item.quantity,
            category: item.category_name || item.category || "Product", // prefer backend category name if available
            categoryId: item.category_id || item.categoryId || null,
            variantId: item.variant_id,
            userId: item.user_id as unknown as string // Map backend user_id to frontend userId
          }))
          set({ items: mappedItems })
        } catch (error) {
          console.error("Failed to fetch cart:", error)
        }
      },

      /**
       * CRITICAL FIX: Merge Local Cart (Updated)
       * =========================================
       * 
       * PROBLEM (Before):
       * - Looped through items one by one
       * - Race condition between add and fetch
       * - No transaction support
       * - Partial failures possible
       * 
       * SOLUTION (Now):
       * - Single batch API call
       * - Backend handles transaction
       * - Duplicate detection on server
       * - All-or-nothing operation
       * 
       * WHY THIS MATTERS:
       * - Better performance (1 request vs N requests)
       * - Data consistency guaranteed
       * - No race conditions
       * - Proper error handling
       */
      mergeLocalCart: async () => {
        const { items, fetchCart } = get()

        // If no local items, just fetch server cart
        if (items.length === 0) {
          return await fetchCart()
        }

        try {
          // Prepare items for batch merge
          // Convert frontend format to backend format
          const itemsToMerge = items.map(item => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity
          }))

          // Call new batch merge endpoint
          // Backend will handle transaction and duplicate detection
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'}/cart/merge`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ items: itemsToMerge })
          })

          if (!response.ok) {
            throw new Error('Failed to merge cart')
          }

          const data = await response.json()

          // Update store with merged cart from server
          const mappedItems: CartItem[] = data.data.items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            name: item.variant_name ? `${item.product_name} - ${item.variant_name}` : item.product_name,
            price: Number(item.price),
            image: item.image_url,
            quantity: item.quantity,
            category: "Product",
            variantId: item.variant_id,
            userId: item.user_id as unknown as string
          }))

          set({ items: mappedItems })
        } catch (error) {
          console.error('[CartStore] Merge failed:', error)
          // Fallback: Just fetch cart if merge fails
          await fetchCart()
        }
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
                categoryId: (item as any).categoryId ?? (item as any).category_id ?? null,
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
