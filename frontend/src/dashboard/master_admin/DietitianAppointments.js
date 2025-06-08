import React, { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./master_admin.css";

const DietitianAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  const API_BASE = "http://localhost:8080/api/appointments";

  useEffect(() => {
    fetch(`${API_BASE}/role/dietitian`)
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch((err) => console.error("Failed to load appointments:", err));
  }, []);

  const updateAppointment = (updated) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    fetch(`${API_BASE}/${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(() => toast.error("Update failed"));
  };

  const handleStatusToggle = (id) => {
    const current = appointments.find((a) => a.id === id);
    let nextStatus;

    switch (current.status) {
      case "Pending":
        nextStatus = "Approved";
        break;
      case "Approved":
        nextStatus = "Completed";
        break;
      default:
        nextStatus = "Pending";
    }

    const updated = { ...current, status: nextStatus };
    updateAppointment(updated);
    toast.info(`Status updated to: ${nextStatus}`);
  };

  const handleMeetingLinkChange = (id, link) => {
    const updated = appointments.find((a) => a.id === id);
    updated.meetingLink = link;
    updateAppointment(updated);
  };

  const handleGenerateLink = (id) => {
    const dummy = `https://zoom.us/j/${Math.floor(
      100000000 + Math.random() * 900000000
    )}`;
    handleMeetingLinkChange(id, dummy);
  };

  const handleDelete = (id) => {
    const confirmToast = () => (
      <div>
        <p>Confirm delete?</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              fetch(`${API_BASE}/${id}`, { method: "DELETE" }).then(() =>
                setAppointments((prev) => prev.filter((a) => a.id !== id))
              );
              toast.dismiss();
              toast.error("Appointment deleted.");
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
    );

    toast(confirmToast, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
    });
  };

  return (
    <div className="dashboard-main">
      <ToastContainer position="top-center" autoClose={2000} />
      <h1>Dietitian Appointments</h1>

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
                        a.appointmentType === "Online" ? "badge-orange" : "badge-blue"
                      }`}
                    >
                      {a.appointmentType}
                    </span>
                  </td>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedNote(a.notes)}
                    >
                      View
                    </button>
                  </td>
                  <td>
                    {a.appointmentType === "Online" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="text"
                          className="search-input"
                          value={a.meetingLink || ""}
                          onChange={(e) =>
                            handleMeetingLinkChange(a.id, e.target.value)
                          }
                          placeholder="Enter or generate"
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
                      {a.status}
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

export default DietitianAppointments;
