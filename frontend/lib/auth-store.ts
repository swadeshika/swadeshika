/**
 * Authentication Store
 *
 * Purpose: Manages user authentication state and role-based access control
 *
 * Features:
 * - User login/logout functionality
 * - Role-based authentication (customer vs admin)
 * - Persistent authentication state
 * - User profile management
 *
 * Roles:
 * - customer: Regular users who can browse and purchase products
 * - admin: Administrators who can manage products, orders, and customers
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Define user roles for role-based access control
export type UserRole = "customer" | "admin"

// User interface defining the structure of authenticated user data
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

// Authentication state interface
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; role: UserRole }>
  logout: () => void
  setUser: (user: User) => void
}

/**
 * Demo credentials for testing
 * In production, this would be replaced with actual API authentication
 */
const DEMO_USERS = {
  admin: {
    email: "admin@swadeshika.com",
    password: "admin123",
    user: {
      id: "1",
      email: "admin@swadeshika.com",
      name: "Admin User",
      role: "admin" as UserRole,
    },
  },
  customer: {
    email: "customer@example.com",
    password: "customer123",
    user: {
      id: "2",
      email: "customer@example.com",
      name: "Customer User",
      role: "customer" as UserRole,
    },
  },
}

/**
 * Authentication store using Zustand
 * Persists authentication state to localStorage for session management
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      /**
       * Login function
       * Authenticates user and determines their role
       *
       * @param email - User's email address
       * @param password - User's password
       * @returns Promise with success status and user role
       */
      login: async (email: string, password: string) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check admin credentials
        if (email === DEMO_USERS.admin.email && password === DEMO_USERS.admin.password) {
          set({
            user: DEMO_USERS.admin.user,
            isAuthenticated: true,
          })
          return { success: true, role: "admin" as UserRole }
        }

        // Check customer credentials or allow any other email as customer
        if (email === DEMO_USERS.customer.email && password === DEMO_USERS.customer.password) {
          set({
            user: DEMO_USERS.customer.user,
            isAuthenticated: true,
          })
          return { success: true, role: "customer" as UserRole }
        }

        // Default: treat any other valid email as customer
        if (email && password) {
          const customerUser = {
            id: Date.now().toString(),
            email,
            name: email.split("@")[0],
            role: "customer" as UserRole,
          }
          set({
            user: customerUser,
            isAuthenticated: true,
          })
          return { success: true, role: "customer" as UserRole }
        }

        return { success: false, role: "customer" as UserRole }
      },

      /**
       * Logout function
       * Clears user session and authentication state
       */
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        })
      },

      /**
       * Set user function
       * Manually set user data (useful for registration or profile updates)
       */
      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
        })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
