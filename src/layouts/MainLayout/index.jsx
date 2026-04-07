import { useState, useEffect } from "react"
import {
  Outlet,
  useLocation,
  useSearchParams,
  ScrollRestoration,
} from "react-router-dom"
import HeaderBar from "../../shared/components/Header/HeaderBar"
import Footer from "../../shared/components/Footer"
import Auth from "@/features/auth/components"
import AuthModalContext from "@/shared/context/AuthModalContext"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import MainSidebar from "./MainSidebar"

const MainLayout = ({ showHeader = true, showFooter = true }) => {
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "login",
    redirectAfterLogin: null,
  })

  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isLandingPage = location.pathname === "/"

  // Check for reset password intent
  useEffect(() => {
    // If we are on the reset-password route OR we have parameters indicating a reset
    if (location.pathname === "/reset-password") {
      // Assuming parameters are passed in query string: ?token=...&email=...
      setAuthModal({
        isOpen: true,
        mode: "reset-password",
        redirectAfterLogin: null,
      })
    }
    // Alternatively, check for "mode" param in query string if backend link is like /?mode=reset
    else if (searchParams.get("mode") === "resetPassword") {
      setAuthModal({
        isOpen: true,
        mode: "reset-password",
        redirectAfterLogin: null,
      })
    }
  }, [location.pathname, searchParams])

  const openAuthModal = (mode = "login", redirectPath = null) =>
    setAuthModal({
      isOpen: true,
      mode,
      redirectAfterLogin: redirectPath,
    })

  const closeAuthModal = () =>
    setAuthModal((prev) => ({
      ...prev,
      isOpen: false,
      redirectAfterLogin: null,
    }))

  return (
    <AuthModalContext.Provider
      value={{
        openAuthModal,
        closeAuthModal,
        redirectAfterLogin: authModal.redirectAfterLogin,
      }}
    >
      <div className="flex flex-col min-h-screen bg-white text-left overflow-x-clip">
        {showHeader && (
          <HeaderBar 
            onGetStarted={() => openAuthModal("login")} 
            hideDesktopNav={!isLandingPage} 
          />
        )}

        <div className="flex flex-row flex-1 bg-white min-w-0 items-stretch">
          {!isLandingPage && <MainSidebar />}

          <main className="flex-1 flex flex-col min-w-0 overflow-x-clip">
            <Outlet />
          </main>
        </div>

        {/* Footer full width (bên trong tự giới hạn 1200px) */}
        {showFooter && isLandingPage && <Footer />}

      </div>

      <Auth
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={closeAuthModal}
        onSwitchMode={openAuthModal}
      />

      <ScrollRestoration />
    </AuthModalContext.Provider>
  )
}

export default MainLayout
