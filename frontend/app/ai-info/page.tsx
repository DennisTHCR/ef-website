"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import CollapsibleHeader from "@/components/collapsible-header"
import PageBackground from "@/components/page-background"
import { useAuth } from "@/contexts/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { Brain, Cpu, ImageIcon, MessageSquareQuote, Users } from "lucide-react"

export default function AIInfoPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const isMobile = useIsMobile()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return null // Don't render anything while checking auth or redirecting
  }

  // Determine icon size based on device
  const iconSize = isMobile ? 16 : 20
  const headerIconSize = isMobile ? 20 : 24

  return (
    <PageBackground>
      <main className="min-h-screen flex flex-col">
        <CollapsibleHeader />

        <div className="flex-1 p-3 md:p-4 max-w-4xl mx-auto w-full">
          <div className="bg-[#fffcb2]/90 backdrop-blur-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-3 md:p-4 border-b-2 border-black bg-[#e0f0ff]">
              <h2 className="text-2xl md:text-4xl font-bold font-pixel text-center flex items-center justify-center gap-2 md:gap-3">
                <Brain className={`h-${headerIconSize} w-${headerIconSize}`} />
                <span>AI INFORMATION</span>
              </h2>
            </div>

            <div className="p-3 md:p-6 space-y-4 md:space-y-8">
              {/* AI Art Section */}
              <section className="space-y-2 md:space-y-4">
                <h3 className="text-xl md:text-2xl font-bold font-pixel flex items-center gap-2">
                  <ImageIcon className={`h-${iconSize} w-${iconSize} flex-shrink-0`} />
                  <span>AI-Generated Artwork</span>
                </h3>
                <div className="bg-white/70 p-3 md:p-4 border-2 border-black">
                  <p className="font-pixel text-sm md:text-base">
                    The teacher card images in Quotemon are generated using artificial intelligence. We've used advanced
                    image generation models to create pixel-art style representations of teachers based on their
                    descriptions. These images are stylized and not intended to be photorealistic representations.
                  </p>
                </div>
              </section>

              {/* Teacher Consent Section */}
              <section className="space-y-2 md:space-y-4">
                <h3 className="text-xl md:text-2xl font-bold font-pixel flex items-center gap-2">
                  <MessageSquareQuote className={`h-${iconSize} w-${iconSize} flex-shrink-0`} />
                  <span>Teacher Consent</span>
                </h3>
                <div className="bg-white/70 p-3 md:p-4 border-2 border-black">
                  <p className="font-pixel text-sm md:text-base">
                    We have obtained consent from every teacher featured in Quotemon to use their quotes and likeness in
                    this educational project. All quotes are authentic and have been approved for use in this context.
                    We respect the privacy and rights of all individuals represented in this game.
                  </p>
                </div>
              </section>

              {/* Technical Implementation */}
              <section className="space-y-2 md:space-y-4">
                <h3 className="text-xl md:text-2xl font-bold font-pixel flex items-center gap-2">
                  <Cpu className={`h-${iconSize} w-${iconSize} flex-shrink-0`} />
                  <span>Technical Implementation</span>
                </h3>
                <div className="bg-white/70 p-3 md:p-4 border-2 border-black">
                  <p className="font-pixel text-sm md:text-base">
                    Quotemon uses AI only for image generation.
                    The pixel art style was chosen to create a nostalgic gaming experience while
                    also being suitable for AI generation.
                  </p>
                </div>
              </section>

              {/* Creators Section */}
              <section className="space-y-2 md:space-y-4">
                <h3 className="text-xl md:text-2xl font-bold font-pixel flex items-center gap-2">
                  <Users className={`h-${iconSize} w-${iconSize} flex-shrink-0`} />
                  <span>Creators</span>
                </h3>
                <div className="bg-white/70 p-3 md:p-4 border-2 border-black">
                  <p className="font-pixel text-sm md:text-base">
                    Quotemon was created by <strong>Alan Leyel</strong> and <strong>Dennis Winghard</strong> as a
                    project to celebrate the unique teaching styles and memorable quotes from educators at KSW. The game
                    combines their passion for education, gaming, and technology to create an engaging experience for
                    the school community.
                  </p>
                </div>
              </section>

              {/* Back Button */}
              <div className="flex justify-center mt-4 md:mt-8">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-[#ffd080] hover:bg-[#ffb060] border-2 border-black font-pixel shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-sm md:text-base"
                >
                  BACK
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageBackground>
  )
}
