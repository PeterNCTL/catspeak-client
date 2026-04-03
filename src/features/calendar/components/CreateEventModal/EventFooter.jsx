const EventFooter = ({ eventColor, isLoading, isEditing }) => (
  <div className="p-5 bg-white rounded-none min-[426px]:rounded-b-[20px]">
    <button
      type="submit"
      disabled={isLoading}
      className="w-full text-white font-bold text-base h-10 rounded-[6px] hover:opacity-90 transition-all duration-300 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ backgroundColor: eventColor }}
    >
      {isEditing
        ? isLoading
          ? "Đang cập nhật..."
          : "Cập nhật sự kiện"
        : isLoading
          ? "Đang tạo..."
          : "Tạo sự kiện"}
    </button>
  </div>
)

export default EventFooter
