"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { authService } from "@/lib/authService"

export function AuthInitializer() {
  const setUser = useAuthStore((state) => state.setUser)
  
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const user = await authService.getCurrentUser()
          setUser(user)
        } catch (error) {
          console.error("Failed to restore session:", error)
          localStorage.removeItem('accessToken')
        }
      }
    }
    initAuth()
  }, [setUser])

  return null
}
