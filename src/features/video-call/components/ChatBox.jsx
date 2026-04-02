import React, { useState, useRef, useEffect, useCallback } from "react"
import { Send } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { colors } from "@/shared/utils/colors"
import { formatTime } from "@/shared/utils/dateFormatter"
import TextInput from "@/shared/components/ui/inputs/TextInput"

const ChatBox = ({
  messages,
  currentUser,
  onSendMessage,
  isConnected,
  className = "",
  hideTitle,
}) => {
  const [message, setMessage] = useState("")
  const scrollRef = useRef(null)
  const sendingRef = useRef(false)
  const { t } = useLanguage()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = useCallback(() => {
    // Guard against rapid double-fires (mobile keyboards)
    if (sendingRef.current) return
    const text = message.trim()
    if (!text) return

    sendingRef.current = true
    onSendMessage(text)
    setMessage("")

    // Reset guard after a short delay
    requestAnimationFrame(() => {
      sendingRef.current = false
    })
  }, [message, onSendMessage])

  const handleKeyDown = (e) => {
    // Ignore Enter during IME composition (e.g. CJK input, some mobile keyboards)
    if (e.nativeEvent?.isComposing || e.keyCode === 229) return
    if (e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className={`flex h-full flex-col bg-white ${className}`}>
      {!hideTitle && (
        <div className="border-b border-[#C6C6C6] px-4 py-3">
          <h3 className="text-black text-sm font-bold m-0">
            {t.rooms.chatBox.title}
          </h3>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#C6C6C6] scrollbar-track-transparent">
        {messages.length === 0 ? (
          <p className="text-sm text-center text-[#7A7574] mt-10 m-0">
            {t.rooms.chatBox.empty}
          </p>
        ) : (
          messages.map((msg, index) => {
            // LiveKit useChat message format:
            // { id, timestamp, message, from?: Participant }
            const isMe = msg.from?.isLocal ?? false
            const senderName = isMe
              ? t.rooms.chatBox.you
              : msg.from?.name || msg.from?.identity || `User`

            return (
              <div
                key={msg.id || `msg-${index}`}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#7A7574]">
                    {senderName}
                  </span>
                  <span className="text-[10px] text-[#7A7574]">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[85%] break-words shadow-sm ${
                    isMe
                      ? "text-white"
                      : "bg-gray-100 text-[#7A7574] border border-[#C6C6C6]"
                  }`}
                  style={
                    isMe ? { backgroundColor: colors.red[700] } : undefined
                  }
                >
                  <p className="text-sm m-0">{msg.message}</p>
                </div>
              </div>
            )
          })
        )}
        {/* Auto-scroll anchor */}
        <div ref={scrollRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-[#C6C6C6] p-4 flex items-center gap-2"
      >
        <TextInput
          disabled={!isConnected}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isConnected
              ? t.rooms.chatBox.inputPlaceholder
              : t.rooms.chatBox.connectingPlaceholder
          }
          containerClassName="flex-1 min-w-0"
          className="disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isConnected || !message.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors disabled:bg-black/10 disabled:text-black/25 disabled:cursor-not-allowed hover:opacity-90"
          style={
            isConnected && message.trim()
              ? { backgroundColor: colors.red[700], color: "white" }
              : {}
          }
        >
          <Send className="ml-[-2px] mt-[1px]" />
        </button>
      </form>
    </div>
  )
}

export default ChatBox
