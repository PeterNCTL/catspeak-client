import React, { useState, useRef, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useUrlFilter } from "../../hooks/useUrlFilter"
import { LEVELS } from "../../config/constants"
import { ChevronDown } from "lucide-react"

const LevelFilter = () => {
  const { lang } = useParams()
  const { t } = useLanguage()
  const { toggleValue, isSelected } = useUrlFilter("requiredLevels")
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const langMap = {
    en: "English",
    zh: "Chinese",
    vi: "Vietnamese",
  }
  const currentLanguage = lang ? langMap[lang] : "English"
  const currentLevels = LEVELS[currentLanguage] || LEVELS.English

  const selectedCount = currentLevels.filter(levelObj => isSelected(levelObj.value)).length

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg h-10 px-4 text-sm font-medium transition-all duration-200 border ${isOpen || selectedCount > 0 ? "border-[#990011] bg-white text-[#990011]" : "border-[#C6C6C6] bg-white hover:bg-gray-50"}`}
      >
        <span>{t.rooms?.filters?.levelsHeading || "Levels"}</span>
        {selectedCount > 0 && (
          <span className="flex items-center justify-center bg-[#990011] text-white text-xs rounded-full min-w-[20px] h-5 px-1">
            {selectedCount}
          </span>
        )}
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-[100] mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-2 max-h-60 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar]:w-1.5 flex flex-col">
            {currentLevels.map((levelObj) => {
              const isChecked = isSelected(levelObj.value)

              return (
                <label
                  key={levelObj.value}
                  className={`flex items-center gap-3 cursor-pointer rounded-md p-2 transition-colors ${isChecked ? "bg-[#F2F2F2] hover:bg-[#E5E5E5]" : "hover:bg-[#F2F2F2]"}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) =>
                      toggleValue(levelObj.value, e.target.checked)
                    }
                    className="w-4 h-4 text-[#990011] bg-white accent-[#990011] cursor-pointer"
                  />
                  <span className="text-sm">{levelObj.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default LevelFilter
