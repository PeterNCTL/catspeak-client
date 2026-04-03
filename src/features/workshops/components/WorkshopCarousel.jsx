import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import ChinaWorkshopModal from "./modals/ChinaWorkshopModal"
import { getWorkshopSlides } from "../data/workshopSlides"
import WorkshopCard from "./WorkshopCard"
import useRoomCarousel from "@/features/rooms/hooks/useRoomCarousel"
import useResponsiveItemsPerPage from "@/features/rooms/hooks/useResponsiveItemsPerPage"
import colors from "@/shared/utils/colors"

const WorkshopCarousel = ({ slides: propSlides = [] }) => {
  const { lang } = useParams()
  const { t } = useLanguage()
  const [modalType, setModalType] = useState(null) // 'china' or 'development'

  // Get slides from data utility
  const slides = getWorkshopSlides(t, lang, propSlides)

  const itemsPerPage = useResponsiveItemsPerPage()
  const isMobile = itemsPerPage === null

  const { visibleItems, currentPage, goNext, goPrev, canGoNext, canGoPrev } =
    useRoomCarousel(slides, itemsPerPage ?? 4)

  if (slides.length === 0) return null

  const renderHeader = (showNavButtons = false) => {
    const shouldShowNav = showNavButtons && slides.length > itemsPerPage

    return (
      <div className="relative z-10 flex w-full items-center justify-between mb-2">
        <h2
          className="text-xl font-bold"
          style={{ color: colors?.headingColor || "#111827" }}
        >
          {t?.workshops?.title || "Workshops"}
        </h2>

        {shouldShowNav && (
          <div className="flex items-center gap-2 pr-2">
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label="Previous workshops"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-[#C6C6C6] transition-all duration-200 hover:bg-gray-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              disabled={!canGoNext}
              aria-label="Next workshops"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-[#C6C6C6] transition-all duration-200 hover:bg-gray-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderMobileContent = () => (
    <div className="flex flex-col gap-2">
      {renderHeader()}
      <div className="flex gap-4 overflow-x-auto py-8 -my-8 px-2 -mx-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {slides.map((slide, idx) => (
          <div key={idx} className="min-w-full flex-shrink-0 snap-center flex">
            <WorkshopCard slide={slide} onCtaClick={setModalType} />
          </div>
        ))}
      </div>
    </div>
  )

  const renderDesktopContent = () => {
    const gridCols = itemsPerPage === 2 ? "grid-cols-2" : "grid-cols-3"

    return (
      <div className="flex flex-col gap-2">
        {renderHeader(true)}

        <div className="overflow-hidden py-10 -my-10 px-4 -mx-4">
          <AnimatePresence mode="wait">
            <FluentAnimation
              key={currentPage}
              animationKey={currentPage}
              direction="none"
              duration={0.15}
              exit={true}
              className={`grid ${gridCols} gap-4 w-full`}
            >
              {visibleItems.map((slide, idx) => (
                <WorkshopCard
                  key={`${currentPage}-${idx}`}
                  slide={slide}
                  onCtaClick={setModalType}
                />
              ))}
            </FluentAnimation>
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {isMobile ? renderMobileContent() : renderDesktopContent()}

      <ChinaWorkshopModal
        open={modalType === "china"}
        onClose={() => setModalType(null)}
        t={t}
      />

      <InDevelopmentModal
        open={modalType === "development"}
        onCancel={() => setModalType(null)}
      />
    </div>
  )
}

export default WorkshopCarousel
