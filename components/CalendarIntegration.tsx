"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

interface CalendarIntegrationProps {
  event: Event;
  className?: string;
}

export default function CalendarIntegration({
  event,
  className = "",
}: CalendarIntegrationProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Format event data for calendar integration
  const formatEventForCalendar = () => {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const eventData = {
      title: event.title,
      description: event.description,
      location: event.location,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };

    return eventData;
  };

  // Generate Google Calendar URL
  const generateGoogleCalendarUrl = () => {
    const eventData = formatEventForCalendar();
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: eventData.title,
      dates: `${eventData.start.replace(/[-:]/g, "").split(".")[0]}Z/${eventData.end.replace(/[-:]/g, "").split(".")[0]}Z`,
      details: eventData.description,
      location: eventData.location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Generate Outlook Calendar URL
  const generateOutlookCalendarUrl = () => {
    const eventData = formatEventForCalendar();
    const params = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      subject: eventData.title,
      body: `${eventData.description}\n\nLocation: ${eventData.location}`,
      startdt: eventData.start,
      enddt: eventData.end,
      location: eventData.location,
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  // Generate iCalendar (.ics) file content
  const generateICalendarContent = () => {
    const eventData = formatEventForCalendar();
    const startDate = eventData.start.replace(/[-:]/g, "").split(".")[0] + "Z";
    const endDate = eventData.end.replace(/[-:]/g, "").split(".")[0] + "Z";

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Innovators Hub//Event Calendar//EN
BEGIN:VEVENT
UID:${event._id}@innovatorshub.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${eventData.title}
DESCRIPTION:${eventData.description.replace(/\n/g, "\\n")}
LOCATION:${eventData.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
  };

  // Download iCalendar file
  const downloadICalendar = () => {
    const icsContent = generateICalendarContent();
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-seville-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Add to Calendar
      </button>

      {showDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Add to Calendar</h3>
          </div>

          <div className="py-2">
            <button
              onClick={() => {
                window.open(generateGoogleCalendarUrl(), "_blank");
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Google Calendar</div>
                <div className="text-xs text-gray-500">calendar.google.com</div>
              </div>
            </button>

            <button
              onClick={() => {
                window.open(generateOutlookCalendarUrl(), "_blank");
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">O</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Outlook</div>
                <div className="text-xs text-gray-500">outlook.live.com</div>
              </div>
            </button>

            <button
              onClick={() => {
                downloadICalendar();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l4-4m-4 4l-4-4m8 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Download .ics</div>
                <div className="text-xs text-gray-500">
                  For any calendar app
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
