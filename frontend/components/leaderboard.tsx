"use client"

import { useState, useEffect } from "react"

interface LeaderboardProps {
  isFullPage?: boolean,
  topCards: LeaderboardCard[],
  isLoading: boolean,
}

interface LeaderboardCard {
  type: string
  teacherName: string
  subject: string
}

export default function Leaderboard({ isFullPage = false, topCards = [], isLoading = true }: LeaderboardProps) {
  useEffect(() => {
    isLoading
  }, [])

  useEffect(() => {
    topCards
  }, [])

  return (
    <div className={`bg-[#ffe3b2] ${isFullPage ? "w-full max-w-4xl mx-auto" : "w-full h-full overflow-auto"}`}>
      <div className="bg-[#ffd080] p-4 border-b-2 border-black">
        <h2 className="text-4xl font-bold font-pixel">LEADERBOARD</h2>
      </div>
      <div className="divide-y-2 divide-black">
        {isLoading ? (
          <div className="p-4 text-xl font-bold font-pixel">LOADING...</div>
        ) : topCards.length > 0 ? (
          topCards.map((card, index) => (
            <div key={index} className="p-4 text-xl font-bold font-pixel">
              {card.teacherName}: {card.subject}
            </div>
          ))
        ) : (
          <div className="p-4 text-xl font-bold font-pixel">NO CARDS FOUND</div>
        )}
      </div>
    </div>
  )
}
