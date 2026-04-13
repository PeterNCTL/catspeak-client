import React from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MainLogo } from "@/shared/assets/icons/logo"
import { useConnectionState } from "@livekit/components-react"
import { ConnectionState } from "livekit-client"

import {
  VideoGrid,
  ParticipantList,
  ChatBox,
  ControlBar as VideoCallControlBar,
  useSessionTimer,
} from "@/features/video-call"
import { formatDate } from "@/shared/utils/dateFormatter"

import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { VideoCallProvider } from "@/features/video-call/context/VideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import VideoCallLoading from "@/features/video-call/components/VideoCallLoading"

const VideoCallRoomContent = () => {
  const { t, language } = useLanguage()
  const { lang } = useParams()
  const navigate = useNavigate()
  const {
    // Layout state
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,
    // Auth guard
    user,
    location,
    // Header info
    session,
    room,
    // ChatBox props (presentational component — keeps props-based API)
    messages,
    handleSendMessage,
    isConnected,
    // PiP controls
    enterPiP,
  } = useVideoCallContext()

  const { formattedElapsed, formattedMax } = useSessionTimer(session)

  const rawRoomName = session?.name || session?.roomName || "General"

  const isSidePanelOpen = showChat || showParticipants
  const sidePanelTitle = showParticipants
    ? t.rooms.videoCall.participantList.title
    : t.rooms.chatBox.title

  // Unread message count
  const [unreadMessages, setUnreadMessages] = React.useState(0)
  const prevMessagesLength = React.useRef(messages.length)

  React.useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      if (!showChat) {
        let newUnread = 0
        for (let i = prevMessagesLength.current; i < messages.length; i++) {
          // LiveKit chat: msg.from?.isLocal identifies own messages
          if (!messages[i].from?.isLocal) newUnread++
        }
        setUnreadMessages((prev) => prev + newUnread)
      }
    }
    prevMessagesLength.current = messages.length
  }, [messages, showChat])

  React.useEffect(() => {
    if (showChat) setUnreadMessages(0)
  }, [showChat])

  // ── Logo click → enter PiP and navigate home ──
  const handleLogoClick = (e) => {
    e.preventDefault()
    const homePath = `/${lang || language || "en"}/community`
    enterPiP(homePath)
  }

  // ── LiveKit connection gate ──
  // The "Connecting…" loading screen from VideoCallProvider is dismissed
  // as soon as phase flips to "in-call", but LiveKit may still be
  // negotiating the WebSocket at that point.  Keep showing a loader
  // until the connection is fully established so that participant
  // metadata (name, avatar, etc.) is available when VideoGrid renders.
  const connectionState = useConnectionState()
  const livekitReady = connectionState === ConnectionState.Connected

  if (!user) return <Navigate to="/" state={{ from: location }} replace />

  if (!livekitReady) {
    return (
      <VideoCallLoading
        message={t.rooms.videoCall.provider.connecting ?? "Connecting..."}
      />
    )
  }

  return (
    <div className="flex h-full w-full flex-col bg-primary2 text-textColor font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#C6C6C6] bg-white px-5 py-3">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden w-40 shrink-0 items-center md:flex">
            {/* Logo: clicking enters PiP mode instead of navigating away */}
            <button
              type="button"
              onClick={handleLogoClick}
              className="flex items-center gap-4 cursor-pointer bg-transparent border-none p-0"
              aria-label="Minimize to Picture-in-Picture"
              title="Continue browsing (call stays active)"
            >
              <img
                src={MainLogo}
                alt="Cat Speak logo"
                className="h-10 w-auto"
              />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-base font-semibold">{rawRoomName}</div>
              {room?.requiredLevel && (
                <span className="rounded-full bg-[#990011] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {room.requiredLevel}
                </span>
              )}
              {room?.topic &&
                room.topic.split(",").map((t_topic) => {
                  const trimmed = t_topic.trim()
                  return (
                    <span
                      key={trimmed}
                      className="rounded-full bg-[#990011] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                    >
                      {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                        trimmed}
                    </span>
                  )
                })}
            </div>
            <div className="hidden text-sm text-[#60600] md:block">
              {formatDate(new Date())}
            </div>
          </div>
        </div>
        {formattedElapsed && formattedElapsed !== "00:00" && (
          <div className="text-xs font-medium text-[#7A7574] md:text-sm">
            {formattedElapsed}
            {formattedMax ? ` / ${formattedMax}` : ""}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Video Area */}
        <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden bg-gradient-to-br from-primary2 via-white to-primary2">
          <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-[0.03] pointer-events-none" />
          <VideoGrid />
        </div>

        {/* Desktop Side Panel */}
        <AnimatePresence initial={false}>
          {isSidePanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="hidden flex-col border-l border-[#C6C6C6] bg-white md:flex overflow-hidden relative"
              style={{ width: 320 }}
            >
              <div className="w-80 h-full flex flex-col shrink-0">
                {showParticipants && <ParticipantList />}
                {showChat && !showParticipants && (
                  <ChatBox
                    messages={messages}
                    currentUser={user}
                    onSendMessage={handleSendMessage}
                    isConnected={isConnected}
                    className="h-full w-full"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Overlay Side Panel */}
        <AnimatePresence initial={false}>
          {isSidePanelOpen && (
            <div className="md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-30 flex bg-black/40"
                onClick={() => {
                  setShowChat(false)
                  setShowParticipants(false)
                }}
              >
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", duration: 0.2 }}
                  className="ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="text-black flex w-full items-center gap-2 border-b border-[#C6C6C6] px-4 py-3 text-left hover:bg-gray-50"
                    onClick={() => {
                      setShowChat(false)
                      setShowParticipants(false)
                    }}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary2/10">
                      <ChevronRight className="rotate-180" />
                    </span>
                    <div className="text-base font-semibold">
                      {sidePanelTitle}
                    </div>
                  </button>

                  <div className="flex-1 overflow-y-auto">
                    {showParticipants && <ParticipantList hideTitle />}
                    {showChat && !showParticipants && (
                      <ChatBox
                        messages={messages}
                        currentUser={user}
                        onSendMessage={handleSendMessage}
                        isConnected={isConnected}
                        className="h-full w-full"
                        hideTitle
                      />
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <VideoCallControlBar unreadMessages={unreadMessages} />
    </div>
  )
}

const VideoCallRoom = () => (
  <VideoCallProvider>
    <VideoCallRoomContent />
  </VideoCallProvider>
)

export default VideoCallRoom
