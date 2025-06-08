import React, { useEffect, useState } from "react";
import {
  BarChart2,
  CheckCircle,
  Clock,
  FileText,
  PlusCircle,
  AlertCircle,
  User,
  Edit3,
  Trash,
  ImagePlus,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "../../ThemeProvider";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
} from "recharts";
import "react-toastify/dist/ReactToastify.css";

const CounselorDashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/counselorAppointments";
  const [appointments, setAppointments] = useState([]);
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [localNotes, setLocalNotes] = useState(() =>
    JSON.parse(localStorage.getItem("counselorNotes") || "[]")
  );
  const [newNote, setNewNote] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingPic, setEditingPic] = useState(false);

  const quotes = [
    "A good counselor listens with their heart.",
    "You are the calm in someone else’s storm.",
    "Healing begins with empathy.",
    "Small steps every day lead to big change.",
  ];

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const profilePic =
    localStorage.getItem("profilePic") || "https://i.pravatar.cc/150?img=47";
  const lastLogin = localStorage.getItem("lastLogin") || "Not Available";
  const lastLogout = localStorage.getItem("lastLogout") || "Not Available";

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setAppointments(data));

    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const stats = {
    today: appointments.filter((a) => a.date === today).length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    completed: appointments.filter((a) => a.status === "Completed").length,
    total: appointments.length,
  };

  const chartData = [
    { name: "Pending", value: stats.pending },
    { name: "Completed", value: stats.completed },
  ];

  const barChartData = [
    {
      name: "Appointments",
      Pending: stats.pending,
      Completed: stats.completed,
      Total: stats.total,
    },
  ];

  const COLORS = ["#cc5500", "#2ecc71"];

  const upcoming = appointments
    .filter((a) => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const recentNotes = appointments
    .filter((a) => a.notes)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const handleNoteAdd = () => {
    if (!newNote.trim()) return toast.error("Note cannot be empty.");
    const updated = [...localNotes, { id: Date.now(), text: newNote }];
    setLocalNotes(updated);
    localStorage.setItem("counselorNotes", JSON.stringify(updated));
    setNewNote("");
    setShowNoteModal(false);
    toast.success("Note added!");
  };

  const handleNoteDelete = (id) => {
    const updated = localNotes.filter((note) => note.id !== id);
    setLocalNotes(updated);
    localStorage.setItem("counselorNotes", JSON.stringify(updated));
    toast.success("Note deleted.");
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem("profilePic", reader.result);
        window.location.reload();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`dashboard-main ${theme}`}>
      <ToastContainer position="top-center" autoClose={2000} />
      <h1>Welcome, Counselor</h1>

      {/* Daily Quote */}
      <div
        className="card"
        style={{ textAlign: "center", marginBottom: "1.5rem" }}
      >
        <h3 className="card-header">🌟 Daily Inspiration</h3>
        <p style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>
          {motivationalQuote}
        </p>
      </div>

      {/* Profile & Chart */}
      <div className="row">
        <div className="col card" style={{ textAlign: "center" }}>
          <div style={{ position: "relative" }}>
            <img
              src={profilePic}
              alt="Counselor"
              style={{
                width: "100px",
                borderRadius: "50%",
                marginBottom: "0.5rem",
              }}
            />
            <label htmlFor="profileUpload" style={{ cursor: "pointer" }}>
              <ImagePlus size={16} />
            </label>
            <input
              id="profileUpload"
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              style={{ display: "none" }}
            />
          </div>
          <h3>{currentUser?.name || "Counselor Name"}</h3>
          <p style={{ color: "var(--text-secondary)" }}>
            {currentUser?.email || "email@example.com"}
          </p>
          <p>
            <User size={14} /> Role: {currentUser?.role}
          </p>
          <p>Last Login: {lastLogin}</p>
          <p>Last Logout: {lastLogout}</p>
        </div>

        <div className="col card">
          <h3 className="card-header">📝 Recent Remarks</h3>
          {recentNotes.length === 0 ? (
            <p>No recent notes.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
              </table>
              <div className="scrollable-remarks-table">
                <table className="table table-striped">
                  <tbody>
                    {recentNotes.map((a, index) => (
                      <tr key={a.id}>
                        <td>{index + 1}</td>
                        <td>{a.patientName}</td>
                        <td>{a.date}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => setSelectedNote(a)}
                          >
                            View Note
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats + Bar Chart */}

      <div className="row">
        {/* Today’s Appointments */}
        <div className="col card">
          <h3 className="card-header">
            <Clock size={20} /> Today’s Appointments
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: "5rem" }}>{stats.today}</p>
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Today", value: stats.today },
                    { name: "Others", value: stats.total - stats.today },
                  ]}
                  dataKey="value"
                  outerRadius={100}
                >
                  <Cell fill="#00bcd4" />
                  <Cell fill="#444" />
                </Pie>
                <Tooltip />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending */}
        <div className="col card">
          <h3 className="card-header">
            <AlertCircle size={20} /> Pending
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: "5rem" }}>{stats.pending}</p>
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Pending", value: stats.pending },
                    { name: "Others", value: stats.total - stats.pending },
                  ]}
                  dataKey="value"
                  outerRadius={100}
                >
                  <Cell fill="#cc5500" />
                  <Cell fill="#444" />
                </Pie>
                <Tooltip />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completed */}
        <div className="col card">
          <h3 className="card-header">
            <CheckCircle size={20} /> Completed
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: "5rem" }}>{stats.completed}</p>
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Completed", value: stats.completed },
                    { name: "Others", value: stats.total - stats.completed },
                  ]}
                  dataKey="value"
                  outerRadius={100}
                >
                  <Cell fill="#cc5500" />
                  <Cell fill="#444" />
                </Pie>
                <Tooltip />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total */}
        <div className="col card">
          <h3 className="card-header">
            <BarChart2 size={20} /> Total
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: "5rem" }}>{stats.total}</p>
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Total", value: stats.total },
                    { name: "Balance", value: 10 }, // for visualization balance
                  ]}
                  dataKey="value"
                  outerRadius={100}
                >
                  <Cell fill="#cc5500" />
                  <Cell fill="#444" />
                </Pie>
                <Tooltip />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Appointments and Remarks */}
      <div className="row">
        <div className="col card">
          <h3 className="card-header">📅 Upcoming Appointments</h3>
          {upcoming.length === 0 ? (
            <p>No upcoming appointments.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>MRN</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="scrollable-appointments-table">
                  {upcoming.map((a, index) => (
                    <tr key={a.id}>
                      <td>{index + 1}</td>
                      <td>{a.patientName}</td>
                      <td>{a.mrn}</td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td>
                        <span
                          className={`badge ${
                            a.status === "Pending"
                              ? "bg-warning"
                              : a.status === "Approved"
                              ? "bg-primary"
                              : "bg-success"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Alerts and Personal Notes */}
      <div className="row">
        <div className="col card">
          <h3 className="card-header">⚡ Quick Actions</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowNoteModal(true)}
            style={{ marginBottom: "0.5rem" }}
          >
            <PlusCircle size={16} /> Add Personal Note
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/counselor/CounselorPasswordRequest")}
          >
            <FileText size={16} /> Request Password Change
          </button>
        </div>

        <div className="col card">
          <h3 className="card-header">📌 My Personal Notes</h3>
          {localNotes.length === 0 ? (
            <p>No notes added yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {localNotes.map((note, index) => (
                    <tr key={note.id}>
                      <td>{index + 1}</td>
                      <td>{note.text}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleNoteDelete(note.id)}
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedNote && (
        <div className="modal-overlay">
          <div className="modalsc-box" style={{ border: "1px solid #cc5500" }}>
            <h2>Note for {selectedNote.patientName}</h2>
            <p>
              <strong>Date:</strong> {selectedNote.date}
            </p>
            <p>{selectedNote.notes}</p>
            <center>
              {" "}
              <button
                className="btn btn-primary"
                onClick={() => setSelectedNote(null)}
              >
                Close
              </button>
            </center>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="modal-overlay">
          <div className="modalsc-box">
            <h2>Add Personal Note</h2>
            <textarea

              className="search-input"
              rows="10"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your task/reminder..."
            />
            <div style={{ marginTop: "10px" }}>
              <center><button className="btn btn-primary" onClick={handleNoteAdd}>
                Add
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowNoteModal(false)}
              >
                Cancel
              </button></center>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselorDashboard;
