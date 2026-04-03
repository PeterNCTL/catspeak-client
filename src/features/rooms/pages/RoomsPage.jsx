import React, { useState } from "react"
import { Filter } from "lucide-react"
import { useSearchParams, useParams, useNavigate } from "react-router-dom"
import {
  ClassSidebar,
  CommunicateTab,
  // RoomsTabs,
  RoomsMobileDrawer,
  useGetRoomsQuery,
  useRoomsPageLogic,
  AllowConnectSwitch,
} from "@/features/rooms"

import { useLanguage } from "@/shared/context/LanguageContext"
import { PageNotFound } from "@/shared/pages"
import { AnimatePresence } from "framer-motion"
import {
  FadeAnimation,
  FluentAnimation,
} from "@/shared/components/ui/animations"

const RoomsPage = () => {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { t } = useLanguage()

  const [page, setPage] = useState(1)
  const [tab, setTab] = useState("communicate")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { lang } = useParams()

  // Map language code to language type
  const langMap = {
    en: "English",
    zh: "Chinese",
    vi: "Vietnamese",
  }
  const languageType = lang ? [langMap[lang]] : undefined

  // Force 404 for Vietnamese language
  if (languageType?.includes("Vietnamese")) {
    return <PageNotFound />
  }

  const getLanguageName = (langCode) => {
    switch (langCode) {
      case "zh":
        return "Chinese"
      case "vi":
        return "Vietnamese"
      case "en":
        return "English"
      default:
        return "English"
    }
  }

  const requiredLevels = searchParams.getAll("requiredLevels")
  const requiredLevelsArg =
    requiredLevels.length > 0 ? requiredLevels : undefined

  const categoriesParam = searchParams.get("categories")
  const categories = categoriesParam
    ? categoriesParam.split(",").map((c) => c.trim())
    : undefined

  const topicsValues = searchParams.getAll("topics")
  const topicsArg = topicsValues.length > 0 ? topicsValues : undefined

  const pageSize = 12

  // Only fetch data if we are in a specific category (Filtered View)
  // Otherwise, the CommunicateTab's sections will fetch their own data.
  const shouldFetch = !!categories

  const { data: responseData, isLoading } = useGetRoomsQuery(
    {
      page,
      pageSize,
      languageType,
      requiredLevels: requiredLevelsArg,
      categories,
      topics: topicsArg,
    },
    { skip: !shouldFetch },
  )

  // Process data
  const rooms = responseData?.data ?? []
  const additionalData = responseData?.additionalData ?? {}
  const totalPages = additionalData.totalPages || 1

  return (
    <AnimatePresence mode="wait">
      <FluentAnimation
        animationKey="rooms-page"
        direction="up"
        className="w-full"
      >
        {/* Hero Section removed and moved to HomePage */}

        {/* Allow Connect Switch Section (Hidden per user request, keeping component imported for future use) */}
        {/* <div className="flex px-5 pt-2 pb-2">
          <AllowConnectSwitch />
        </div> */}

        {/* Lower section with content & sidebar */}
        <div className="p-5">
          <div className="flex flex-col gap-6 w-full">
            {/* Content area */}
            <div className="flex flex-col min-w-0">
              <div className="w-full">
                {/* Hiding tabs since there's currently only the communicate tab */}
                {/* <div className="mb-4">
                  <RoomsTabs tab={tab} setTab={setTab} />
                </div> */}

                {/* Sidebar Drawer */}
                <RoomsMobileDrawer
                  isOpen={filtersOpen}
                  onClose={() => setFiltersOpen(false)}
                  title={
                    tab === "class"
                      ? t.rooms?.tabs?.class || "Class List"
                      : t.rooms?.filters?.title || "Filters"
                  }
                >
                  {tab === "class" ? <ClassSidebar /> : null}
                </RoomsMobileDrawer>

                {/* Tab Panels */}
                <div className="overflow-x-clip">
                  <AnimatePresence mode="wait">
                    <FadeAnimation key={tab} className="w-full">
                      {tab === "communicate" && (
                        <CommunicateTab
                          rooms={rooms}
                          selectedCategories={categories}
                          page={page}
                          totalPages={totalPages}
                          setPage={setPage}
                          languageType={languageType}
                          requiredLevels={requiredLevelsArg}
                          topics={topicsArg}
                        />
                      )}
                    </FadeAnimation>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FluentAnimation>
    </AnimatePresence>
  )
}

export default RoomsPage
