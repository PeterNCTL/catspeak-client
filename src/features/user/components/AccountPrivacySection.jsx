import React from "react"
import EditableField from "./EditableField"

const AccountPrivacySection = ({
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
    <>
      <h2 className="text-xl font-bold text-red-900 mt-6">
        {t.profile?.personalInfo?.accountAndPrivacy || "Account and Privacy"}
      </h2>

      <div className="flex flex-col gap-6">
        {/* Password */}
        <div className="flex items-center justify-between border-b border-gray-100 py-3">
          <span className="w-32 font-bold text-gray-900">
            {t.profile?.personalInfo?.password || "Password"}
          </span>
          <span className="flex-1 text-gray-600 tracking-widest text-lg">
            ***********
          </span>
          <button className="font-bold text-red-800 hover:text-red-900">
            {t.profile?.personalInfo?.reset || "Reset"}
          </button>
        </div>

        {/* Address */}
        <EditableField
          label={t.profile?.personalInfo?.address || "Address"}
          value={formData.address}
          name="address"
          isEditing={editingField === "address"}
          isUpdating={isUpdating}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          onChange={onChange}
          editLabel={t.profile?.personalInfo?.edit || "Edit"}
        />

        {/* Phone Number */}
        <EditableField
          label={t.profile?.personalInfo?.phoneNumber || "Your phone number"}
          value={formData.phoneNumber}
          name="phoneNumber"
          isEditing={editingField === "phoneNumber"}
          isUpdating={isUpdating}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          onChange={onChange}
          editLabel={t.profile?.personalInfo?.edit || "Edit"}
        />

        {/* Email */}
        <EditableField
          label={t.profile?.personalInfo?.email || "Email"}
          value={formData.email}
          name="email"
          isEditing={editingField === "email"}
          isUpdating={isUpdating}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          onChange={onChange}
          editLabel={t.profile?.personalInfo?.edit || "Edit"}
        />
      </div>
    </>
  )
}

export default AccountPrivacySection
