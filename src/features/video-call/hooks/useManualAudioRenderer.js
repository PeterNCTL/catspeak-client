import { useEffect, useRef, useCallback } from "react"
import { useRoomContext } from "@livekit/components-react"
import { RoomEvent, Track } from "livekit-client"

const P = "[ManualAudio]"

/**
 * Custom audio renderer that replaces LiveKit's `<RoomAudioRenderer>`.
 *
 * Creates and manages `<audio>` elements **imperatively via the DOM**
 * instead of through React rendering. This fixes audio playback in
 * in-app WebView browsers (Zalo, Messenger, LINE, etc.) where React-
 * managed `<audio>` elements silently fail after track renegotiation.
 *
 * How it works:
 *  - Listens to TrackSubscribed / TrackUnsubscribed room events
 *  - On subscribe: creates OR REUSES a DOM `<audio>`, attaches the
 *    MediaStream, calls `.play()` with retry logic
 *  - On unsubscribe: detaches the track but KEEPS the `<audio>` element
 *    alive so it can be reused (preserves autoplay privilege in WebViews)
 *  - Keeps a Map<participantIdentity, { el, trackSid }> for reuse/cleanup
 *  - Elements are only fully removed when the participant disconnects
 *
 * WebView quirks addressed:
 *  1. Container uses `position:absolute; opacity:0` instead of `display:none`
 *     because some WebViews won't activate the media pipeline for elements
 *     inside `display:none` containers.
 *  2. An AudioContext unlock is triggered on first user gesture so that
 *     subsequent `.play()` calls are allowed.
 *  3. A global touch/click listener retries all paused `<audio>` elements
 *     on the next user interaction (fallback for very strict autoplay).
 *
 * Safe on all platforms — desktop browsers work identically.
 */
