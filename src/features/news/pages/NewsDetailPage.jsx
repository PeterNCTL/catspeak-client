import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ThumbsUp, Heart, Smile } from "lucide-react"
import {
  useGetPostByIdQuery,
  useReactToPostMutation,
} from "@/store/api/postsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import PostContent from "../components/PostContent"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import Carousel from "@/shared/components/ui/Carousel"
import BackButton from "@/shared/components/ui/buttons/BackButton"
import Avatar from "@/shared/components/ui/Avatar"
import { formatDaysAgo, formatExactDate } from "@/features/news/utils/newsUtils"

const IMAGE_BASE_URL = "https://api.catspeak.com.vn"

const NewsDetailPage = () => {
  const { id, lang } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const { data, isLoading, error } = useGetPostByIdQuery(id)
  const [reactToPost] = useReactToPostMutation()
  const newsItem = data?.data

  const handleReact = (type) => {
    if (!newsItem?.postId) return
    reactToPost({ postId: newsItem.postId, type })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !newsItem || newsItem.privacy !== "Public") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h5 className="mb-4 text-2xl font-bold">{t.news?.error?.notFound}</h5>
        <BackButton onClick={() => navigate(`/${lang}/cat-speak/news`)}>
          {t.news?.error?.backToNews}
        </BackButton>
      </div>
    )
  }

  const avatarSrc = newsItem.avatarUrl
    ? `${IMAGE_BASE_URL}${newsItem.avatarUrl}`
    : undefined

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Back Button */}
      <BackButton to={`/${lang}/cat-speak/news`}>
        {t.news?.newsDetail?.back}
      </BackButton>

      {/* Author */}
      <div className="flex items-center gap-3 mt-3 mb-3">
        <Avatar
          size={40}
          src={avatarSrc}
          name={newsItem.authorName}
          alt={newsItem.authorName}
        />
        <div className="flex flex-col">
          <span className="text-base font-semibold">{newsItem.authorName}</span>
          <div className="flex flex-wrap items-center gap-1 text-sm text-[#7A7574]">
            {/* <span>{formatExactDate(newsItem.createDate)}</span>
            <span>·</span> */}
            <span>{formatDaysAgo(newsItem.createDate)}</span>
            {/* {newsItem.lastEdited && (
              <>
                <span>·</span>
                <span>Edited {formatExactDate(newsItem.lastEdited)}</span>
              </>
            )} */}
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-lg font-bold m-0 leading-snug mb-4">
        {newsItem.title}
      </h1>

      {/* Hero Image / Carousel */}
      {newsItem.media && newsItem.media.length > 0 && (
        <Carousel
          images={newsItem.media.map((item) => ({
            url: `${IMAGE_BASE_URL}${item.mediaUrl}`,
            alt: newsItem.title,
          }))}
          className="rounded-xl mb-1"
        />
      )}

      <article className="overflow-hidden bg-white">
        {/* Interaction Stats */}
        <div className="text-sm text-[#7A7574] mb-2">
          {newsItem.totalReactions} {t.news?.newsDetail?.reactions}
        </div>

        {/* Interaction Buttons */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#C6C6C6]">
          <button
            onClick={() => handleReact("Like")}
            className={`flex items-center gap-2 h-10 px-3 rounded-lg bg-[#F2F2F2] text-sm hover:bg-[#E5E5E5] transition-colors ${newsItem.currentUserReaction === "Like" ? "text-blue-600 font-medium" : ""}`}
          >
            <ThumbsUp
              className={`${newsItem.currentUserReaction === "Like" ? "fill-blue-600" : ""}`}
            />
            {t.news?.newsDetail?.like}
          </button>
          <button
            onClick={() => handleReact("Love")}
            className={`flex items-center gap-2 h-10 px-3 rounded-lg bg-[#F2F2F2] text-sm hover:bg-[#E5E5E5] transition-colors ${newsItem.currentUserReaction === "Love" ? "text-red-500 font-medium" : ""}`}
          >
            <Heart
              className={`${newsItem.currentUserReaction === "Love" ? "fill-red-500" : ""}`}
            />
            {t.news?.newsDetail?.love}
          </button>
          <button
            onClick={() => handleReact("Haha")}
            className={`flex items-center gap-2 h-10 px-3 rounded-lg bg-[#F2F2F2] text-sm hover:bg-[#E5E5E5] transition-colors ${newsItem.currentUserReaction === "Haha" ? "text-yellow-500 font-medium" : ""}`}
          >
            <Smile
              className={`${newsItem.currentUserReaction === "Haha" ? "text-yellow-500" : ""}`}
            />
            {t.news?.newsDetail?.haha}
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 text-gray-700 leading-relaxed my-4 text-base">
          <PostContent html={newsItem.content} />
        </div>
      </article>
    </div>
  )
}

export default NewsDetailPage
