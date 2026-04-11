import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Lock, ArrowLeft } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getCommunityPath } from "@/shared/utils/navigation"

const PasswordScreen = ({ room, error, isLoading, onSubmit }) => {
  const { lang } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    if (!password.trim() || isLoading) return
    onSubmit(password)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <div
      className="flex h-[100dvh] w-full flex-col bg-cover bg-center bg-no-repeat relative overflow-y-auto"
      style={{
        backgroundImage: `url(${room?.thumbnailUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"})`,
      }}
    >
      {/* Dark blurred overlay so the background isn't distracting */}
      <div className="fixed inset-0 bg-[#111111]/40 backdrop-blur-sm" />

      {/* Top Back Button */}
      <div className="relative z-50 w-full p-5 flex justify-start shrink-0">
        <button
          onClick={() => navigate(getCommunityPath(lang || language))}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 text-white transition-all duration-300 shadow-sm"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          <span className="text-sm font-medium pr-1">
            {t.rooms.waitingScreen.backToCommunity}
          </span>
        </button>
      </div>

      {/* Centered Content */}
      <div className="relative z-10 flex flex-1 w-full flex-col items-center justify-center p-5">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-2xl w-full max-w-[420px] flex flex-col items-center">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-6 w-full"
          >
            {/* Hidden username for accessibility to fix Chromium DOM warning */}
            <input
              type="text"
              autoComplete="username"
              value={room?.roomId || "room"}
              readOnly
              className="hidden"
            />
            {/* Lock icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#990011]/10 mb-2">
              <Lock size={36} className="text-[#990011]" />
            </div>

            {/* Title & room name */}
            <div className="text-center">
              <h1 className="text-2xl font-bold leading-tight mb-2">
                {t.rooms.passwordScreen.title}
              </h1>
              {room?.name && (
                <p className="text-base text-[#7A7574] font-medium mb-1">
                  {room.name}
                </p>
              )}
              {room && (
                <div className="flex flex-wrap justify-center gap-2 mb-3 mt-2">
                  {room.requiredLevel && (
                    <span className="rounded-full bg-[#990011] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {room.requiredLevel}
                    </span>
                  )}
                  {room.topic &&
                    room.topic.split(",").map((t_topic) => {
                      const trimmed = t_topic.trim()
                      return (
                        <span
                          key={trimmed}
                          className="rounded-full bg-[#990011] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                        >
                          {t.rooms?.createRoom?.topics?.[
                            trimmed.toLowerCase()
                          ] || trimmed}
                        </span>
                      )
                    })}
                </div>
              )}
              <p className="text-[15px] text-[#7A7574] leading-relaxed">
                {t.rooms.passwordScreen.description}
              </p>
            </div>

            {/* Password input */}
            <div className="flex flex-col gap-2 w-full">
              <label
                htmlFor="room-password-screen"
                className="text-sm font-medium"
              >
                {t.rooms.passwordScreen.label}
              </label>
              <TextInput
                id="room-password-screen"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.rooms.passwordScreen.placeholder}
                autoFocus
                autoComplete="new-password"
                className={
                  error
                    ? "!border-red-400 focus:!border-red-500 hover:!border-red-500 focus:!ring-red-500"
                    : ""
                }
              />

              {/* Error message */}
              {error && <p className="m-0 text-xs text-red-500">{error}</p>}
            </div>

            {/* Submit button */}
            <PillButton
              type="submit"
              className="h-11 w-full mt-1"
              loading={isLoading}
              loadingText={t.rooms.passwordScreen.verifying}
              disabled={!password.trim()}
            >
              {t.rooms.passwordScreen.submit}
            </PillButton>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PasswordScreen
