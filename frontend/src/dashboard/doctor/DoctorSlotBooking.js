"use client"

import { useState, useEffect } from "react"
import { toast, ToastContainer } from "react-toastify"
import { useTheme } from "../../ThemeProvider"
import "react-toastify/dist/ReactToastify.css"
import "./DoctorSlotBooking.css"

const DoctorSlotBooking = () => {
  const { theme } = useTheme()

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const initialSlots = daysOfWeek.map((day) => ({
    day,
    available: false,
    timeBlocks: [],
  }))

  const [slots, setSlots] = useState(initialSlots)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [allSlotData, setAllSlotData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [viewSlotIndex, setViewSlotIndex] = useState(null)

  const toggleAvailability = (day) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.day === day
          ? {
              ...slot,
              available: !slot.available,
              timeBlocks: slot.available ? [] : [{ start: "", end: "" }],
            }
          : slot,
      ),
    )
  }

  const updateTimeBlock = (day, idx, field, value) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.day === day) {
          const newBlocks = [...slot.timeBlocks]
          newBlocks[idx][field] = value
          return { ...slot, timeBlocks: newBlocks }
        }
        return slot
      }),
    )
  }

  const addTimeBlock = (day) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.day === day
          ? {
              ...slot,
              timeBlocks: [...slot.timeBlocks, { start: "", end: "" }],
            }
          : slot,
      ),
    )
  }

  const removeTimeBlock = (day, indexToRemove) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.day === day
          ? {
              ...slot,
              timeBlocks: slot.timeBlocks.filter((_, i) => i !== indexToRemove),
            }
          : slot,
      ),
    )
  }

  const resetForm = () => {
    setSlots(initialSlots)
    setStartDate("")
    setEndDate("")
    setEditingIndex(null)
    setEditingId(null)
    setShowForm(false)
  }

  const validateSlots = () => {
    for (const slot of slots) {
      if (slot.available) {
        for (const block of slot.timeBlocks) {
          if (!block.start || !block.end) {
            toast.error(`Incomplete time block in ${slot.day}`)
            return false
          }
          if (block.start >= block.end) {
            toast.error(`Start time must be before end time in ${slot.day}`)
            return false
          }
        }
      }
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!startDate || !endDate) {
      toast.error("Please enter both start and end dates.")
      return
    }
    if (!validateSlots()) return

    const entry = {
      startDate,
      endDate,
      slots,
    }

    const request = editingId
      ? fetch(`http://localhost:3001/doctorSlots/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...entry, id: editingId }),
        })
      : fetch("http://localhost:3001/doctorSlots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        })

    request
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save")
        return res.json()
      })
      .then(() => {
        fetch("http://localhost:3001/doctorSlots")
          .then((res) => res.json())
          .then((data) => {
            setAllSlotData(data)
            toast.success(editingId ? "Slot updated!" : "Slot booked!")
            resetForm()
          })
      })
      .catch(() => toast.error("Server error"))
  }

  const handleEdit = (index) => {
    const entry = allSlotData[index]
    setSlots(entry.slots)
    setStartDate(entry.startDate)
    setEndDate(entry.endDate)
    setEditingIndex(index)
    setEditingId(entry.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = (id) => {
    fetch(`http://localhost:3001/doctorSlots/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setAllSlotData((prev) => prev.filter((item) => item.id !== id))
        toast.info("Slot deleted")
      })
      .catch(() => toast.error("Failed to delete"))
  }

  const confirmDelete = (id) => {
    toast(
      ({ closeToast }) => (
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this slot?</p>
          <div className="delete-confirmation-buttons">
            <button
              className="btn btn-danger"
              onClick={() => {
                handleDelete(id)
                closeToast()
              }}
            >
              Yes
            </button>
            <button className="btn btn-secondary" onClick={closeToast}>
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      },
    )
  }

  useEffect(() => {
    fetch("http://localhost:3001/doctorSlots")
      .then((res) => res.json())
      .then((data) => setAllSlotData(data))
      .catch(() => toast.error("Failed to fetch slots"))
  }, [])

  return (
    <div className={`doctor-slot-container ${theme}`}>
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            <span className="title-icon">🏥</span>
            Doctor Slot Booking
          </h1>

          {!showForm && (
            <button className="btn btn-primary btn-large" onClick={() => setShowForm(true)}>
              <span className="btn-icon">➕</span>
              {editingIndex !== null ? "Edit Slot" : "Book New Slot"}
            </button>
          )}
        </div>

        {showForm && (
          <div className="card form-card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="title-icon">📅</span>
                {editingIndex !== null ? "Update Slots" : "Select Weekly Availability"}
              </h2>
            </div>

            <form className="slot-form" onSubmit={handleSubmit}>
              <div className="date-inputs-section">
                <div className="input-group">
                  <label htmlFor="start-date" className="input-label">
                    <span className="label-icon">📅</span>
                    Start Date
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="end-date" className="input-label">
                    <span className="label-icon">📅</span>
                    End Date
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="availability-section">
                <h3 className="section-title">Weekly Availability</h3>

                <div className="table-container">
                  <table className="availability-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Available</th>
                        <th>Time Blocks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map(({ day, available, timeBlocks }) => (
                        <tr key={day} className={available ? "available-row" : ""}>
                          <td data-label="Day" className="day-cell">
                            <span className="day-name">{day}</span>
                          </td>

                          <td data-label="Available" className="checkbox-cell">
                            <label className="checkbox-wrapper">
                              <input
                                type="checkbox"
                                checked={available}
                                onChange={() => toggleAvailability(day)}
                                className="availability-checkbox"
                              />
                              <span className="checkbox-custom"></span>
                              <span className="checkbox-label">{available ? "Available" : "Not Available"}</span>
                            </label>
                          </td>

                          <td data-label="Time Blocks" className="time-blocks-cell">
                            {available && (
                              <div className="time-blocks-container">
                                {timeBlocks.map((block, idx) => (
                                  <div key={idx} className="time-block">
                                    <div className="time-inputs">
                                      <input
                                        type="time"
                                        value={block.start}
                                        onChange={(e) => updateTimeBlock(day, idx, "start", e.target.value)}
                                        className="time-input"
                                        placeholder="Start time"
                                      />
                                      <span className="time-separator">to</span>
                                      <input
                                        type="time"
                                        value={block.end}
                                        onChange={(e) => updateTimeBlock(day, idx, "end", e.target.value)}
                                        className="time-input"
                                        placeholder="End time"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-small remove-btn"
                                      onClick={() => removeTimeBlock(day, idx)}
                                      title="Remove time block"
                                    >
                                      <span className="btn-icon">🗑️</span>
                                      Remove
                                    </button>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  className="btn btn-outline add-time-btn"
                                  onClick={() => addTimeBlock(day)}
                                >
                                  <span className="btn-icon">➕</span>
                                  Add Time Slot
                                </button>
                              </div>
                            )}

                            {!available && (
                              <div className="not-available-message">
                                <span className="icon">❌</span>
                                Not available on this day
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-large">
                  <span className="btn-icon">💾</span>
                  {editingIndex !== null ? "Update Slot" : "Submit Availability"}
                </button>
                <button type="button" className="btn btn-secondary btn-large" onClick={resetForm}>
                  <span className="btn-icon">❌</span>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Summary View */}
        {allSlotData.length > 0 && (
          <div className="card summary-card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="title-icon">📋</span>
                Saved Slot Periods
              </h2>
            </div>

            <div className="table-container">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>SI_NO</th>
                    <th>Date Range</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allSlotData.map((entry, index) => (
                    <tr key={index}>
                      <td data-label="SI_NO" className="serial-cell">
                        <span className="serial-number">{index + 1}</span>
                      </td>
                      <td data-label="Date Range" className="date-range-cell">
                        <div className="date-range">
                          <span className="date-from">{entry.startDate}</span>
                          <span className="date-separator">to</span>
                          <span className="date-to">{entry.endDate}</span>
                        </div>
                      </td>
                      <td data-label="Actions" className="actions-cell">
                        <div className="action-buttons">
                          <button
                            className="btn btn-info btn-small"
                            onClick={() => setViewSlotIndex(index)}
                            title="View details"
                          >
                            <span className="btn-icon">👁️</span>
                            View
                          </button>
                          <button
                            className="btn btn-warning btn-small"
                            onClick={() => handleEdit(index)}
                            title="Edit slot"
                          >
                            <span className="btn-icon">✏️</span>
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => confirmDelete(entry.id)}
                            title="Delete slot"
                          >
                            <span className="btn-icon">🗑️</span>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal View */}
        {viewSlotIndex !== null && (
          <div className="modal-overlay" onClick={() => setViewSlotIndex(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <span className="title-icon">📅</span>
                  Slot Availability Details
                </h3>
                <button className="modal-close-btn" onClick={() => setViewSlotIndex(null)} title="Close modal">
                  ❌
                </button>
              </div>

              <div className="modal-body">
                <div className="date-range-info">
                  <span className="date-range-label">Period:</span>
                  <span className="date-range-value">
                    {allSlotData[viewSlotIndex].startDate} to {allSlotData[viewSlotIndex].endDate}
                  </span>
                </div>

                <div className="modal-table-container">
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Availability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSlotData[viewSlotIndex].slots.map((slot) => (
                        <tr key={slot.day} className={slot.available ? "available-row" : "unavailable-row"}>
                          <td data-label="Day" className="day-cell">
                            <span className="day-name">{slot.day}</span>
                          </td>
                          <td data-label="Availability" className="availability-cell">
                            {slot.available ? (
                              <div className="time-slots">
                                {slot.timeBlocks.map((block, i) => (
                                  <div key={i} className="time-slot-badge">
                                    <span className="time-icon">🕐</span>
                                    {block.start} - {block.end}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="not-available-badge">
                                <span className="icon">❌</span>
                                Not Available
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-primary btn-large" onClick={() => setViewSlotIndex(null)}>
                  <span className="btn-icon">✅</span>
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

export default DoctorSlotBooking
