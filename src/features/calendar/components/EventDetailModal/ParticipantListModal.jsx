import React from "react"
import { X, User } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"

const ParticipantListModal = ({ open, onClose, participants = [] }) => {
  const { t } = useLanguage()

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={false}
      className="!max-w-[500px] w-full p-0 bg-white rounded-xl shadow-xl overflow-visible"
    >
      <div className="relative flex flex-col w-full h-full bg-white rounded-xl max-h-[80vh]">
        {/* Floating close button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-[#B81919] text-white p-1.5 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-50 hover:bg-red-800 transition-colors border-[3px] border-white"
        >
          <X size={18} strokeWidth={4} />
        </button>

        <div className="p-5 border-b border-gray-100 shrink-0">
          <h3 className="text-xl font-bold text-gray-800">
            {t.calendar?.participantList || "Danh sách người đăng ký"}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {participants.length === 0 ? (
            <div className="text-center text-gray-500 py-10 italic">
              {t.calendar?.noParticipants || "Chưa có người đăng ký"}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {participants.map((p, idx) => (
                <li
                  key={p.id || idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 overflow-hidden">
                    {p.avatarUrl || p.avatar ? (
                      <img
                        src={p.avatarUrl || p.avatar}
                        alt={p.name || p.fullName || p.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-gray-800 truncate">
                      {p.name ||
                        p.fullName ||
                        p.username ||
                        t.calendar?.unknownUser ||
                        "Người dùng ẩn danh"}
                    </span>
                    {(p.email || p.username) && (
                      <span className="text-xs text-gray-500 truncate">
                        {p.email || p.username}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ParticipantListModal
