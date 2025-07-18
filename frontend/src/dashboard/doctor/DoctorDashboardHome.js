import React, { useState, useEffect } from "react";
import { useTheme } from "../../ThemeProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../physio/clientManagement.css";
import { CheckCircle } from "lucide-react";

const DoctorDashboardHome = () => {
  const { theme } = useTheme();

  const [quote, setQuote] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [testCategories, setTestCategories] = useState([]);
  const [searchMRN, setSearchMRN] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [activeTab, setActiveTab] = useState("medical");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showCounselorModal, setShowCounselorModal] = useState(false);

  const [counselorTypes, setCounselorTypes] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [counselorNote, setCounselorNote] = useState("");

  const [showLastVisitModal, setShowLastVisitModal] = useState(false);
  const scrollRef = React.useRef(null);
  const [showAssignTestModal, setShowAssignTestModal] = useState(false);
  const [testForm, setTestForm] = useState({
    testType: "",
    testName: "",
    priority: "normal",
    notes: "",
    scheduledDate: "",
    scheduledTime: "",
  });

  const quotes = [
    "Every patient is a story waiting to be heard.",
    "The best doctors give the best of themselves.",
    "Wherever the art of medicine is loved, there is also a love of humanity.",
    "A kind doctor makes healing happen faster.",
  ];

  useEffect(() => {
    // Set motivational quote
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Fetch today's appointments
    fetch("http://localhost:3001/appointments")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch appointments");
        return res.json();
      })
      .then(setAppointments)
      .catch(() => {
        toast.error("Could not fetch appointments");
      });

    // Fetch test categories for dynamic test name dropdown
    fetch("http://localhost:3001/testCategories")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch test categories");
        return res.json();
      })
      .then(setTestCategories)
      .catch(() => {
        toast.error("Could not load test types");
      });

    // Fetch counselor types
    fetch("http://localhost:3001/counselorTypes")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch counselor types");
        return res.json();
      })
      .then(setCounselorTypes)
      .catch(() => {
        toast.error("Could not load counselor types");
      });
  }, []);

  const handleSearch = () => {
    if (!searchMRN.trim()) {
      toast.warning("Please enter a valid MRN");
      return;
    }

    fetch(`http://localhost:3001/patients_detailed/${searchMRN}`)
      .then((res) => {
        if (!res.ok) throw new Error("Patient not found");
        return res.json();
      })
      .then((data) => {
        toast.success("Patient found!");
        setPatientData(data);
      })
      .catch(() => {
        toast.error("No patient found with this MRN");
        setPatientData(null);
      });
  };

  const handleApproval = (type) => {
    if (!patientData || !type) return;

    const updatedApproval = {
      ...patientData.approvals,
      [type]: true,
    };

    fetch(`http://localhost:3001/patients_detailed/${patientData.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ approvals: updatedApproval }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update approval");
        return res.json();
      })
      .then((data) => {
        toast.success(
          `${type.charAt(0).toUpperCase() + type.slice(1)} Approved!`
        );
        setPatientData(data); // Update state with backend response
      })
      .catch(() => {
        toast.error("Could not update approval in database");
      });
  };
  const showUndoApprovalToast = (typeLabelText, onConfirm, theme) => {
    const toastId = "deassign-confirmation"; // prevent duplicate confirmation toasts

    if (toast.isActive(toastId)) return; // skip if it's already showing

    toast(
      ({ closeToast }) => (
        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: "0.5rem" }}>
            Are you sure you want to deassign this patient from{" "}
            <strong>{typeLabelText}</strong>?
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <button
              onClick={() => {
                onConfirm();
                toast.dismiss(toastId);
              }}
              style={{
                padding: "0.4rem 1rem",
                backgroundColor: "#cc5500",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(toastId)}
              style={{
                padding: "0.4rem 1rem",
                backgroundColor: "#e0e0e0",
                color: "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        toastId, // prevent stacking
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      }
    );
  };

  const handleAssignTest = () => {
    if (
      !testForm.testType ||
      !testForm.testName ||
      !testForm.scheduledDate ||
      !testForm.scheduledTime
    ) {
      toast.warning("Please fill all required fields");
      return;
    }

    const newTest = {
      id: Date.now(), // Simple ID generation
      ...testForm,
      status: "scheduled",
      assignedDate: new Date().toISOString().split("T")[0],
      patientId: patientData.id,
    };

    // Update patient data with new test
    const updatedPatient = {
      ...patientData,
      assignedTests: [...(patientData.assignedTests || []), newTest],
    };

    fetch(`http://localhost:3001/patients_detailed/${patientData.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assignedTests: updatedPatient.assignedTests }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to assign test");
        return res.json();
      })
      .then((data) => {
        toast.success("Test assigned successfully!");
        setPatientData(data);
        setShowAssignTestModal(false);
        // Reset form
        setTestForm({
          testType: "",
          testName: "",
          priority: "normal",
          notes: "",
          scheduledDate: "",
          scheduledTime: "",
        });
      })
      .catch(() => {
        toast.error("Could not assign test");
      });
  };
  const medicalData = [
    {
      date: "2025-06-01",
      time: "10:30 AM",
      clinicalNote: "/pdfs/MRN01.pdf",
      prescription: "/prescriptions/MRN123456_labreport.pdf",
    },
  ];

  const testRecords =
    patientData?.documents?.map((doc) => ({
      name: doc,
      url: `/pdfs/${doc}`,
    })) || [];

  return (
    <div
      className={`dashboard-main ${theme}`}
      style={{
        padding: "1rem",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <ToastContainer position="top-center" autoClose={2000} />

      {/* Responsive Styles */}
      <style jsx>{`
        /* Theme-aware Scrollbar Styles */
        .dashboard-main ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .dashboard-main ::-webkit-scrollbar-track {
          background: var(--bg-secondary, #f1f1f1);
          border-radius: 4px;
        }

        .dashboard-main ::-webkit-scrollbar-thumb {
          background: var(--primary-color, #cc5500);
          border-radius: 4px;
          transition: background 0.3s ease;
        }

        .dashboard-main ::-webkit-scrollbar-thumb:hover {
          background: var(--primary-hover, #b84a00);
        }

        /* Dark theme scrollbar */
        .dashboard-main.dark ::-webkit-scrollbar-track {
          background: var(--bg-secondary, #2a2a2a);
        }

        .dashboard-main.dark ::-webkit-scrollbar-thumb {
          background: var(--primary-color, #ff6b35);
        }

        .dashboard-main.dark ::-webkit-scrollbar-thumb:hover {
          background: var(--primary-hover, #ff5722);
        }

        /* Modal scrollbars */
        .modal-responsive ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .modal-responsive ::-webkit-scrollbar-track {
          background: var(--bg-secondary, #f9f9f9);
          border-radius: 3px;
        }

        .modal-responsive ::-webkit-scrollbar-thumb {
          background: var(--primary-color, #cc5500);
          border-radius: 3px;
        }

        .modal-responsive ::-webkit-scrollbar-thumb:hover {
          background: var(--primary-hover, #b84a00);
        }

        /* Table scrollbars */
        .responsive-table ::-webkit-scrollbar {
          height: 6px;
        }

        .responsive-table ::-webkit-scrollbar-track {
          background: var(--bg-secondary, #f1f1f1);
          border-radius: 3px;
        }

        .responsive-table ::-webkit-scrollbar-thumb {
          background: var(--primary-color, #cc5500);
          border-radius: 3px;
        }

        .responsive-table ::-webkit-scrollbar-thumb:hover {
          background: var(--primary-hover, #b84a00);
        }

        /* Firefox scrollbar styling */
        .dashboard-main {
          scrollbar-width: thin;
          scrollbar-color: var(--primary-color, #cc5500)
            var(--bg-secondary, #f1f1f1);
        }

        .dashboard-main.dark {
          scrollbar-color: var(--primary-color, #ff6b35)
            var(--bg-secondary, #2a2a2a);
        }
        .date-time-grid {
          grid-template-columns: 1fr 1fr;
        }

        @media (max-width: 480px) {
          .date-time-grid {
            grid-template-columns: 1fr !important;
          }

          .modal-responsive form > div > input,
          .modal-responsive form > div > select,
          .modal-responsive form > div > textarea {
            font-size: 16px !important; /* Prevents zoom on iOS */
          }
        }
        @media (max-width: 768px) {
          .responsive-table {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
          }

          .responsive-table table {
            min-width: 100%;
            font-size: 0.8rem;
          }

          .responsive-table th,
          .responsive-table td {
            padding: 0.5rem 0.3rem;
            white-space: nowrap;
          }

          .mobile-search {
            flex-direction: column;
            gap: 0.5rem;
          }

          .mobile-search input {
            width: 100%;
            margin-bottom: 0.5rem;
          }

          .mobile-search button {
            width: 100%;
          }

          .modal-responsive {
            width: 95% !important;
            max-width: 95% !important;
            margin: 1rem !important;
            padding: 1rem !important;
          }

          .tab-buttons {
            flex-direction: column;
            gap: 0.5rem;
          }

          .tab-buttons button {
            width: 100%;
          }

          .patient-details-responsive {
            display: block;
            overflow-x: auto;
          }

          .patient-details-responsive table {
            min-width: 600px;
          }

          .btn-responsive {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
            min-width: 70px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-main {
            padding: 0.5rem;
          }

          .card {
            margin-bottom: 1rem;
            padding: 1rem;
          }

          .card-header {
            font-size: 1.2rem;
            margin-bottom: 0.8rem;
          }

          .responsive-table th,
          .responsive-table td {
            padding: 0.4rem 0.2rem;
            font-size: 0.7rem;
          }

          .btn-responsive {
            padding: 0.3rem 0.6rem;
            font-size: 0.7rem;
            min-width: 60px;
          }

          .modal-responsive {
            width: 98% !important;
            max-width: 98% !important;
            margin: 0.5rem !important;
            padding: 0.8rem !important;
          }

          .pdf-viewer-responsive {
            height: 300px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .dashboard-main {
            padding: 1.5rem;
          }

          .modal-responsive {
            width: 85% !important;
            max-width: 85% !important;
          }
        }

        @media (min-width: 1025px) {
          .dashboard-main {
            padding: 2rem;
          }
        }
      `}</style>

      {/* Welcome Section */}
      <div
        className="card"
        style={{ textAlign: "center", border: "1px solid #cc5500" }}
      >
        <h2 className="card-header">Welcome, Doctor</h2>
        <p
          style={{
            fontStyle: "italic",
            color: "var(--text-secondary)",
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            lineHeight: "1.4",
          }}
        >
          {quote}
        </p>
      </div>

      {/* Today's Appointments */}
      <div className="card" style={{ border: "1px solid #cc5500" }}>
        <h3 className="card-header">Today's Appointments</h3>
        {appointments.length === 0 ? (
          <p>No appointments for today.</p>
        ) : (
          <div className="table-responsive responsive-table">
            <table className="user-table">
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Patient Name</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt, index) => (
                  <tr key={index}>
                    <td>{appt.mrn}</td>
                    <td>{appt.patientName}</td>
                    <td>{appt.time}</td>
                    <td>{appt.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MRN Search */}
      <div
        className="card"
        ref={scrollRef}
        style={{ border: "1px solid #cc5500" }}
      >
        <h3 className="card-header">Search Patient by MRN</h3>
        <div
          className="mobile-search"
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={searchMRN}
            onChange={(e) => setSearchMRN(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Enter MRN"
            className="search-input"
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "0.8rem",
              fontSize: "1rem",
              height: "auto",
              boxSizing: "border-box",
            }}
          />

          <button
            className="btn btn-primary btn-responsive"
            onClick={handleSearch}
            style={{
              minWidth: "100px",
              padding: "0.8rem 1.5rem",
              height: "auto",
              boxSizing: "border-box",
              fontSize: "1rem",
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Patient Details Table */}
      {patientData && (
        <div className="card" style={{ border: "1px solid #cc5500" }}>
          <h3 className="card-header">Patient Details</h3>
          <div className="table-responsive patient-details-responsive">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Reference Number</th>
                  <th>Next Visit</th>
                  <th style={{ textAlign: "center" }}>Last Visit</th>
                  <th style={{ textAlign: "center" }}>Records / Documents</th>
                  <th style={{ textAlign: "center" }}>Assign Tests</th>
                  <th style={{ textAlign: "center" }}>Assign Counselor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{patientData.clientName}</td>
                  <td>{patientData.referenceNumber}</td>

                  <td>
                    {patientData?.newVisit?.date
                      ? `${patientData.newVisit.date} at ${patientData.newVisit.time}`
                      : "N/A"}
                  </td>

                  <td>
                    <center>
                      <button
                        className="btn btn-primary btn-responsive"
                        onClick={() => setShowLastVisitModal(true)}
                      >
                        View Last Visit
                      </button>
                    </center>
                  </td>
                  <td>
                    <center>
                      <button
                        className="btn btn-primary btn-responsive"
                        onClick={() => setShowDocumentModal(true)}
                      >
                        View Documents
                      </button>
                    </center>
                  </td>
                  <td>
                    <center>
                      <button
                        className="btn btn-primary btn-responsive"
                        onClick={() => setShowAssignTestModal(true)}
                      >
                        Assign Test
                      </button>
                    </center>
                  </td>
                  <td>
                    <center>
                      {" "}
                      <button
                        className="btn btn-primary btn-responsive"
                        onClick={() => setShowCounselorModal(true)}
                        style={{ marginTop: "0.5rem" }}
                      >
                        Refer to Counselor
                      </button>
                    </center>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Approval Buttons */}
          {/* Approval Buttons */}
          {/* Approval Buttons with Undo Confirmation */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            {["nutrition", "diet", "physio"].map((type) => {
              const isApproved = patientData.approvals?.[type];
              const typeLabel = {
                nutrition: "Neutrogenomic",
                diet: "Dietician",
                physio: "Physiotherapist",
              };

              return (
                <button
                  key={type}
                  className="btn btn-primary btn-responsive"
                  onClick={() => {
                    if (isApproved) {
                      showUndoApprovalToast(
                        typeLabel[type],
                        () => {
                          const updatedApproval = {
                            ...patientData.approvals,
                            [type]: false,
                          };

                          fetch(
                            `http://localhost:3001/patients_detailed/${patientData.id}`,
                            {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                approvals: updatedApproval,
                              }),
                            }
                          )
                            .then((res) => {
                              if (!res.ok)
                                throw new Error("Failed to update approval");
                              return res.json();
                            })
                            .then((data) => {
                              toast.success(
                                `${typeLabel[type]} deassigned successfully.`
                              );
                              setPatientData(data);
                            })
                            .catch(() => {
                              toast.error("Failed to update approval status.");
                            });
                        },
                        theme
                      );
                    } else {
                      handleApproval(type);
                    }
                  }}
                  style={{ margin: "0.5rem" }}
                >
                  {isApproved
                    ? `${typeLabel[type]} Approved ✅ (Click to Undo)`
                    : `Approve for ${typeLabel[type]}'s`}
                </button>
              );
            })}
          </div>

          {(patientData?.approvals?.physio ||
            patientData?.approvals?.diet ||
            patientData?.approvals?.nutrition) && (
            <div
              style={{
                background: "--var(--bg-primary)",
                color: "--var(--text-primary)",
                border: "1px solid #cc5500",
                borderRadius: "8px",
                padding: "1rem",
                marginTop: "1.5rem",
                textAlign: "left",
              }}
            >
              <h4 style={{ color: "#ff6b35", marginBottom: "0.5rem" }}>
                <strong>Patient Assigned</strong>
              </h4>
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>{patientData.clientName}</strong> is currently assigned
                to:
              </p>
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {patientData.approvals.physio && (
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <CheckCircle size={18} color="green" />
                    <strong>Physio</strong>
                  </li>
                )}
                {patientData.approvals.diet && (
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <CheckCircle size={18} color="green" />
                    <strong>Dietitian</strong>
                  </li>
                )}
                {patientData.approvals.nutrition && (
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <CheckCircle size={18} color="green" />
                    <strong>Neutrogenomic</strong>
                  </li>
                )}
              </ul>
            </div>
          )}
          {(patientData?.approvals?.physio ||
            patientData?.approvals?.diet ||
            patientData?.approvals?.nutrition) && (
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button
                className="btn btn-primary"
                style={{
                  backgroundColor: "#ff6b35",
                  border: "none",
                  padding: "0.8rem 2rem",
                  fontWeight: "bold",
                  borderRadius: "6px",
                  fontSize: "1rem",
                }}
                onClick={() => {
                  toast.success("Patient Assignment Completed!");
                  setPatientData(null); // Clear search result
                  setSearchMRN(""); // Clear input
                  scrollRef.current?.scrollIntoView({ behavior: "smooth" }); // Scroll back
                }}
              >
                Click To Proceed
              </button>
            </div>
          )}
        </div>
      )}
      {/* Assign Test Modal */}
      {showAssignTestModal && (
        <div
          onClick={() => setShowAssignTestModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem",
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-responsive"
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "90%",
              border: "1px solid #cc5500",
              boxSizing: "border-box",
            }}
          >
            <h2
              style={{
                marginBottom: "1.5rem",
                fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                color: "var(--text-primary)",
              }}
            >
              Assign Test to {patientData?.clientName}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAssignTest(); // Uses only testType and testName now
              }}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* Test Type */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                    color: "var(--text-primary)",
                  }}
                >
                  Test Type *
                </label>
                <select
                  value={testForm.testType}
                  onChange={(e) =>
                    setTestForm({
                      ...testForm,
                      testType: e.target.value,
                      testName: "", // Reset test name when type changes
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="">Select Test Type</option>
                  {testCategories.map((cat) => (
                    <option key={cat.type} value={cat.type}>
                      {cat.type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                    color: "var(--text-primary)",
                  }}
                >
                  Test Name *
                </label>
                <select
                  value={testForm.testName}
                  onChange={(e) =>
                    setTestForm({ ...testForm, testName: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="">Select Test Name</option>
                  {testCategories
                    .find((cat) => cat.type === testForm.testType)
                    ?.subTests.map((name, index) => (
                      <option key={index} value={name}>
                        {name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Submit and Cancel Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAssignTestModal(false)}
                  style={{
                    padding: "0.6rem 1.2rem",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.6rem 1.2rem",
                    backgroundColor: "#cc5500",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCounselorModal && (
        <div
          onClick={() => setShowCounselorModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem",
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-responsive"
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "100%",
              border: "1px solid #cc5500",
              boxSizing: "border-box",
            }}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>Refer to Counselor</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedCounselor) {
                  toast.error("Please select a counselor type.");
                  return;
                }
                toast.success(`Referred to ${selectedCounselor}`);
                setShowCounselorModal(false);
                setSelectedCounselor("");
                setCounselorNote("");
              }}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <select
                value={selectedCounselor}
                onChange={(e) => setSelectedCounselor(e.target.value)}
                required
                style={{
                  padding: "0.8rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Select Counselor Type</option>
                {counselorTypes.map((item) => (
                  <option key={item.id} value={item.type}>
                    {item.type}
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Reason or notes (optional)"
                value={counselorNote}
                onChange={(e) => setCounselorNote(e.target.value)}
                rows={3}
                style={{
                  padding: "0.8rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  resize: "vertical",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCounselorModal(false)}
                  className="btn btn-responsive"
                  style={{
                    border: "1px solid #ccc",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-responsive"
                  style={{ backgroundColor: "#cc5500", color: "#fff" }}
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocumentModal && (
        <div
          onClick={() => setShowDocumentModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem",
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-responsive"
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "70%",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
              border: "1px solid #cc5500",
              position: "relative",
              boxSizing: "border-box",
            }}
          >
            {/* Tabs */}
            <div
              className="tab-buttons"
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1rem",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setActiveTab("medical")}
                className={`btn btn-responsive ${
                  activeTab === "medical" ? "btn-active" : "btn-primary"
                }`}
                style={{ flex: "1" }}
              >
                Medical
              </button>
              <button
                onClick={() => setActiveTab("test")}
                className={`btn btn-responsive ${
                  activeTab === "test" ? "btn-active" : "btn-primary"
                }`}
                style={{ flex: "1" }}
              >
                Test Record
              </button>
            </div>

            {/* Medical Tab */}
            {activeTab === "medical" && (
              <div className="responsive-table">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th style={{ textAlign: "center" }}>Clinical Note</th>
                      <th style={{ textAlign: "center" }}>Prescription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalData.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.date}</td>
                        <td>{item.time}</td>
                        <td>
                          <center>
                            <button
                              className="btn btn-primary"
                              onClick={() => setPdfUrl(item.clinicalNote)}
                            >
                              View
                            </button>
                          </center>
                        </td>
                        <td>
                          <center>
                            <button
                              className="btn btn-primary"
                              onClick={() => setPdfUrl(item.prescription)}
                            >
                              View
                            </button>
                          </center>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Test Record Tab */}
            {activeTab === "test" && (
              <div className="responsive-table">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Date</th> {/* New column added here */}
                      <th>Test Name</th>
                      <th style={{ textAlign: "center" }}>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testRecords.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.date}</td> {/* New date data rendered here */}
                        <td>{item.name}</td>
                        <td>
                          <center>
                            <button
                              className="btn btn-primary btn-responsive"
                              onClick={() => setPdfUrl(item.url)}
                            >
                              View
                            </button>
                          </center>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PDF Viewer */}
            {pdfUrl && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  position: "relative",
                }}
              >
                {/* Top Action Bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setPdfUrl("")}
                    className="btn btn-primary"
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      lineHeight: "1",
                      padding: "0.4rem 0.8rem",
                      cursor: "pointer",
                    }}
                    title="Close PDF Viewer"
                  >
                    ×
                  </button>

                  {/* Open in New Tab */}
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-responsive"
                    style={{
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    🔗 Open in New Tab
                  </a>
                </div>

                {/* PDF Iframe Viewer */}
                <iframe
                  src={pdfUrl}
                  title="PDF Viewer"
                  width="100%"
                  height="500px"
                  className="pdf-viewer-responsive"
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    minHeight: "300px",
                  }}
                />
              </div>
            )}

            <center>
              <button
                style={{ marginTop: "2rem", marginBottom: "0rem" }}
                onClick={() => setShowDocumentModal(false)}
                className="btn btn-primary btn-responsive"
              >
                Close
              </button>
            </center>
          </div>
        </div>
      )}

      {/* Last Visit Modal */}
      {showLastVisitModal && (
        <div
          onClick={() => setShowLastVisitModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem",
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
              border: "1px solid #CC5500",
              boxSizing: "border-box",
            }}
          >
            <button
              onClick={() => setShowLastVisitModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#cc5500",
                border: "none",
                padding: "0.5rem 1rem",
                fontWeight: "bold",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Close
            </button>

            <h2
              style={{
                marginBottom: "1rem",
                fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                paddingRight: "3rem",
              }}
            >
              Last Visit Summary
            </h2>

            <div style={{ lineHeight: "1.6" }}>
              <p>
                <strong>Date:</strong> {patientData.lastVisit?.date}
              </p>
              <p>
                <strong>Time:</strong> {patientData.lastVisit?.time}
              </p>
              <p>
                <strong>Summary:</strong> {patientData.lastVisit?.summary}
              </p>

              <h3
                style={{
                  marginTop: "1rem",
                  fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                }}
              >
                Vitals
              </h3>
              <ul style={{ paddingLeft: "1.2rem" }}>
                <li>
                  <strong>BP:</strong> {patientData.lastVisit?.vitals?.BP}
                </li>
                <li>
                  <strong>Pulse:</strong> {patientData.lastVisit?.vitals?.Pulse}
                </li>
                <li>
                  <strong>Temp:</strong> {patientData.lastVisit?.vitals?.Temp}
                </li>
              </ul>

              <p>
                <strong>Doctor Notes:</strong>
                <br />
                {patientData.lastVisit?.doctorNotes}
              </p>
              <p>
                <strong>Recommendation:</strong>
                <br />
                {patientData.lastVisit?.recommendation}
              </p>

              {patientData.lastVisit?.prescription && (
                <div style={{ marginTop: "1rem" }}>
                  <strong>Prescription:</strong>
                  <br />
                  <a
                    href={patientData.lastVisit.prescription}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-responsive"
                    style={{ marginTop: "0.5rem" }}
                  >
                    View PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DoctorDashboardHome;
