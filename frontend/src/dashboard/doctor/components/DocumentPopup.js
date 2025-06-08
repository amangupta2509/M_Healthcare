import React, { useState } from "react";
import PdfCardViewer from "./PdfCardViewer";
import "./popup.css";

const DocumentPopup = ({ onClose, documents }) => {
  const [activeTab, setActiveTab] = useState("medical");
  const [pdfUrl, setPdfUrl] = useState(null);

  const medicalData = [
    {
      date: "2025-06-01",
      time: "10:30 AM",
      clinicalNote: "/pdfs/MRN01.pdf",
      prescription: "/prescriptions/MRN123456_labreport.pdf"
    }
  ];

  const testRecords = documents.map((doc) => ({
    name: doc,
    url: `/pdfs/${doc}`
  }));

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <button className="close-btn" onClick={onClose}>X</button>
        <div className="tab-buttons">
          <button onClick={() => setActiveTab("medical")} className={activeTab === "medical" ? "active" : ""}>Medical</button>
          <button onClick={() => setActiveTab("test")} className={activeTab === "test" ? "active" : ""}>Test Record</button>
        </div>

        {activeTab === "medical" && (
          <table className="popup-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Clinical Note</th>
                <th>Prescription</th>
              </tr>
            </thead>
            <tbody>
              {medicalData.map((entry, i) => (
                <tr key={i}>
                  <td>{entry.date}</td>
                  <td>{entry.time}</td>
                  <td>
                    <button onClick={() => setPdfUrl(entry.clinicalNote)}>View</button>
                  </td>
                  <td>
                    <button onClick={() => setPdfUrl(entry.prescription)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "test" && (
          <table className="popup-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>View Result</th>
              </tr>
            </thead>
            <tbody>
              {testRecords.map((test, i) => (
                <tr key={i}>
                  <td>{test.name}</td>
                  <td>
                    <button onClick={() => setPdfUrl(test.url)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pdfUrl && (
          <PdfCardViewer url={pdfUrl} onClose={() => setPdfUrl(null)} />
        )}
      </div>
    </div>
  );
};

export default DocumentPopup;
