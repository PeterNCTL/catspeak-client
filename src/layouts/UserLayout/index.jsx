import { useState } from "react"
import { Layout, theme } from "antd"
import { Outlet, ScrollRestoration } from "react-router-dom"
import HeaderBar from "../../shared/components/Header/HeaderBar"
import Footer from "../../shared/components/Footer"
import Auth from "@/features/auth/components"
import AuthModalContext from "@/shared/context/AuthModalContext"

const { Content } = Layout

const UserLayout = ({ showFooter = true }) => {
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "login",
    redirectAfterLogin: null,
  })

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

  const {
    token: { colorBgContainer },
  } = theme.useToken()

  return (
    <AuthModalContext.Provider
      value={{
        openAuthModal,
        closeAuthModal,
        redirectAfterLogin: authModal.redirectAfterLogin,
      }}
    >
      <Layout className="flex justify-center bg-white">
        {/* Header full width */}
        <HeaderBar onGetStarted={() => openAuthModal("login")} />

        <Content className="w-full flex justify-center">
          <Outlet />
        </Content>

        {/* Footer full width */}
        {showFooter && <Footer />}

        <Auth
          isOpen={authModal.isOpen}
          mode={authModal.mode}
          onClose={closeAuthModal}
          onSwitchMode={openAuthModal}
        />

        <ScrollRestoration />
      </Layout>
    </AuthModalContext.Provider>
  )
}

export default UserLayout
