import React from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const WorkshopCard = ({ slide, onCtaClick }) => {
  const { t } = useLanguage()

  return (
    <motion.div
      className="relative flex w-full flex-col overflow-hidden rounded-xl bg-black/5 group aspect-video cursor-pointer"
      onClick={() => onCtaClick(slide.modal || "development")}
    >
      <img
        src={slide.image}
        alt={slide.title || "Workshop Image"}
        className="absolute inset-0 h-full w-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105"
      />
      {/* Vertical gradient overlay (darker at bottom) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Horizontal subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Content Section overlaying the image */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white text-left">
        <div className="space-y-2 sm:space-y-3">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold drop-shadow-lg line-clamp-1">
              {slide.title || t?.workshops?.heroCarousel?.comingSoonTitle}
            </h3>
            {slide.subtext && (
              <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 drop-shadow-md">
                {slide.subtext}
              </p>
            )}
          </div>

          <div className="pt-1">
            <PillButton
              onClick={(e) => {
                e.stopPropagation()
                onCtaClick(slide.modal || "development")
              }}
              bgColor="#f5c518"
              textColor="#990011"
              className="h-8 sm:h-10 text-xs sm:text-sm px-4 sm:px-6 shadow-md transition-transform hover:scale-105"
            >
              {slide.cta}
            </PillButton>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WorkshopCard
