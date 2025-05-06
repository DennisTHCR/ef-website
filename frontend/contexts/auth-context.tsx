"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { login as apiLogin, getUserProfile, validateToken } from "@/utils/api-service"

interface User {
  id: string
  username: string
  coins: number
  rating: number
  lastPackClaim?: string
  packs?: any[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing token and load user data on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        const isValid = await validateToken()
        if (isValid) {
          await loadUserData()
        } else {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  async function loadUserData() {
    setIsLoading(true)
    try {
      const data = await getUserProfile()
      setUser(data.user)
    } catch (error) {
      console.error("Failed to load user data:", error)
      localStorage.removeItem("token")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(username: string, password: string) {
    setIsLoading(true)
    try {
      const data = await apiLogin(username, password)
      localStorage.setItem("token", data.token)
      setUser(data.user)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem("token")
    setUser(null)
  }

  async function refreshUserData() {
    return loadUserData()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
