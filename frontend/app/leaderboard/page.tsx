"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CollapsibleHeader from "@/components/collapsible-header"
import Leaderboard from "@/components/leaderboard"
import PageBackground from "@/components/page-background"
import { useAuth } from "@/contexts/auth-context"
import { getTopRankedCards } from "@/utils/api-service"
import { useIsMobile } from "@/hooks/use-mobile"

interface LeaderboardCard {
  type: string
  teacherName: string
  subject: string
}

export default function LeaderboardPage() {
  const [topCards, setTopCards] = useState<LeaderboardCard[]>([])
  const [isLeaderLoading, setIsLeaderLoading] = useState(true)
  const isMobile = useIsMobile()

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
    <PageBackground>
      <main className="h-screen flex flex-col overflow-hidden">
        <CollapsibleHeader />

        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="bg-[#fffcb2] border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-4xl h-[80vh]">
            <div className="p-4 border-b-4 border-black bg-[#ffd080]">
              {isMobile ? (
                <h2
                  className="text-2xl font-bold font-pixel text-center"
                  style={{
                    letterSpacing: "-0.05em",
                    paddingLeft: "0.5rem",
                    paddingRight: "0.5rem",
                  }}
                >
                  LEADERBOARD
                </h2>
              ) : (
                <h2 className="text-4xl font-bold font-pixel text-center">LEADERBOARD</h2>
              )}
            </div>

            <div className="h-[calc(100%-5rem)]">
              <Leaderboard
                topCards={topCards}
                isLoading={isLeaderLoading}
                isFullPage={true}
                hideHeader={true}
                className="rounded-b-lg"
              />
            </div>
          </div>
        </div>
      </main>
    </PageBackground>
  )
}
