import React from "react"
import { formatTime, FREQUENCY_LABEL } from "../../utils/eventFormatters"
import { useLanguage } from "@/shared/context/LanguageContext"

const EventDetailBody = ({ ev, event, headerColor, isLoading }) => {
  const { t } = useLanguage()

  return (
    <div className="p-5 relative bg-white text-base overflow-y-auto max-h-[60vh]">
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
          {t.calendar?.loadingDetails || "Đang tải chi tiết…"}
        </div>
      ) : (
        <div className="flex flex-col gap-3 text-black">
          {/* Time */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold min-w-max">
              {t.calendar?.timeLabel || "Thời gian"}:
            </span>
            <span className="text-[#60060]">
              {formatTime(ev.startTime)} – {formatTime(ev.endTime)} (GMT +07:00)
            </span>
          </div>

          {/* Location */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold min-w-max">
              {t.calendar?.location || "Địa điểm"}:
            </span>
            <span className="text-[#60060]">
              {ev.location || (t.calendar?.locationDefault ?? "Đại học FPT")}
            </span>
          </div>

          {/* Description */}
          {ev.description && (
            <div className="flex items-baseline gap-2">
              <span className="font-bold min-w-max">
                {t.calendar?.description || "Mô tả"}:
              </span>
              <span className="text-[#60060]">{ev.description}</span>
            </div>
          )}

          {/* Participants */}
          {(ev.currentParticipants !== undefined || ev.maxParticipants) && (
            <div className="flex items-baseline gap-2">
              {ev.currentParticipants !== undefined ? (
                <>
                  <span className="font-bold min-w-max">
                    {t.calendar?.registeredCount || "Số lượng đã đăng kí"}:
                  </span>
                  <span className="text-[#60060]">
                    {ev.currentParticipants}/{ev.maxParticipants ?? "∞"}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-bold min-w-max">
                    {t.calendar?.maxParticipants || "Số lượng tối đa"}:
                  </span>
                  <span className="text-[#60060]">{ev.maxParticipants}</span>
                </>
              )}
            </div>
          )}

          {/* Conditions */}
          {ev.conditions && ev.conditions.length > 0 && (
            <div className="flex items-baseline gap-2">
              <span className="font-bold min-w-max">
                {t.calendar?.conditions || "Điều kiện"}:
              </span>
              <div className="flex flex-wrap gap-2">
                {ev.conditions.map((c) => (
                  <span
                    key={c.id}
                    title={c.description || undefined}
                    className="px-3 py-1 rounded-full text-white text-sm flex items-center justify-center"
                    style={{ backgroundColor: headerColor }}
                  >
                    {c.title || c.conditionType || c.category || `#${c.id}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recurrence */}
          {ev.isRecurring && ev.recurrenceRule && (
            <div className="flex items-baseline gap-2">
              <span className="font-bold min-w-max">
                {t.calendar?.repeatLabel || "Lặp lại"}:
              </span>
              <div className="text-[#60060] flex gap-1">
                <span>
                  {FREQUENCY_LABEL[ev.recurrenceRule.frequency] ??
                    ev.recurrenceRule.frequency}
                  {ev.recurrenceRule.interval > 1
                    ? ` (${t.calendar?.every || "mỗi"} ${ev.recurrenceRule.interval} ${t.calendar?.intervalUnit?.default || "lần"})`
                    : ""}
                  {ev.recurrenceRule.recurrenceStartDate &&
                  ev.recurrenceRule.recurrenceEndDate
                    ? ","
                    : ""}
                </span>
                {ev.recurrenceRule.recurrenceStartDate &&
                  ev.recurrenceRule.recurrenceEndDate && (
                    <span className="text-[#60060]">
                      {new Date(
                        ev.recurrenceRule.recurrenceStartDate,
                      ).toLocaleDateString("vi-VN")}
                      {" – "}
                      {new Date(
                        ev.recurrenceRule.recurrenceEndDate,
                      ).toLocaleDateString("vi-VN")}
                    </span>
                  )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EventDetailBody
