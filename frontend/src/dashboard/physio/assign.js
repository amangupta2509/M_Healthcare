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
  CheckCircle,
  Repeat,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./assign.css";

const Assign = () => {
  const { theme } = useTheme();
  const [searchMRN, setSearchMRN] = useState("");
  const [patient, setPatient] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState(Array(15).fill(null));
  const [feedback, setFeedback] = useState(Array(15).fill(""));
  const [pdfs, setPdfs] = useState(Array(15).fill(null));
  const [viewedPdf, setViewedPdf] = useState(null);
  const [viewedFileType, setViewedFileType] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const handleSearch = async () => {
    if (!searchMRN.trim()) {
      toast.warn("Please enter an MRN.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/patients?mrn=${searchMRN}`
      );
      if (!res.ok) throw new Error("Fetch failed");

      const found = await res.json();
      setPatient(found);

      const chartData = found.charts || {};
      const newFiles = Array(15).fill(null);
      const newFeedback = Array(15).fill("");
      const newPdfs = Array(15).fill(null);

      Object.entries(chartData).forEach(([index, value]) => {
        const [filename, fb] = value.split("|");
        const idx = parseInt(index);
        newFiles[idx] = { name: filename };
        newFeedback[idx] = fb || "";
        newPdfs[idx] = `/prescriptions/${filename}`;
      });

      setUploadedFiles(newFiles);
      setFeedback(newFeedback);
      setPdfs(newPdfs);
      toast.success("Patient data loaded.");
    } catch (err) {
      console.error(err);
      toast.error("Patient not found or error fetching data.");
      resetAll();
    }
  };

  const resetAll = () => {
    setPatient(null);
    setUploadedFiles(Array(15).fill(null));
    setFeedback(Array(15).fill(""));
    setPdfs(Array(15).fill(null));
    setViewedPdf(null);
    setViewedFileType(null);
    setConfirmAction(null);
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

  const viewChartData = (index) => {
    setViewedPdf(pdfs[index]);
    setViewedFileType(
      uploadedFiles[index]?.type?.includes("pdf") ? "pdf" : "excel"
    );
  };

  const removeChartData = (index) => {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
    setPdfs((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
    setFeedback((prev) => {
      const updated = [...prev];
      updated[index] = "";
      return updated;
    });
    setViewedPdf(null);
  };

  const getDisplayFileName = (file) => {
    if (!file) return "Upload";
    const maxLength = 15;
    return file.name.length > maxLength
      ? file.name.substring(0, maxLength - 3) + "..."
      : file.name;
  };

  const showConfirmationToast = (index, type) => {
    setConfirmAction({ type, index });

    toast.info(
      ({ closeToast }) => (
        <div>
          <p>
            Are you sure you want to {type} Chart {index + 1}?
          </p>
          <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (type === "remove") handleConfirmedRemove(index);
                if (type === "reassign") handleConfirmedReassign(index);
                toast.dismiss();
              }}
            >
              Confirm
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                toast.dismiss();
                toast.info("Action cancelled.");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const handleRemove = (index) => {
    showConfirmationToast(index, "remove");
  };

  const handleReassign = (index) => {
    showConfirmationToast(index, "reassign");
  };

  const handleConfirmedRemove = (index) => {
    removeChartData(index);
    toast.success(`Chart ${index + 1} removed.`);
  };

  const handleConfirmedReassign = (index) => {
    removeChartData(index);
    toast.success(`Chart ${index + 1} is ready for reassignment.`);
  };

  const handleConfirmAssignment = async () => {
    if (!patient) return;

    try {
      const chartMap = {};
      uploadedFiles.forEach((file, i) => {
        if (file && file.name) {
          chartMap[i.toString()] = `${file.name}|${feedback[i] || ""}`;
        }
      });

      const patchData = {
        charts: chartMap,
        assignedTo: {
          physio: true,
        },
      };

      const res = await fetch(
        `http://localhost:8080/api/patients/${patient.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
        }
      );

      if (res.ok) {
        toast.success("Patient assignment saved successfully.");
        resetAll();
        setSearchMRN("");
      } else {
        toast.error("Failed to save assignment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving data.");
    }
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
                onChange={(e) => setSearchMRN(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="search-button" onClick={handleSearch}>
                <Search size={16} />
                <span className="button-text">Search</span>
              </button>
            </div>

            {patient && (
              <div className="user-info">
                <p>
                  <strong>Name:</strong> {patient.name}
                </p>
                <p>
                  <strong>Age:</strong> {patient.age}
                </p>
                <p>
                  <strong>Gender:</strong> {patient.gender}
                </p>
                <p>
                  <strong>Weight:</strong> {patient.weight}
                </p>
                <p>
                  <strong>Product:</strong> {patient.product}
                </p>
              </div>
            )}
          </div>

          {patient?.reportPdfUrl && (
            <div className={`assign-card ${theme === "dark" ? "dark" : ""}`}>
              <h2 className="section-title">Client Report</h2>
              <div className="pdf-viewer-container">
                <iframe
                  src={patient.reportPdfUrl}
                  title="Lab Report"
                  width="100%"
                  height="400px"
                  style={{
                    backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                ></iframe>

                <div style={{ marginTop: "0.5rem" }}>
                  <a
                    href={patient.reportPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="open-pdf-link"
                  >
                    🔗 Open PDF in New Tab
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {patient && (
        <>
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
                            title={uploadedFiles[i]?.name}
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
                            className="btn btn-primary"
                            onClick={() => viewChartData(i)}
                            disabled={!uploadedFiles[i]}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleRemove(i)}
                            disabled={!uploadedFiles[i]}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleReassign(i)}
                            disabled={!uploadedFiles[i]}
                          >
                            <Repeat size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              className="btn btn-primary"
              onClick={handleConfirmAssignment}
            >
              <CheckCircle size={18} style={{ marginRight: "8px" }} />
              Confirm Assignment
            </button>
          </div>
        </>
      )}

      {viewedPdf && (
        <div className={`modal ${theme}`}>
          <div
            className="modal-content"
            style={{
              border: `1px solid #cc5500`,
              backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
              color: theme === "dark" ? "#f1f1f1" : "#000",
            }}
          >
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
                  style={{
                    backgroundColor: theme === "dark" ? "#2a2a2a" : "#fff",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                  }}
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
