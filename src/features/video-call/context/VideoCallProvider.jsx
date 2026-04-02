import React, { useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { LiveKitRoom } from "@livekit/components-react"
import { useGetProfileQuery } from "@/features/auth"
import {
  useGetVideoSessionByIdQuery,
  useGetLivekitTokenMutation,
} from "@/store/api/videoSessionsApi"
import {
  useGetRoomByIdQuery,
  WaitingScreen,
  useMediaPreview,
  useJoinVideoSession,
} from "@/features/rooms"
import { useLanguage } from "@/shared/context/LanguageContext"
import { VideoCallContent } from "./VideoCallContext"
import VideoCallLoading from "../components/VideoCallLoading"
import RoomNotFoundScreen from "../components/RoomNotFoundScreen"
import SessionErrorScreen from "../components/SessionErrorScreen"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"

const LIVEKIT_WS_URL = "wss://livekit.catspeak.com.vn"

/**
 * Phases:
 *  - "waiting"  : Room loaded, showing WaitingScreen with media preview
 *  - "joining"  : User clicked "Join Now", creating/joining video session
 *  - "in-call"  : Session joined, LiveKit token acquired, LiveKitRoom rendered
 */
export const VideoCallProvider = ({ children }) => {
  const { id: roomId } = useParams()
  const { t } = useLanguage()

  // Phase state machine
  const [phase, setPhase] = useState("waiting") // "waiting" | "joining" | "in-call"
  const [joinedSessionId, setJoinedSessionId] = useState(null)
  const [livekitToken, setLivekitToken] = useState(null)
  const [initMicOn, setInitMicOn] = useState(false)
  const [initCamOn, setInitCamOn] = useState(false)

  // --- User data ---
  const { data: userData, isLoading: isLoadingUser } = useGetProfileQuery()
  const user = userData?.data ?? null

  // --- Room data (fetched by roomId from URL) ---
  const isRoomQuerySkipped = !roomId || !user
  const {
    data: room,
    isLoading: isLoadingRoom,
    error: roomError,
  } = useGetRoomByIdQuery(roomId, {
    skip: isRoomQuerySkipped,
    pollingInterval: phase === "waiting" ? 15000 : undefined,
  })

  // --- Media Preview (for waiting screen) ---
  const {
    micOn,
    cameraOn,
    localStream,
    toggleMic: hookToggleMic,
    toggleCamera: hookToggleCamera,
  } = useMediaPreview()

  const toggleMic = async () => {
    await hookToggleMic()
  }

  const toggleCamera = async () => {
    await hookToggleCamera()
  }

  // --- Join/create session logic ---
  const {
    handleJoin: hookJoin,
    isLoadingSessions,
    activeSession,
    isJoining,
    isCreating,
  } = useJoinVideoSession({
    roomId,
    isAuthenticated: !!user,
  })

  // Room full check
  const currentParticipantCount = room?.currentParticipantCount ?? 0
  const maxParticipants = room?.maxParticipants ?? null
  const isRoomFull =
    maxParticipants !== null && currentParticipantCount >= maxParticipants

  // --- Session data (fetched after join) ---
  const {
    data: session,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useGetVideoSessionByIdQuery(joinedSessionId, {
    skip: !joinedSessionId,
  })

  // --- LiveKit token mutation ---
  const [getLivekitToken] = useGetLivekitTokenMutation()

  // --- Cleanup media preview tracks when transitioning to in-call ---
  const cleanupMediaPreview = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }
  }, [localStream])

  // --- Handle "Join Now" click ---
  // Flow: LiveKit token first → backend session only if token is valid
  const handleJoinClick = async () => {
    setPhase("joining")

    try {
      // 1. Fetch LiveKit token FIRST to validate connectivity
      const tokenRes = await getLivekitToken({
        roomId: parseInt(roomId),
        roomName: room.name,
        participantIdentity: String(user.accountId),
        participantName: user.username,
      }).unwrap()

      const token = tokenRes?.participant_token
      if (!token || typeof token !== "string") {
        throw new Error("Invalid LiveKit token received from backend")
      }

      // 2. Token is valid → now create/join the backend session
      const result = await hookJoin({ isRoomFull, micOn, cameraOn })

      if (result) {
        // Stop preview tracks before entering the call
        cleanupMediaPreview()

        setLivekitToken(token)
        setInitMicOn(result.micOn)
        setInitCamOn(result.cameraOn)
        setJoinedSessionId(result.sessionId)
        setPhase("in-call")
      } else {
        // Backend session join failed, go back to waiting
        setPhase("waiting")
      }
    } catch (err) {
      console.error("[VideoCall] LiveKit token fetch failed:", err)
      toast.error(
        t.rooms.videoCall.provider.tokenError ??
          "Failed to connect to video service. Please try again.",
      )
      setPhase("waiting")
    }
  }

  // ========================================
  //  RENDER: Guards & phase-based rendering
  // ========================================

  // Loading room data
  if (
    isLoadingUser ||
    isLoadingRoom ||
    isLoadingSessions ||
    isRoomQuerySkipped
  ) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-gray-500">
        <LoadingSpinner text={t.rooms.waitingScreen.loading} />
      </div>
    )
  }

  // Room not found
  if (roomError || !room) {
    return <RoomNotFoundScreen />
  }

  // ---- PHASE: WAITING ----
  if (phase === "waiting") {
    const displaySession = activeSession || {
      name: room.name,
      roomName: room.name,
      topic: room.topic,
      requiredLevel: room.requiredLevel,
      participants: [],
    }

    return (
      <WaitingScreen
        session={displaySession}
        room={room}
        participantCount={currentParticipantCount}
        user={user}
        micOn={micOn}
        cameraOn={cameraOn}
        localStream={localStream}
        onToggleMic={toggleMic}
        onToggleCam={toggleCamera}
        onJoin={handleJoinClick}
        isFull={isRoomFull}
        maxParticipants={maxParticipants}
      />
    )
  }

  // ---- PHASE: JOINING ----
  if (phase === "joining") {
    return (
      <VideoCallLoading
        message={t.rooms.videoCall.provider.connecting ?? "Connecting..."}
      />
    )
  }

  // ---- PHASE: IN-CALL ----
  // Wait for session data
  if (isLoadingSession || !session) {
    return (
      <VideoCallLoading
        message={t.rooms.videoCall.provider.connecting ?? "Connecting..."}
      />
    )
  }

  // Session error
  if (sessionError) {
    console.error("Failed to load session:", sessionError)
    return <SessionErrorScreen error={sessionError} />
  }

  // Wait for LiveKit token
  if (!livekitToken || !userData) {
    return (
      <VideoCallLoading
        message={t.rooms.videoCall.provider.connecting ?? "Connecting..."}
      />
    )
  }

  return (
    <LiveKitRoom
      serverUrl={LIVEKIT_WS_URL}
      token={livekitToken}
      connect={true}
      audio={initMicOn}
      video={initCamOn}
      className="h-full w-full flex flex-col"
      options={{
        publishDefaults: {
          simulcast: true,
        },
      }}
    >
      <VideoCallContent
        user={user}
        session={session}
        sessionError={sessionError}
        room={room}
      >
        {children}
      </VideoCallContent>
    </LiveKitRoom>
  )
}
