import React, { useState, useMemo } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import useStories from "../hooks/useStories"
import useDanmaku from "../hooks/useDanmaku"
import StoryInputBar from "./StoryInputBar"
import DanmakuStage from "./DanmakuStage"
import PassConfirmationModal from "./PassConfirmationModal"
import MyStoryModal from "./MyStoryModal"
import { LoadingSpinner } from "@/shared/components/ui/indicators"


const LiveMessages = ({ languageCommunity }) => {
  const {
    stories,
    myStories,
    inputValue,
    setInputValue,
    handleCreate,
    handleInteract,
    handleDelete,
    loadingStories,
    loadingMyStories,
  } = useStories(languageCommunity)
  const { t } = useLanguage()
  const [selectedStory, setSelectedStory] = useState(null)
  const [selectedMyStory, setSelectedMyStory] = useState(null)

  // Combine stories with isOwn flag
  const combinedStories = useMemo(
    () => [
      ...stories.map((story) => ({ ...story, isOwn: false })),
      ...myStories.map((story) => ({ ...story, isOwn: true })),
    ],
    [stories, myStories],
  )

  const { stageRef, danmakuItems } = useDanmaku(combinedStories)

  const myCount = myStories.length
  const totalCount = stories.length + myStories.length
  const handleSend = () => handleCreate(inputValue)

  const isLoading = loadingStories || loadingMyStories
  const isEmpty = !isLoading && combinedStories.length === 0

  // Interaction handlers
  const handleItemClick = (story) => {
    if (story.isOwn) {
      setSelectedMyStory(story)
    } else {
      setSelectedStory(story)
    }
  }

  const handleConnect = (story) => {
    handleInteract(story.storyId, 1)
  }

  const handlePass = (story) => {
    handleInteract(story.storyId, 2)
  }

  return (
    <div
      className="relative flex w-full max-w-full flex-col"
      style={{ height: "calc(100dvh - 180px)", minHeight: "50vh" }}
    >
      <StoryInputBar
        inputValue={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onSend={handleSend}
        myCount={myCount}
        totalCount={totalCount}
        variant={isEmpty ? "empty" : "default"}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-0">
          <LoadingSpinner size="lg" />
        </div>
      ) : isEmpty ? (
        <div className="relative my-6 flex-1 w-full max-w-full overflow-hidden rounded-3xl bg-white/60 px-2 py-8 text-center">
          <div className="mt-4 text-[#7A7574] italic">
            {t.catSpeak.mail.noStories}
          </div>
        </div>
      ) : (
        <DanmakuStage
          danmakuItems={danmakuItems}
          stageRef={stageRef}
          onItemClick={handleItemClick}
        />
      )}

      <PassConfirmationModal
        open={!!selectedStory}
        story={selectedStory}
        onConnect={handleConnect}
        onPass={handlePass}
        onClose={() => setSelectedStory(null)}
      />
      <MyStoryModal
        open={!!selectedMyStory}
        story={selectedMyStory}
        onClose={() => setSelectedMyStory(null)}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default LiveMessages
