"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

export default function CalendarWidget() {
  const mockEvents = [
    { title: "All Hands Meeting", date: "2026-08-15" },
    { title: "Engineering Sync", date: "2026-08-16T10:00:00" },
    { title: "Company Holiday", date: "2026-08-25", allDay: true, color: "#00DC82" },
  ];

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin] as any}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        events={mockEvents}
        height="auto"
        contentHeight={700}
        eventColor="#001E2B"
      />
    </div>
  );
}
