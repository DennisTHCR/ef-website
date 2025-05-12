"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Leaderboard from "@/components/leaderboard"
import { useAuth } from "@/contexts/auth-context"
import { getTopRankedCards } from "@/utils/api-service"

interface LeaderboardCard {
  type: string
  teacherName: string
  subject: string
}

export default function LeaderboardPage() {
  const [topCards, setTopCards] = useState<LeaderboardCard[]>()
  const [isLeaderLoading, setIsLeaderLoading] = useState(true)

  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  async function fetchLeaderboard() {
    try {
      const data = await getTopRankedCards(10)
      setTopCards(data.leaderboard || [])
      setIsLeaderLoading(false)
    } catch (error) {
      console.error("Failed to fetch top cards:", error)
    }
  }


  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
    fetchLeaderboard()
  }, [isAuthenticated, isLoading, router])

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return null // Don't render anything while checking auth or redirecting
  }

  return (
    <main className="min-h-screen bg-[#fffdd0] flex flex-col">
      <Header />

      <div className="flex-1 p-4">
        <Leaderboard topCards={topCards || []} isLoading={isLeaderLoading} isFullPage={true} />
      </div>
    </main>
  )
}
