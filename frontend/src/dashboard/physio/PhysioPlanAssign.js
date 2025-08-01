"use client"

import { useState, useRef } from "react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import "./PhysioPlanAssign.css" // We'll create this CSS file

const PhysioPlanAssign = () => {
  const [mrn, setMrn] = useState("")
  const [clientData, setClientData] = useState(null)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState("")
  const [fromDateTime, setFromDateTime] = useState("")
  const [toDateTime, setToDateTime] = useState("")
  const [assignedDates, setAssignedDates] = useState([])
  const [physioAssignedPlans, setPhysioAssignedPlans] = useState({})
  const [assignmentConfirmed, setAssignmentConfirmed] = useState(false)
  const [showPreviousCard, setShowPreviousCard] = useState(false)
  const scrollToRef = useRef(null)

  const deleteBatch = async (batchId) => {
    try {
      const res = await axios.get(`http://localhost:3001/physioAssignedPlans?mrn=${mrn}`)
      const batchToDelete = res.data.find((b) => b.batchId === batchId)
      if (batchToDelete?.id) {
        await axios.delete(`http://localhost:3001/physioAssignedPlans/${batchToDelete.id}`)
        setPhysioAssignedPlans((prev) => ({
          ...prev,
          [mrn]: prev[mrn].filter((b) => b.batchId !== batchId),
        }))
        toast.success("Batch deleted successfully!")
      }
    } catch (err) {
      console.error("❌ Delete batch failed", err)
      toast.error("Failed to delete batch.")
    }
  }

  const [showViewPopup, setShowViewPopup] = useState({
    visible: false,
    date: "",
    data: [],
  })
  const [selectedDates, setSelectedDates] = useState([])
  const [dateError, setDateError] = useState("")
  const [showAssignModal, setShowAssignModal] = useState({
    visible: false,
    date: null,
  })
  const [selectedType, setSelectedType] = useState("")
  const [selectedExercise, setSelectedExercise] = useState("")
  const [exerciseInputs, setExerciseInputs] = useState({})
  const [assignedExercises, setAssignedExercises] = useState([])

  const exerciseList = {
    Yoga: ["Diaphragmatic breathing", "Ujjay breathing", "Bhramari", "Nadi shodhana"],
    Resistance: ["Kettle bell swing", "Goblet squat", "Push ups", "Dumbbell row"],
  }

  const jsonForThisUser = {
    mrn,
    batchId: Date.now(),
    from: fromDateTime,
    to: toDateTime,
    assignedDates,
  }

  const confirmAssignment = async () => {
    if (!fromDateTime || !toDateTime || !mrn) {
      toast.error("Missing From/To date or MRN")
      return
    }
    if (!assignedDates?.length || !assignedDates.some((d) => d.exercises?.length)) {
      toast.error("Please assign at least one exercise")
      return
    }
    try {
      const createRes = await axios.post(`http://localhost:3001/physioAssignedPlans`, jsonForThisUser)
      jsonForThisUser.id = createRes.data.id

      setPhysioAssignedPlans((prev) => {
        const existingPlans = Array.isArray(prev[mrn]) ? prev[mrn] : []
        return {
          ...prev,
          [mrn]: [...existingPlans, jsonForThisUser],
        }
      })
      setAssignmentConfirmed(true)
      toast.success("✅ Assignment confirmed and saved!")
      setAssignedDates([])
      setSelectedDates([])
      setSelectedDate("")
      setFromDateTime("")
      setToDateTime("")
    } catch (error) {
      console.error("❌ Assignment Save Error:", error)
      toast.error("🚫 Failed to confirm assignment")
    }
  }

  const deleteAssignedDate = (dateToDelete) => {
    showDeleteConfirmation(dateToDelete, async () => {
      const current = physioAssignedPlans[mrn]
      const updated = {
        ...current,
        assignedDates: current.assignedDates.filter((d) => d.date !== dateToDelete),
      }
      try {
        const res = await axios.get(`http://localhost:3001/physioAssignedPlans?mrn=${mrn}`)
        if (res.data.length > 0) {
          await axios.put(`http://localhost:3001/physioAssignedPlans/${res.data[0].id}`, updated)
        }
        setPhysioAssignedPlans((prev) => ({
          ...prev,
          [mrn]: updated,
        }))
        toast.success(" Plan deleted successfully!")
      } catch (err) {
        console.error(err)
        toast.error("❌ Failed to delete plan")
      }
    })
  }

  const showDeleteConfirmation = (dateToDelete, onConfirm) => {
    const toastId = toast(
      ({ closeToast }) => (
        <div className="delete-confirmation">
          <p>
            Are you sure you want to delete the plan for <strong>{dateToDelete}</strong>?
          </p>
          <div className="delete-confirmation-buttons">
            <button
              className="btn btn-danger"
              onClick={() => {
                toast.dismiss(toastId)
                onConfirm()
              }}
            >
              Yes, Delete
            </button>
            <button className="btn btn-secondary" onClick={() => toast.dismiss(toastId)}>
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      },
    )
  }

  const generateDatesBetween = (start, end) => {
    const dateArray = []
    const current = new Date(start)
    const endDate = new Date(end)
    while (current <= endDate) {
      dateArray.push(current.toISOString().split("T")[0])
      current.setDate(current.getDate() + 1)
    }
    return dateArray
  }

  const handleDateRangeChange = () => {
    if (!fromDateTime || !toDateTime) {
      setDateError("Please select both From and To dates.")
      return
    }
    if (new Date(toDateTime) < new Date(fromDateTime)) {
      setDateError("'To Date' must be after 'From Date'")
      return
    }
    const allDates = generateDatesBetween(fromDateTime, toDateTime)
    setAvailableDates(allDates)
    setSelectedDate("")
    setDateError("")
  }

  const handleSearch = async () => {
    try {
      const clientRes = await axios.get(`http://localhost:3001/physioClients?mrn=${mrn}`)
      const planRes = await axios.get(`http://localhost:3001/physioAssignedPlans?mrn=${mrn}`)
      if (planRes.data.length > 0) {
        setPhysioAssignedPlans((prev) => ({
          ...prev,
          [mrn]: planRes.data,
        }))
      }
      if (clientRes.data.length > 0) {
        setClientData(clientRes.data[0])
      }
      if (planRes.data.length > 0) {
        setPhysioAssignedPlans((prev) => ({
          ...prev,
          [mrn]: planRes.data[0],
        }))
      }
    } catch (error) {
      toast.error("Error fetching client or assignment data")
      console.error(error)
    }
  }

  return (
    <div className="physio-plan-container">
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="main-content">
        <h1 className="page-title">Physio Plan Assignment</h1>

        {/* MRN Search Card */}
        <div className="card search-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="icon">🔍</span>
              Search Patient by MRN
            </h3>
          </div>
          <div className="card-content">
            <div className="search-form">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter MRN Number"
                  className="form-input"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSearch()
                    }
                  }}
                />
                <button className="btn btn-primary" onClick={handleSearch}>
                  <span className="icon">🔍</span>
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {!assignmentConfirmed && (
          <>
            {/* Client Data Display */}
            {clientData && (
              <div className="card client-card">
                <div className="card-header">
                  <h3 className="card-title">
                    <span className="icon">👤</span>
                    Client Details
                  </h3>
                </div>
                <div className="card-content">
                  <div className="client-details">
                    <div className="detail-item">
                      <label>Name</label>
                      <p>{clientData.name}</p>
                    </div>
                    <div className="detail-item">
                      <label>Age</label>
                      <p>{clientData.age}</p>
                    </div>
                    <div className="detail-item">
                      <label>Gender</label>
                      <p>{clientData.gender}</p>
                    </div>
                    <div className="detail-item">
                      <label>Weight</label>
                      <p>{clientData.weight}</p>
                    </div>
                    <div className="detail-item">
                      <label>Issue</label>
                      <p>{clientData.condition || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Date Range Picker */}
            {clientData && (
              <div className="card date-range-card">
                <div className="card-header">
                  <h3 className="card-title">
                    <span className="icon">📅</span>
                    Select Date Range
                  </h3>
                </div>
                <div className="card-content">
                  {/* Warning */}
                  {(!fromDateTime || !toDateTime || dateError) && (
                    <div className="warning-message">
                      <p>
                        {dateError ? (
                          dateError
                        ) : (
                          <>
                            Please select a <strong>From</strong> and <strong>To</strong> date range to activate the
                            plan assignment section.
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Date Range Pickers */}
                  <div className="date-range-inputs">
                    <div className="date-input-group">
                      <label htmlFor="from-date">From Date</label>
                      <input
                        id="from-date"
                        type="date"
                        className="form-input"
                        value={fromDateTime}
                        onChange={(e) => setFromDateTime(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="date-input-group">
                      <label htmlFor="to-date">To Date</label>
                      <input
                        id="to-date"
                        type="date"
                        className="form-input"
                        value={toDateTime}
                        onChange={(e) => setToDateTime(e.target.value)}
                        min={fromDateTime || new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={handleDateRangeChange}>
                    Generate Dates
                  </button>

                  {/* Date Selection */}
                  {availableDates.length > 0 && (
                    <div className="date-selection">
                      <div className="select-group">
                        <label>Select Date to Assign Plan:</label>
                        <select
                          className="form-select"
                          value={selectedDate}
                          onChange={(e) => {
                            const newDate = e.target.value
                            setSelectedDate(newDate)
                            if (!selectedDates.includes(newDate)) {
                              setSelectedDates((prev) => [...prev, newDate])
                            }
                            const alreadyExists = assignedDates.some((entry) => entry.date === newDate)
                            if (!alreadyExists && newDate) {
                              setAssignedDates((prev) => [...prev, { date: newDate, exercises: [] }])
                            }
                            setTimeout(() => {
                              scrollToRef.current?.scrollIntoView({
                                behavior: "smooth",
                              })
                            }, 100)
                          }}
                        >
                          <option value="">-- Select Date --</option>
                          {availableDates.map((date, idx) => (
                            <option key={idx} value={date}>
                              {date}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedDates.length > 0 && (
                        <div className="selected-dates">
                          <label>Selected Dates:</label>
                          <div className="selected-dates-list">
                            {selectedDates.map((date, index) => (
                              <div key={index} className="selected-date-badge">
                                <span>📅 {date}</span>
                                <button
                                  className="remove-date-btn"
                                  onClick={() => {
                                    setSelectedDates((prev) => prev.filter((d) => d !== date))
                                    setAssignedDates((prev) => prev.filter((row) => row.date !== date))
                                    if (selectedDate === date) setSelectedDate("")
                                  }}
                                  title="Remove"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assigned Dates Table */}
                  {(assignedDates.length > 0 || selectedDate) && (
                    <div ref={scrollToRef} className="assigned-dates-section">
                      <h4>Assigned Dates</h4>
                      <div className="table-container">
                        <table className="responsive-table">
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
                                <td data-label="Sr No.">{idx + 1}</td>
                                <td data-label="Date">{item.date}</td>
                                <td data-label="Actions">
                                  <div className="action-buttons">
                                    {item.exercises && item.exercises.length > 0 ? (
                                      <>
                                        <button
                                          className="btn btn-outline"
                                          onClick={() =>
                                            setShowViewPopup({
                                              visible: true,
                                              data: item.exercises,
                                              date: item.date,
                                            })
                                          }
                                        >
                                          <span className="icon">👁️</span>
                                          View
                                        </button>
                                        <button
                                          className="btn btn-outline"
                                          onClick={() => {
                                            const dateEntry = assignedDates.find((entry) => entry.date === item.date)
                                            setAssignedExercises(dateEntry?.exercises || [])
                                            if (dateEntry?.exercises?.length) {
                                              setSelectedType(dateEntry.exercises[0].type)
                                            } else {
                                              setSelectedType("")
                                            }
                                            setShowAssignModal({
                                              visible: true,
                                              date: item.date,
                                            })
                                          }}
                                        >
                                          <span className="icon">✏️</span>
                                          Edit
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        className="btn btn-warning"
                                        onClick={() =>
                                          setShowAssignModal({
                                            visible: true,
                                            date: item.date,
                                          })
                                        }
                                      >
                                        <span className="icon">➕</span>
                                        Assign Plan
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {assignedDates.length > 0 && (
                    <div className="confirm-section">
                      <button className="btn btn-primary btn-large" onClick={confirmAssignment}>
                        Confirm Assignment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {physioAssignedPlans[mrn] && (
              <div className="previous-plans-button">
                <button className="btn btn-outline" onClick={() => setShowPreviousCard(true)}>
                  <span className="icon">📁</span>
                  View Previous Assigned Plan
                </button>
              </div>
            )}
          </>
        )}

        {/* Assignment Modal */}
        {showAssignModal.visible && (
          <div className="modal-overlay" onClick={() => setShowAssignModal({ visible: false, date: null })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Assign Plan for {showAssignModal.date}</h3>
                <button className="modal-close-btn" onClick={() => setShowAssignModal({ visible: false, date: null })}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                {/* Plan Type */}
                <div className="form-group">
                  <label>Plan Type</label>
                  <select
                    className="form-select"
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value)
                      setSelectedExercise("")
                      setExerciseInputs({})
                    }}
                  >
                    <option value="">-- Select --</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Resistance">Resistance Training</option>
                  </select>
                </div>

                {/* Exercise List */}
                {selectedType && (
                  <div className="form-group">
                    <label>Exercise</label>
                    <select
                      className="form-select"
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
                  <div className="exercise-inputs">
                    {selectedType === "Yoga" ? (
                      <div className="input-row">
                        <div className="form-group">
                          <label>Breaths per round</label>
                          <input
                            className="form-input"
                            placeholder="Breaths per round"
                            value={exerciseInputs.breaths || ""}
                            onChange={(e) =>
                              setExerciseInputs({
                                ...exerciseInputs,
                                breaths: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Rounds</label>
                          <input
                            className="form-input"
                            placeholder="Rounds"
                            value={exerciseInputs.rounds || ""}
                            onChange={(e) =>
                              setExerciseInputs({
                                ...exerciseInputs,
                                rounds: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="input-row">
                        <div className="form-group">
                          <label>Sets</label>
                          <input
                            className="form-input"
                            placeholder="Sets"
                            value={exerciseInputs.sets || ""}
                            onChange={(e) =>
                              setExerciseInputs({
                                ...exerciseInputs,
                                sets: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Reps</label>
                          <input
                            className="form-input"
                            placeholder="Reps"
                            value={exerciseInputs.reps || ""}
                            onChange={(e) =>
                              setExerciseInputs({
                                ...exerciseInputs,
                                reps: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Weight (optional)</label>
                          <input
                            className="form-input"
                            placeholder="Weight (optional)"
                            value={exerciseInputs.weight || ""}
                            onChange={(e) =>
                              setExerciseInputs({
                                ...exerciseInputs,
                                weight: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        if (!selectedExercise) return
                        setAssignedExercises((prev) => [
                          ...prev,
                          {
                            type: selectedType,
                            name: selectedExercise,
                            ...exerciseInputs,
                          },
                        ])
                        setSelectedExercise("")
                        setExerciseInputs({})
                      }}
                    >
                      <span className="icon">➕</span>
                      Add Exercise
                    </button>
                  </div>
                )}

                {/* Assigned Exercises Preview */}
                {assignedExercises.length > 0 && (
                  <div className="assigned-exercises">
                    <h5>Assigned Exercises</h5>
                    <div className="table-container">
                      <table className="responsive-table">
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
                              <td data-label="Type">{item.type}</td>
                              <td data-label="Exercise">{item.name}</td>
                              <td data-label="Details">
                                {item.type === "Yoga"
                                  ? `${item.rounds || "-"} rounds × ${item.breaths || "-"} breaths`
                                  : `${item.sets || "-"} sets × ${item.reps || "-"} reps${
                                      item.weight ? ` (${item.weight} kg)` : ""
                                    }`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="modal-footer">
                  <button
                    className="btn btn-primary btn-large"
                    onClick={async () => {
                      if (!assignedExercises.length) {
                        toast.error("Please add at least one exercise")
                        return
                      }
                      const updatedAssignedDates = assignedDates.filter((entry) => entry.date !== showAssignModal.date)
                      updatedAssignedDates.push({
                        date: showAssignModal.date,
                        exercises: assignedExercises,
                      })

                      const updatedPlan = {
                        ...physioAssignedPlans[mrn],
                        assignedDates: updatedAssignedDates,
                      }

                      try {
                        await axios.put(`http://localhost:3001/physioAssignedPlans/${updatedPlan.id}`, updatedPlan)
                        setAssignedDates(updatedAssignedDates)
                        setPhysioAssignedPlans((prev) => ({
                          ...prev,
                          [mrn]: updatedPlan,
                        }))
                        toast.success("✅ Plan updated successfully!")
                      } catch (err) {
                        console.error("❌ Edit save failed:", err)
                        toast.error("❌ Failed to update plan")
                      }

                      setShowAssignModal({ visible: false, date: null })
                      setAssignedExercises([])
                      setSelectedType("")
                      setSelectedExercise("")
                      setExerciseInputs({})
                    }}
                  >
                    Submit Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Popup Modal */}
        {showViewPopup.visible && (
          <div
            className="modal-overlay"
            onClick={() =>
              setShowViewPopup({
                visible: false,
                data: [],
                date: "",
                isBatch: false,
              })
            }
          >
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Assigned Plan for {showViewPopup.date}</h3>
                <button
                  className="modal-close-btn"
                  onClick={() =>
                    setShowViewPopup({
                      visible: false,
                      data: [],
                      date: "",
                      isBatch: false,
                    })
                  }
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                {showViewPopup.isBatch ? (
                  <div className="batch-view">
                    {showViewPopup.data.map((day, idx) => (
                      <div key={idx} className="day-card">
                        <h5 className="day-title">📅 {day.date}</h5>
                        <div className="exercises-grid">
                          {day.exercises.map((exercise, exIdx) => (
                            <div key={exIdx} className="exercise-card">
                              <h6>{exercise.name}</h6>
                              <p>
                                {exercise.type === "Yoga"
                                  ? `${exercise.rounds || "-"} rounds × ${exercise.breaths || "-"} breaths`
                                  : `${exercise.sets || "-"} sets × ${exercise.reps || "-"} reps${
                                      exercise.weight ? ` (${exercise.weight}kg)` : ""
                                    }`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="exercises-grid">
                    {showViewPopup.data.map((exercise, index) => (
                      <div key={index} className="exercise-card">
                        <h6>{exercise.name}</h6>
                        <p>
                          {exercise.type === "Yoga"
                            ? `${exercise.rounds || "-"} rounds × ${exercise.breaths || "-"} breaths`
                            : `${exercise.sets || "-"} sets × ${exercise.reps || "-"} reps${
                                exercise.weight ? ` (${exercise.weight}kg)` : ""
                              }`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Previous Plans Card */}
        {showPreviousCard && (
          <div className="card previous-plans-card">
            <div className="card-header">
              <h3 className="card-title">Previous Assigned Plans for {mrn}</h3>
            </div>
            <div className="card-content">
              <div className="plans-grid">
                {Array.isArray(physioAssignedPlans[mrn]) &&
                  physioAssignedPlans[mrn].map((batch, batchIdx) => (
                    <div key={batch.batchId || batchIdx} className="plan-card">
                      <div className="plan-header">
                        <h5>🗂️ Plan Group {batchIdx + 1}</h5>
                      </div>
                      <div className="plan-details">
                        <div className="detail-row">
                          <span className="label">From:</span>
                          <span>{batch.from}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">To:</span>
                          <span>{batch.to}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Total Dates:</span>
                          <span>{batch.assignedDates.length}</span>
                        </div>
                      </div>
                      <div className="plan-actions">
                        <button
                          className="btn btn-outline"
                          onClick={() =>
                            setShowViewPopup({
                              visible: true,
                              date: `Plan Group ${batchIdx + 1}`,
                              data: batch.assignedDates,
                              isBatch: true,
                            })
                          }
                        >
                          <span className="icon">👁️</span>
                          View
                        </button>
                        <button className="btn btn-danger" onClick={() => deleteBatch(batch.batchId)}>
                          <span className="icon">🗑️</span>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="close-section">
                <button className="btn btn-outline" onClick={() => setShowPreviousCard(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PhysioPlanAssign
