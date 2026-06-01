"use client";

import { useState, useEffect } from "react";
import { mockStorage, Worker, Apartment } from "@/lib/mockStorage";

export interface VehicleTask {
  id: string;
  vehicleId: string;
  license: string;
  model: string;
  slot: string;
  parkingSlot: string;
  status: "pending" | "washed" | "skipped" | "missed";
  apartmentName: string;
  blockName: string;
  interiorFrequency?: number;
  hasInteriorRequest?: boolean;
  markedAt?: string | null;
}

const getLocalDateString = (d = new Date()) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const TODAY_SIMULATION_DATE = getLocalDateString();

export function useWorkerSession() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loggedInWorker, setLoggedInWorker] = useState<Worker | null>(null);
  const [activeTab, setActiveTab] = useState<"attendance" | "checklist" | "profile" | "settings">("attendance");
  const [assistantMessage, setAssistantMessage] = useState("");
  
  const [session, setSession] = useState<{
    checkedIn: boolean;
    checkedOut: boolean;
    checkInTime: string | null;
    checkOutTime: string | null;
    complexId: string | null;
    lat: number | null;
    lng: number | null;
  }>({
    checkedIn: false,
    checkedOut: false,
    checkInTime: null,
    checkOutTime: null,
    complexId: null,
    lat: null,
    lng: null
  });

  const [tasks, setTasks] = useState<VehicleTask[]>([]);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [pendingSkipTask, setPendingSkipTask] = useState<VehicleTask | null>(null);
  const [logsBackup, setLogsBackup] = useState<string | null>(null);

  useEffect(() => {
    const wList = mockStorage.getWorkers();
    const aptList = mockStorage.getApartments();
    setWorkers(wList);
    setApartments(aptList);

    const cachedWorkerId = localStorage.getItem("sv_logged_in_worker_id");
    if (cachedWorkerId) {
      const match = wList.find(w => w.id === cachedWorkerId);
      if (match && match.is_active) {
        setLoggedInWorker(match);
      }
    }

    const cachedSession = localStorage.getItem("sv_worker_attendance_session");
    if (cachedSession) {
      try {
        const parsed = JSON.parse(cachedSession);
        if (parsed.date === TODAY_SIMULATION_DATE) {
          setSession(parsed);
          if (parsed.checkedOut) {
            setAssistantMessage("Awesome shift conclude today! Enjoy the rest of your day! 🎉");
          } else if (parsed.checkedIn) {
            setAssistantMessage("Roster active and proximity verified. Go ahead and mark those vehicle washes! 🧼");
          }
        } else {
          localStorage.removeItem("sv_worker_attendance_session");
        }
      } catch (e) {
        localStorage.removeItem("sv_worker_attendance_session");
      }
    } else {
      setAssistantMessage("Ready to start? We can verify your GPS location to check in, or you can preview your vehicles list first!");
    }
  }, []);

  useEffect(() => {
    const handleSyncCompleted = () => {
      console.log("[useWorkerSession] Dynamic background cloud sync completed! Refreshing active view...");
      const wList = mockStorage.getWorkers();
      const aptList = mockStorage.getApartments();
      setWorkers(wList);
      setApartments(aptList);
      const cachedWorkerId = localStorage.getItem("sv_logged_in_worker_id");
      if (cachedWorkerId) {
        const match = wList.find(w => w.id === cachedWorkerId);
        if (match && match.is_active) {
          setLoggedInWorker(match);
        }
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("db_cloud_sync_completed", handleSyncCompleted);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("db_cloud_sync_completed", handleSyncCompleted);
      }
    };
  }, []);

  const loadTasks = (workerId: string, complexId: string | null) => {
    if (!workerId) return;
    let list = mockStorage.getWorkerTasks(workerId, TODAY_SIMULATION_DATE);
    if (complexId) {
      const complexName = apartments.find(a => a.id === complexId)?.name.toLowerCase();
      if (complexName) {
        list = list.filter(t => t.apartmentName.toLowerCase() === complexName);
      }
    }
    setTasks(list as any[]);
  };

  useEffect(() => {
    if (loggedInWorker) {
      loadTasks(loggedInWorker.id, session.complexId);
    }
  }, [loggedInWorker, session.complexId, apartments]);

  const handleLoginSuccess = (worker: Worker) => {
    localStorage.setItem("sv_logged_in_worker_id", worker.id);
    setLoggedInWorker(worker);
    setActiveTab("attendance");
    setAssistantMessage(`Good morning ${worker.name.split(" ")[0]}! Let's start with checking in using GPS proximity scan. 📍`);
  };

  const handleLogout = () => {
    localStorage.removeItem("sv_logged_in_worker_id");
    localStorage.removeItem("sv_worker_attendance_session");
    setLoggedInWorker(null);
    setSession({
      checkedIn: false,
      checkedOut: false,
      checkInTime: null,
      checkOutTime: null,
      complexId: null,
      lat: null,
      lng: null
    });
    setTasks([]);
    setAssistantMessage("");
  };

  const handleCheckIn = (complexId: string, timeStr: string, lat: number, lng: number) => {
    const newSession = {
      date: TODAY_SIMULATION_DATE,
      checkedIn: true,
      checkedOut: false,
      checkInTime: timeStr,
      checkOutTime: null,
      complexId,
      lat,
      lng
    };
    localStorage.setItem("sv_worker_attendance_session", JSON.stringify(newSession));
    setSession(newSession);
    setAssistantMessage("GPS verified successfully! Proximity confirmed. You can now tap vehicle cards to mark washes! 🧼");

    if (loggedInWorker) {
      mockStorage.updateWorker(
        loggedInWorker.id,
        loggedInWorker.name,
        loggedInWorker.phone,
        loggedInWorker.role,
        loggedInWorker.assigned_complex_ids,
        loggedInWorker.monthly_salary,
        loggedInWorker.salary_status,
        "present"
      );
    }
  };

  const handleCheckOut = (timeStr: string) => {
    const newSession = {
      ...session,
      checkedOut: true,
      checkOutTime: timeStr
    };
    localStorage.setItem("sv_worker_attendance_session", JSON.stringify(newSession));
    setSession(newSession);
    setAssistantMessage("Excellent wash completion rate today. Your daily attendance is logged! Enjoy the rest of your day! 🎉");
  };

  const handleResetSession = () => {
    localStorage.removeItem("sv_worker_attendance_session");
    setSession({
      checkedIn: false,
      checkedOut: false,
      checkInTime: null,
      checkOutTime: null,
      complexId: null,
      lat: null,
      lng: null
    });
    setAssistantMessage("Shift has been successfully resumed! Let's get back to clean-force duties! 🧼");
  };

  const toggleStatus = (task: VehicleTask, overrideStatus?: "washed" | "skipped" | "missed" | "pending") => {
    if (!loggedInWorker) return;
    
    // REQUIRE checkin for status marking
    if (!session.checkedIn || session.checkedOut) {
      setAssistantMessage("Oops! Geofence Lock. You must check in at the complex first to mark vehicles as washed. Let's do a quick GPS check-in first! 📍");
      setActiveTab("attendance");
      return;
    }

    if (overrideStatus === "skipped") {
      setPendingSkipTask(task);
      setIsSkipModalOpen(true);
    } else if (overrideStatus === "washed") {
      mockStorage.updateTaskStatus(task.vehicleId, loggedInWorker.id, TODAY_SIMULATION_DATE, "washed");
      loadTasks(loggedInWorker.id, session.complexId);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAssistantMessage(`Super! Vehicle ${task.license} marked as washed at ${timeStr}. Keep up the great pace! 🧼`);
    } else if (overrideStatus === "missed") {
      mockStorage.updateTaskStatus(task.vehicleId, loggedInWorker.id, TODAY_SIMULATION_DATE, "missed");
      loadTasks(loggedInWorker.id, session.complexId);
      setAssistantMessage(`Vehicle ${task.license} marked as missed. ⏳`);
    } else if (overrideStatus === "pending") {
      mockStorage.updateTaskStatus(task.vehicleId, loggedInWorker.id, TODAY_SIMULATION_DATE, "pending");
      loadTasks(loggedInWorker.id, session.complexId);
      setAssistantMessage(`Vehicle ${task.license} is back to pending! 🔄`);
    } else {
      // Direct TAP action: Toggle Washed status
      const nextStatus = task.status === "washed" ? "pending" : "washed";
      mockStorage.updateTaskStatus(task.vehicleId, loggedInWorker.id, TODAY_SIMULATION_DATE, nextStatus);
      loadTasks(loggedInWorker.id, session.complexId);
      if (nextStatus === "washed") {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setAssistantMessage(`Super! Vehicle ${task.license} marked as washed at ${timeStr}. Keep up the great pace! 🧼`);
      } else {
        setAssistantMessage(`Vehicle ${task.license} is back to pending! 🔄`);
      }
    }
  };

  const handleSkipSubmit = (reason: string, notes: string) => {
    if (!pendingSkipTask || !loggedInWorker) return;
    mockStorage.updateTaskStatus(
      pendingSkipTask.vehicleId,
      loggedInWorker.id,
      TODAY_SIMULATION_DATE,
      "skipped",
      reason,
      notes
    );
    setIsSkipModalOpen(false);
    setPendingSkipTask(null);
    loadTasks(loggedInWorker.id, session.complexId);
    
    const reasonLabels: Record<string, string> = {
      owner_away: "Owner Away ✈️",
      vehicle_not_present: "Vehicle Not Present 🚗",
      lockout: "Lockout / Security Guard Block 🔒",
      bad_weather: "Bad Weather 🌧️",
      other: "Other Exception 📦"
    };
    
    setAssistantMessage(`Got it. Skip exception logged for ${pendingSkipTask.license} (${reasonLabels[reason] || "Other"}). Let's move to the next one! 👍`);
  };

  const markAllWashed = () => {
    if (!loggedInWorker) return;

    if (!session.checkedIn || session.checkedOut) {
      setAssistantMessage("Oops! Geofence Lock. You must check in at the complex first to mark vehicles as washed. Let's do a quick GPS check-in first! 📍");
      setActiveTab("attendance");
      return;
    }

    if (tasks.length === 0) return;

    const currentLogs = localStorage.getItem("sv_daily_service_logs");
    setLogsBackup(currentLogs);

    tasks.forEach(t => {
      mockStorage.updateTaskStatus(t.vehicleId, loggedInWorker.id, TODAY_SIMULATION_DATE, "washed");
    });

    loadTasks(loggedInWorker.id, session.complexId);
    setAssistantMessage(`Success! Marked all ${tasks.length} vehicles as washed. Tap "Undo" to revert, or tap individual cards to adjust exceptions! 🧼`);
  };

  const undoMarkAll = () => {
    if (!loggedInWorker || !logsBackup) return;

    localStorage.setItem("sv_daily_service_logs", logsBackup);
    setLogsBackup(null);

    loadTasks(loggedInWorker.id, session.complexId);
    setAssistantMessage("Shift checklist state successfully restored! 🔄");
  };

  const triggerDbRefresh = () => {
    const wList = mockStorage.getWorkers();
    const aptList = mockStorage.getApartments();
    setWorkers(wList);
    setApartments(aptList);
    const cachedWorkerId = localStorage.getItem("sv_logged_in_worker_id");
    if (cachedWorkerId) {
      const match = wList.find(w => w.id === cachedWorkerId);
      if (match && match.is_active) {
        setLoggedInWorker(match);
      }
    }
  };

  return {
    workers,
    apartments,
    loggedInWorker,
    activeTab,
    setActiveTab,
    session,
    tasks,
    isSkipModalOpen,
    setIsSkipModalOpen,
    pendingSkipTask,
    setPendingSkipTask,
    assistantMessage,
    setAssistantMessage,
    handleLoginSuccess,
    handleLogout,
    handleCheckIn,
    handleCheckOut,
    handleResetSession,
    toggleStatus,
    handleSkipSubmit,
    markAllWashed,
    undoMarkAll,
    hasUndo: logsBackup !== null,
    triggerDbRefresh
  };
}
