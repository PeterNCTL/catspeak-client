import { useState, useEffect } from "react"

const MOBILE_MAX = 425 // ≤425px → touch scroll (returns null)
const DESKTOP_MIN = 1024 // ≥1024px → 4 cards, below → 2 cards

/**
 * Returns the number of visible carousel items per breakpoint.
 * Returns null on mobile (≤425px) to signal touch-scroll mode instead of button carousel.
 * @returns {number | null}
 */
const useResponsiveItemsPerPage = () => {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : DESKTOP_MIN,
  )

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (width <= MOBILE_MAX) return null // mobile: use touch scroll
  if (width <= DESKTOP_MIN) return 2 // tablet: 2 columns
  return 4 // desktop: 4 columns
}

export default useResponsiveItemsPerPage
