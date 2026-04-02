import React from "react"
import EditableField from "./EditableField"

const BasicInfoSection = ({
  formData,
  editingField,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
  onChange,
  t,
}) => {
  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Full Name / Username */}
      <EditableField
        label={t.profile?.personalInfo?.username || "Họ và tên"}
        value={formData.username}
        name="username"
        isEditing={editingField === "username"}
        isUpdating={isUpdating}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        onChange={onChange}
        editLabel={t.profile?.personalInfo?.edit || "Edit"}
      />

      {/* Nickname */}
      <EditableField
        label={t.profile?.personalInfo?.nickname || "Nickname"}
        value={formData.nickname}
        name="nickname"
        isEditing={editingField === "nickname"}
        isUpdating={isUpdating}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        onChange={onChange}
        editLabel={t.profile?.personalInfo?.edit || "Edit"}
      />

      {/* Country */}
      <div className="flex items-center justify-between border-b border-gray-100 py-3">
        <span className="w-32 font-bold text-gray-900">
          {t.profile?.personalInfo?.country || "Quốc gia"}
        </span>
        <div className="flex-1"></div>
        <div className="relative">
          <button className="flex items-center gap-2 rounded border border-gray-200 px-3 py-1 text-sm font-bold text-red-900 hover:bg-gray-50">
            {formData.country || "Viet Nam"}
            <span className="text-gray-400">▼</span>
          </button>
        </div>
      </div>

      {/* Account Type */}
      <div className="flex items-center justify-between border-b border-gray-100 py-3">
        <span className="w-32 font-bold text-gray-900">
          {t.profile?.personalInfo?.accountType || "Account type"}
        </span>
        <span className="flex-1 text-gray-600">{formData.accountType}</span>
      </div>
    </div>
  )
}

export default BasicInfoSection
