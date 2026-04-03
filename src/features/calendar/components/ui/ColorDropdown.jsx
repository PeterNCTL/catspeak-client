import React, { useState } from "react"
import HeaderDropdown from "./HeaderDropdown"
import { COLORS } from "@/shared/constants/constants"

const ColorDropdown = ({ value, onChange }) => {
  const [selectedColor, setSelectedColor] = useState(value || "transparent")

  const handleSelect = (color, close) => {
    setSelectedColor(color)
    if (onChange) onChange(color)
    close()
  }

  const triggerIcon = (
    <div
      className="w-[14px] h-[14px] rounded-full border-[1.5px] border-white"
      style={{ backgroundColor: selectedColor }}
    />
  )

  return (
    <HeaderDropdown triggerIcon={triggerIcon} label="Màu">
      {(close) => (
        <div className="flex flex-col gap-3 p-3 w-fit min-w-[120px]">
          {COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => handleSelect(color.value, close)}
              className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded-md transition-colors w-full text-left"
              aria-label={`Select color ${color.name}`}
            >
              <div
                className={`w-6 h-6 rounded-full shrink-0 border border-gray-200 ${
                  selectedColor === color.value
                    ? "ring-2 ring-offset-1 ring-gray-400"
                    : ""
                }`}
                style={{ backgroundColor: color.value }}
              />
              <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                {color.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </HeaderDropdown>
  )
}

export default ColorDropdown
