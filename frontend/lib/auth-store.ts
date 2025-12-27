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
 * - Integration with backend auth APIs
 *
 * Roles:
 * - customer: Regular users who can browse and purchase products
 * - admin: Administrators who can manage products, orders, and customers
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authService } from "./authService"

// Define user roles for role-based access control
export type UserRole = "customer" | "admin"

// User interface defining the structure of authenticated user data
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
}

// Authentication state interface
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; role: UserRole; error?: string }>
  logout: () => Promise<void>
  setUser: (user: User) => void
  setInitialized: (val: boolean) => void
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; role: UserRole; error?: string }>
}

/**
 * Authentication store using Zustand
 * Persists authentication state to localStorage for session management
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      /**
       * Login function
       * Authenticates user with backend API and determines their role
       *
       * @param email - User's email address
       * @param password - User's password
       * @returns Promise with success status and user role
       */
      login: async (email: string, password: string) => {
        try {
          const response = await authService.login({ email, password })

          // Set user in store
          set({
            user: response.user,
            isAuthenticated: true,
          })

          return { success: true, role: response.user.role }
        } catch (error: any) {
          console.error('Login error:', error)

          // Clear any existing auth state on error
          set({
            user: null,
            isAuthenticated: false,
          })

          return {
            success: false,
            role: "customer" as UserRole,
            error: error.errors?.[0]?.message || error.message || "Login failed"
          }
        }
      },

      /**
       * Register function
       * Creates a new user account
       *
       * @param name - User's full name
       * @param email - User's email address
       * @param password - User's password
       * @param phone - Optional phone number
       * @returns Promise with success status and user role
       */
      register: async (name: string, email: string, password: string, phone?: string) => {
        try {
          const response = await authService.register({ name, email, password, phone })

          // Set user in store
          set({
            user: response.user,
            isAuthenticated: true,
          })

          return { success: true, role: response.user.role }
        } catch (error: any) {
          console.error('Registration error:', error)

          return {
            success: false,
            role: "customer" as UserRole,
            error: error.errors?.[0]?.message || error.message || "Registration failed"
          }
        }
      },

      /**
       * Logout function
       * Clears user session and authentication state
       */
      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Always clear store
          set({
            user: null,
            isAuthenticated: false,
          })
        }
      },

      /**
       * Set user function
       * Manually set user data (useful for profile updates)
       */
      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
        })
      },

      setInitialized: (val: boolean) => {
        set({ isInitialized: val })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
