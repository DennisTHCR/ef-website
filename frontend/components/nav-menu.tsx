"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { claimDailyPack, buyPack, openPack, getTradeOffers, getUserProfile } from "@/utils/api-service"

// Define different types of menu items
type MenuItemAction =
  | { type: "link"; href: string }
  | { type: "api"; handler: () => Promise<any> }
  | { type: "display"; value: string | number }

interface MenuItem {
  id: string
  label: string
  action: MenuItemAction
  count?: string | number
  disabled?: boolean
}

export default function NavMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [menuData, setMenuData] = useState<{
    packCount: number
    tradeOffers: number
    coins: number
    canClaimDaily: boolean
  }>({
    packCount: 0,
    tradeOffers: 0,
    coins: 0,
    canClaimDaily: false,
  })
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, refreshUserData, isAuthenticated } = useAuth()

  // Fetch data when menu opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchMenuData()
    }
  }, [isOpen, isAuthenticated])

  async function fetchMenuData() {
    try {
      // Fetch user profile to get pack count and last claim date
      const profileData = await getUserProfile()

      // Check if daily pack can be claimed
      const lastClaim = profileData.user.lastPackClaim ? new Date(profileData.user.lastPackClaim) : null
      const now = new Date()
      const canClaimDaily =
        !lastClaim ||
        now.getDate() !== lastClaim.getDate() ||
        now.getMonth() !== lastClaim.getMonth() ||
        now.getFullYear() !== lastClaim.getFullYear()

      // Count unopened packs
      const packCount = profileData.user.packs ? profileData.user.packs.filter((pack: any) => !pack.isOpened).length : 0

      // Fetch trade offers
      const tradeData = await getTradeOffers()
      const tradeOffers = tradeData.trades ? tradeData.trades.length : 0

      setMenuData({
        packCount,
        tradeOffers,
        coins: profileData.user.coins || 0,
        canClaimDaily,
      })
    } catch (error) {
      console.error("Failed to fetch menu data:", error)
    }
  }

  // Define menu items with their actions
  const getMenuItems = (): MenuItem[] => [
    {
      id: "dailyPack",
      label: "DAILY PACK",
      action: {
        type: "api",
        handler: async () => {
          const result = await claimDailyPack()
          if (result) {
            toast.success("Daily pack claimed successfully!")
            await refreshUserData()
            await fetchMenuData()
          }
        },
      },
      count: "CLAIM",
      disabled: !menuData.canClaimDaily,
    },
    {
      id: "buyPack",
      label: "BUY PACK (100 COINS)",
      action: {
        type: "api",
        handler: async () => {
          const result = await buyPack()
          if (result) {
            toast.success("Bought pack successfully!")
            await refreshUserData()
            await fetchMenuData()
          }
        },
      },
      disabled: menuData.coins < 100,
    },
    {
      id: "openPack",
      label: "OPEN PACK",
      action: {
        type: "api",
        handler: async () => {
          const result = await openPack()
          if (result) {
            toast.success("Pack opened successfully!")
            router.push("/new-cards")
          }
        },
      },
      count: menuData.packCount,
      disabled: menuData.packCount <= 0,
    },
    {
      id: "viewLeaderboard",
      label: "VIEW LEADERBOARD",
      action: { type: "link", href: "/leaderboard" },
    },
    {
      id: "viewDeck",
      label: "VIEW DECK",
      action: { type: "link", href: "/deck" },
    },
    {
      id: "viewProfile",
      label: "VIEW PROFILE",
      action: { type: "link", href: "/profile" },
    },
    {
      id: "coins",
      label: "COINS",
      action: { type: "display", value: menuData.coins },
      count: menuData.coins,
    },
  ]

  // Handle menu item click
  const handleMenuItemClick = async (item: MenuItem) => {
    if (item.disabled) return

    if (item.action.type === "link") {
      setIsOpen(false)
      router.push(item.action.href)
    } else if (item.action.type === "api") {
      setIsLoading(item.id)
      try {
        await item.action.handler()
      } catch (error) {
        console.error(`Error performing action for ${item.id}:`, error)
        toast.error("An error occurred")
      } finally {
        setIsLoading(null)
        setIsOpen(false)
      }
    }
    // For display type, do nothing
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Get notification count
  const getNotificationCount = () => {
    let count = 0
    if (menuData.canClaimDaily) count++
    if (menuData.tradeOffers > 0) count += menuData.tradeOffers
    return count
  }

  const menuItems = getMenuItems()
  const notificationCount = getNotificationCount()

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger button with notification badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col justify-center items-center w-12 h-12 space-y-1.5 relative"
        aria-label="Toggle menu"
      >
        <span className="block w-8 h-1 bg-black"></span>
        <span className="block w-8 h-1 bg-black"></span>
        <span className="block w-8 h-1 bg-black"></span>

        {/* Notification badge */}
        {notificationCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-pixel text-xs">
            {notificationCount}
          </div>
        )}
      </button>

      {/* Overlay menu */}
      {isOpen && (
        <div className="absolute top-full right-0 w-[32rem] bg-[#fffcb2] border-2 border-black z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 border-b-2 border-black">
            <h2 className="text-4xl font-bold font-pixel text-center">MENU</h2>
          </div>
          <div className="max-h-[80vh] overflow-y-auto">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`block w-full text-left p-4 border-b-2 border-black font-pixel text-xl ${item.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#ffe3b2] cursor-pointer"
                  }`}
                onClick={() => !item.disabled && handleMenuItemClick(item)}
                disabled={item.disabled || isLoading === item.id}
              >
                {item.label}
                {item.count !== undefined && `: ${item.count}`}
                {isLoading === item.id && " (Loading...)"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
