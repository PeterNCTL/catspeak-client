import { useState, useEffect, useCallback, useRef } from "react"
import { RoomEvent } from "livekit-client"

export const useAiMessages = (lkRoom, currentUserId, participants = []) => {
  const [aiMessages, setAiMessages] = useState([])
  const [aiPromptStatus, setAiPromptStatus] = useState({ active: false, name: "" })
  const participantsRef = useRef(participants)
  const currentUserIdRef = useRef(currentUserId)

  useEffect(() => {
    participantsRef.current = participants
  }, [participants])

  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  // Allow the frontend to optimistically inject messages (e.g., user prompts)
  const addOptimisticAiMessage = useCallback((msg) => {
    setAiMessages((prev) => [...prev, msg])
  }, [])

  useEffect(() => {
    if (!lkRoom) return

    const handleData = (payload, participant, kind, topic) => {
      // Handle incoming public AI prompt from another user
      if (topic === "public-ai-prompt") {
        try {
          const decoded = new TextDecoder().decode(payload)
          const json = JSON.parse(decoded)
          const questionerName = participant?.name || participant?.identity || "Someone"
          
          const promptMsg = {
            id: `ai-prompt-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            message: json.message,
            topic: "public-ai",
            questioner: json.questioner,
            from: { name: questionerName, isLocal: false, isAi: false }
          }
          
          setAiMessages(prev => [...prev, promptMsg])
          setAiPromptStatus({ active: true, name: questionerName })
        } catch (e) {
          console.warn("[LiveKit Debug] Failed to parse public-ai-prompt payload:", e)
        }
        return
      }

      // Only process AI response topics
      if (topic !== "public-ai" && topic !== "private-ai") return

      try {
        const decoded = new TextDecoder().decode(payload)
        const json = JSON.parse(decoded)

        // Clear AI prompting status when response arrives
        setAiPromptStatus({ active: false, name: "" })

        // Do not display empty messages
        if (!json.message || typeof json.message !== "string" || json.message.trim() === "") return

        // Filter private messages not meant for the current user
        if (topic === "private-ai" && json.questioner && String(json.questioner) !== String(currentUserIdRef.current)) {
          return
        }

        const fromName = topic === "public-ai" ? "Public AI" : "Private AI"

        const newAiMsg = {
          id: json.id || `ai-${Date.now()}-${Math.random()}`,
          timestamp: json.timestamp || Date.now(),
          message: json.message,
          topic: topic, // So the UI knows if it's public or private AI
          questioner: json.questioner,
          from: { name: fromName, isSystem: false, isAi: true },
        }

        setAiMessages((prev) => [...prev, newAiMsg])
      } catch (e) {
        console.warn("[LiveKit Debug] Failed to parse AI message payload:", e)
      }
    }

    lkRoom.on(RoomEvent.DataReceived, handleData)
    return () => {
      lkRoom.off(RoomEvent.DataReceived, handleData)
    }
  }, [lkRoom])

  return { aiMessages, addOptimisticAiMessage, aiPromptStatus, setAiPromptStatus }
}
