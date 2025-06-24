import React, { useEffect, useState } from "react";
import { useTheme } from "../../ThemeProvider";
import "../physio/assign.css";
import { FileText, Loader } from "lucide-react";

const DoctorAssignmentDashboard = () => {
  const { theme } = useTheme();
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMRN, setSearchMRN] = useState("");

  // Document Viewer States
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [activeTab, setActiveTab] = useState("medical");
  const [pdfUrl, setPdfUrl] = useState("");
  const [medicalData, setMedicalData] = useState([]);
  const [testRecords, setTestRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3001/patients_detailed");
        const patients = await res.json();

        const filtered = patients
          .filter((p) => p.approvals?.physio || p.approvals?.diet)
          .sort((a, b) => {
            const dateA = new Date(a.assignedTests?.[0]?.assignedDate || 0);
            const dateB = new Date(b.assignedTests?.[0]?.assignedDate || 0);
            return dateB - dateA;
          });

        setAssignedPatients(filtered);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPatients = assignedPatients.filter((p) =>
    p.id.toLowerCase().includes(searchMRN.toLowerCase())
  );

  const handleViewHistory = (patientId) => {
    // Replace with actual API data later
    const dummyMedical = [
      {
        date: "2024-05-10",
        time: "10:00 AM",
        clinicalNote: "/dummy-clinical.pdf",
        prescription: "/dummy-prescription.pdf",
      },
    ];
    const dummyTests = [
      { date: "2024-05-09", name: "Blood Test", url: "/dummy-test.pdf" },
    ];

    setMedicalData(dummyMedical);
    setTestRecords(dummyTests);
    setShowDocumentModal(true);
  };

  if (loading) {
    return (
      <div className={`assign-page ${theme}`}>
        <div className="assign-container">
          <div className="loading-container">
            <Loader className="loading-spinner" size={32} />
            <p className="loading-text">Loading assigned patients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`assign-page ${theme}`}>
      <div className="assign-container">
        <h2 className="section-title">Assigned Patients Dashboard</h2>

        <div style={{ margin: "1rem 0" }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by MRN"
            value={searchMRN}
            onChange={(e) => setSearchMRN(e.target.value.toUpperCase())}
            style={{
              padding: "0.6rem 1rem",
              fontSize: "1rem",
              width: "100%",
              maxWidth: "400px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {filteredPatients.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} className="empty-icon" />
            <p className="empty-text">No patients assigned yet</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>MRN</th>
                  <th>Assigned To</th>
                  <th>Prescription File</th>
                  <th>Assign Tests</th>
                  <th>Counselor Type</th>
                  <th>History</th> {/* NEW COLUMN */}
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const testAssigned = patient.assignedTests?.length > 0;
                  const counselorType = patient.counselorAssignment?.type;

                  return (
                    <tr key={patient.id}>
                      <td data-label="Name">{patient.clientName}</td>
                      <td data-label="MRN">{patient.id}</td>
                      <td data-label="Assigned To">
                        <div className="assignment-tags">
                          {patient.approvals?.physio && (
                            <span className="assignment-tag physio">
                              Physio
                            </span>
                          )}
                          {patient.approvals?.diet && (
                            <span className="assignment-tag dietitian">
                              Dietitian
                            </span>
                          )}
                          {patient.approvals?.nutrition && (
                            <span className="assignment-tag nutrition">
                              Nutrition
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label="Prescription File">
                        {patient.lastVisit?.prescription ? (
                          <a
                            href={patient.lastVisit.prescription}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pdf-link"
                          >
                            <FileText size={18} /> View File
                          </a>
                        ) : (
                          <span className="no-file">No File</span>
                        )}
                      </td>
                      <td data-label="Assign Tests">
                        {testAssigned ? (
                          <span className="assignment-tag">✅ Assigned</span>
                        ) : (
                          <span
                            className="assignment-tag"
                            style={{ backgroundColor: "#eee", color: "#999" }}
                          >
                            ❌ Not Assigned
                          </span>
                        )}
                      </td>
                      <td data-label="Counselor Type">
                        {counselorType ? (
                          <span className="assignment-tag">
                            {counselorType}
                          </span>
                        ) : (
                          <span
                            className="assignment-tag"
                            style={{ backgroundColor: "#eee", color: "#999" }}
                          >
                            ❌ Not Assigned
                          </span>
                        )}
                      </td>
                      <td data-label="History" style={{ textAlign: "center" }}>
                        <center>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleViewHistory(patient.id)}
                            title="View History"
                            style={{ padding: "0.3rem 0.6rem" }}
                          >
                            <FileText size={18} />
                          </button>
                        </center>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
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

            {/* Test Tab */}
            {activeTab === "test" && (
              <div className="responsive-table">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Test Name</th>
                      <th style={{ textAlign: "center" }}>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testRecords.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.date}</td>
                        <td>{item.name}</td>
                        <td>
                          <center>
                            <button
                              className="btn btn-primary"
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
                  }}
                >
                  <button
                    onClick={() => setPdfUrl("")}
                    className="btn btn-primary"
                  >
                    ×
                  </button>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    🔗 Open in New Tab
                  </a>
                </div>
                <iframe
                  src={pdfUrl}
                  title="PDF Viewer"
                  width="100%"
                  height="500px"
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
                className="btn btn-primary"
                onClick={() => setShowDocumentModal(false)}
                style={{ marginTop: "2rem" }}
              >
                Close
              </button>
            </center>
          </div>
        </div>
      )}
      <style jsx>{`
        /* Loading Styles */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          gap: 1rem;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
          color: ${theme === "dark"
            ? "var(--primary-dark, #64b5f6)"
            : "var(--primary-light, #1976d2)"};
        }

        .loading-text {
          color: ${theme === "dark"
            ? "var(--text-secondary-dark, #cccccc)"
            : "var(--text-secondary-light, #666666)"};
          font-size: 1rem;
          margin: 0;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          gap: 1rem;
        }

        .empty-icon {
          color: ${theme === "dark"
            ? "var(--text-tertiary-dark, #888888)"
            : "var(--text-tertiary-light, #999999)"};
          opacity: 0.6;
        }

        .empty-text {
          color: ${theme === "dark"
            ? "var(--text-secondary-dark, #cccccc)"
            : "var(--text-secondary-light, #666666)"};
          font-size: 1.1rem;
          margin: 0;
        }

        /* Table Wrapper */
        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          margin-top: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* Table Styles */
        .styled-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
          background-color: ${theme === "dark"
            ? "var(--background-secondary, #1a1a1a)"
            : "var(--background-primary, #ffffff)"};
        }

        .styled-table th,
        .styled-table td {
          padding: 1rem 0.75rem;
          border-bottom: 1px solid
            ${theme === "dark"
              ? "var(--border-dark, #333)"
              : "var(--border-light, #e0e0e0)"};
          text-align: left;
          vertical-align: middle;
        }

        .styled-table th {
          background-color: ${theme === "dark"
            ? "var(--accent-dark, #2d2d2d)"
            : "var(--accent-light, #f8f9fa)"};
          color: ${theme === "dark"
            ? "var(--text-primary-dark, #ffffff)"
            : "var(--text-primary-light, #333333)"};
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .styled-table td {
          color: ${theme === "dark"
            ? "var(--text-secondary-dark, #cccccc)"
            : "var(--text-secondary-light, #666666)"};
          font-size: 0.875rem;
        }

        .styled-table tr:hover {
          background-color: ${theme === "dark"
            ? "var(--hover-dark, #2a2a2a)"
            : "var(--hover-light, #f5f5f5)"};
          transition: background-color 0.2s ease;
        }

        /* Prescription Text */
        .prescription-text {
          display: block;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Assignment Tags */
        .assignment-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .assignment-tag {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .assignment-tag.physio {
          background-color: ${theme === "dark"
            ? "rgba(76, 175, 80, 0.2)"
            : "rgba(76, 175, 80, 0.1)"};
          color: ${theme === "dark" ? "#81c784" : "#4caf50"};
          border: 1px solid
            ${theme === "dark" ? "#4caf50" : "rgba(76, 175, 80, 0.3)"};
        }

        .assignment-tag.dietitian {
          background-color: ${theme === "dark"
            ? "rgba(255, 152, 0, 0.2)"
            : "rgba(255, 152, 0, 0.1)"};
          color: ${theme === "dark" ? "#ffb74d" : "#ff9800"};
          border: 1px solid
            ${theme === "dark" ? "#ff9800" : "rgba(255, 152, 0, 0.3)"};
        }
        .assignment-tag.nutrition {
          background-color: ${theme === "dark"
            ? "rgba(33, 150, 243, 0.2)"
            : "rgba(33, 150, 243, 0.1)"};
          color: ${theme === "dark" ? "#64b5f6" : "#2196f3"};
          border: 1px solid
            ${theme === "dark" ? "#2196f3" : "rgba(33, 150, 243, 0.3)"};
        }

        /* PDF Link */
        .pdf-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: ${theme === "dark"
            ? "var(--primary-dark, #64b5f6)"
            : "var(--primary-light, #1976d2)"};
          font-weight: 500;
          text-decoration: none;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .pdf-link:hover {
          background-color: ${theme === "dark"
            ? "rgba(100, 181, 246, 0.1)"
            : "rgba(25, 118, 210, 0.1)"};
          text-decoration: none;
        }

        .no-file {
          color: ${theme === "dark"
            ? "var(--text-tertiary-dark, #888888)"
            : "var(--text-tertiary-light, #999999)"};
          font-style: italic;
        }

        /* Tablet Styles */
        @media (max-width: 1024px) {
          .table-wrapper {
            margin-top: 1rem;
          }

          .styled-table {
            min-width: 600px;
          }

          .styled-table th,
          .styled-table td {
            padding: 0.75rem 0.5rem;
            font-size: 0.8rem;
          }

          .prescription-text {
            max-width: 150px;
          }
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .table-wrapper {
            overflow-x: visible;
            box-shadow: none;
          }

          .styled-table,
          .styled-table thead,
          .styled-table tbody,
          .styled-table th,
          .styled-table td,
          .styled-table tr {
            display: block;
          }

          .styled-table {
            min-width: auto;
            background-color: transparent;
          }

          .styled-table thead {
            display: none;
          }

          .styled-table tr {
            margin-bottom: 1rem;
            border: 1px solid
              ${theme === "dark"
                ? "var(--border-dark, #333)"
                : "var(--border-light, #e0e0e0)"};
            border-radius: 8px;
            padding: 1rem;
            background-color: ${theme === "dark"
              ? "var(--background-secondary, #1a1a1a)"
              : "var(--background-primary, #ffffff)"};
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .styled-table tr:hover {
            background-color: ${theme === "dark"
              ? "var(--hover-dark, #2a2a2a)"
              : "var(--hover-light, #f5f5f5)"};
          }

          .styled-table td {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 0.75rem 0;
            border-bottom: 1px solid
              ${theme === "dark"
                ? "var(--border-dark, #333)"
                : "var(--border-light, #e0e0e0)"};
            font-size: 0.875rem;
          }

          .styled-table td:last-child {
            border-bottom: none;
          }

          .styled-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: ${theme === "dark"
              ? "var(--text-primary-dark, #ffffff)"
              : "var(--text-primary-light, #333333)"};
            width: 40%;
            flex-shrink: 0;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .prescription-text {
            max-width: none;
            text-align: right;
            width: 60%;
          }

          .assignment-tags {
            justify-content: flex-end;
            width: 60%;
          }

          .pdf-link {
            justify-content: flex-end;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            font-size: 0.8rem;
          }

          .no-file {
            text-align: right;
            width: 60%;
          }
        }

        /* Small Mobile Styles */
        @media (max-width: 480px) {
          .assign-container {
            padding: 0.5rem;
          }

          .section-title {
            font-size: 1.25rem;
            margin-bottom: 1rem;
          }

          .styled-table tr {
            padding: 0.75rem;
          }

          .styled-table td {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            padding: 0.5rem 0;
          }

          .styled-table td::before {
            width: 100%;
            margin-bottom: 0.25rem;
          }

          .prescription-text,
          .assignment-tags,
          .pdf-link,
          .no-file {
            width: 100%;
            text-align: left;
          }

          .assignment-tags {
            justify-content: flex-start;
          }

          .pdf-link {
            justify-content: flex-start;
            align-self: flex-start;
            margin-top: 0.25rem;
          }
        }

        /* Large Desktop Styles */
        @media (min-width: 1200px) {
          .styled-table th,
          .styled-table td {
            padding: 1.25rem 1rem;
          }

          .styled-table {
            font-size: 0.9rem;
          }

          .prescription-text {
            max-width: 250px;
          }
        }

        /* Print Styles */
        @media print {
          .table-wrapper {
            box-shadow: none;
          }

          .styled-table {
            border: 1px solid #000;
          }

          .styled-table th,
          .styled-table td {
            border: 1px solid #000;
            color: #000;
            background-color: #fff;
          }

          .pdf-link {
            color: #000;
          }

          .assignment-tag {
            border: 1px solid #000;
            background-color: #fff;
            color: #000;
          }
        }
      `}</style>
    </div>
  );
};

export default DoctorAssignmentDashboard;
