import React from "react"
import { Check, X } from "lucide-react"

const EditableField = ({
  label,
  value,
  name,
  isEditing,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
  onChange,
  editLabel,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3">
      <span className="w-32 font-bold text-gray-900">{label}</span>
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="flex-1 rounded border border-gray-300 px-2 py-1 mr-4 focus:border-red-900 focus:outline-none"
        />
      ) : (
        <span className="flex-1 text-gray-600">{value}</span>
      )}
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <button
              onClick={onSave}
              disabled={isUpdating}
              className="font-bold text-green-600 hover:text-green-700"
            >
              <Check size={18} />
            </button>
            <button
              onClick={onCancel}
              disabled={isUpdating}
              className="font-bold text-red-600 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={() => onEdit(name)}
            className="font-bold text-red-800 hover:text-red-900"
          >
            {editLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default EditableField
