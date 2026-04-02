import React from "react"
import { useLanguage } from "../../context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const HeaderGuestControls = ({ onGetStarted }) => {
  const { t } = useLanguage()

  const handleLogin = () => {
    if (onGetStarted) {
      onGetStarted("login") // Open modal
    }
  }

  return (
    <>
      <PillButton onClick={handleLogin} className="h-10">
        {t.auth.loginButton}
      </PillButton>
    </>
  )
}

export default HeaderGuestControls
