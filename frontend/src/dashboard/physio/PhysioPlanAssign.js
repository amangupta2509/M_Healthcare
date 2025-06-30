// File: src/dashboard/physio/PhysioPlanAssign.js

import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "../physio/assign.css"; // Reuse existing physio styles
import "react-toastify/dist/ReactToastify.css";

const PhysioPlanAssign = () => {
  const [mrn, setMrn] = useState("");
  const [clientData, setClientData] = useState(null);

  const handleSearch = async () => {
    if (!mrn.trim()) {
      toast.error("Please enter a valid MRN number");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/physioClients?mrn=${mrn}`);
      const data = await response.json();

      if (data.length > 0) {
        setClientData(data[0]);
        toast.success("Client found!");
      } else {
        setClientData(null);
        toast.error("No client found with this MRN");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch data");
    }
  };

  return (
    <div className="dashboard-main">
      <ToastContainer position="top-center" autoClose={2000} />
      <h1>Physio Plan Assignment</h1>

      {/* MRN Search Card */}
      <div className="card" style={{ border: "1px solid #cc5500" }}>
        <h3 className="card-header">Search Patient by MRN</h3>
        <div
          className="form-group"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Enter MRN Number"
            className="search-input"
            value={mrn}
            onChange={(e) => setMrn(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            style={{
              flex: "1",
              minWidth: "200px",
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #cc5500",
              borderRadius: "4px",
            }}
          />

          <button
            className="btn btn-primary"
            onClick={handleSearch}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              whiteSpace: "nowrap",
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Client Data Display */}
      {clientData && (
        <div className="card" style={{ marginTop: "1.5rem", border: "1px solid #cc5500" }}>
          <h3 className="card-header">Client Details</h3>
          <p><strong>Name:</strong> {clientData.name}</p>
          <p><strong>Age:</strong> {clientData.age}</p>
          <p><strong>Gender:</strong> {clientData.gender}</p>
          <p><strong>Weight:</strong> {clientData.weight}</p>
          <p><strong>Issue:</strong> {clientData.condition || "N/A"}</p>
        </div>
      )}
    </div>
  );
};

export default PhysioPlanAssign;
