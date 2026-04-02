import React from "react"
import { Link } from "react-router-dom"
import { MainLogo } from "@/shared/assets/icons/logo"

const HeaderLogo = () => {
  return (
    <div className="flex items-center gap-4 max-lg:justify-between">
      <Link
        to="/"
        className="flex items-center gap-4"
        aria-label="Cat Speak Home"
      >
        <img src={MainLogo} alt="Cat Speak logo" className="h-10 w-auto" />
      </Link>
    </div>
  )
}

export default HeaderLogo
