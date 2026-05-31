"use client";

import { useState, useEffect } from "react";
import { Apartment } from "@/lib/mockStorage/types";

interface SessionData {
  checkedIn: boolean;
  checkedOut: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  complexId: string | null;
  lat: number | null;
  lng: number | null;
}

export function useAttendanceGPS(
  assignedComplexes: Apartment[],
  session: SessionData,
  onCheckIn: (complexId: string, timeStr: string, lat: number, lng: number) => void,
  onCheckOut: (timeStr: string) => void
) {
  const [selectedComplexId, setSelectedComplexId] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [timerText, setTimerText] = useState("00:00:00");

  useEffect(() => {
    if (assignedComplexes.length > 0 && !selectedComplexId) {
      setSelectedComplexId(assignedComplexes[0].id);
    }
  }, [assignedComplexes, selectedComplexId]);

  // Shift Proximity Check Clock Timer
  useEffect(() => {
    if (!session.checkedIn || session.checkedOut || !session.checkInTime) return;

    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return new Date();
      let [_, hrs, mins, period] = match;
      let hours = parseInt(hrs);
      const minutes = parseInt(mins);
      if (period.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
      
      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    const startTime = parseTime(session.checkInTime);

    const interval = setInterval(() => {
      const diff = Date.now() - startTime.getTime();
      if (diff <= 0) {
        setTimerText("00:00:00");
        return;
      }
      const secs = Math.floor((diff / 1000) % 60);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const hrs = Math.floor(diff / (1000 * 60 * 60));

      const pad = (n: number) => String(n).padStart(2, "0");
      setTimerText(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [session.checkedIn, session.checkedOut, session.checkInTime]);

  const handleGPSCheckIn = () => {
    if (!selectedComplexId) return;
    setGpsLoading(true);
    setGpsError("");
    setCoords(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(6));
          const lng = parseFloat(position.coords.longitude.toFixed(6));
          setTimeout(() => {
            setCoords({ lat, lng });
            setGpsLoading(false);
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            onCheckIn(selectedComplexId, timeStr, lat, lng);
          }, 1500);
        },
        (error) => {
          const mockLat = parseFloat((12.9716 + (Math.random() - 0.5) * 0.002).toFixed(6));
          const mockLng = parseFloat((77.5946 + (Math.random() - 0.5) * 0.002).toFixed(6));
          setTimeout(() => {
            setCoords({ lat: mockLat, lng: mockLng });
            setGpsLoading(false);
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            onCheckIn(selectedComplexId, timeStr, mockLat, mockLng);
          }, 1500);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsError("Geolocation is not supported by this browser.");
      setGpsLoading(false);
    }
  };

  const handleCheckOut = () => {
    setGpsLoading(true);
    setTimeout(() => {
      setGpsLoading(false);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      onCheckOut(timeStr);
    }, 1000);
  };

  return {
    selectedComplexId,
    setSelectedComplexId,
    gpsLoading,
    gpsError,
    timerText,
    handleGPSCheckIn,
    handleCheckOut
  };
}
