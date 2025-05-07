// Base URL for all API requests
const API_BASE_URL = "https://api.kswofficial.fr/api"

// Helper function for making API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  // Get token from localStorage if available
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // Set default headers
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Parse the JSON response
    const data = await response.json()

    // If the response is not ok, throw an error
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong")
    }

    return data
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

// Authentication APIs
export async function login(username: string, password: string) {
  return fetchAPI("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })
}

export async function register(username: string, password: string) {
  return fetchAPI("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })
}

export async function getUserProfile() {
  return fetchAPI("/auth/profile")
}

// Battle APIs
export async function getBattleCards() {
  return fetchAPI("/battles/cards")
}

export async function voteOnBattle(card1Id: string, card2Id: string, winnerId: string) {
  return fetchAPI("/battles/vote", {
    method: "POST",
    body: JSON.stringify({ card1Id, card2Id, winnerId }),
  })
}

export async function getBattleHistory() {
  return fetchAPI("/battles/history")
}

export async function getTopRankedCards(limit = 10, seasonId?: number) {
  const params = new URLSearchParams()
  if (limit) params.append("limit", limit.toString())
  if (seasonId) params.append("seasonId", seasonId.toString())

  return fetchAPI(`/battles/top-cards?${params.toString()}`)
}

// Card APIs
export async function getUserCards() {
  return fetchAPI("/cards")
}

export async function getCardByType(type: string) {
  return fetchAPI(`/cards/type/${type}`)
}

// Update the openPack function to store new cards in localStorage
export async function openPack() {
  try {
    const result = await fetchAPI("/cards/open-pack", { method: "POST" })

    // Store the new cards in localStorage for the new-cards page
    if (result.cards && typeof window !== "undefined") {
      localStorage.setItem("newCards", JSON.stringify(result.cards))
    }

    return result
  } catch (error) {
    console.error("Error opening pack:", error)
    throw error
  }
}

export async function claimDailyPack() {
  return fetchAPI("/cards/claim-daily", { method: "POST" })
}

// Season APIs
export async function getCurrentSeason() {
  return fetchAPI("/seasons/current")
}

export async function getSeasonLeaderboard(seasonId: number) {
  return fetchAPI(`/seasons/${seasonId}/leaderboard`)
}

// Trainer APIs
export async function getTopTrainers(limit = 100) {
  return fetchAPI(`/trainers/top?limit=${limit}`)
}

// Trade APIs
export async function getTradeOffers() {
  return fetchAPI("/trades/offers")
}

export async function createTradeOffer(offeredCardId: string, requestedCardId?: string, askingPrice?: number) {
  return fetchAPI("/trades/create", {
    method: "POST",
    body: JSON.stringify({
      offeredCardId,
      ...(requestedCardId ? { requestedCardId } : {}),
      ...(askingPrice ? { askingPrice } : {}),
    }),
  })
}

export async function acceptTradeOffer(tradeId: string) {
  return fetchAPI("/trades/accept", {
    method: "POST",
    body: JSON.stringify({ tradeId }),
  })
}

export async function cancelTradeOffer(tradeId: string) {
  return fetchAPI("/trades/cancel", {
    method: "POST",
    body: JSON.stringify({ tradeId }),
  })
}

export async function getTradeHistory() {
  return fetchAPI("/trades/history")
}

// Helper function to check if token is valid
export async function validateToken() {
  try {
    await getUserProfile()
    return true
  } catch (error) {
    // If there's an error, the token is invalid or expired
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
    return false
  }
}

// Get trainer's cards
export async function getTrainerCards(trainerId: string) {
  return fetchAPI(`/trainers/${trainerId}/cards`)
}
