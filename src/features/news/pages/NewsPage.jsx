import React, { useState, useEffect } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPostsQuery } from "@/store/api/postsApi"
import NewsCard from "../components/NewsCard"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"

const NewsPage = () => {
  const { t } = useLanguage()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [viewMode, setViewMode] = useState("post")

  const [accumulatedPosts, setAccumulatedPosts] = useState([])

  const { data, isLoading, isFetching, error } = useGetPostsQuery({ page, pageSize })

  useEffect(() => {
    if (data?.data) {
      const publicPosts = data.data.filter((post) => post.privacy === "Public")
      if (page === 1) {
        setAccumulatedPosts(publicPosts)
      } else {
        setAccumulatedPosts((prev) => [...prev, ...publicPosts])
      }
    }
  }, [data, page])

  const hasMore = data?.data && data.data.length === pageSize

  if (isLoading && page === 1) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error && page === 1) {
    if (error?.status === 404) {
      return <EmptyState message="No posts found" />
    }

    if (error?.status === 401) {
      return <EmptyState message={t.catSpeak.newsLoginPrompt} />
    }

    return <ErrorMessage message="Error loading posts" />
  }

  return (
    <div className="mx-auto max-w-4xl py-6 px-4">
      {/* View Mode Toggle */}
      <div className="mb-6 flex items-center justify-end gap-2">
        <button
          onClick={() => setViewMode("post")}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "post"
              ? "bg-[#990011] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t.news?.viewMode?.post || "Post View"}
        </button>
        <button
          onClick={() => setViewMode("article")}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "article"
              ? "bg-[#990011] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t.news?.viewMode?.article || "Article View"}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {accumulatedPosts.map((post) => (
          <NewsCard key={`${post.postId}-${page}`} news={post} viewMode={viewMode} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
            className="rounded-full bg-blue-50 px-6 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
          >
            {isFetching ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  )
}

export default NewsPage
