import React, { useState } from "react";
import axios from "axios";
import { useTheme } from "../../ThemeProvider";
import { toast, ToastContainer } from "react-toastify";
import { CheckCircle, Hourglass } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import "./master_admin.css";

const PatientJourney = () => {
  const { theme } = useTheme();
  const [mrn, setMrn] = useState("");
  const [patient, setPatient] = useState(null);

  const fetchJourney = async () => {
    if (!mrn.trim()) {
      toast.error("Please enter an MRN.");
      setPatient(null);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:3001/patients?mrn=${mrn}`);
      if (res.data.length === 0) {
        toast.error("No patient found.");
        setPatient(null);
      } else {
        setPatient(res.data[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch patient data.");
    }
  };

  const getStatusBadge = (condition) =>
    condition ? (
      <span className="status-badge badge-green">
        <CheckCircle size={16} style={{ marginRight: "5px" }} />
        Completed
      </span>
    ) : (
      <span className="status-badge badge-yellow">
        <Hourglass size={16} style={{ marginRight: "5px" }} />
        Pending
      </span>
    );

  const isResolved = (p) =>
    p.reportPdfUrl &&
    (p.assignedTo.physio || p.assignedTo.dietitian) &&
    p.prescription.fileUrl;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchJourney();
    }
  };

  return (
    <div className={`dashboard-main ${theme}`}>
      <ToastContainer position="top-center" autoClose={2500} />
      <h1>Patient Journey Viewer</h1>

      <div className="journey-search">
        <input
          type="text"
          placeholder="Enter MRN"
          value={mrn}
          onChange={(e) => setMrn(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-primary" onClick={fetchJourney}>
          Search
        </button>
      </div>

      {patient && (
        <div className="journey-card">
          <h2 style={{ color: "orangered" }}>
            {patient.name} ({patient.mrn})
          </h2>

          <div className="table-responsive">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Status</th>
                  <th>Reports</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sample Processed</td>
                  <td>{getStatusBadge(!!patient.reportPdfUrl)}</td>
                  <td>
                    {patient.reportPdfUrl ? (
                      <a
                        href={patient.reportPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        View Report
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Assigned to Physio</td>
                  <td>{getStatusBadge(patient.assignedTo.physio)}</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Assigned to Dietitian</td>
                  <td>{getStatusBadge(patient.assignedTo.dietitian)}</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Prescription Uploaded</td>
                  <td>{getStatusBadge(!!patient.prescription.fileUrl)}</td>
                  <td>
                    {patient.prescription.fileUrl ? (
                      <a
                        href={patient.prescription.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        View Prescription
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Final Resolution</td>
                  <td>{getStatusBadge(isResolved(patient))}</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientJourney;
