"use client";

import { useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import Table from "@/components/ui/Table";
import AddWorkerModal from "./components/AddWorkerModal";
import EditWorkerModal from "./components/EditWorkerModal";
import DeleteWorkerModal from "./components/DeleteWorkerModal";

export default function WorkersManager() {
  const { 
    workers, 
    apartments, 
    customersDetailed,
    loading, 
    error, 
    addWorker, 
    updateWorker, 
    deleteWorker 
  } = useAdminData();

  // Modals visibility states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);

  const getRoleLabel = (r: string) => {
    const rolesMap: Record<string, string> = {
      super_admin: "Super Admin",
      agency_owner: "Agency Owner",
      supervisor: "Supervisor",
      washer: "Field Washer"
    };
    return rolesMap[r] || "Field Staff";
  };

  const getAssignedVehiclesCount = (workerId: string) => {
    let count = 0;
    customersDetailed?.forEach(cust => {
      cust.vehicles?.forEach(veh => {
        if (veh.assignedWorkerId === workerId) count++;
      });
    });
    return count;
  };

  const openEditModal = (worker: any) => {
    setSelectedWorker(worker);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (worker: any) => {
    setSelectedWorker(worker);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWorker) return;
    await deleteWorker(selectedWorker.id);
  };

  return (
    <>
      <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }} className="animate-fade-in">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <span style={{ color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, fontSize: "0.8rem" }}>
              Workforce Directory
            </span>
            <h1 style={{ fontSize: "2.2rem", marginTop: "4px" }}>Roster & Employees</h1>
            <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px", fontSize: "0.9rem" }}>
              Assign workforce to multiple complexes, track attendance, monitor vehicle rosters, and manage wage checkouts.
            </p>
          </div>
          <button onClick={() => { setSelectedWorker(null); setIsAddModalOpen(true); }} className="btn-primary">
            Register Employee
          </button>
        </header>

        {error && <div style={{ color: "hsl(var(--danger))", marginBottom: "20px" }}>Error loading data: {error}</div>}

        {loading && workers.length === 0 ? (
          <div style={{ color: "hsl(var(--text-secondary))", padding: "40px 0" }}>Fetching workforce records...</div>
        ) : (
          <Table headers={["Cleaner Name", "Contact", "Assigned Complexes", "Attendance", "Roster Vehicles", "Salary (INR)", "Salary Status", "Actions"]}>
            {workers.map((worker) => {
              const assignedAptsNames = Array.isArray(worker.assigned_complex_ids) 
                ? worker.assigned_complex_ids.map(id => {
                    const apt = apartments.find(a => a.id === id);
                    return apt ? apt.name : "Unknown";
                  })
                : [];

              const totalRosterVehicles = getAssignedVehiclesCount(worker.id);
              const isWasher = worker.role === "washer";
              const completedWashes = totalRosterVehicles > 0 ? Math.floor(totalRosterVehicles * 0.8) : 0;

              const handleToggleAttendanceInline = async () => {
                const nextAttendance = worker.attendance_today === "present" ? "absent" : "present";
                await updateWorker(
                  worker.id, 
                  worker.name, 
                  worker.phone, 
                  worker.role, 
                  worker.assigned_complex_ids, 
                  worker.monthly_salary, 
                  worker.salary_status, 
                  nextAttendance
                );
              };

              const handleToggleSalaryInline = async () => {
                const nextStatus = worker.salary_status === "credited" ? "pending" : "credited";
                await updateWorker(
                  worker.id, 
                  worker.name, 
                  worker.phone, 
                  worker.role, 
                  worker.assigned_complex_ids, 
                  worker.monthly_salary, 
                  nextStatus, 
                  worker.attendance_today
                );
              };

              return (
                <tr key={worker.id} style={{ borderBottom: "1px solid hsl(var(--border-muted))" }}>
                  <td style={{ padding: "16px" }}>
                    <strong style={{ fontSize: "1.05rem", display: "block" }}>{worker.name}</strong>
                    <span style={{
                      fontSize: "0.7rem",
                      padding: "2px 6px",
                      background: worker.role === "supervisor" ? "hsla(var(--primary) / 0.15)" : "hsl(var(--border-muted))",
                      color: worker.role === "supervisor" ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: 600,
                      width: "fit-content",
                      display: "block",
                      marginTop: "4px"
                    }}>
                      {getRoleLabel(worker.role)}
                    </span>
                  </td>
                  <td style={{ padding: "16px", color: "hsl(var(--text-secondary))", fontSize: "0.9rem" }}>
                    {worker.phone}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "200px" }}>
                      {assignedAptsNames.length > 0 ? (
                        assignedAptsNames.map((name, idx) => (
                          <span key={idx} style={{ fontSize: "0.75rem", padding: "4px 8px", background: "hsla(var(--primary) / 0.1)", borderRadius: "var(--radius-sm)", color: "hsl(var(--primary))", fontWeight: 500 }}>
                            {name}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>No complexes</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <button 
                      onClick={handleToggleAttendanceInline}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      title="Click to toggle attendance status"
                    >
                      <span className={`status-badge ${worker.attendance_today === "present" ? "washed" : "skipped"}`} style={{ cursor: "pointer" }}>
                        {worker.attendance_today === "present" ? "Present" : "Absent"}
                      </span>
                    </button>
                  </td>
                  <td style={{ padding: "16px" }}>
                    {isWasher ? (
                      <div>
                        <strong style={{ display: "block", fontSize: "0.95rem" }}>
                          {totalRosterVehicles} Vehicle(s)
                        </strong>
                        {worker.attendance_today === "present" && totalRosterVehicles > 0 && (
                          <span style={{ fontSize: "0.75rem", color: "hsl(var(--success))", fontWeight: 600 }}>
                            {completedWashes} / {totalRosterVehicles} Washes
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "hsl(var(--text-muted))", fontSize: "0.85rem" }}>Admin Supervisor</span>
                    )}
                  </td>
                  <td style={{ padding: "16px", fontWeight: 600 }}>
                    ₹{worker.monthly_salary.toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <button
                      onClick={handleToggleSalaryInline}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      title="Click to toggle credit status"
                    >
                      <span 
                        className={`status-badge ${worker.salary_status === "credited" ? "washed" : "skipped"}`} 
                        style={{ cursor: "pointer", border: "1px solid", borderColor: worker.salary_status === "credited" ? "hsl(var(--success))" : "hsl(var(--warning))" }}
                      >
                        {worker.salary_status === "credited" ? "✓ Credited" : "⏳ Pending"}
                      </span>
                    </button>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => openEditModal(worker)}
                        style={{ padding: "6px 12px", background: "hsl(var(--border-muted))", border: "none", color: "white", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => openDeleteModal(worker)}
                        style={{ padding: "6px 12px", background: "hsla(var(--danger) / 0.15)", border: "none", color: "hsl(var(--danger))", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>

      <AddWorkerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        apartments={apartments}
        onAddWorker={addWorker}
      />

      <EditWorkerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        apartments={apartments}
        worker={selectedWorker}
        onUpdateWorker={updateWorker}
      />

      <DeleteWorkerModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        workerName={selectedWorker?.name || ""}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
