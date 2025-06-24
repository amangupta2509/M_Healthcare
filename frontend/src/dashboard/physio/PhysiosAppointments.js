import React, { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../master_admin/master_admin.css";

const PhysiosAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  const API_URL = "http://localhost:8080/api/appointments";

  useEffect(() => {
    fetch(`${API_URL}/role/physio`)
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch(() => toast.error("Failed to fetch appointments"));
  }, []);

  const updateAppointment = (updated) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    fetch(`${API_URL}/${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(() => toast.error("Failed to update appointment"));
  };

  const handleStatusToggle = (id) => {
    const current = appointments.find((a) => a.id === id);
    if (!current) return;

    const nextStatus =
      current.status === "Pending"
        ? "Approved"
        : current.status === "Approved"
        ? "Completed"
        : "Pending";

    updateAppointment({ ...current, status: nextStatus });
    toast.info(`Status updated to: ${nextStatus}`);
  };

  const handleMeetingLinkChange = (id, link) => {
    const updated = appointments.find((a) => a.id === id);
    if (!updated) return;
    updateAppointment({ ...updated, meetingLink: link });
  };

  const handleGenerateLink = (id) => {
    const dummy = `https://zoom.us/j/${Math.floor(
      100000000 + Math.random() * 900000000
    )}`;
    handleMeetingLinkChange(id, dummy);
  };

  const handleDelete = (id) => {
    toast(
      () => (
        <div>
          <p>Confirm delete?</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                fetch(`${API_URL}/${id}`, { method: "DELETE" })
                  .then(() =>
                    setAppointments((prev) => prev.filter((a) => a.id !== id))
                  )
                  .then(() => toast.error("Appointment deleted."))
                  .catch(() => toast.error("Failed to delete appointment"));
                toast.dismiss();
              }}
            >
              Confirm
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                toast.dismiss();
                toast.info("Deletion cancelled.");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  return (
    <div className="dashboard-main">
      <ToastContainer position="top-center" autoClose={2000} />
      <h1>Physio Appointments</h1>

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="table-responsive">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>MRN No.</th>
                <th>Patient Name</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Notes</th>
                <th>Meeting Link</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.mrn || "N/A"}</td>
                  <td>{a.patientName || "Unknown"}</td>
                  <td>
                    <span
                      className={`type-badge ${
                        a.appointmentType === "Online"
                          ? "badge-orange"
                          : "badge-blue"
                      }`}
                    >
                      {a.appointmentType || "N/A"}
                    </span>
                  </td>
                  <td>{a.date || "-"}</td>
                  <td>{a.time || "-"}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedNote(a.notes || "No notes")}
                    >
                      View
                    </button>
                  </td>
                  <td>
                    {a.appointmentType === "Online" ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="text"
                          value={a.meetingLink || ""}
                          onChange={(e) =>
                            handleMeetingLinkChange(a.id, e.target.value)
                          }
                          placeholder="Enter or generate"
                          className="search-input"
                          style={{
                            width: "180px",
                            padding: "5px 8px",
                            fontSize: "14px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                          }}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => handleGenerateLink(a.id)}
                        >
                          Auto
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ backgroundColor: "#f44336", color: "#fff" }}
                          onClick={() => handleMeetingLinkChange(a.id, "")}
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        a.status === "Completed"
                          ? "badge-green"
                          : a.status === "Approved"
                          ? "badge-blue"
                          : "badge-yellow"
                      }`}
                      onClick={() => handleStatusToggle(a.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {a.status || "Pending"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDelete(a.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedNote && (
        <div className="modal-overlay">
          <div className="modalsc-box" style={{ border: "1px solid #cc5500" }}>
            <h2>Full Notes</h2>
            <p>{selectedNote}</p>
            <div className="center-btn">
              <center>
                <button
                  className="btn btn-primary"
                  onClick={() => setSelectedNote(null)}
                >
                  Close
                </button>
              </center>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysiosAppointments;
