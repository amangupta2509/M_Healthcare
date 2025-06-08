import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Chart } from "react-google-charts";
import { useTheme } from "../../ThemeProvider";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import { Eye, Pencil, Trash2 } from "lucide-react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};
// Toast Message Component
const ToastMessage = ({ message, type = "success", duration = 3000 }) => {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!visible || !message) return null;

  return (
    <div
      className={`toast-message ${type}`}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "12px 20px",
        borderRadius: "8px",
        color: "white",
        fontWeight: "bold",
        transition: "opacity 0.5s ease-in-out",
        opacity: visible ? 1 : 0,
        zIndex: 1000,
        backgroundColor: type === "error" ? "#ff4d4d" : "#28a745",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <i
        className={`fa ${
          type === "error" ? "fa-times-circle" : "fa-check-circle"
        }`}
        style={{ fontSize: "18px" }}
      ></i>
      {message}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const isMobile = useIsMobile();
  const togglePopup = () => setIsPopupOpen(!isPopupOpen);
  const [allclientPopupOpen, setallclientPopupOpen] = useState(false);
  const toggleallclientPopup = () => setallclientPopupOpen(!allclientPopupOpen);

  const [selectedTime, setSelectedTime] = useState("10:00");

  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  // Show toast message function
  const showToast = (message, type = "success") => {
    setToast({
      visible: true,
      message,
      type,
    });

    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast({
        visible: false,
        message: "",
        type: "success",
      });
    }, 3000);
  };

  const [profileData, setProfileData] = useState(null);
  const fetchProfileData = async () => {
    try {
      const res = await fetch("http://localhost:3001/profile");
      const data = await res.json();
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      showToast("Failed to load profile", "error");
    }
  };
  useEffect(() => {
    fetchProfileData();
  }, []);
  if (!profileData)
    return (
      <div className="p-8 text-center text-lg font-medium">
        Loading profile...
      </div>
    );

  const handleUpdateProfile = () => {
    showToast("Profile updated successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    showToast("You have been logged out.");
    navigate("/login");
  };

  // Added custom button styles
  const buttonStyle = {
    display: "block",
    margin: "1rem auto",
    padding: "0.5rem 1.5rem",
  };

  // Added card style for consistent spacing
  const cardStyle = {
    padding: "1.5rem",
    margin: "1rem",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  };

  // Added section style for consistent section spacing
  const sectionStyle = {
    marginBottom: "2rem",
  };

  // Responsive styles
  const responsiveRowStyle = {
    display: "flex",
    flexDirection: window.innerWidth <= 768 ? "column" : "row",
    gap: "1.5rem",
    marginBottom: "2rem",
  };

  return (
    <div
      className="profile"
      style={{
        marginRight: isMobile ? "1.2rem" : "0rem",
      }}
    >
      {/* Toast Message Component */}
      {toast.visible && (
        <ToastMessage message={toast.message} type={toast.type} />
      )}
      {/* Personal Info + Client Info */}
      <div className="row" style={responsiveRowStyle}>
        <div
          className="col card"
          style={{
            ...cardStyle,
            flex: 1,
            border: "0.1px solid #cc5500",
          }}
        >
          <center>
            <h3>Personal Information</h3>
          </center>
          <p>
            <strong>Name:</strong> {profileData.personalInfo.name}
          </p>
          <p>
            <strong>Email:</strong> {profileData.personalInfo.email}
          </p>
          <p>
            <strong>Phone:</strong> {profileData.personalInfo.phone}
          </p>
          <p>
            <strong>DOB:</strong> {profileData.personalInfo.dob}
          </p>
          <div style={{ textAlign: "center" }}>
            <button
              className="btn btn-primary"
              onClick={togglePopup}
              style={buttonStyle}
            >
              View More
            </button>
          </div>
        </div>

        <div
          className="col card"
          style={{
            ...cardStyle,
            flex: 1,
            border: "1px solid #cc5500",
          }}
        >
          <center>
            <h3>Client Info</h3>
          </center>
          <p>
            <strong>Total Clients:</strong>{" "}
            {profileData.clientData.totalClients}
          </p>
          <p style={{ fontSize: "1.5em", color: "var(--accent)" }}>
            <strong>Random Number:</strong>{" "}
            {profileData.clientData.randomNumber}
          </p>
        </div>
      </div>
      {/* Performance & Analytics + Weekly Patient Flow side-by-side */}
      <div className="row" style={responsiveRowStyle}>
        {/* Performance Chart */}
        <div
          className="col card"
          style={{
            ...cardStyle,
            flex: 1,
            border: "0.1px solid #cc5500",
          }}
        >
          <center>
            <h3>Performance & Analytics</h3>
          </center>
          <Chart
            chartType="PieChart"
            data={[
              ["Metric", "Value"],
              ["Patients Treated", profileData.performanceData.patientsTreated],
              [
                "Remaining",
                profileData.performanceData.totalPatients -
                  profileData.performanceData.patientsTreated,
              ],
            ]}
            options={{
              title: "Treatment Overview",
              titleTextStyle: {
                fontSize: 18,
                bold: true,
                textAlign: "center",
                color: theme === "dark" ? "#f8f9fa" : "#212529",
              },
              is3D: true,
              pieHole: 0.3,
              colors: ["#cc5500", "#ffb380"],
              legend: {
                position: "bottom",
                textStyle: {
                  color: theme === "dark" ? "#f8f9fa" : "#212529",
                  fontSize: 13,
                },
              },
              pieSliceText: "value",
              pieSliceTextStyle: {
                color: "#fff",
                fontSize: 14,
                bold: true,
              },
              slices: {
                0: { offset: 0.05 },
              },
              backgroundColor: "transparent",
              chartArea: { width: "80%", height: "80%" }, // Better responsive chart
            }}
            width={"100%"}
            height={"300px"}
          />
          <center>
            {" "}
            <p>
              <strong>Success Rate:</strong>{" "}
              {profileData.performanceData.successRate}
            </p>
          </center>
        </div>

        {/* Weekly Bar Chart */}
        <div
          className="col card"
          style={{
            ...cardStyle,
            flex: 1,
            border: "1px solid #cc5500",
          }}
        >
          <center>
            <h3>Weekly Patient Flow</h3>
          </center>
          <Chart
            chartType="BarChart"
            data={[
              ["Week", "Appointments", "Patients Treated"],
              ["Week 1", 10, profileData.weeklyMetrics.patientsPerWeek[0]],
              ["Week 2", 12, profileData.weeklyMetrics.patientsPerWeek[1]],
              ["Week 3", 14, profileData.weeklyMetrics.patientsPerWeek[2]],
              ["Week 4", 16, profileData.weeklyMetrics.patientsPerWeek[3]],
            ]}
            options={{
              title: "",
              backgroundColor: "transparent",
              titleTextStyle: {
                fontSize: 18,
                bold: true,
                color: theme === "dark" ? "#f8f9fa" : "#212529",
              },
              legend: {
                position: "bottom",
                textStyle: {
                  color: theme === "dark" ? "#f8f9fa" : "#212529",
                  fontSize: 13,
                },
              },
              chartArea: { width: "60%" },
              hAxis: {
                title: "Count",
                minValue: 0,
                textStyle: {
                  color: theme === "dark" ? "#f8f9fa" : "#212529",
                },
                titleTextStyle: {
                  color: theme === "dark" ? "#f8f9fa" : "#212529",
                  bold: true,
                },
                gridlines: {
                  color: theme === "dark" ? "#444" : "#ccc",
                },
              },
              vAxis: {
                title: "Week",
                textStyle: {
                  color: theme === "dark" ? "#f8f9fa" : "#212529",
                },
                titleTextStyle: {
                  color: theme === "dark" ? "#f8f9fa" : "#212529",
                  bold: true,
                },
              },
              colors: ["#cc5500", "#ff884d"],
              bar: { groupWidth: "60%" },
            }}
            width={"100%"}
            height={"300px"}
          />
        </div>
      </div>
      <div className="section" style={sectionStyle}>
        <div className="section-header mb-4 text-[#cc5500]">
          <h2>Client Management</h2>
        </div>
        <div className="row" style={responsiveRowStyle}>
          <div
            className="col card"
            style={{
              ...cardStyle,
              flex: 1,
              border: "0.1px solid #cc5500",
            }}
          >
            <center>
              <h3>Active Clients</h3>
            </center>
            <div
              className="metric-display"
              style={{ textAlign: "center", margin: "1.5rem 0" }}
            >
              <span
                className="metric-number"
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  display: "block",
                }}
              >
                {profileData.clientManagement.activeClients}
              </span>
              <span
                className="metric-label"
                style={{ display: "block", color: "#666" }}
              >
                Active
              </span>
            </div>
            <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              Currently enrolled in treatment plans
            </p>
            <div style={{ textAlign: "center" }}>
              <button
                className="btn btn-primary"
                style={buttonStyle}
                onClick={() => {
                  toggleallclientPopup();
                }}
              >
                View All Active Clients
              </button>
            </div>
          </div>

          <div
            className="col card"
            style={{
              ...cardStyle,
              flex: 1,
              border: "1px solid #cc5500",
            }}
          >
            <center>
              <h3>Past Clients</h3>
            </center>
            <div
              className="metric-display"
              style={{ textAlign: "center", margin: "1.5rem 0" }}
            >
              <span
                className="metric-number"
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  display: "block",
                }}
              >
                {profileData.clientManagement.pastClients}
              </span>
              <span
                className="metric-label"
                style={{ display: "block", color: "#666" }}
              >
                Past
              </span>
            </div>
            <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              Completed treatment programs
            </p>
            <div style={{ textAlign: "center" }}>
              <button
                className="btn btn-primary"
                style={buttonStyle}
                onClick={() => {
                  toggleallclientPopup();
                }}
              >
                View Treatment History
              </button>
            </div>
          </div>

          <div
            className="col card"
            style={{
              ...cardStyle,
              flex: 1,
              border: "1px solid #cc5500",
            }}
          >
            <center>
              <h3>Pending Consultations</h3>
            </center>
            <div
              className="metric-display"
              style={{ textAlign: "center", margin: "1.5rem 0" }}
            >
              <span
                className="metric-number"
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  display: "block",
                }}
              >
                {profileData.clientManagement.pendingConsultations}
              </span>
              <span
                className="metric-label"
                style={{ display: "block", color: "#666" }}
              >
                Pending
              </span>
            </div>
            <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              Awaiting initial assessment
            </p>
            <div style={{ textAlign: "center" }}>
              <button
                className="btn btn-primary"
                style={buttonStyle}
                onClick={() => {
                  togglePopup();
                }}
              >
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* NEW SECTION: Exercise Plans */}
      <div className="section" style={sectionStyle}>
        <div className="section-header" style={{ marginBottom: "1rem" }}>
          <h2>Exercise Plans</h2>
        </div>
        <div className="row" style={responsiveRowStyle}>
          <div
            className="col card"
            style={{
              ...cardStyle,
              flex: 1,
              border: "0.1px solid #cc5500",
            }}
          >
            <center>
              <h3>Create New Plan</h3>
            </center>
            <div className="plan-form" style={{ marginTop: "1.5rem" }}>
              <select
                className="form-control"
                style={{
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  width: "100%",
                }}
              >
                <option>Select Client...</option>
                <option>Alice Smith</option>
                <option>Bob Johnson</option>
                <option>Carol Davis</option>
              </select>
              <select
                className="form-control"
                style={{
                  marginBottom: "1.5rem",
                  padding: "0.5rem",
                  width: "100%",
                }}
              >
                <option>Select Template...</option>
                <option>Lower Back Rehabilitation</option>
                <option>Knee Strengthening</option>
                <option>Post-Surgery Recovery</option>
              </select>
              <div style={{ textAlign: "center" }}>
                <button
                  className="btn btn-primary"
                  style={buttonStyle}
                  onClick={() => {
                    togglePopup();
                  }}
                >
                  Create Custom Plan
                </button>
              </div>
            </div>
          </div>

          <div
            className="col card"
            style={{
              ...cardStyle,
              flex: 1,
              border: "1px solid #cc5500",
            }}
          >
            <center>
              <h3>Manage Existing Plans</h3>
            </center>
            <p style={{ margin: "1rem 0" }}>
              <strong>Total Active Plans:</strong>{" "}
              {profileData.exercisePlans.totalPlans}
            </p>
            <ul
              className="plan-list"
              style={{ listStyle: "none", padding: 0, margin: "1.5rem 0" }}
            >
              <li
                style={{
                  margin: "0.5rem 0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                Lower Back Rehabilitation{" "}
                <span
                  className="badge"
                  style={{
                    background: "#cc5500",
                    color: "white",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  12 Clients
                </span>
              </li>
              <li
                style={{
                  margin: "0.5rem 0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                Knee Strengthening{" "}
                <span
                  className="badge"
                  style={{
                    background: "#cc5500",
                    color: "white",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  8 Clients
                </span>
              </li>
              <li
                style={{
                  margin: "0.5rem 0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                Shoulder Mobility{" "}
                <span
                  className="badge"
                  style={{
                    background: "#cc5500",
                    color: "white",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  14 Clients
                </span>
              </li>
            </ul>
            <div style={{ textAlign: "center" }}>
              <button
                className="btn btn-primary"
                style={buttonStyle}
                onClick={() => {
                  togglePopup();
                }}
              >
                View All Plans
              </button>
            </div>
          </div>

          <div
            className="col card"
            style={{
              ...cardStyle,
              flex: 1,
              border: "1px solid #cc5500",
            }}
          >
            <center>
              <h3>Plan Templates</h3>
            </center>
            <p style={{ margin: "1rem 0" }}>
              <strong>Available Templates:</strong>{" "}
              {profileData.exercisePlans.templates}
            </p>

            <table
              style={{
                width: "100%",
                marginTop: "1rem",
                borderSpacing: "0 0.5rem",
              }}
            >
              <tbody>
                {[
                  "Lower Back Rehabilitation",
                  "Knee Strengthening",
                  "Post-Surgery Recovery",
                ].map((template, index) => (
                  <tr key={index} style={{ backgroundColor: "transparent" }}>
                    <td style={{ padding: "0.5rem 0" }}>{template}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "0.25rem 0.75rem" }}
                        onClick={() =>
                          showToast(`Editing template: ${template}`)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button
                className="btn btn-primary"
                style={buttonStyle}
                onClick={() => {
                  togglePopup();
                }}
              >
                Create New Template
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* NEW SECTION: Appointments */}
      <div className="section" style={sectionStyle}>
        <div className="section-header" style={{ marginBottom: "1rem" }}>
          <h2>Appointments</h2>
        </div>

        {/* Row 1: Schedule Form and Calendar */}
        <div className="row" style={responsiveRowStyle}>
          <div
            className="col card"
            style={{
              ...cardStyle,
              flex: 1,
              border: "0.1px solid #cc5500",
            }}
          >
            <center>
              <h3>Schedule Consultation</h3>
            </center>
            <form className="consultation-form" style={{ width: "100%" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="clientName">Client Name:</label>
                <input
                  type="text"
                  id="clientName"
                  className="form-control"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="date">Date:</label>
                <input
                  type="date"
                  id="date"
                  className="form-control"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="time">Time:</label>
                <input
                  type="time"
                  id="time"
                  className="form-control"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="type">Consultation Type:</label>
                <select
                  id="type"
                  className="form-control"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <option>Initial Assessment</option>
                  <option>Follow-up</option>
                  <option>Treatment Session</option>
                </select>
              </div>
              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={buttonStyle}
                  onClick={() =>
                    showToast("Appointment scheduled successfully!")
                  }
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Row 2: Today's Appointments */}
        <div className="row" style={responsiveRowStyle}>
          <div
            className="appointments-card card"
            style={{
              ...cardStyle,
              flex: 1,
              width: "100%",
              border: "0.1px solid #cc5500",
            }}
          >
            <center>
              <h3>Today's Appointments</h3>
            </center>
            <div style={{ overflowX: "auto" }}>
              {" "}
              {/* Makes table scrollable on small screens */}
              <table
                className="appointments-table"
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0 0.5rem",
                  marginTop: "1rem",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Patient
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Time
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "0.5rem",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profileData.todaysAppointments.map((appointment, index) => (
                    <tr key={index}>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        {appointment.patient}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        {appointment.time}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        <span
                          className={`status-tag status-${appointment.status.toLowerCase()}`}
                          style={{
                            background:
                              appointment.status === "Confirmed"
                                ? "#28a745"
                                : "#ffc107",
                            color: "white",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                          }}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          padding: "0.75rem 0.5rem",
                        }}
                      >
                        <div
                          className="action-buttons"
                          style={{
                            display: "flex",
                            flexDirection:
                              window.innerWidth <= 500 ? "column" : "row",
                            gap: "0.5rem",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            className="btn btn-primary"
                            style={{
                              padding: "0.25rem 0.75rem",
                            }}
                            onClick={() =>
                              showToast(
                                `Session started with ${appointment.patient}`
                              )
                            }
                          >
                            Start
                          </button>
                          <button
                            className="btn btn-success"
                            style={{
                              padding: "0.25rem 0.75rem",
                            }}
                            onClick={() =>
                              showToast(
                                `Rescheduling ${appointment.patient}'s appointment`
                              )
                            }
                          >
                            Reschedule
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Time Picker Component */}
            <div style={{ marginTop: "2rem" }}>
              <h4>Quick Time Selection</h4>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "1rem",
                  flexDirection: window.innerWidth <= 768 ? "column" : "row",
                }}
              >
                <label
                  htmlFor="time"
                  style={{
                    marginRight: "1rem",
                    marginBottom: window.innerWidth <= 768 ? "0.5rem" : 0,
                  }}
                >
                  Select Time:
                </label>
                <TimePicker
                  id="time"
                  onChange={(time) => {
                    setSelectedTime(time);
                    showToast(`Time selected: ${time}`);
                  }}
                  value={selectedTime}
                  disableClock={true}
                  clearIcon={null}
                  className="form-control"
                  format="hh:mm a"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className="row"
          style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}
        >
          <div
            className="col card"
            style={{
              ...cardStyle,
              flex: 1,
              border: "1px solid #cc5500",
              overflow: "hidden",

              display: "flex",
              flexDirection: "column",
              maxHeight: "360px", // adjust as needed
            }}
          >
            <center>
              <h3>Upcoming Appointments</h3>
            </center>

            <div
              style={{
                overflowY: "auto",
                flex: 2,
                marginTop: "1rem",
                scrollbarColor: "#cc5500 transparent",
                scrollbarWidth: "thin",
              }}
            >
              <style>
                {`
        /* WebKit-based browsers */
        .col.card::-webkit-scrollbar {
          width: 8px;
        }
        .col.card::-webkit-scrollbar-track {
          background: transparent;
        }
        .col.card::-webkit-scrollbar-thumb {
          background-color: #cc5500;
          border-radius: 4px;
        }
      `}
              </style>
              <table
                style={{
                  width: "100%",
                  borderSpacing: "0 0.75rem", // horizontal 0, vertical 0.75rem space between rows
                  fontSize: "0.9rem",
                  borderCollapse: "separate", // IMPORTANT: allows borderSpacing to work
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        borderBottom: "1px solid #ccc",
                        textAlign: "left",
                        padding: "8px",
                        backgroundColor: "var(--bg-primary)",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ccc",
                        textAlign: "left",
                        padding: "8px",
                        backgroundColor: "var(--bg-primary)",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      Patient
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ccc",
                        textAlign: "left",
                        padding: "8px",
                        backgroundColor: "var(--bg-primary)",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profileData.appointments.map((appointment, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {appointment.date}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {appointment.patient}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {appointment.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>{" "}
      {isPopupOpen && (
        <div
          className="popup"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="popup-content card"
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h3>Physiotherapist Details</h3>
            <p>
              <strong>Specialization:</strong>{" "}
              {profileData.professionalInfo.specialization}
            </p>
            <p>
              <strong>Experience:</strong>{" "}
              {profileData.professionalInfo.experience}
            </p>
            <p>
              <strong>Certifications:</strong>{" "}
              {profileData.professionalInfo.certifications.join(", ")}
            </p>
            <Chart
              chartType="PieChart"
              data={[
                ["Metric", "Value"],
                [
                  "Patients Treated",
                  profileData.performanceData.patientsTreated,
                ],
                [
                  "Remaining",
                  profileData.performanceData.totalPatients -
                    profileData.performanceData.patientsTreated,
                ],
              ]}
              options={{
                title: "Performance Insights",
                backgroundColor: "transparent",
                titleTextStyle: {
                  color: theme === "dark" ? "white" : "#212529",
                },
                legend: {
                  textStyle: {
                    color: theme === "dark" ? "white" : "#212529",
                  },
                },
                pieSliceTextStyle: {
                  color: theme === "dark" ? "white" : "#212529",
                },
                tooltip: {
                  textStyle: {
                    color: theme === "dark" ? "white" : "#212529",
                  },
                },
              }}
              width={"100%"}
              height={"300px"}
            />

            <div style={{ textAlign: "center" }}>
              <button
                className="btn btn-primary"
                onClick={togglePopup}
                style={buttonStyle}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {allclientPopupOpen && (
        <div
          className="popup"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="popup-content card"
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              top: "50%",
              left: "50%",
              borderRadius: "8px",
              border: "1px solid #cc5500",
              maxWidth: "700px",
              width: "95%",
              maxHeight: "90vh",
              overflow: "auto",
              color: "var(--text-primary)",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Upcoming Appointments</h3>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#cc5500" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>
                    Date
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>
                    Patient
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>
                    Time
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>
                    Status
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "center" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {profileData.appointments.map((appt, index) => (
                  <tr
                    key={index}
                    style={{ borderBottom: "1px solid var(--border-color)" }}
                  >
                    <td style={{ padding: "0.75rem" }}>{appt.date}</td>
                    <td style={{ padding: "0.75rem" }}>{appt.patient}</td>
                    <td style={{ padding: "0.75rem" }}>{appt.time}</td>
                    <td style={{ padding: "0.75rem" }}>Scheduled</td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ marginRight: "0.5rem" }}
                        onClick={() => showToast(`Viewing ${appt.patient}`)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ marginRight: "0.5rem" }}
                        onClick={() => showToast(`Editing ${appt.patient}`)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => showToast(`Deleting ${appt.patient}`)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button
                className="btn btn-primary"
                onClick={toggleallclientPopup}
                style={{ padding: "0.5rem 1.5rem", fontSize: "1rem" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
