"use client";

import React, { useState } from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  startOfToday,
  isAfter,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Range {
  startDate?: Date;
  endDate?: Date;
  key?: string;
}

interface CalendarProps {
  value: Range;
  onChange: (value: Range) => void;
  disabledDates?: Date[];
}

export const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  disabledDates = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    value.startDate || new Date()
  );
  const today = startOfToday();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Determine starting blank slots for first day of week
  const startDayIndex = monthStart.getDay(); // 0 = Sunday

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, today)) return true;
    return disabledDates.some((disabledDate) => isSameDay(date, disabledDate));
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!value.startDate || (value.startDate && value.endDate)) {
      // Start a new range
      onChange({
        startDate: date,
        endDate: undefined,
        key: "selection",
      });
    } else if (value.startDate && !value.endDate) {
      // Pick end date
      if (isBefore(date, value.startDate)) {
        // If clicked date is before start date, treat as new start date
        onChange({
          startDate: date,
          endDate: undefined,
          key: "selection",
        });
      } else {
        onChange({
          startDate: value.startDate,
          endDate: date,
          key: "selection",
        });
      }
    }
  };

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="w-full select-none bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-sm font-bold text-slate-900">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2 text-center text-xs font-semibold text-slate-400">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {/* Empty slots before first day */}
        {Array.from({ length: startDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}

        {/* Days */}
        {days.map((day) => {
          const isDisabled = isDateDisabled(day);
          const isStart = value.startDate && isSameDay(day, value.startDate);
          const isEnd = value.endDate && isSameDay(day, value.endDate);
          const isInRange =
            value.startDate &&
            value.endDate &&
            isWithinInterval(day, {
              start: value.startDate,
              end: value.endDate,
            });

          let dayClasses =
            "w-9 h-9 mx-auto flex items-center justify-center rounded-full transition-all text-xs font-medium cursor-pointer ";

          if (isDisabled) {
            dayClasses += "text-slate-300 line-through cursor-not-allowed ";
          } else if (isStart || isEnd) {
            dayClasses += "bg-rose-500 text-white font-bold shadow-xs ";
          } else if (isInRange) {
            dayClasses += "bg-rose-100 text-rose-900 rounded-none ";
          } else {
            dayClasses += "text-slate-700 hover:bg-slate-100 ";
          }

          return (
            <div
              key={day.toISOString()}
              className={`h-9 flex items-center justify-center ${
                isInRange && !isStart && !isEnd ? "bg-rose-50" : ""
              }`}
            >
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => handleDateClick(day)}
                className={dayClasses}
              >
                {format(day, "d")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
