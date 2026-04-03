import React, { useState } from "react"
import dayjs from "dayjs"
import MailHeadline from "../components/MailHeadline"
import MailToolbar from "../components/MailToolbar"
import MailCalendar from "../components/MailCalendar"

const SchedulesPage = () => {
  const [currentDate, setCurrentDate] = useState(dayjs())

  const handleNextMonth = () => setCurrentDate((prev) => prev.add(1, "month"))
  const handlePrevMonth = () =>
    setCurrentDate((prev) => prev.subtract(1, "month"))

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-5 w-full min-h-[480px]">
        <div className="flex items-center shrink-0 w-full lg:w-auto">
          <MailHeadline
            currentDate={currentDate}
            onNextMonth={handleNextMonth}
            onPrevMonth={handlePrevMonth}
          />
        </div>
        <div className="flex flex-col justify-center w-full flex-1 min-w-0">
          <div className="flex flex-col">
            <MailToolbar />
            <MailCalendar currentDate={currentDate} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SchedulesPage
