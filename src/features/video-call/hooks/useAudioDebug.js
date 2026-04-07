import { useEffect, useRef, useCallback } from "react"
import { useRoomContext, useConnectionState } from "@livekit/components-react"
import { Track, ConnectionState, RoomEvent } from "livekit-client"

const P = "[AudioDebug]"

/**
 * Diagnostic hook for the "one person can't hear others" issue.
 *
 * What to look for in the console:
 *   ❌ SUBSCRIPTION FAILED  → LiveKit couldn't deliver audio
 *   🔇 UNSUBSCRIBED         → Audio track dropped mid-call
 *   Snapshot shows:
 *     - micIsSubscribed: false     → not receiving someone's audio
 *     - mediaStreamTrackState: "ended" → browser track died
 *     - <audio> paused: true       → autoplay policy blocked playback
 *     - <audio> srcObject: "null"  → audio element not wired up
 *
 * Manual use: call window.__audioDebugSnapshot() in the browser console.
 *
 * Remove this hook after the issue is diagnosed.
 */
export const useAudioDebug = () => {
  const room = useRoomContext()
  const connectionState = useConnectionState()
  const intervalRef = useRef(null)

  // ── Room-level audio track events ──
  useEffect(() => {
    if (!room) return

    const onSubscribed = (track, pub, participant) => {
      if (pub.kind !== Track.Kind.Audio) return
      console.log(`${P} 🔊 SUBSCRIBED`, participant.identity, {
        sid: pub.trackSid,
        source: pub.source,
        muted: pub.isMuted,
        mstState: track.mediaStreamTrack?.readyState,
        mstEnabled: track.mediaStreamTrack?.enabled,
      })
    }

    const onUnsubscribed = (_track, pub, participant) => {
      if (pub.kind !== Track.Kind.Audio) return
      console.warn(`${P} 🔇 UNSUBSCRIBED`, participant.identity, pub.trackSid)
    }

    const onSubFailed = (trackSid, participant) => {
      console.error(`${P} ❌ SUBSCRIPTION FAILED`, participant.identity, trackSid)
    }

    const onMuted = (pub, participant) => {
      if (pub.kind !== Track.Kind.Audio) return
      console.log(`${P} 🔇 MUTED`, participant.identity, pub.trackSid)
    }

    const onUnmuted = (pub, participant) => {
      if (pub.kind !== Track.Kind.Audio) return
      console.log(`${P} 🔊 UNMUTED`, participant.identity, pub.trackSid)
    }

    room.on(RoomEvent.TrackSubscribed, onSubscribed)
    room.on(RoomEvent.TrackUnsubscribed, onUnsubscribed)
    room.on(RoomEvent.TrackSubscriptionFailed, onSubFailed)
    room.on(RoomEvent.TrackMuted, onMuted)
    room.on(RoomEvent.TrackUnmuted, onUnmuted)

    return () => {
      room.off(RoomEvent.TrackSubscribed, onSubscribed)
      room.off(RoomEvent.TrackUnsubscribed, onUnsubscribed)
      room.off(RoomEvent.TrackSubscriptionFailed, onSubFailed)
      room.off(RoomEvent.TrackMuted, onMuted)
      room.off(RoomEvent.TrackUnmuted, onUnmuted)
    }
  }, [room])

  // ── Snapshot: local + all remotes + <audio> elements (all from YOUR perspective) ──
  const snapshot = useCallback(() => {
    if (!room || connectionState !== ConnectionState.Connected) return

    const local = room.localParticipant
    const remotes = Array.from(room.remoteParticipants.values())
    const audioEls = document.querySelectorAll("audio")

    console.groupCollapsed(
      `${P} 📊 Snapshot (from ${local.identity}) — ${remotes.length} remote(s), ${audioEls.length} <audio>(s)`,
    )

    // Local participant's outgoing audio
    const localMic = local.getTrackPublication(Track.Source.Microphone)
    console.log(`  [LOCAL] ${local.name || local.identity}`, {
      micEnabled: local.isMicrophoneEnabled,
      micPublished: !!localMic,
      trackSid: localMic?.trackSid ?? null,
      muted: localMic?.isMuted ?? null,
      trackExists: !!localMic?.track,
      mstState: localMic?.track?.mediaStreamTrack?.readyState ?? null,
      mstEnabled: localMic?.track?.mediaStreamTrack?.enabled ?? null,
    })

    // Each remote participant's audio as seen from this client
    remotes.forEach((p) => {
      const mic = p.getTrackPublication(Track.Source.Microphone)
      console.log(`  [REMOTE] ${p.name || p.identity}`, {
        connectionQuality: p.connectionQuality,
        micEnabled: p.isMicrophoneEnabled,
        micPublished: !!mic,
        subscribed: mic?.isSubscribed ?? null,
        muted: mic?.isMuted ?? null,
        enabled: mic?.isEnabled ?? null,
        trackExists: !!mic?.track,
        mstState: mic?.track?.mediaStreamTrack?.readyState ?? null,
        mstEnabled: mic?.track?.mediaStreamTrack?.enabled ?? null,
      })
    })

    // <audio> elements rendered by RoomAudioRenderer
    audioEls.forEach((el, i) => {
      const tracks = el.srcObject?.getTracks?.() ?? []
      console.log(`  <audio>[${i}]`, {
        paused: el.paused,
        muted: el.muted,
        volume: el.volume,
        readyState: el.readyState,
        srcObject: el.srcObject ? "present" : "null",
        tracks: tracks.map((t) => ({ state: t.readyState, enabled: t.enabled, muted: t.muted })),
        error: el.error ? { code: el.error.code, message: el.error.message } : null,
      })
    })

    console.groupEnd()
  }, [room, connectionState])

  // Run snapshot every 15s while connected
  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return
    const t = setTimeout(snapshot, 3000)
    intervalRef.current = setInterval(snapshot, 15000)
    return () => { clearTimeout(t); clearInterval(intervalRef.current) }
  }, [connectionState, snapshot])

  // Expose for manual console use
  useEffect(() => {
    window.__audioDebugSnapshot = snapshot
    return () => { delete window.__audioDebugSnapshot }
  }, [snapshot])
}
