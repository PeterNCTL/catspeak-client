import React, { useState, useMemo, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import Avatar from "@/shared/components/ui/Avatar"
import { COLORS } from "@/shared/constants/constants"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getTranslatedTimeAgo } from "@/features/news/utils/newsUtils"

const IMAGE_BASE_URL = "https://api.catspeak.com.vn"

const NewsCard = ({ news, viewMode = "post" }) => {
  const navigate = useNavigate()
  const { lang } = useParams()
  const currentLang = lang || "en"
  const { t } = useLanguage()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  const newsCard = t.news?.newsCard

  const handleCardClick = () => {
    navigate(`/${currentLang}/cat-speak/news/${news.postId}`)
  }

  const hasMedia = news.media && news.media.length > 0

  useEffect(() => {
    if (hasMedia && news.media.length > 1) {
      const interval = setInterval(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % news.media.length)
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [hasMedia, news.media?.length])

  const fallbackColor = useMemo(() => {
    const seed = news.postId || Math.floor(Math.random() * COLORS.length)
    const index =
      typeof seed === "number"
        ? seed % COLORS.length
        : seed.length % COLORS.length
    return COLORS[index].value
  }, [news.postId])

  const avatarSrc = news.avatarUrl
    ? `${IMAGE_BASE_URL}${news.avatarUrl}`
    : undefined

  if (viewMode === "article") {
    return (
      <div
        onClick={handleCardClick}
        className="group overflow-hidden border cursor-pointer rounded-xl transition-all duration-300 border-[#C6C6C6] hover:border-[#990011] hover:shadow-md bg-white flex flex-row h-[140px] sm:h-[160px]"
      >
        {/* Left Side: Thumbnail */}
        <div className="relative w-[140px] sm:w-[200px] flex-shrink-0 border-r border-[#C6C6C6]">
          {hasMedia && !imageError ? (
            <img
              src={`${IMAGE_BASE_URL}${news.media[0].mediaUrl}`}
              alt={news.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-2"
              style={{ backgroundColor: fallbackColor }}
            >
              <span className="text-white/20 font-bold text-xl select-none truncate">
                Cat Speak
              </span>
            </div>
          )}
          
          {hasMedia && (
            <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          )}
        </div>

        {/* Right Side: Info */}
        <div className="flex flex-col flex-1 p-3 sm:p-4 justify-between min-w-0">
          <div>
            <h5 className="m-0 text-base font-semibold leading-snug line-clamp-2 text-gray-900 mb-2">
              {news.title}
            </h5>
            <div className="flex items-center gap-2">
              <Avatar
                size={20}
                src={avatarSrc}
                alt={news.authorName || "Author"}
                name={news.authorName}
                fallback={news.authorName?.charAt(0) || "C"}
              />
              <span className="text-sm font-medium text-gray-700 truncate">
                {news.authorName || "Cat Speak Admin"}
              </span>
              <span className="text-sm text-[#7A7574] whitespace-nowrap">
                · {getTranslatedTimeAgo(news.createDate, newsCard?.timeAgo)}
              </span>
            </div>
          </div>

          {news.totalReactions != null && (
            <div className="text-sm text-[#7A7574] mt-2">
              {news.totalReactions}{" "}
              {news.totalReactions === 1 ? newsCard?.reaction : newsCard?.reactions}
            </div>
          )}
        </div>

        <InDevelopmentModal
          open={isModalOpen}
          onCancel={(e) => {
            if (e) e.stopPropagation()
            setIsModalOpen(false)
          }}
        />
      </div>
    )
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative overflow-hidden border cursor-pointer rounded-xl transition-all duration-300 border-[#C6C6C6] hover:border-[#990011] hover:shadow-md bg-white flex flex-col"
    >
      {/* Header: Author Info */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="flex-shrink-0">
          <Avatar
            size={40}
            src={avatarSrc}
            alt={news.authorName || "Author"}
            name={news.authorName}
            fallback={news.authorName?.charAt(0) || "C"}
          />
        </div>
        <div className="min-w-0 flex flex-col">
          <span className="font-semibold text-base leading-snug text-gray-900">
            {news.authorName || "Cat Speak Admin"}
          </span>
          <span className="text-sm text-[#7A7574]">
            {getTranslatedTimeAgo(news.createDate, newsCard?.timeAgo)}
          </span>
        </div>
      </div>

      {/* Body: Title */}
      <div className="px-4 pb-3">
        <h5 className="m-0 text-base leading-snug text-gray-800">
          {news.title}
        </h5>
      </div>

      {/* Thumbnail – 16:9 */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "16 / 9" }}
      >
        {hasMedia && !imageError ? (
          <div
            className="flex h-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentMediaIndex * 100}%)` }}
          >
            {news.media.map((item) => {
              const imageUrl = `${IMAGE_BASE_URL}${item.mediaUrl}`
              return (
                <div
                  key={item.postMediaId}
                  className="w-full h-full flex-shrink-0 relative"
                >
                  <img
                    src={imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: fallbackColor }}
          >
            <span className="text-white/20 font-bold text-4xl select-none">
              Cat Speak
            </span>
          </div>
        )}

        {hasMedia && (
          <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
      </div>

      {/* Footer: Reactions */}
      {news.totalReactions != null && (
        <div className="px-4 py-3 text-sm text-[#7A7574] border-t border-gray-100 flex items-center">
          <span>
            {news.totalReactions}{" "}
            {news.totalReactions === 1 ? newsCard?.reaction : newsCard?.reactions}
          </span>
        </div>
      )}

      <InDevelopmentModal
        open={isModalOpen}
        onCancel={(e) => {
          if (e) e.stopPropagation()
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}

export default NewsCard
