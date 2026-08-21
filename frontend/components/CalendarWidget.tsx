"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

interface CalendarWidgetProps {
  isGoogleConnected?: boolean;
  userToken?: string | null;
}

export default function CalendarWidget({ isGoogleConnected, userToken }: CalendarWidgetProps) {
  const mockEvents = [
    { title: "All Hands Meeting", date: "2026-08-15" },
    { title: "Engineering Sync", date: "2026-08-16T10:00:00" },
    { title: "Company Holiday", date: "2026-08-25", allDay: true, color: "#00DC82" },
  ];

  const fetchGoogleEvents = async (info: any, successCallback: any, failureCallback: any) => {
    if (!isGoogleConnected || !userToken) {
      successCallback([]);
      return;
    }
    try {
      const timeMin = info.start.toISOString();
      const timeMax = info.end.toISOString();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(
        `${apiUrl}/api/v1/calendar/google-events?timeMin=${timeMin}&timeMax=${timeMax}`, 
        {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      );
      if (!res.ok) throw new Error("Failed to fetch Google Calendar");
      const events = await res.json();
      successCallback(events);
    } catch (err) {
      console.error(err);
      failureCallback(err);
    }
  };

  const sources: any[] = [
    { events: mockEvents }
  ];

  if (isGoogleConnected) {
    sources.push({ events: fetchGoogleEvents });
  }

  const now = new Date();
  // We scroll slightly above current time so the current time indicator is somewhat centered or clearly visible.
  // Using just the hour provides a clean scroll point.
  const currentHour = Math.max(0, now.getHours() - 1).toString().padStart(2, '0');
  const scrollTime = `${currentHour}:00:00`;

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
        eventSources={sources}
        height="auto"
        contentHeight={700}
        eventColor="#001E2B"
        nowIndicator={true}
        scrollTime={scrollTime}
      />
    </div>
  );
}
