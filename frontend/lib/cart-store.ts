/**
 * Shopping Cart State Management with Zustand
 *
 * This store manages the global shopping cart state across the application.
 * Uses Zustand for simple, performant state management and includes
 * persistence middleware to save cart data to localStorage.
 *
 * Features:
 * - Add items to cart (increments quantity if item exists)
 * - Remove items from cart
 * - Update item quantities
 * - Clear entire cart
 * - Calculate total items count
 * - Calculate total price
 * - Persist cart data across browser sessions
 *
 * The cart data is automatically saved to localStorage and restored
 * when the user returns to the site, providing a seamless shopping experience.
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

// TypeScript interface for cart item structure
// Each item includes product details and quantity
export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number // Number of this item in cart
  category: string
}

// TypeScript interface for cart store state and actions
interface CartStore {
  items: CartItem[] // Array of all items in cart
  addItem: (item: Omit<CartItem, "quantity">) => void // Add item (quantity auto-set to 1)
  removeItem: (id: number) => void // Remove item completely from cart
  updateQuantity: (id: number, quantity: number) => void // Update item quantity
  clearCart: () => void // Empty the entire cart
  getTotalItems: () => number // Calculate total number of items
  getTotalPrice: () => number // Calculate total cart value
}

// Create Zustand store with persistence
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [], // Initial empty cart

      /**
       * Add item to cart
       * If item already exists, increment its quantity
       * If item is new, add it with quantity 1
       */
      addItem: (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.id === item.id)

        if (existingItem) {
          // Item exists - increment quantity
          set({
            items: items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
          })
        } else {
          // New item - add with quantity 1
          set({ items: [...items, { ...item, quantity: 1 }] })
        }
      },

      /**
       * Remove item from cart by ID
       * Filters out the item completely
       */
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      /**
       * Update item quantity
       * If quantity is 0 or less, remove the item
       * Otherwise, update the quantity
       */
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id) // Remove if quantity is 0 or negative
          return
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })
      },

      /**
       * Clear all items from cart
       * Useful for post-checkout cleanup
       */
      clearCart: () => set({ items: [] }),

      /**
       * Calculate total number of items in cart
       * Sums up quantities of all items
       */
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      /**
       * Calculate total price of all items in cart
       * Multiplies each item's price by its quantity and sums
       */
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: "cart-storage", // localStorage key name
      // Cart data is automatically saved to localStorage
      // and restored when the store is initialized
    },
  ),
)
