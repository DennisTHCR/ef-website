"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { getTradeOffers, acceptTradeOffer, cancelTradeOffer } from "@/utils/api-service"
import { toast } from "sonner"

interface TradeOffer {
  id: string
  offeredBy: {
    id: string
    username: string
  }
  offeredTo: {
    id: string
    username: string
  }
  offeredCard: {
    id: string
    type: string
    level: number
  }
  requestedCard?: {
    id: string
    type: string
    level: number
  }
  askingPrice: number
  status: string
  createdAt: string
}

export default function TradeOffersPage() {
  const { isAuthenticated, isLoading, user, refreshUserData } = useAuth()
  const [trades, setTrades] = useState<TradeOffer[]>([])
  const [isLoadingTrades, setIsLoadingTrades] = useState(true)
  const [processingTradeId, setProcessingTradeId] = useState<string | null>(null)
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch trade offers
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchTradeOffers()
    }
  }, [isAuthenticated, isLoading])

  async function fetchTradeOffers() {
    setIsLoadingTrades(true)
    try {
      const data = await getTradeOffers()
      setTrades(data.trades || [])
    } catch (error) {
      console.error("Failed to fetch trade offers:", error)
      toast.error("Failed to load trade offers")
    } finally {
      setIsLoadingTrades(false)
    }
  }

  async function handleAcceptTrade(tradeId: string) {
    setProcessingTradeId(tradeId)
    try {
      await acceptTradeOffer(tradeId)
      toast.success("Trade accepted successfully!")
      await refreshUserData()
      await fetchTradeOffers()
    } catch (error) {
      console.error("Failed to accept trade:", error)
      toast.error("Failed to accept trade")
    } finally {
      setProcessingTradeId(null)
    }
  }

  async function handleCancelTrade(tradeId: string) {
    setProcessingTradeId(tradeId)
    try {
      await cancelTradeOffer(tradeId)
      toast.success("Trade canceled successfully!")
      await fetchTradeOffers()
    } catch (error) {
      console.error("Failed to cancel trade:", error)
      toast.error("Failed to cancel trade")
    } finally {
      setProcessingTradeId(null)
    }
  }

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return null // Don't render anything while checking auth or redirecting
  }

  return (
    <main className="min-h-screen bg-[#fffcb2] flex flex-col">
      <Header />

      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        <div className="bg-[#fffcb2] border-2 border-black">
          <div className="p-4 border-b-2 border-black">
            <h2 className="text-4xl font-bold font-pixel text-center">TRADE OFFERS</h2>
          </div>

          {isLoadingTrades ? (
            <div className="p-4 text-xl font-bold font-pixel text-center">LOADING TRADES...</div>
          ) : trades.length > 0 ? (
            <div className="divide-y-2 divide-black">
              {trades.map((trade) => {
                const isUserOfferer = trade.offeredBy.id === user?.id
                const isProcessing = processingTradeId === trade.id

                return (
                  <div key={trade.id} className="p-4 font-pixel">
                    <div className="mb-2">
                      <span className="font-bold">
                        {isUserOfferer ? "YOUR OFFER TO" : "OFFER FROM"}:{" "}
                        {isUserOfferer ? trade.offeredTo.username : trade.offeredBy.username}
                      </span>
                    </div>

                    <div className="mb-1">
                      <span className="font-bold">OFFERING: </span>
                      {trade.offeredCard.type} (Level {trade.offeredCard.level})
                    </div>

                    {trade.requestedCard ? (
                      <div className="mb-1">
                        <span className="font-bold">FOR: </span>
                        {trade.requestedCard.type} (Level {trade.requestedCard.level})
                      </div>
                    ) : (
                      <div className="mb-1">
                        <span className="font-bold">ASKING PRICE: </span>
                        {trade.askingPrice} COINS
                      </div>
                    )}

                    <div className="mb-2">
                      <span className="font-bold">DATE: </span>
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </div>

                    <div className="mt-2 flex justify-end gap-2">
                      {isUserOfferer ? (
                        <button
                          className="px-4 py-2 bg-[#f7e8d4] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-pixel disabled:opacity-50"
                          onClick={() => handleCancelTrade(trade.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "PROCESSING..." : "CANCEL"}
                        </button>
                      ) : (
                        <button
                          className="px-4 py-2 bg-[#f7e8d4] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-pixel disabled:opacity-50"
                          onClick={() => handleAcceptTrade(trade.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "PROCESSING..." : "ACCEPT"}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-4 text-xl font-bold font-pixel text-center">NO TRADE OFFERS AVAILABLE</div>
          )}
        </div>
      </div>
    </main>
  )
}
