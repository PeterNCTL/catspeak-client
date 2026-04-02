import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
import {
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  conversationsApi,
} from "@/store/api/conversationsApi"
import useConversationSignalR from "../hooks/useConversationSignalR"
import {
  closeWidget,
  openWidget,
  setActiveConversation,
  setView,
  toggleWidget,
} from "@/store/slices/messageWidgetSlice"
import { MessageCircle } from "lucide-react"
import MessageModal from "./MessageModal"
import ConversationListHeader from "./headers/ConversationListHeader"
import ConversationDetailHeader from "./headers/ConversationDetailHeader"
import ConversationList from "./conversation-list/ConversationList"
import ConversationDetail from "./conversation-detail/ConversationDetail"

const MessageWidget = () => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = React.useContext(AuthModalContext)
  const { isOpen, activeConversationId, view } = useSelector(
    (state) => state.messageWidget,
  )
  const [input, setInput] = React.useState("")
  const widgetRef = React.useRef(null)

  // Handle click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        // Also check if click is inside the portal-rendered modal (mobile)
        if (event.target.closest?.("[data-message-widget-portal]")) return
        if (isOpen) {
          dispatch(closeWidget())
        }
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, dispatch])

  // Fetch conversations from API
  const {
    data: conversations = [],
    isLoading,
    isError,
  } = useGetConversationsQuery()

  // Find active conversation object
  const selected = conversations.find(
    (c) => c.conversationId === activeConversationId,
  )

  // Fetch messages for selected conversation
  const {
    data: messages = [],
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetConversationMessagesQuery(activeConversationId, {
    skip: !activeConversationId,
  })

  // -- SignalR Integration --
  const signalRHandlers = React.useMemo(
    () => ({
      NewMessage: (...args) => {
        let conversationId, message
        if (args.length >= 2) {
          conversationId = args[0]
          message = args[1]
        } else {
          // If only 1 arg, assume it's the message object and ID is inside
          message = args[0]
          conversationId = message?.conversationId
        }

        // Always force refetch of messages to guarantee consistency
        if (conversationId) {
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Messages", id: conversationId },
              "Conversations",
            ]),
          )
        }

        // Optimistically update the messages cache (if matches active conversation)
        // Ensure strictly converted to numbers for comparison
        if (
          activeConversationId &&
          conversationId &&
          Number(conversationId) === Number(activeConversationId)
        ) {
          dispatch(
            conversationsApi.util.updateQueryData(
              "getConversationMessages",
              activeConversationId,
              (draft) => {
                // Prevent duplicates
                const exists = draft.find(
                  (m) => m.messageId === message.messageId,
                )
                if (!exists) {
                  // Ensure sender exists for MessageList safety
                  const normalized = {
                    ...message,
                    sender: message.sender || { accountId: message.senderId },
                  }
                  draft.push(normalized)
                }
              },
            ),
          )
        }

        // Always invalidate conversations list to update snippets/unread counts
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
      },
      NewConversation: (data) => {
        // Refresh conversation list
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
      },
      FriendStatusChange: (data) => {
        // Refresh conversation list (to show online status)
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
      },
      ChatUpdated: (data) => {
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
      },
    }),
    [activeConversationId, dispatch],
  )

  const { sendMessage: sendSignalRMessage } =
    useConversationSignalR(signalRHandlers)

  // Handle conversation selection
  const handleSelectConversation = (conv) => {
    dispatch(setActiveConversation(conv.conversationId))
  }

  // Handle back to list
  const handleBackToList = () => {
    dispatch(setView("list"))
    dispatch(setActiveConversation(null)) // Optional: clear selection
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim() || !activeConversationId) return

    try {
      // Use SignalR to send
      await sendSignalRMessage(activeConversationId, input, 0) // 0 = Text
      setInput("")
    } catch (error) {
      console.error("Failed to send message via SignalR:", error)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="relative flex items-center" ref={widgetRef}>
      <MessageModal isOpen={isOpen}>
        {/* Header */}
        {view === "detail" && selected ? (
          <ConversationDetailHeader
            conversation={selected}
            onBack={handleBackToList}
            onClose={() => dispatch(closeWidget())}
          />
        ) : (
          <ConversationListHeader
            onClose={() => dispatch(closeWidget())}
            isLoading={isLoading}
          />
        )}

        {/* Content Area */}
        {view === "list" ? (
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            isError={isError}
            onSelectConversation={handleSelectConversation}
          />
        ) : (
          <ConversationDetail
            conversation={selected}
            messages={messages}
            isLoading={messagesLoading}
            input={input}
            onInputChange={(e) => setInput(e.target.value)}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            isSending={false} // Removed mutation usage
          />
        )}
      </MessageModal>

      <button
        onClick={() => {
          if (!isAuthenticated) {
            openAuthModal("login")
            return
          }
          dispatch(toggleWidget())
        }}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors bg-[#F2F2F2] hover:bg-[#D9D9D9] ${isOpen ? "" : ""}`}
        aria-label="Tin nhắn"
      >
        <MessageCircle />
      </button>
    </div>
  )
}

export default MessageWidget
