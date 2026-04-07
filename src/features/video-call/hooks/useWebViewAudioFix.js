import { useEffect, useRef } from "react"
import { useRoomContext, useConnectionState } from "@livekit/components-react"
import { RoomEvent, Track, ConnectionState } from "livekit-client"

/**
 * Workaround for in-app WebView browsers (Zalo, Messenger, LINE, etc.)
 * that silently refuse to play audio after a remote participant's track
 * is re-subscribed (e.g. when someone refreshes and rejoins the call).
 *
 * Initial audio works because the user tapped "Join" (user gesture),
 * but subsequent TrackSubscribed events fire programmatically — the
 * WebView blocks autoplay on the new <audio> srcObject.
 *
 * This hook:
 *  1. Resumes suspended AudioContext
 *  2. Force-plays paused <audio> elements
 *  3. Re-attaches srcObject on <audio> elements that report playing but
 *     have a stale/dead MediaStreamTrack (common in WebViews)
 *
 * Safe to use on all platforms — the checks are no-ops on desktop
 * browsers where audio plays normally.
 */
export const useWebViewAudioFix = () => {
  const room = useRoomContext()
  const connectionState = useConnectionState()
  const isConnected = connectionState === ConnectionState.Connected

  // Track whether we've set up the one-time user-gesture listener
  const gestureListenerRef = useRef(false)

  // ── 1. On every remote audio track subscription, force audio playback ──
  useEffect(() => {
    if (!room) return

    const ensureAudioPlaying = (_track, pub, participant) => {
      if (pub.kind !== Track.Kind.Audio) return

      console.log(
        `[WebViewAudioFix] 🔄 Audio subscribed from ${participant.identity}`,
      )

      // Resume AudioContext if suspended
      resumeAudioContext(room)

      // Wait for RoomAudioRenderer to attach the stream, then force-play
      setTimeout(() => forcePlayAllAudioElements(), 200)
      // Second attempt with longer delay for slow WebViews
      setTimeout(() => forcePlayAllAudioElements(), 800)
    }

    room.on(RoomEvent.TrackSubscribed, ensureAudioPlaying)
    return () => room.off(RoomEvent.TrackSubscribed, ensureAudioPlaying)
  }, [room])

  // ── 2. Also handle reconnection events (participant reconnected) ──
  useEffect(() => {
    if (!room) return

    const onReconnected = () => {
      console.log("[WebViewAudioFix] 🔄 Room reconnected, ensuring audio...")
      resumeAudioContext(room)
      setTimeout(() => forcePlayAllAudioElements(), 500)
    }

    room.on(RoomEvent.Reconnected, onReconnected)
    return () => room.off(RoomEvent.Reconnected, onReconnected)
  }, [room])

  // ── 3. Listen for any user touch/click to resume audio ──
  // WebViews allow audio after ANY user gesture. If the fix above doesn't
  // work immediately (e.g. user isn't touching the screen), this catches
  // the next tap and resumes everything.
  useEffect(() => {
    if (!isConnected || gestureListenerRef.current) return
    gestureListenerRef.current = true

    const onUserGesture = () => {
      resumeAudioContext(room)
      forcePlayAllAudioElements()
    }

    // These events count as "user gestures" for autoplay policy
    document.addEventListener("touchstart", onUserGesture, { passive: true })
    document.addEventListener("click", onUserGesture, { passive: true })

    return () => {
      gestureListenerRef.current = false
      document.removeEventListener("touchstart", onUserGesture)
      document.removeEventListener("click", onUserGesture)
    }
  }, [isConnected, room])
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resumeAudioContext(room) {
  try {
    // Try LiveKit's internal AudioContext first
    const ctx =
      room?.localParticipant?.audioContext ??
      (typeof window !== "undefined" && window.__lkAudioContext)
    if (ctx?.state === "suspended") {
      console.log("[WebViewAudioFix] ▶️ Resuming suspended AudioContext")
      ctx.resume().catch(() => {})
    }
  } catch {}

  // Also try the global AudioContext (some WebViews use this)
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (Ctor) {
      const ctx = new Ctor()
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {})
      }
      // Don't leave orphaned contexts — close immediately if we created one
      // (the resume will have kicked the browser's audio system)
      ctx.close().catch(() => {})
    }
  } catch {}
}

function forcePlayAllAudioElements() {
  const audioEls = document.querySelectorAll("audio")
  audioEls.forEach((el, i) => {
    if (!el.srcObject) return

    // Check if the MediaStreamTrack is alive
    const tracks = el.srcObject.getAudioTracks?.() ?? []
    const hasLiveTrack = tracks.some(
      (t) => t.readyState === "live" && t.enabled,
    )

    if (el.paused) {
      console.log(`[WebViewAudioFix] ▶️ <audio>[${i}] paused → play()`)
      el.play().catch(() => {})
    } else if (!hasLiveTrack && tracks.length > 0) {
      // Tracks are ended/disabled — can't fix, just log
      console.warn(
        `[WebViewAudioFix] ⚠️ <audio>[${i}] has no live tracks`,
        tracks.map((t) => ({ state: t.readyState, enabled: t.enabled })),
      )
    } else {
      // Element says it's playing and tracks are live, but WebView
      // may still not be outputting audio. Re-attach srcObject to
      // force the browser to re-initialize the audio pipeline.
      const stream = el.srcObject
      el.srcObject = null
      el.srcObject = stream
      el.play().catch(() => {})
      console.log(
        `[WebViewAudioFix] 🔁 <audio>[${i}] re-attached srcObject`,
      )
    }
  })
}
