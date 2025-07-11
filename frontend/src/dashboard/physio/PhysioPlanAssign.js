// File: src/dashboard/physio/PhysioPlanAssign.js

import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "../physio/assign.css"; // Reuse existing physio styles
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "../master_admin/master_admin.css";
import "../physio/clientManagement.css";

const PhysioPlanAssign = () => {
  const [mrn, setMrn] = useState("");
  const [clientData, setClientData] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [fromDateTime, setFromDateTime] = useState("");
  const [toDateTime, setToDateTime] = useState("");
  const [assignedDates, setAssignedDates] = useState([]); // [{ date: "2024-07-01", exercises: [...] }]
  const [physioAssignedPlans, setPhysioAssignedPlans] = useState({});
  const [assignmentConfirmed, setAssignmentConfirmed] = useState(false);
  const [showPreviousCard, setShowPreviousCard] = useState(false);

  const scrollToRef = useRef(null);
  const deleteBatch = async (batchId) => {
    try {
      const res = await axios.get(
        `http://localhost:3001/physioAssignedPlans?mrn=${mrn}`
      );
      const batchToDelete = res.data.find((b) => b.batchId === batchId);

      if (batchToDelete?.id) {
        await axios.delete(
          `http://localhost:3001/physioAssignedPlans/${batchToDelete.id}`
        );
        setPhysioAssignedPlans((prev) => ({
          ...prev,
          [mrn]: prev[mrn].filter((b) => b.batchId !== batchId),
        }));
        toast.success("Batch deleted successfully!");
      }
    } catch (err) {
      console.error("❌ Delete batch failed", err);
      toast.error("Failed to delete batch.");
    }
  };
        
  const [showViewPopup, setShowViewPopup] = useState({
    visible: false,
    date: "",
    data: [],
  });

  const [selectedDates, setSelectedDates] = useState([]); // ✅ store multiple selected dates

  const [dateError, setDateError] = useState("");
  const [showAssignModal, setShowAssignModal] = useState({
    visible: false,
    date: null,
  });

  const [selectedType, setSelectedType] = useState(""); // Yoga or Resistance
  const [selectedExercise, setSelectedExercise] = useState("");
  const [exerciseInputs, setExerciseInputs] = useState({});

  const [assignedExercises, setAssignedExercises] = useState([]);
  const exerciseList = {
    Yoga: [
      "Diaphragmatic breathing",
      "Ujjay breathing",
      "Bhramari",
      "Nadi shodhana",
    ],
    Resistance: [
      "Kettle bell swing",
      "Goblet squat",
      "Push ups",
      "Dumbbell row",
    ],
  };
  const jsonForThisUser = {
    mrn,
    batchId: Date.now(), // Unique identifier for this plan group
    from: fromDateTime,
    to: toDateTime,
    assignedDates,
  };
  const confirmAssignment = async () => {
    if (!fromDateTime || !toDateTime || !mrn) {
      toast.error("Missing From/To date or MRN");
      return;
    }

    if (
      !assignedDates?.length ||
      !assignedDates.some((d) => d.exercises?.length)
    ) {
      toast.error("Please assign at least one exercise");
      return;
    }

    try {
      // ✅ Always create a new batch (no overwrite logic)
      const createRes = await axios.post(
        `http://localhost:3001/physioAssignedPlans`,
        jsonForThisUser
      );

      jsonForThisUser.id = createRes.data.id;

      // ✅ Safe append to array-based state
      setPhysioAssignedPlans((prev) => {
        const existingPlans = Array.isArray(prev[mrn]) ? prev[mrn] : [];
        return {
          ...prev,
          [mrn]: [...existingPlans, jsonForThisUser],
        };
      });

      setAssignmentConfirmed(true);
      toast.success("✅ Assignment confirmed and saved!");

      // 🔄 Optional reset if you want to clear form after submission:
      setAssignedDates([]);
      setSelectedDates([]);
      setSelectedDate("");
      setFromDateTime("");
      setToDateTime("");
    } catch (error) {
      console.error("❌ Assignment Save Error:", error);
      toast.error("🚫 Failed to confirm assignment");
    }
  };

  const deleteAssignedDate = (dateToDelete) => {
    showDeleteConfirmation(dateToDelete, async () => {
      const current = physioAssignedPlans[mrn];
      const updated = {
        ...current,
        assignedDates: current.assignedDates.filter(
          (d) => d.date !== dateToDelete
        ),
      };

      try {
        const res = await axios.get(
          `http://localhost:3001/physioAssignedPlans?mrn=${mrn}`
        );
        if (res.data.length > 0) {
          await axios.put(
            `http://localhost:3001/physioAssignedPlans/${res.data[0].id}`,
            updated
          );
        }

        setPhysioAssignedPlans((prev) => ({
          ...prev,
          [mrn]: updated,
        }));

        toast.success(" Plan deleted successfully!");
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to delete plan");
      }
    });
  };
  const showDeleteConfirmation = (dateToDelete, onConfirm) => {
    const toastId = toast(
      ({ closeToast }) => (
        <div style={{ textAlign: "center" }}>
          <p>
            Are you sure you want to delete the plan for <b>{dateToDelete}</b>?
          </p>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "1rem" }}
          >
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                toast.dismiss(toastId);
                onConfirm(); // ✅ call the delete function
              }}
            >
              Yes, Delete
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => toast.dismiss(toastId)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      }
    );
  };
  const generateDatesBetween = (start, end) => {
    const dateArray = [];
    let current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      dateArray.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return dateArray;
  };

  const handleDateRangeChange = () => {
    if (!fromDateTime || !toDateTime) {
      setDateError("Please select both From and To dates.");
      return;
    }

    if (new Date(toDateTime) < new Date(fromDateTime)) {
      setDateError("'To Date' must be after 'From Date'");
      return;
    }

    const allDates = generateDatesBetween(fromDateTime, toDateTime);
    setAvailableDates(allDates);
    setSelectedDate("");
    setDateError(""); // clear any previous error
  };

  const handleSearch = async () => {
    try {
      const clientRes = await axios.get(
        `http://localhost:3001/physioClients?mrn=${mrn}`
      );
      const planRes = await axios.get(
        `http://localhost:3001/physioAssignedPlans?mrn=${mrn}`
      );
      if (planRes.data.length > 0) {
        setPhysioAssignedPlans((prev) => ({
          ...prev,
          [mrn]: planRes.data, // array of batches
        }));
      }

      if (clientRes.data.length > 0) {
        setClientData(clientRes.data[0]);
      }

      if (planRes.data.length > 0) {
        setPhysioAssignedPlans((prev) => ({
          ...prev,
          [mrn]: planRes.data[0], // ✅ includes id now
        }));
      }
    } catch (error) {
      toast.error("Error fetching client or assignment data");
      console.error(error);
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
      {!assignmentConfirmed && (
        <>
          {/* Client Data Display */}
          {clientData && (
            <div
              className="card"
              style={{ marginTop: "1.5rem", border: "1px solid #cc5500" }}
            >
              <h3 className="card-header">Client Details</h3>
              <p>
                <strong>Name:</strong> {clientData.name}
              </p>
              <p>
                <strong>Age:</strong> {clientData.age}
              </p>
              <p>
                <strong>Gender:</strong> {clientData.gender}
              </p>
              <p>
                <strong>Weight:</strong> {clientData.weight}
              </p>
              <p>
                <strong>Issue:</strong> {clientData.condition || "N/A"}
              </p>
            </div>
          )}

          {/* Date Range Picker */}
          {clientData && (
            <div
              className="card"
              style={{ marginTop: "1.5rem", border: "1px solid #cc5500" }}
            >
              <h3 className="card-header">Select Date Range</h3>
              {/* Warning */}
              {(!fromDateTime || !toDateTime || dateError) && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "1rem",
                    marginTop: "1rem",
                    marginBottom: "1rem",
                    backgroundColor: "var(--bg-primary)",
                    color: "#FF0000",
                    border: "1px solid #FFBF00",
                    borderRadius: "5px",
                  }}
                >
                  {dateError ? (
                    dateError
                  ) : (
                    <>
                      Please select a <strong>From</strong> and{" "}
                      <strong>To</strong> date range to activate the plan
                      assignment section.
                    </>
                  )}
                </div>
              )}

              {/* Date Range Pickers */}
              <div
                className="date-range-container"
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ flex: "1", minWidth: "150px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    From Date
                  </label>
                  <input
                    type="date"
                    placeholder="DD-MM-YYYY"
                    style={{
                      borderRadius: "6px",
                      border: "1px solid #cc5500",
                      fontSize: "1rem",
                      width: "100%",
                      color: "var(--text-white)",
                      backgroundColor: "var(--bg-primary)",
                    }}
                    value={fromDateTime}
                    onChange={(e) => setFromDateTime(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div style={{ flex: "1", minWidth: "150px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    To Date
                  </label>
                  <input
                    type="date"
                    placeholder="DD-MM-YYYY"
                    style={{
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #cc5500",
                      fontSize: "1rem",
                      width: "100%",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-white)",
                    }}
                    value={toDateTime}
                    onChange={(e) => setToDateTime(e.target.value)}
                    min={fromDateTime || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <div style={{ marginTop: "1.8rem" }}>
                <button
                  className="btn btn-primary"
                  onClick={handleDateRangeChange}
                >
                  Generate Dates
                </button>
              </div>
              {/* Dropdown to Select Date */}
              {availableDates.length > 0 && (
                <div className="col mt-3">
                  <label>Select Date to Assign Plan:</label>
                  <select
                    className="form-control"
                    style={{
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #cc5500",
                      fontSize: "1rem",
                      width: "100%",
                      maxWidth: "250px",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-white)",
                      marginBottom: "1rem",
                    }}
                    value={selectedDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setSelectedDate(newDate);

                      if (!selectedDates.includes(newDate)) {
                        setSelectedDates((prev) => [...prev, newDate]);
                      }

                      const alreadyExists = assignedDates.some(
                        (entry) => entry.date === newDate
                      );
                      if (!alreadyExists && newDate) {
                        setAssignedDates((prev) => [
                          ...prev,
                          { date: newDate, exercises: [] },
                        ]);
                      }

                      // 👇 Scroll after short delay
                      setTimeout(() => {
                        scrollToRef.current?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }, 100);
                    }}
                  >
                    <option value="">-- Select Date --</option>
                    {availableDates.map((date, idx) => (
                      <option key={idx} value={date}>
                        {date}
                      </option>
                    ))}
                  </select>
                  {selectedDates.length > 0 && (
                    <div
                      className="selected-meals"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        paddingTop: "5px",
                        marginBottom: "1rem",
                      }}
                    >
                      {selectedDates.map((date, index) => (
                        <div
                          key={index}
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <div
                            className="selected-meal-btn"
                            style={{
                              padding: "10px 14px",
                              fontSize: "0.95rem",
                              backgroundColor: "transparent",
                              border: "1px solid #cc5500",
                              borderRadius: "10px",
                              color: "var(--text-white)",
                              fontWeight: "bold",
                              cursor: "default",
                            }}
                          >
                            📅 Assigned Plan Date: {date}
                          </div>
                          <span
                            onClick={() => {
                              setSelectedDates((prev) =>
                                prev.filter((d) => d !== date)
                              );
                              setAssignedDates((prev) =>
                                prev.filter((row) => row.date !== date)
                              );
                              if (selectedDate === date) setSelectedDate("");
                            }}
                            style={{
                              position: "absolute",
                              top: "-6px",
                              right: "-6px",
                              backgroundColor: "#cc5500",
                              color: "#fff",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              fontSize: "14px",
                              fontWeight: "bold",
                              lineHeight: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              boxShadow: "0 0 2px rgba(0, 0, 0, 0.5)",
                              zIndex: 1,
                            }}
                            title="Remove"
                          >
                            ×
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(assignedDates.length > 0 || selectedDate) && (
                <div className="appointments-table" ref={scrollToRef}>
                  <h4>Assigned Dates</h4>
                  <table className="table-responsive">
                    <thead>
                      <tr>
                        <th>Sr No.</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedDates.map((item, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{item.date}</td>
                          <td>
                            {item.exercises && item.exercises.length > 0 ? (
                              <>
                                <button
                                  className="btn btn-primary"
                                  onClick={() =>
                                    setShowViewPopup({
                                      visible: true,
                                      data: item.exercises,
                                      date: item.date,
                                    })
                                  }
                                >
                                  View
                                </button>
                                <button
                                  className="btn btn-primary"
                                  onClick={() => {
                                    const dateEntry = assignedDates.find(
                                      (entry) => entry.date === item.date
                                    );

                                    // ✅ Load exercises into modal
                                    setAssignedExercises(
                                      dateEntry?.exercises || []
                                    );

                                    // ✅ Preload plan type from the first exercise
                                    if (dateEntry?.exercises?.length) {
                                      setSelectedType(
                                        dateEntry.exercises[0].type
                                      );
                                    } else {
                                      setSelectedType("");
                                    }

                                    // ✅ Open modal
                                    setShowAssignModal({
                                      visible: true,
                                      date: item.date,
                                    });
                                  }}
                                >
                                  Edit
                                </button>
                              </>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() =>
                                  setShowAssignModal({
                                    visible: true,
                                    date: item.date,
                                  })
                                }
                              >
                                + Assign Plan
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {assignedDates.length > 0 && (
                <center>
                  <button
                    className="btn btn-primary"
                    onClick={confirmAssignment}
                  >
                    Confirm Assignment
                  </button>
                </center>
              )}
            </div>
          )}
          {physioAssignedPlans[mrn] && (
            <button
              className="btn btn-primary"
              onClick={() => setShowPreviousCard(true)}
            >
              📁 View Previous Assigned Plan
            </button>
          )}
        </>
      )}
      {showAssignModal.visible && (
        <div
          className="popup-overlay"
          onClick={() => setShowAssignModal({ visible: false, date: null })}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="popup-content card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={() => setShowAssignModal({ visible: false, date: null })}
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

            <h3 className="text-center mb-3">
              Assign Plan for {showAssignModal.date}
            </h3>

            {/* Plan Type */}
            <div className="form-group mb-3">
              <label>Plan Type</label>
              <select
                className="form-control"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setSelectedExercise("");
                  setExerciseInputs({});
                }}
              >
                <option value="">-- Select --</option>
                <option value="Yoga">Yoga</option>
                <option value="Resistance">Resistance Training</option>
              </select>
            </div>

            {/* Exercise List */}
            {selectedType && (
              <div className="form-group mb-3">
                <label>Exercise</label>
                <select
                  className="form-control"
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                >
                  <option value="">-- Select Exercise --</option>
                  {exerciseList[selectedType].map((ex, idx) => (
                    <option key={idx} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Inputs */}
            {selectedExercise && (
              <div className="form-group mb-3">
                {selectedType === "Yoga" ? (
                  <>
                    <input
                      className="form-control mb-2"
                      placeholder="Breaths per round"
                      value={exerciseInputs.breaths || ""}
                      onChange={(e) =>
                        setExerciseInputs({
                          ...exerciseInputs,
                          breaths: e.target.value,
                        })
                      }
                    />
                    <input
                      className="form-control"
                      placeholder="Rounds"
                      value={exerciseInputs.rounds || ""}
                      onChange={(e) =>
                        setExerciseInputs({
                          ...exerciseInputs,
                          rounds: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <>
                    <input
                      className="form-control mb-2"
                      placeholder="Sets"
                      value={exerciseInputs.sets || ""}
                      onChange={(e) =>
                        setExerciseInputs({
                          ...exerciseInputs,
                          sets: e.target.value,
                        })
                      }
                    />
                    <input
                      className="form-control mb-2"
                      placeholder="Reps"
                      value={exerciseInputs.reps || ""}
                      onChange={(e) =>
                        setExerciseInputs({
                          ...exerciseInputs,
                          reps: e.target.value,
                        })
                      }
                    />
                    <input
                      className="form-control"
                      placeholder="Weight (optional)"
                      value={exerciseInputs.weight || ""}
                      onChange={(e) =>
                        setExerciseInputs({
                          ...exerciseInputs,
                          weight: e.target.value,
                        })
                      }
                    />
                  </>
                )}

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!selectedExercise) return;
                    setAssignedExercises((prev) => [
                      ...prev,
                      {
                        type: selectedType,
                        name: selectedExercise,
                        ...exerciseInputs,
                      },
                    ]);
                    setSelectedExercise("");
                    setExerciseInputs({});
                  }}
                >
                  + Add Exercise
                </button>
              </div>
            )}

            {/* Assigned Exercises Preview */}
            {assignedExercises.length > 0 && (
              <div className="appointments-table">
                <h5>Assigned Exercises</h5>
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Exercise</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedExercises.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.type}</td>
                        <td>{item.name}</td>
                        <td>
                          {item.type === "Yoga"
                            ? `${item.rounds || "-"} rounds × ${
                                item.breaths || "-"
                              } breaths`
                            : `${item.sets || "-"} sets × ${
                                item.reps || "-"
                              } reps${
                                item.weight ? ` (${item.weight} kg)` : ""
                              }`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Submit Button */}
            <center>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (!assignedExercises.length) {
                    toast.error("Please add at least one exercise");
                    return;
                  }

                  // Step 1: Create updated assignedDates list
                  const updatedAssignedDates = assignedDates.filter(
                    (entry) => entry.date !== showAssignModal.date
                  );

                  updatedAssignedDates.push({
                    date: showAssignModal.date,
                    exercises: assignedExercises,
                  });

                  // Step 2: Create final updated plan object
                  const updatedPlan = {
                    ...physioAssignedPlans[mrn],
                    assignedDates: updatedAssignedDates,
                  };

                  try {
                    await axios.put(
                      `http://localhost:3001/physioAssignedPlans/${updatedPlan.id}`,
                      updatedPlan
                    );

                    // Step 3: Reflect changes in frontend state
                    setAssignedDates(updatedAssignedDates);
                    setPhysioAssignedPlans((prev) => ({
                      ...prev,
                      [mrn]: updatedPlan,
                    }));

                    toast.success("✅ Plan updated successfully!");
                  } catch (err) {
                    console.error("❌ Edit save failed:", err);
                    toast.error("❌ Failed to update plan");
                  }

                  // Step 4: Reset modal UI
                  setShowAssignModal({ visible: false, date: null });
                  setAssignedExercises([]);
                  setSelectedType("");
                  setSelectedExercise("");
                  setExerciseInputs({});
                }}
              >
                Submit Plan
              </button>
            </center>
          </div>
        </div>
      )}
      {showViewPopup.visible && (
        <div
          className="popup-overlay"
          onClick={() =>
            setShowViewPopup({
              visible: false,
              data: [],
              date: "",
              isBatch: false,
            })
          }
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="popup-content card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={() =>
                setShowViewPopup({
                  visible: false,
                  data: [],
                  date: "",
                  isBatch: false,
                })
              }
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#cc5500",
                border: "none",
                padding: "0.5rem 1rem",
                fontWeight: "bold",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Close
            </button>

            <h3 className="mb-4 text-center">
              Assigned Plan for {showViewPopup.date}
            </h3>

            {showViewPopup.isBatch ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {showViewPopup.data.map((day, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #cc5500",
                      borderRadius: "10px",
                      padding: "1rem",
                      backgroundColor: "var(--bg-secondary, #fff)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <h5 style={{ color: "#cc5500", marginBottom: "0.75rem" }}>
                      📅 {day.date}
                    </h5>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {day.exercises.map((exercise, exIdx) => (
                        <div
                          key={exIdx}
                          style={{
                            padding: "0.8rem",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            backgroundColor: "#fdfdfd",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            fontSize: "0.9rem",
                          }}
                        >
                          <strong>{exercise.name}</strong>
                          <div style={{ marginTop: "0.3rem", color: "#555" }}>
                            {exercise.type === "Yoga"
                              ? `${exercise.rounds || "-"} rounds × ${
                                  exercise.breaths || "-"
                                } breaths`
                              : `${exercise.sets || "-"} sets × ${
                                  exercise.reps || "-"
                                } reps${
                                  exercise.weight
                                    ? ` (${exercise.weight}kg)`
                                    : ""
                                }`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 🔁 Original single-date view (unchanged)
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "1.2rem",
                }}
              >
                {showViewPopup.data.map((exercise, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "1rem",
                      border: "1px solid #cc5500",
                      borderRadius: "10px",
                      backgroundColor: "var(--bg-secondary, #fff)",
                      color: "var(--text-primary)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      fontSize: "0.95rem",
                    }}
                  >
                    <strong style={{ fontSize: "1.05rem", display: "block" }}>
                      {exercise.name}
                    </strong>
                    <div
                      style={{
                        marginTop: "0.4rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {exercise.type === "Yoga"
                        ? `${exercise.rounds || "-"} rounds × ${
                            exercise.breaths || "-"
                          } breaths`
                        : `${exercise.sets || "-"} sets × ${
                            exercise.reps || "-"
                          } reps${
                            exercise.weight ? ` (${exercise.weight}kg)` : ""
                          }`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showPreviousCard && (
        <div
          className="card"
          style={{ border: "1px solid #cc5500", marginBottom: "1rem" }}
        >
          <div className="card-header d-flex justify-content-between align-items-center">
            <h2>Previous Assigned Plans for {mrn}</h2>
          </div>

          <div
            className="card-body"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {Array.isArray(physioAssignedPlans[mrn]) &&
              physioAssignedPlans[mrn].map((batch, batchIdx) => (
                <div
                  key={batch.batchId || batchIdx}
                  className="card"
                  style={{
                    border: "1px solid #cc5500",
                    borderRadius: "8px",
                    padding: "1rem",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <h5 style={{ color: "#cc5500", marginBottom: "0.75rem" }}>
                    🗂️ Plan Group {batchIdx + 1}
                  </h5>
                  <p>
                    <strong>From:</strong> {batch.from}
                    <br />
                    <strong>To:</strong> {batch.to}
                    <br />
                    <strong>Total Dates:</strong> {batch.assignedDates.length}
                  </p>

                  <div className="d-flex justify-content-between mt-3">
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() =>
                        setShowViewPopup({
                          visible: true,
                          date: `Plan Group ${batchIdx + 1}`,
                          data: batch.assignedDates,
                          isBatch: true,
                        })
                      }
                    >
                      View
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteBatch(batch.batchId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <center>
            <button
              className="btn btn-primary mt-3"
              onClick={() => setShowPreviousCard(false)}
            >
              Close
            </button>
          </center>
        </div>
      )}
    </div>
  );
};

export default PhysioPlanAssign;
