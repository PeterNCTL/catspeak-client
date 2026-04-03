import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

const CatSpeakPage = () => {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto grid max-w-screen-xl gap-8 px-4 lg:grid-cols-[240px_1fr_350px] lg:px-8">
        {/* LEFT COLUMN: SIDEBAR */}
        <div></div>

        {/* MIDDLE COLUMN: PUBLIC FEED */}
        <div className="flex flex-col gap-10">
          {/* Content moved to Mail page */}
        </div>

        {/* RIGHT COLUMN: MY DASHBOARD */}
        <div className="flex flex-col gap-6"></div>
      </div>
    </div>
  )
}

export default CatSpeakPage
