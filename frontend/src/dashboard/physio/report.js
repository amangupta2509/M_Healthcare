import React, { useState } from "react";
import axios from "axios";
import "./report.css";

const Report = () => {
  const [mrn, setMrn] = useState("");
  const [searchedMrn, setSearchedMrn] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    const formattedMrn = mrn.trim().toUpperCase();
    if (!formattedMrn) return;

    setLoading(true);
    setNotFound(false);
    setPdfUrl(""); // reset before new search

    try {
      const response = await axios.get(
        `http://localhost:5000/reports?mrn=${formattedMrn}`
      );
      if (response.data.length > 0) {
        // Get the relative path from the db.json file
        const relativePath = response.data[0].pdfUrl;

        // Create the full path by prepending the public path
        // The public folder is served at the root of your app
        const fullPath = relativePath.startsWith("/")
          ? relativePath
          : `/${relativePath}`;

        setPdfUrl(fullPath);
        setSearchedMrn(formattedMrn);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setSearchedMrn("");
    setMrn("");
    setPdfUrl("");
    setNotFound(false);
  };

  const handleMrnChange = (e) => {
    setMrn(e.target.value.toUpperCase());
  };

  return (
    <div className="report-body standalone-report">
      <div className="report-card">
        <div className="content-area">
          <h2>Client Reports</h2>
          <p className="page-description">
            This page allows you to view and download client reports by entering
            the MRN (Medical Record Number). Please ensure the MRN is accurate
            to retrieve the correct PDF report.
          </p>
          <div className="search-container">
            <input
              type="text"
              placeholder="Enter MRN"
              value={mrn}
              onChange={handleMrnChange}
              className="uppercase-input"
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          {loading && <p>Loading report...</p>}

          {searchedMrn && (
            <div className="pdf-container">
              <h3>Report for MRN: {searchedMrn}</h3>
              {pdfUrl ? (
                <>
                  <iframe
                    src={pdfUrl}
                    width="100%"
                    height="600px"
                    title="Patient Report"
                    style={{ border: "1px solid #ccc", borderRadius: "6px" }}
                  />
                  <button onClick={handleRemove} className="remove-button">
                    Remove
                  </button>
                </>
              ) : (
                <p>PDF not found for this MRN.</p>
              )}
            </div>
          )}

          {notFound && !loading && (
            <p className="error-text">No report found for MRN: {mrn}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;
