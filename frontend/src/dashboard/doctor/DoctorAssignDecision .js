import React, { useState } from "react";
import { useTheme } from "../../ThemeProvider";
import { FileText, Search, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../physio/assign.css";

const DoctorAssignDecision = () => {
  const { theme } = useTheme();
  const [searchMRN, setSearchMRN] = useState("");
  const [patient, setPatient] = useState(null);
  const [assignment, setAssignment] = useState({});
  const [loading, setLoading] = useState(false);
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);

  const handleSearch = async () => {
    if (!searchMRN.trim()) {
      toast.warn("Please enter an MRN.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3001/patients?mrn=${searchMRN}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const foundPatient = data[0];
        setPatient(foundPatient);
        setAssignment(foundPatient.assignedTo || {});
        setPrescriptionSaved(false);
      } else {
        toast.error("Patient not found.");
        setPatient(null);
        setAssignment({});
        setPrescriptionSaved(false);
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
      toast.error("Error fetching patient data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async (role) => {
    if (!patient || !prescriptionSaved) {
      toast.warn("Please save the prescription before assignment.");
      return;
    }

    const updatedAssignment = {
      ...assignment,
      [role.toLowerCase()]: true,
    };

    try {
      const res = await fetch(`http://localhost:3001/patients/${patient.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignedTo: updatedAssignment,
          prescription: patient.prescription || {},
        }),
      });

      if (res.ok) {
        setAssignment(updatedAssignment);
        setPatient({
          ...patient,
          assignedTo: updatedAssignment,
        });
        toast.success(`Assigned to ${role}`);
      } else {
        toast.error("Failed to assign patient.");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Error assigning patient.");
    }
  };

  const handleFinish = () => {
    toast.success("All tasks completed for this patient.");
    setSearchMRN("");
    setPatient(null);
    setAssignment({});
    setPrescriptionSaved(false);
  };

  return (
    <div className={`assign-page ${theme}`}>
      <div className="assign-container">
        <h2 className="section-title">Doctor Assignment Interface</h2>

        <div className="input-group">
          <input
            type="text"
            className="search-inputs"
            placeholder="Enter MRN to fetch patient report"
            value={searchMRN}
            onChange={(e) => setSearchMRN(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>
            <Search size={16} /> Search
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {patient && (
          <div className="row">
            <div className="col card">
              <h3>Patient Information</h3>
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
                <strong>MRN:</strong> {patient.mrn}
              </p>
              <p>
                <strong>Condition:</strong> {patient.condition}
              </p>
            </div>

            <div className="col card">
              <h3>Lab Report</h3>
              {patient.reportPdfUrl ? (
                <>
                  <div className="pdf-viewer-container">
                    <iframe
                      src={patient.reportPdfUrl}
                      title="Lab Report PDF"
                      width="100%"
                      height="400px"
                      style={{
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
                </>
              ) : (
                <p>No PDF report available.</p>
              )}
            </div>
          </div>
        )}

        {patient && (
          <div className="card" style={{ marginTop: "2rem" }}>
            <h3>Doctor's Prescription</h3>
            <label htmlFor="prescriptionText">Write Prescription:</label>
            <textarea
              id="prescriptionText"
              rows="4"
              style={{ width: "100%", marginBottom: "1rem" }}
              value={patient.prescription?.text || ""}
              onChange={(e) =>
                setPatient({
                  ...patient,
                  prescription: {
                    ...patient.prescription,
                    text: e.target.value,
                  },
                })
              }
            />
            <label htmlFor="prescriptionFile">
              Upload Prescription (PDF/Image):
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const fileUrl = `/prescriptions/${file.name}`;
                  setPatient({
                    ...patient,
                    prescription: {
                      ...patient.prescription,
                      fileUrl,
                    },
                  });
                  toast.info(
                    "Prescription file URL set. Please place the file in /public/prescriptions/"
                  );
                }
              }}
            />
            {patient.prescription?.fileUrl && (
              <p style={{ marginTop: "0.5rem" }}>
                🔗{" "}
                <a
                  href={patient.prescription.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Uploaded Prescription
                </a>
              </p>
            )}
            <button
              className="btn btn-prescription"
              style={{ marginTop: "1rem" }}
              onClick={async () => {
                if (
                  !patient.prescription?.text &&
                  !patient.prescription?.fileUrl
                ) {
                  toast.warn(
                    "Enter text or upload a file to save prescription."
                  );
                  return;
                }
                try {
                  const res = await fetch(
                    `http://localhost:3001/patients/${patient.id}`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        prescription: patient.prescription,
                      }),
                    }
                  );
                  if (res.ok) {
                    toast.success("Prescription saved.");
                    setPrescriptionSaved(true);
                  } else {
                    toast.error("Failed to save prescription.");
                  }
                } catch (error) {
                  console.error("Save error:", error);
                  toast.error("Error saving prescription.");
                }
              }}
            >
              💾 Save Prescription
            </button>
          </div>
        )}

        {patient && (
          <div
            className="row"
            style={{ justifyContent: "center", marginTop: "1.5rem" }}
          >
            <button
              className="btn btn-physio"
              disabled={!prescriptionSaved || assignment.physio}
              onClick={() => handleAssignment("physio")}
            >
              <CheckCircle size={18} />
              {assignment.physio ? "Assigned to Physio" : "Assign to Physio"}
            </button>
            <button
              className="btn btn-dietitian"
              disabled={!prescriptionSaved || assignment.dietitian}
              onClick={() => handleAssignment("dietitian")}
            >
              <CheckCircle size={18} />
              {assignment.dietitian
                ? "Assigned to Dietitian"
                : "Assign to Dietitian"}
            </button>
          </div>
        )}

        {patient && (assignment.physio || assignment.dietitian) && (
          <>
            <div
              className="card"
              style={{ marginTop: "2rem", border: "2px solid var(--accent)" }}
            >
              <h3>✅ Patient Assigned</h3>
              <p>{patient.name} is currently assigned to:</p>
              <ul>
                {assignment.physio && (
                  <li>
                    <strong>Physio</strong>
                  </li>
                )}
                {assignment.dietitian && (
                  <li>
                    <strong>Dietitian</strong>
                  </li>
                )}
              </ul>
            </div>
            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <button className="btn btn-primary" onClick={handleFinish}>
                Click To Proceed
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorAssignDecision;
