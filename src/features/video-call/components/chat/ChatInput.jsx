import React, { useState, useRef, useCallback, useEffect } from "react"
import { Send } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { colors } from "@/shared/utils/colors"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

const ChatInput = ({ onSendMessage, isConnected, onAiMessageSent }) => {
  const [message, setMessage] = useState("")
  const sendingRef = useRef(false)
  const { t } = useLanguage()
  const {
    addOptimisticAiMessage,
    chatPublicAi,
    chatPrivateAi,
    currentUserId,
    aiMessages,
    lkRoomName,
    localParticipant,
    aiPromptStatus,
    setAiPromptStatus,
  } = useGlobalVideoCall()

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [activeSuggestion, setActiveSuggestion] = useState(0)

  // Autocomplete suggestions logic
  useEffect(() => {
    if (message.startsWith("@")) {
      const query = message.toLowerCase()
      const matches = ["@public-ai ", "@private-ai "].filter((s) =>
        s.startsWith(query),
      )
      if (
        matches.length > 0 &&
        query !== "@public-ai " &&
        query !== "@private-ai "
      ) {
        setSuggestions(matches)
        setShowSuggestions(true)
        setActiveSuggestion(0)
      } else {
        setShowSuggestions(false)
      }
    } else {
      setShowSuggestions(false)
    }
  }, [message])

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion)
    setShowSuggestions(false)
  }

  const handleSend = useCallback(async () => {
    if (sendingRef.current) return
    const text = message.trim()
    if (!text) return

    sendingRef.current = true

    if (
      text.startsWith("@public-ai ") ||
      text.startsWith("@private-ai ") ||
      text === "@public-ai" ||
      text === "@private-ai"
    ) {
      if (aiPromptStatus?.active) {
        return // Prevent prompting if already waiting for AI
      }

      const isPublic = text.startsWith("@public-ai")
      const cleanPrompt = text
        .replace(isPublic ? "@public-ai" : "@private-ai", "")
        .trim()
      const formattedPrompt = `${isPublic ? "@public-ai" : "@private-ai"} ${cleanPrompt}`

      const roomName = lkRoomName || "General"

      setAiPromptStatus({ active: true, name: t?.rooms?.chatBox?.you || "You" })

      addOptimisticAiMessage({
        id: `ai-opt-${Date.now()}`,
        timestamp: Date.now(),
        message: formattedPrompt,
        topic: isPublic ? "public-ai" : "private-ai",
        questioner: currentUserId,
        from: {
          name: t?.rooms?.chatBox?.you || "You",
          isLocal: true,
          isAi: false,
        },
      })

      // Broadcast the public prompt to everyone else so they see the prompt and loading state
      if (isPublic && localParticipant) {
        try {
          const payload = JSON.stringify({
            message: formattedPrompt,
            questioner: currentUserId,
          })
          const encoded = new TextEncoder().encode(payload)
          localParticipant.publishData(encoded, {
            reliable: true,
            topic: "public-ai-prompt",
          })
        } catch (e) {
          console.warn("Failed to broadcast public AI prompt", e)
        }
      }

      setMessage("")
      requestAnimationFrame(() => {
        sendingRef.current = false
      })

      // Notify parent to open AI pane if collapsed
      if (onAiMessageSent) onAiMessageSent()

      try {
        const payload = { roomName, message: cleanPrompt }
        console.log("Sending AI payload:", payload)

        if (isPublic) {
          await chatPublicAi(payload).unwrap()
        } else {
          await chatPrivateAi(payload).unwrap()
        }
        // We do not set aiPromptStatus false here, we wait for the LiveKit message via useAiMessages
      } catch (error) {
        console.error("AI chat error", error)
        setAiPromptStatus({ active: false, name: "" })
        addOptimisticAiMessage({
          id: `ai-err-${Date.now()}`,
          timestamp: Date.now(),
          message: error?.data?.message || "All models are unavailable.",
          topic: isPublic ? "public-ai" : "private-ai",
          from: { name: "System", isSystem: true, isAi: true },
        })
      }
      return
    }

    onSendMessage(text)
    setMessage("")

    requestAnimationFrame(() => {
      sendingRef.current = false
    })
  }, [
    message,
    onSendMessage,
    addOptimisticAiMessage,
    chatPublicAi,
    chatPrivateAi,
    currentUserId,
    t,
    onAiMessageSent,
    aiPromptStatus,
    lkRoomName,
    localParticipant,
    setAiPromptStatus,
  ])

  const handleKeyDown = (e) => {
    if (e.nativeEvent?.isComposing || e.keyCode === 229) return

    if (showSuggestions) {
      if (e.key === "Tab") {
        e.preventDefault()
        setMessage(suggestions[activeSuggestion])
        setShowSuggestions(false)
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveSuggestion((prev) => (prev + 1) % suggestions.length)
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveSuggestion(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length,
        )
        return
      }
    }

    if (e.key === "Enter") {
      if (showSuggestions) {
        e.preventDefault()
        setMessage(suggestions[activeSuggestion])
        setShowSuggestions(false)
        return
      }
      e.preventDefault()
      handleSend()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className="flex flex-col relative shrink-0">
      {showSuggestions && (
        <div className="absolute bottom-full left-4 mb-2 flex flex-col gap-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg z-30 min-w-[150px] p-1">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`flex w-full items-center rounded-lg px-3 py-2 min-h-10 text-sm cursor-pointer transition-colors ${
                index === activeSuggestion
                  ? "bg-[#F6F6F6]"
                  : "hover:bg-[#F6F6F6]"
              }`}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-[#E5E5E5] py-2 px-3 flex items-center gap-2 bg-white relative z-20"
      >
        <TextInput
          disabled={!isConnected}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isConnected
              ? t.rooms?.chatBox?.inputPlaceholder ||
                "Type a message or @public-ai / @private-ai..."
              : t.rooms?.chatBox?.connectingPlaceholder || "Connecting..."
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
          <Send size={20} className="ml-[-2px] mt-[1px]" />
        </button>
      </form>
    </div>
  )
}

export default ChatInput
