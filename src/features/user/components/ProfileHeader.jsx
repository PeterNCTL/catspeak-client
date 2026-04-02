import React from "react"
import { Plus } from "lucide-react"

const ProfileHeader = ({ avatarImageUrl, t }) => {
  return (
    <div className="relative mb-10">
      {/* Cover Image */}
      <div className="h-48 w-full overflow-hidden rounded-xl bg-gray-200">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" // Placeholder for tropical/travel cover
          alt="Cover"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Avatar Section */}
      <div className="absolute -bottom-12 left-8 flex items-end gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            {t.profile?.personalInfo?.avatar}
          </span>
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {avatarImageUrl ? (
              <img
                src={avatarImageUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              "Q"
            )}
          </div>
        </div>

        {/* Avatar Selection List (Mock) */}
        <div className="mb-2 flex flex-wrap gap-2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white overflow-hidden cursor-pointer hover:scale-110 transition-transform"
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                alt="avatar option"
              />
            </div>
          ))}
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50">
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
