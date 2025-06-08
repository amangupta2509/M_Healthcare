import React, { useState } from "react";
import { useTheme } from "../../ThemeProvider";
import {
  Search,
  Upload,
  Eye,
  Trash2,
  Calendar,
  FileCheck,
  X,
  Download,
  FileType,
} from "lucide-react";
import "../physio/assign.css";

const Assign = () => {
  const { theme } = useTheme();
  const [searchMRN, setSearchMRN] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [patientReport, setPatientReport] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState(Array(15).fill(null));
  const [feedback, setFeedback] = useState(Array(15).fill(""));
  const [pdfs, setPdfs] = useState(Array(15).fill(null));
  const [viewedPdf, setViewedPdf] = useState(null);
  const [viewedFileType, setViewedFileType] = useState(null);

  const fetchUserDetails = async () => {
    setUserDetails({
      name: "John Doe",
      age: 35,
      weight: "70kg",
      product: "Knee Brace",
    });
  };

  const fetchPatientReport = async () => {
    setPatientReport({
      details:
        "Patient is responding well to therapy with minor stiffness in left knee.",
    });
  };

  const handleFileUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = file;
        return newFiles;
      });
      setPdfs((prev) => {
        const newPdfs = [...prev];
        newPdfs[index] = URL.createObjectURL(file);
        return newPdfs;
      });
    }
  };

  const handleFeedbackChange = (e, index) => {
    const value = e.target.value;
    setFeedback((prev) => {
      const newFeedback = [...prev];
      newFeedback[index] = value;
      return newFeedback;
    });
  };

  const removeChartData = (index) => {
    setUploadedFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = null;
      return newFiles;
    });
    setPdfs((prev) => {
      const newPdfs = [...prev];
      newPdfs[index] = null;
      return newPdfs;
    });
    setViewedPdf(null);
  };

  const viewChartData = (index) => {
    setViewedPdf(pdfs[index]);
    setViewedFileType(
      uploadedFiles[index]?.type?.includes("pdf") ? "pdf" : "excel"
    );
  };

  // Function to truncate filename for display
  const getDisplayFileName = (file) => {
    if (!file) return "Upload";
    const maxLength = 15; // Adjust this value to control the length
    const fileName = file.name;
    return fileName.length > maxLength
      ? fileName.substring(0, maxLength - 3) + "..."
      : fileName;
  };

  return (
    <div className={`assign-page ${theme}`}>
      <div className="assign-container">
        <div className="assign-flex">
          <div className={`assign-card ${theme === "dark" ? "dark" : ""}`}>
            <h2 className="section-title">Client Details</h2>
            <div className="input-group">
              <input
                type="text"
                className="search-inputs"
                placeholder="Enter MRN"
                value={searchMRN}
                onChange={(e) => setSearchMRN(e.target.value)}
              />
              <button className="search-button" onClick={fetchUserDetails}>
                <Search size={16} />
                <span className="button-text">Search</span>
              </button>
            </div>

            {userDetails && (
              <div className="user-info">
                <p>
                  <strong>Username:</strong> {userDetails.name}
                </p>
                <p>
                  <strong>Age:</strong> {userDetails.age}
                </p>
                <p>
                  <strong>Weight:</strong> {userDetails.weight}
                </p>
                <p>
                  <strong>Product:</strong> {userDetails.product}
                </p>
              </div>
            )}
          </div>
          {/* Patient Report */}
          <div className={`assign-card ${theme === "dark" ? "dark" : ""}`}>
            <h2 className="section-title">Client Report</h2>
            <center>
              <button className="btn btn-primary" onClick={fetchPatientReport}>
                <FileCheck size={16} />
                <span className="button-text">View Report</span>
              </button>
            </center>
            {patientReport && (
              <div className="report-text">
                <p>{patientReport.details}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts and Documentation Table */}
      <div className="table-section">
        <h3 className="section-title">Charts and Documentation</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="chart-column">Charts</th>
                <th className="dates-column">Dates (From-To)</th>
                <th className="upload-column">Upload</th>
                <th className="feedback-column">Feedback</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 15 }, (_, i) => (
                <tr key={i}>
                  <td>Chart {i + 1}</td>
                  <td>
                    <div className="date-inputs">
                      <div className="date-field">
                        <Calendar size={14} />
                        <input type="date" className="date-input" />
                      </div>
                      <span className="date-separator">to</span>
                      <div className="date-field">
                        <Calendar size={14} />
                        <input type="date" className="date-input" />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="upload-container">
                      <label
                        htmlFor={`upload-${i}`}
                        className="upload-label"
                        title={uploadedFiles[i] ? uploadedFiles[i].name : ""}
                      >
                        <Upload size={16} />
                        <span className="file-name">
                          {getDisplayFileName(uploadedFiles[i])}
                        </span>
                      </label>
                      <input
                        id={`upload-${i}`}
                        type="file"
                        className="file-input"
                        onChange={(e) => handleFileUpload(e, i)}
                        accept=".pdf,.xls,.xlsx"
                      />
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="feedback-input"
                      placeholder="Enter feedback"
                      value={feedback[i]}
                      onChange={(e) => handleFeedbackChange(e, i)}
                    />
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className="btn btn-view"
                        onClick={() => viewChartData(i)}
                        disabled={!uploadedFiles[i]}
                      >
                        <Eye size={16} />
                        <span className="action-text">View</span>
                      </button>
                      <button
                        className="btn btn-remove"
                        onClick={() => removeChartData(i)}
                        disabled={!uploadedFiles[i]}
                      >
                        <Trash2 size={16} />
                        <span className="action-text">Remove</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for viewing PDF/Excel */}
      {viewedPdf && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Document Viewer</h3>
              <button
                className="close-button"
                onClick={() => setViewedPdf(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {viewedFileType === "pdf" ? (
                <embed
                  src={viewedPdf}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                />
              ) : (
                <div className="excel-container">
                  <FileType size={48} />
                  <p>Excel file preview not supported. Please download.</p>
                  <a href={viewedPdf} download className="btn download-button">
                    <Download size={16} /> Download Excel
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

export default Assign;
