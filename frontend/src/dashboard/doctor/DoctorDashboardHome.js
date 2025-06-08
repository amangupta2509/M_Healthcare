import React, { useState, useEffect } from "react";
import { useTheme } from "../../ThemeProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../physio/clientManagement.css";

const DoctorDashboardHome = () => {
  const { theme } = useTheme();

  const [quote, setQuote] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [searchMRN, setSearchMRN] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [activeTab, setActiveTab] = useState("medical");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showLastVisitModal, setShowLastVisitModal] = useState(false);

  const quotes = [
    "Every patient is a story waiting to be heard.",
    "The best doctors give the best of themselves.",
    "Wherever the art of medicine is loved, there is also a love of humanity.",
    "A kind doctor makes healing happen faster.",
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    fetch("http://localhost:3001/appointments")
      .then((res) => res.json())
      .then(setAppointments)
      .catch(() => {
        console.warn("Could not fetch appointments");
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
      <div className="card" style={{ textAlign: "center" }}>
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
      <div className="card">
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
      <div className="card">
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
            onChange={(e) => setSearchMRN(e.target.value)}
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
        <div className="card">
          <h3 className="card-header">Patient Details</h3>
          <div className="table-responsive patient-details-responsive">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Reference Number</th>
                  <th style={{ textAlign: "center" }}>Last Visit</th>
                  <th>Next Visit</th>
                  <th style={{ textAlign: "center" }}>Records / Documents</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{patientData.clientName}</td>
                  <td>{patientData.referenceNumber}</td>
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
                    {patientData.newVisit.date} at {patientData.newVisit.time}
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
                </tr>
              </tbody>
            </table>
          </div>
          {/* Approval Buttons */}
          {/* Approval Buttons */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button
              className="btn btn-primary btn-responsive"
              onClick={() => handleApproval("nutrition")}
              style={{ margin: "0.5rem" }}
              disabled={patientData.approvals?.nutrition}
            >
              {patientData.approvals?.nutrition
                ? "Nutrition Approved ✅"
                : "Approve for Nutrition"}
            </button>

            <button
              className="btn btn-primary btn-responsive"
              onClick={() => handleApproval("diet")}
              style={{ margin: "0.5rem" }}
              disabled={patientData.approvals?.diet}
            >
              {patientData.approvals?.diet
                ? "Diet Approved ✅"
                : "Approve for Diet"}
            </button>

            <button
              className="btn btn-primary btn-responsive"
              onClick={() => handleApproval("physio")}
              style={{ margin: "0.5rem" }}
              disabled={patientData.approvals?.physio}
            >
              {patientData.approvals?.physio
                ? "Physio Approved ✅"
                : "Approve for Physio"}
            </button>
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
                className="btn btn-primary btn-responsive"
                style={{ flex: "1" }}
              >
                Medical
              </button>
              <button
                onClick={() => setActiveTab("test")}
                className="btn btn-primary btn-responsive"
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
                              className="btn btn-primary btn-responsive"
                              onClick={() => setPdfUrl(item.clinicalNote)}
                            >
                              View
                            </button>
                          </center>
                        </td>
                        <td>
                          <center>
                            <button
                              className="btn btn-primary btn-responsive"
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
                      <th>Test Name</th>
                      <th style={{ textAlign: "center" }}>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testRecords.map((item, idx) => (
                      <tr key={idx}>
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
                }}
              >
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
