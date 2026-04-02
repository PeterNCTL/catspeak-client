import { useCallback } from "react"
import {
  useRoomContext,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react"
import { Track } from "livekit-client"

/**
 * Encapsulates screen-share state & actions using LiveKit.
 *
 * - Detects active screen shares via useTracks(ScreenShare)
 * - Toggle via room.localParticipant.setScreenShareEnabled()
 */
export const useScreenShare = () => {
  const room = useRoomContext()
  const { isScreenShareEnabled } = useLocalParticipant()

  // Get all screen share tracks across all participants
  const screenShareTracks = useTracks([Track.Source.ScreenShare])

  // Find the first active screen share
  const screenShareTrackRef =
    screenShareTracks.length > 0 ? screenShareTracks[0] : null

  const presenter = screenShareTrackRef?.participant ?? null
  const isLocalScreenShare = presenter?.isLocal ?? false
  const screenShareOn = !!screenShareTrackRef

  const toggleScreenShare = useCallback(async () => {
    await room.localParticipant.setScreenShareEnabled(!isScreenShareEnabled)
  }, [room, isScreenShareEnabled])

  return {
    screenShareOn,
    screenShareTrackRef,
    presenterId: presenter?.identity ?? null,
    isLocalScreenShare,
    toggleScreenShare,
    presenterDisplayName: presenter?.name ?? null,
  }
}
