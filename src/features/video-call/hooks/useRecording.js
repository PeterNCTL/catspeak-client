import { useState, useCallback, useRef } from "react"
import { toast } from "react-hot-toast"
import {
  useStartRecordingMutation,
  useStopRecordingMutation,
} from "@/store/api/videoSessionsApi"

/**
 * useRecording — manages recording state for a video call session.
 *
 * @param {number|null} sessionId - CatSpeak session ID from Redux callInfo
 * @returns recording state and toggle handler
 */
export function useRecording(sessionId) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTogglingRecording, setIsTogglingRecording] = useState(false)
  const egressIdRef = useRef(null) // store egressId returned by start-recording

  const [startRecording] = useStartRecordingMutation()
  const [stopRecording] = useStopRecordingMutation()

  const handleToggleRecording = useCallback(async () => {
    if (!sessionId) {
      toast.error("No active session — cannot record.")
      return
    }

    if (isTogglingRecording) return // debounce double-click
    setIsTogglingRecording(true)

    try {
      if (!isRecording) {
        // ── START recording ────────────────────────────────────────────
        const result = await startRecording(sessionId).unwrap()
        egressIdRef.current = result.egressId
        setIsRecording(true)
        toast.success("Recording started", {
          icon: "🔴",
          duration: 3000,
        })
      } else {
        // ── STOP recording ─────────────────────────────────────────────
        const egressId = egressIdRef.current
        if (!egressId) {
          // Fallback: already stopped somehow
          setIsRecording(false)
          return
        }
        await stopRecording(egressId).unwrap()
        egressIdRef.current = null
        setIsRecording(false)
        toast.success("Recording stopped — processing upload…", {
          icon: "⏹️",
          duration: 4000,
        })
      }
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.data ||
        (isRecording ? "Failed to stop recording." : "Failed to start recording.")
      toast.error(msg)
      console.error("[Recording] toggle error:", err)
    } finally {
      setIsTogglingRecording(false)
    }
  }, [sessionId, isRecording, isTogglingRecording, startRecording, stopRecording])

  return {
    isRecording,
    isTogglingRecording,
    handleToggleRecording,
  }
}
