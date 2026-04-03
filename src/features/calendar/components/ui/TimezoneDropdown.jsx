import React, { useState, useRef, useEffect } from "react"
import { Globe } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import { colors } from "@/shared/utils/colors"

const TIMEZONES = [
  { id: "Asia/Bangkok", label: "Bangkok", offset: "GMT +07:00" },
  { id: "Asia/Shanghai", label: "China", offset: "GMT +08:00" },
  { id: "America/Los_Angeles", label: "US (PST)", offset: "GMT -08:00" },
  { id: "America/New_York", label: "US (EST)", offset: "GMT -05:00" },
]

const TimezoneDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const selectedIdx = TIMEZONES.findIndex((tz) => tz.id === value?.id)
  const selectedTz = selectedIdx !== -1 ? TIMEZONES[selectedIdx] : TIMEZONES[0]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (tz) => {
    if (onChange) onChange(tz)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="border border-[#c6c6c6] flex flex-col justify-center items-start gap-1 p-3 shadow-sm w-full md:w-[130px] shrink-0 bg-white hover:bg-gray-50 transition-colors rounded-[8px] h-full min-h-[86px]"
      >
        <Globe size={20} />
        <div className="text-sm mt-1 text-left line-clamp-2">
          {selectedTz.offset}
          <br />
          {selectedTz.label}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <FluentAnimation
            key="timezone-dropdown"
            direction="down"
            exit={true}
            className="absolute top-full left-0 mt-2 z-[60] origin-top w-full min-w-[160px]"
          >
            <div
              className="bg-white border rounded-md shadow-lg py-1 max-h-[250px] overflow-y-auto"
              style={{ borderColor: colors.border }}
            >
              {TIMEZONES.map((tz) => {
                const isSelected = selectedTz.label === tz.label
                return (
                  <button
                    key={tz.label}
                    type="button"
                    onClick={() => handleSelect(tz)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex flex-col ${
                      isSelected
                        ? "bg-red-50/50 text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    <span
                      className={isSelected ? "font-semibold" : "font-medium"}
                    >
                      {tz.label}
                    </span>
                    <span className="text-xs text-gray-500">{tz.offset}</span>
                  </button>
                )
              })}
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TimezoneDropdown
