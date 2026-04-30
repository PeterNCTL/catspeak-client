import React, { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import MessageList from "./MessageList"
import ChatInput from "./ChatInput"

const ChatBox = ({
  messages,
  currentUser,
  onSendMessage,
  isConnected,
  className = "",
  hideTitle,
}) => {
  const { t } = useLanguage()
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)

  const chatStyle = isChatCollapsed
    ? { height: "40px", flexShrink: 0 }
    : { flex: 1, minHeight: 0 }

  return (
    <div className={`relative flex h-full flex-col bg-white ${className}`}>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Regular Chat Pane */}
        <div className="flex flex-col bg-white" style={chatStyle}>
          <button
            type="button"
            onClick={() => setIsChatCollapsed(!isChatCollapsed)}
            className="flex items-center gap-2 px-4 h-10 w-full hover:bg-[#F6F6F6] border-b border-[#E5E5E5] shrink-0 text-left"
          >
            {isChatCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
            <h3 className="text-sm">
              {t.rooms?.chatBox?.title || "Room Chat"}
            </h3>
          </button>
          {!isChatCollapsed && (
            <>
              <MessageList
                messages={messages}
                t={t}
                emptyText={t.rooms?.chatBox?.empty || "No messages yet"}
              />
              <ChatInput
                onSendMessage={onSendMessage}
                isConnected={isConnected}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatBox
