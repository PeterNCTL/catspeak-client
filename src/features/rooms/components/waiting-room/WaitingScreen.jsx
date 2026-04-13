import React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ParticipantsPreview from "./ParticipantsPreview"
import VideoPreview from "./VideoPreview"
import { useLanguage } from "@/shared/context/LanguageContext"
import meetingFallbackImage from "@/shared/assets/images/rooms/meeting.jpeg"

const WaitingScreen = ({
  session,
  room,
  participantCount,
  localStream,
  micOn,
  cameraOn,
  user,
  onToggleMic,
  onToggleCam,
  onJoin,
  isFull = false,
  maxParticipants = 5,
}) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const participants = session?.participants ?? []
  const { t } = useLanguage()
  const communityLanguage = localStorage.getItem("communityLanguage") || "en"
  const effectiveParticipantCount = participantCount ?? participants.length
  return (
    <div
      className="flex h-[100dvh] w-full flex-col bg-cover bg-center bg-no-repeat relative overflow-y-auto"
      style={{
        backgroundImage: `url(${room?.thumbnailUrl || meetingFallbackImage})`,
      }}
    >
      {/* Dark blurred overlay so the background isn't distracting */}
      <div className="fixed inset-0 bg-[#111111]/40 backdrop-blur-sm" />

      {/* Top Back Button */}
      <div className="relative z-50 w-full p-5 flex justify-start shrink-0">
        <button
          onClick={() =>
            navigate({
              pathname: `/${communityLanguage}/community`,
              search: searchParams.toString(),
            })
          }
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 text-white transition-all duration-300 shadow-sm"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          <span className="text-sm font-medium pr-1">
            {t.rooms.waitingScreen.backToCommunity}
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 w-full flex-col items-center justify-center p-5">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-2xl w-full max-w-[800px] flex flex-col items-center">
          <div className="mb-4 text-center">
            <h4 className="mb-2 font-semibold text-2xl md:text-3xl">
              {session?.roomName ||
                t.rooms.waitingScreen.readyToJoin}
            </h4>

            {/* Level & Topic Tags */}
            {(room?.requiredLevel || room?.topic) && (
              <div className="flex flex-wrap justify-center gap-2 mb-3 mt-2">
                {room?.requiredLevel && (
                  <span className="rounded-full bg-[#990011] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {room.requiredLevel}
                  </span>
                )}
                {room?.topic &&
                  room.topic.split(",").map((t_topic) => {
                    const trimmed = t_topic.trim()
                    return (
                      <span
                        key={trimmed}
                        className="rounded-full bg-[#990011] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                      >
                        {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                          trimmed}
                      </span>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Participants + Video stacked and centered */}
          <div className="flex w-full flex-col items-center justify-center gap-6 mb-6">
            <ParticipantsPreview
              participants={participants}
              participantCount={participantCount}
            />
            <VideoPreview
              user={user}
              localStream={localStream}
              micOn={micOn}
              cameraOn={cameraOn}
              onToggleMic={onToggleMic}
              onToggleCam={onToggleCam}
            />
          </div>

          <div className="flex flex-col items-center gap-2 w-full max-w-[320px]">
            <PillButton
              onClick={onJoin}
              disabled={isFull}
              aria-disabled={isFull}
              title={isFull ? t.rooms.waitingScreen.roomFull : undefined}
              className="h-11 w-full"
            >
              {t.rooms.waitingScreen.joinNow}
            </PillButton>
            {isFull && (
              <p className="text-sm text-red-600">
                {t.rooms.waitingScreen.roomFull} ({effectiveParticipantCount}/
                {maxParticipants})
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {t.rooms.waitingScreen.joinedAs}{" "}
              <span className="font-medium text-gray-900">
                {user?.username}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaitingScreen
