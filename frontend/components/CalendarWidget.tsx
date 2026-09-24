"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useToast } from "@/hooks/use-toast";
import { EventModal, EventData } from "./EventModal";

interface CalendarWidgetProps {
  isGoogleConnected?: boolean;
  userToken?: string | null;
}

export default function CalendarWidget({ isGoogleConnected, userToken }: CalendarWidgetProps) {
  const { toast } = useToast();
  const calendarRef = useRef<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "");
      const res = await fetch(
        `${apiUrl}/api/v1/calendar/google-events?timeMin=${timeMin}&timeMax=${timeMax}`, 
        {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      );
      if (res.status === 401) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log out and log back in to reconnect your calendar.",
          variant: "destructive",
        });
        successCallback([]);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch Google Calendar");
      const events = await res.json();
      successCallback(events);
    } catch (err) {
      console.error(err);
      failureCallback(err);
    }
  };

  const handleDateClick = (arg: any) => {
    if (!isGoogleConnected) {
      toast({
        title: "Google Workspace Required",
        description: "Please connect your Google Workspace account to create events.",
        variant: "default",
      });
      return;
    }
    
    // arg.date is a Date object. If allDay view was clicked, arg.allDay is true.
    const start = new Date(arg.date);
    if (arg.allDay) {
      // Default to 9:00 AM instead of an all-day event
      start.setHours(9, 0, 0, 0);
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
    
    setSelectedEvent({
      title: "",
      start,
      end,
      allDay: false,
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    if (!isGoogleConnected) return; // Only allow editing if connected
    
    const event = arg.event;
    // Don't edit mock events (they won't have an ID that looks like a Google ID, or we can just try)
    if (!event.id) return;

    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start || new Date(),
      end: event.end || event.start || new Date(),
      allDay: event.allDay,
      meet_url: event.extendedProps?.meet_url,
    });
    setIsModalOpen(true);
  };

  const refetchCalendar = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents();
    }
  };

  const handleSaveEvent = async (eventData: EventData) => {
    if (!userToken) return;
    setIsLoading(true);
    
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "");
      const isUpdate = !!eventData.id;
      const url = isUpdate 
        ? `${apiUrl}/api/v1/calendar/google-events/${eventData.id}`
        : `${apiUrl}/api/v1/calendar/google-events`;
        
      const payload = {
        ...eventData,
        start: eventData.allDay ? new Date(eventData.start).toISOString().split("T")[0] : new Date(eventData.start).toISOString(),
        end: eventData.allDay ? new Date(eventData.end).toISOString().split("T")[0] : new Date(eventData.end).toISOString(),
      };
      
      const res = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        let errMsg = "Failed to save event";
        try {
          const errData = await res.json();
          if (res.status === 401 || res.status === 403 || (errData.detail && errData.detail.includes("insufficient authentication scopes"))) {
            errMsg = "Please reconnect your Google Workspace account to grant permission to create/edit events.";
          } else if (errData.detail) {
            errMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch(e) {}
        
        toast({
          title: "Error",
          description: errMsg,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "Success",
        description: isUpdate ? "Event updated successfully." : "Event created successfully.",
      });
      
      setIsModalOpen(false);
      refetchCalendar();
    } catch (err: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the event.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!userToken) return;
    setIsLoading(true);
    
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/api/v1/calendar/google-events/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      
      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to delete the event.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "Deleted",
        description: "Event has been deleted.",
      });
      
      setIsModalOpen(false);
      refetchCalendar();
    } catch (err: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the event.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sources: any[] = [
    { events: mockEvents }
  ];

  if (isGoogleConnected) {
    sources.push({ events: fetchGoogleEvents });
  }

  const now = new Date();
  const currentHour = Math.max(0, now.getHours() - 1).toString().padStart(2, '0');
  const scrollTime = `${currentHour}:00:00`;

  return (
    <div className="calendar-container">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin] as any}
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
        selectable={isGoogleConnected}
        editable={isGoogleConnected}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={(arg) => {
          // If they drag and drop to reschedule
          if (arg.event.id) {
            handleSaveEvent({
              id: arg.event.id,
              title: arg.event.title,
              allDay: arg.event.allDay,
              start: arg.event.start || new Date(),
              end: arg.event.end || arg.event.start || new Date(),
            });
          }
        }}
      />
      
      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialData={selectedEvent}
        isLoading={isLoading}
      />
    </div>
  );
}