export const useManualAudioRenderer = () => {
  const room = useRoomContext()

  // Map of participantIdentity → { el: HTMLAudioElement, trackSid: string }
  const audioMapRef = useRef(new Map())
  // Container for audio elements (lives outside React tree)
  const containerRef = useRef(null)

  // ── Create / destroy the container ──
  // Uses position:absolute + opacity:0 instead of display:none.
  // Some WebView engines (Zalo, Messenger) refuse to play media inside
  // display:none containers.
  useEffect(() => {
    const container = document.createElement("div")
    container.id = "manual-audio-renderer"
    container.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;"
    document.body.appendChild(container)
    containerRef.current = container

    return () => {
      audioMapRef.current.forEach((entry, identity) => {
        cleanupAudioElement(entry.el, identity)
      })
      audioMapRef.current.clear()
      container.remove()
      containerRef.current = null
    }
  }, [])

  // ── AudioContext unlock + gesture-powered audio resume ──
  // WebView browsers often keep AudioContext suspended until a user gesture.
  // We also retry all paused <audio> elements on the first interaction.
  useEffect(() => {
    let unlocked = false

    const unlockAudio = () => {
      if (unlocked) return
      unlocked = true

      // 1. Resume AudioContext (needed by WebViews)
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (AudioCtx) {
          const ctx = new AudioCtx()
          ctx.resume().then(() => {
            ctx.close()
            console.log(`${P} 🔓 AudioContext unlocked via user gesture`)
          })
        }
      } catch {}

      // 2. Retry all paused <audio> elements
      audioMapRef.current.forEach((entry, identity) => {
        if (entry.el && entry.el.paused && entry.el.srcObject) {
          entry.el
            .play()
            .then(() =>
              console.log(
                `${P} ✅ Resumed paused audio for ${identity} via user gesture`,
              ),
            )
            .catch(() => {})
        }
      })

      // Clean up listeners after first successful unlock
      cleanup()
    }

    const events = ["click", "touchstart", "touchend", "keydown"]
    events.forEach((e) =>
      document.addEventListener(e, unlockAudio, { capture: true, once: false }),
    )

    const cleanup = () => {
      events.forEach((e) =>
        document.removeEventListener(e, unlockAudio, { capture: true }),
      )
    }

    return cleanup
  }, [])

  // ── Core: attach an audio track to an <audio> element ──
  const attachTrack = useCallback((track, pub, participant) => {
    const identity = participant.identity
    const sid = pub.trackSid
    if (!identity || !sid || !containerRef.current) return

    const existing = audioMapRef.current.get(identity)

    if (existing) {
      // Reuse the existing <audio> element — just swap the track.
      if (existing.trackSid === sid) {
        console.log(`${P} 🔄 Re-attaching same track for ${identity} (${sid})`)
      } else {
        console.log(
          `${P} 🔄 Swapping track for ${identity}: ${existing.trackSid} → ${sid}`,
        )
      }

      // Detach old track
      try {
        existing.el.pause()
        existing.el.srcObject = null
      } catch {}

      // Attach the new track's MediaStream
      track.attach(existing.el)
      existing.trackSid = sid
      existing.el.setAttribute("data-track-sid", sid)

      playWithRetry(existing.el, sid, identity)
    } else {
      // First time — create a new <audio>
      const el = document.createElement("audio")
      el.autoplay = true
      el.playsInline = true
      // Some WebViews need these explicitly
      el.setAttribute("playsinline", "")
      el.setAttribute("webkit-playsinline", "")
      el.setAttribute("data-participant", identity)
      el.setAttribute("data-track-sid", sid)

      track.attach(el)

      containerRef.current.appendChild(el)
      audioMapRef.current.set(identity, { el, trackSid: sid })

      console.log(`${P} ▶️ Created audio element for ${identity} (${sid})`)

      playWithRetry(el, sid, identity)
    }
  }, [])

  // ── Detach track but keep the <audio> element alive ──
  const detachTrack = useCallback((pub, participant) => {
    const identity = participant.identity
    const sid = pub.trackSid
    if (!identity) return

    const entry = audioMapRef.current.get(identity)
    if (entry && entry.trackSid === sid) {
      try {
        entry.el.pause()
      } catch {}
      entry.el.srcObject = null
      entry.trackSid = null
      console.log(
        `${P} 🔇 Detached track for ${identity} (${sid}) — element kept`,
      )
    }
  }, [])

  // ── Remove element entirely when participant leaves the room ──
  const removeParticipant = useCallback((participant) => {
    const identity = participant.identity
    if (!identity) return

    const entry = audioMapRef.current.get(identity)
    if (entry) {
      cleanupAudioElement(entry.el, identity)
      audioMapRef.current.delete(identity)
    }
  }, [])

  // ── Attach existing remote audio tracks on mount / reconnect ──
  useEffect(() => {
    if (!room) return

    const attachExisting = () => {
      room.remoteParticipants.forEach((participant) => {
        participant.audioTrackPublications.forEach((pub) => {
          if (pub.track && pub.isSubscribed && pub.kind === Track.Kind.Audio) {
            attachTrack(pub.track, pub, participant)
          }
        })
      })
    }

    attachExisting()

    room.on(RoomEvent.Reconnected, attachExisting)
    return () => room.off(RoomEvent.Reconnected, attachExisting)
  }, [room, attachTrack])

  // ── Subscribe / unsubscribe / disconnect listeners ──
  useEffect(() => {
    if (!room) return

    const onSubscribed = (track, pub, participant) => {
      if (pub.kind !== Track.Kind.Audio) return
      if (participant.isLocal) return
      attachTrack(track, pub, participant)
    }

    const onUnsubscribed = (_track, pub, participant) => {
      if (pub.kind !== Track.Kind.Audio) return
      if (participant.isLocal) return
      detachTrack(pub, participant)
    }

    const onParticipantDisconnected = (participant) => {
      removeParticipant(participant)
    }

    room.on(RoomEvent.TrackSubscribed, onSubscribed)
    room.on(RoomEvent.TrackUnsubscribed, onUnsubscribed)
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected)

    return () => {
      room.off(RoomEvent.TrackSubscribed, onSubscribed)
      room.off(RoomEvent.TrackUnsubscribed, onUnsubscribed)
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected)
    }
  }, [room, attachTrack, detachTrack, removeParticipant])
}

// ─── Helpers (module-level) ──────────────────────────────────────────────────

function cleanupAudioElement(el, identity) {
  try {
    el.pause()
    el.srcObject = null
    el.remove()
    console.log(`${P} 🗑️ Removed audio element for ${identity}`)
  } catch {}
}

/**
 * Attempt to play an <audio> element with retries.
 * WebViews often need multiple attempts with increasing delays.
 */
function playWithRetry(el, sid, identity, attempt = 0) {
  const delays = [0, 100, 300, 800, 1500, 3000]
  if (attempt >= delays.length) {
    console.warn(
      `${P} ❌ All play attempts exhausted for ${identity} (${sid}). ` +
        `Waiting for user gesture to resume.`,
    )
    return
  }

  setTimeout(() => {
    if (!el.parentNode) return

    // Ensure the element is in a playable state
    el.muted = false
    el.volume = 1.0

    el.play()
      .then(() => {
        console.log(
          `${P} ✅ Playing audio for ${identity} (${sid}) [attempt ${attempt + 1}]`,
        )
      })
      .catch((err) => {
        console.warn(
          `${P} ⚠️ play() failed for ${identity} (${sid}) [attempt ${attempt + 1}]:`,
          err.message,
        )
        playWithRetry(el, sid, identity, attempt + 1)
      })
  }, delays[attempt])
}
