import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { Typography } from "@mui/material"

const CommunitySection = ({ languages }) => {
  const { t } = useLanguage()
  const footerText = t.footer

  return (
    <div className="flex-1 text-center lg:text-left">
      <Typography
        variant="subtitle1"
        className="font-bold uppercase tracking-wide"
      >
        {footerText.ourCommunity}
      </Typography>
      <ul className="pt-6 text-white/85 flex flex-row flex-wrap justify-center lg:flex-col lg:justify-start lg:items-start gap-4 lg:gap-2">
        {languages.map((lang) => (
          <li key={lang} className="drop-shadow-md">
            <Typography variant="body1" className="text-white font-bold">
              {lang}
            </Typography>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CommunitySection
