import React, { useState, useRef, useEffect, useMemo } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import { colors } from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"

const RecurrenceDropdown = ({ value, onChange }) => {
  const { t } = useLanguage()
  const cal = t.calendar

  const OPTIONS = useMemo(
    () => [
      cal.recurrence.noRepeat,
      cal.recurrence.daily,
      cal.recurrence.weekly,
      cal.recurrence.monthly,
      cal.recurrence.yearly,
      // cal.recurrence.custom,
    ],
    [cal],
  )

  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(value || OPTIONS[0])
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    setSelected(option)
    if (onChange) onChange(option)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm flex items-center justify-between border border-[#C6C6C6] rounded-lg px-4 h-10 shadow-sm w-full bg-white hover:bg-gray-50 transition-colors"
      >
        <span>{selected}</span>
        <ChevronDown
          size={14}
          style={{ color: colors.textGray }}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <FluentAnimation
            key="recurrence-dropdown"
            direction="down"
            exit={true}
            className="absolute top-full left-0 right-0 mt-1 z-50 origin-top"
          >
            <div className="bg-white border border-[#C6C6C6] rounded-md shadow-lg max-h-[250px] overflow-y-auto">
              {OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F2F2F2] transition-colors ${
                    selected === option
                      ? "bg-[#F2F2F2] hover:bg-[#e6e6e6] text-[#990011]"
                      : ""
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RecurrenceDropdown
