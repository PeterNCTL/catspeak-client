import { MicOff, VideoOff, MonitorUp } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useEffect, useRef } from "react"
import { useIsSpeaking } from "@livekit/components-react"
import { Track } from "livekit-client"

/**
 * Renders a single participant's video tile using LiveKit.
 *
 * @param {{ participant: import('livekit-client').Participant }} props
 */
const VideoTile = ({ participant }) => {
  const isSpeaking = useIsSpeaking(participant)

  const displayName = participant.name || participant.identity || "?"
  const isLocal = participant.isLocal
  const micOn = participant.isMicrophoneEnabled
  const webcamOn = participant.isCameraEnabled
  const screenShareOn = participant.isScreenShareEnabled

  // Get the camera track publication
  const cameraPub = participant.getTrackPublication(Track.Source.Camera)
  const cameraTrack = cameraPub?.track
  const isVideoVisible = webcamOn && !!cameraTrack

  const videoRef = useRef(null)

  // Attach / detach the camera track to the <video> element
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    if (cameraTrack) {
      cameraTrack.attach(el)
    }

    return () => {
      if (cameraTrack) {
        cameraTrack.detach(el)
      }
    }
  }, [cameraTrack])

  // For remote participants, also attach audio
  const micPub = participant.getTrackPublication(Track.Source.Microphone)
  const audioTrack = micPub?.track
  const audioRef = useRef(null)

  useEffect(() => {
    const el = audioRef.current
    if (!el || isLocal) return

    if (audioTrack) {
      audioTrack.attach(el)
    }

    return () => {
      if (audioTrack) {
        audioTrack.detach(el)
      }
    }
  }, [audioTrack, isLocal])

  return (
    <div
      className={`relative h-full w-full min-h-[150px] overflow-hidden rounded-lg bg-white border border-solid transition-[border-color,box-shadow] duration-200 ease-in-out ${
        isSpeaking
          ? "border-green-600 shadow-[0_0_15px_rgba(46,125,50,0.4)]"
          : "border-[#C6C6C6] shadow-sm"
      }`}
    >
      {/* Video element for camera track */}
      <video
        autoPlay
        playsInline
        muted={isLocal}
        ref={videoRef}
        className={`h-full w-full object-cover ${
          isVideoVisible ? "block" : "hidden"
        }`}
      />

      {/* Hidden audio element for remote audio */}
      {!isLocal && (
        <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />
      )}

      {/* Avatar fallback when no video */}
      {!isVideoVisible && (
        <div className="flex h-full w-full items-center justify-center">
          <Avatar
            size={64}
            name={displayName || "?"}
            speaking={isSpeaking}
            className="sm:!w-20 sm:!h-20 md:!w-24 md:!h-24"
          />
        </div>
      )}

      {/* Name + speaking indicator */}
      <div className="absolute bottom-5 left-5 flex max-w-[70%] items-center gap-2">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-black">
          {displayName} {isLocal && "(You)"}
        </div>
        {isSpeaking && (
          <div className="flex h-3 items-end gap-[2px]">
            <div className="h-2 w-[3px] animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-green-600" />
            <div className="h-3 w-[3px] animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-green-600 delay-100" />
            <div className="h-[6px] w-[3px] animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-green-600 delay-200" />
          </div>
        )}
      </div>

      {/* Mic / cam off icons */}
      <div className="absolute bottom-5 right-5 flex items-center gap-4">
        {screenShareOn && <MonitorUp className="text-yellow-500" />}
        {!micOn && <MicOff className="text-[#7A7574]" />}
        {!webcamOn && <VideoOff className="text-[#7A7574]" />}
      </div>
    </div>
  )
}

export default VideoTile
