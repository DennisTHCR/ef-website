"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Leaderboard from "@/components/leaderboard"
import { useAuth } from "@/contexts/auth-context"

export default function LeaderboardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return null // Don't render anything while checking auth or redirecting
  }

  return (
    <main className="min-h-screen bg-[#fffcb2] flex flex-col">
      <Header />

      <div className="flex-1 p-4">
        <Leaderboard isFullPage={true} />
      </div>
    </main>
  )
}
