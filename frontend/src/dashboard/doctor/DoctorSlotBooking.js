import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "../../ThemeProvider";
import "react-toastify/dist/ReactToastify.css";

const DoctorSlotBooking = () => {
  const { theme } = useTheme();
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const initialSlots = daysOfWeek.map((day) => ({
    day,
    available: false,
    timeBlocks: [],
  }));

  const [slots, setSlots] = useState(initialSlots);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allSlotData, setAllSlotData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [viewSlotIndex, setViewSlotIndex] = useState(null);

  const toggleAvailability = (day) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.day === day
          ? {
              ...slot,
              available: !slot.available,
              timeBlocks: slot.available ? [] : [{ start: "", end: "" }],
            }
          : slot
      )
    );
  };

  const updateTimeBlock = (day, idx, field, value) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.day === day) {
          const newBlocks = [...slot.timeBlocks];
          newBlocks[idx][field] = value;
          return { ...slot, timeBlocks: newBlocks };
        }
        return slot;
      })
    );
  };

  const addTimeBlock = (day) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.day === day
          ? {
              ...slot,
              timeBlocks: [...slot.timeBlocks, { start: "", end: "" }],
            }
          : slot
      )
    );
  };

  const removeTimeBlock = (day, indexToRemove) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.day === day
          ? {
              ...slot,
              timeBlocks: slot.timeBlocks.filter((_, i) => i !== indexToRemove),
            }
          : slot
      )
    );
  };

  const resetForm = () => {
    setSlots(initialSlots);
    setStartDate("");
    setEndDate("");
    setEditingIndex(null);
    setEditingId(null);
    setShowForm(false);
  };

  const validateSlots = () => {
    for (let slot of slots) {
      if (slot.available) {
        for (let block of slot.timeBlocks) {
          if (!block.start || !block.end) {
            toast.error(`Incomplete time block in ${slot.day}`);
            return false;
          }
          if (block.start >= block.end) {
            toast.error(`Start time must be before end time in ${slot.day}`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error("Please enter both start and end dates.");
      return;
    }

    if (!validateSlots()) return;

    const entry = {
      startDate,
      endDate,
      slots,
    };

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
        });

    request
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      })
      .then(() => {
        fetch("http://localhost:3001/doctorSlots")
          .then((res) => res.json())
          .then((data) => {
            setAllSlotData(data);
            toast.success(editingId ? "Slot updated!" : "Slot booked!");
            resetForm();
          });
      })
      .catch(() => toast.error("Server error"));
  };

  const handleEdit = (index) => {
    const entry = allSlotData[index];
    setSlots(entry.slots);
    setStartDate(entry.startDate);
    setEndDate(entry.endDate);
    setEditingIndex(index);
    setEditingId(entry.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:3001/doctorSlots/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setAllSlotData((prev) => prev.filter((item) => item.id !== id));
        toast.info("Slot deleted");
      })
      .catch(() => toast.error("Failed to delete"));
  };

  const confirmDelete = (id) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to delete this slot?</p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={() => {
                handleDelete(id);
                closeToast();
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
      }
    );
  };

  useEffect(() => {
    fetch("http://localhost:3001/doctorSlots")
      .then((res) => res.json())
      .then((data) => setAllSlotData(data))
      .catch(() => toast.error("Failed to fetch slots"));
  }, []);

  return (
    <div className={`dashboard-main ${theme}`} style={{ padding: "1rem" }}>
      <ToastContainer position="top-center" autoClose={2000} />
      <h1
        style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", marginBottom: "2rem" }}
      >
        Doctor Slot Booking
      </h1>

      {!showForm && (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          {editingIndex !== null ? "Edit Slot" : "Book New Slot"}
        </button>
      )}

      {showForm && (
        <form
          className="card responsive-form"
          onSubmit={handleSubmit}
          style={{ marginTop: "20px" }}
        >
          <h2 style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)" }}>
            {editingIndex !== null
              ? "Update Slots"
              : "Select Weekly Availability"}
          </h2>

          <div className="date-inputs">
            <div>
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="search-input responsive-input"
                required
              />
            </div>
            <div>
              <label>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="search-input responsive-input"
                required
              />
            </div>
          </div>

          <div className="table-container">
            <table className="user-table responsive-table">
              <thead>
                <tr>
                  <th style={{ width: "15%" }}>Day</th>
                  <th style={{ width: "" }}>Available</th>
                  <th>Time Blocks</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(({ day, available, timeBlocks }) => (
                  <tr key={day}>
                    <td data-label="Day">{day}</td>
                    <td data-label="Available" style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={available}
                        onChange={() => toggleAvailability(day)}
                        style={{
                          width: "20px",
                          height: "20px",
                          accentColor: "#cc5500",
                        }}
                      />
                    </td>
                    <td data-label="Time Blocks">
                      {available &&
                        timeBlocks.map((block, idx) => (
                          <div key={idx} className="time-block">
                            <input
                              type="time"
                              value={block.start}
                              onChange={(e) =>
                                updateTimeBlock(
                                  day,
                                  idx,
                                  "start",
                                  e.target.value
                                )
                              }
                              className="time-input"
                            />
                            <input
                              type="time"
                              value={block.end}
                              onChange={(e) =>
                                updateTimeBlock(day, idx, "end", e.target.value)
                              }
                              className="time-input"
                            />
                            <button
                              type="button"
                              className="time-remove-btn"
                              onClick={() => removeTimeBlock(day, idx)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      {available && (
                        <button
                          type="button"
                          className="btn-primary add-slot-btn"
                          onClick={() => addTimeBlock(day)}
                        >
                          + Add Slot
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingIndex !== null ? "Update Slot" : "Submit Availability"}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Summary View */}
      {allSlotData.length > 0 && (
        <div style={{ marginTop: "2%" }}>
          <h2 style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)" }}>
            Saved Slot Periods
          </h2>
          <div className="table-container">
            <table className="user-table responsive-table">
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
                    <td data-label="#">{index + 1}</td>
                    <td data-label="Date Range">
                      {entry.startDate} to {entry.endDate}
                    </td>
                    <td data-label="Actions">
                      <div className="action-buttons">
                        <button
                          className="btn btn-primary"
                          onClick={() => setViewSlotIndex(index)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleEdit(index)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => confirmDelete(entry.id)}
                        >
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
        <div className="modal-overlay">
          <div className="modalslot-box responsive-modal">
            <h3 style={{ fontSize: "clamp(1rem, 2.5vw, 1.4rem)" }}>
              Slot Availability: {allSlotData[viewSlotIndex].startDate} to{" "}
              {allSlotData[viewSlotIndex].endDate}
            </h3>
            <div className="table-container">
              <table className="user-table responsive-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {allSlotData[viewSlotIndex].slots.map((slot) => (
                    <tr key={slot.day}>
                      <td data-label="Day">{slot.day}</td>
                      <td data-label="Availability">
                        {slot.available
                          ? slot.timeBlocks.map((b, i) => (
                              <div key={i}>
                                {b.start} - {b.end}
                              </div>
                            ))
                          : "Not Available"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => setViewSlotIndex(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .responsive-form {
          max-width: 100%;
          overflow-x: auto;
        }

        .date-inputs {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .date-inputs > div {
          flex: 1;
          min-width: 200px;
        }

        .responsive-input {
          width: 100%;
          max-width: 100%;
        }

        .table-container {
          overflow-x: auto;
          margin: 1rem 0;
        }

        .responsive-table {
          width: 100%;
          min-width: 600px;
        }

        .time-block {
          display: flex;
          align-items: stretch;
          gap: 10px;
          flex-wrap: nowrap;
          margin-bottom: 8px;
        }

        .time-input {
          flex: 1;
          min-width: 100px;
          height: auto;
          padding: 8px 12px;
          box-sizing: border-box;
        }

        .time-remove-btn {
          padding: 8px 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          border: 1px solid #dc3545;
          background-color: #dc3545;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          line-height: 1.2;
          box-sizing: border-box;
          flex-shrink: 0;
          align-self: stretch;
          max-height: 43px;
        }

        .time-remove-btn:hover {
          background-color: #c82333;
        }

        .add-slot-btn {
          margin-top: 5px;
          width: 20%;
          background-color: var(--accent);
          color: white;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          white-space: nowrap;
          min-width: 80px;
          padding: 1.5%;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 15px;
          flex-wrap: wrap;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .responsive-modal {
          background: --background-color;
          border: 1px solid #cc5500;
          padding: 1rem;
          border-radius: 8px;
          max-width: 50vw;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-actions {
          text-align: center;
          margin-top: 1rem;
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .dashboard-main {
            padding: 0.5rem !important;
          }

          .responsive-table {
            min-width: unset;
            width: 100%;
          }

          .responsive-table thead {
            display: none;
          }

          .add-slot-btn {
            width: 100%;
            padding: 2.5%;
          }

          .responsive-table tr {
            display: block;
            margin-bottom: 1rem;
            border: 1px solid #ddd;
            padding: 0.5rem;
            border-radius: 4px;
          }

          .responsive-table td {
            display: block;
            text-align: left !important;
            padding: 0.5rem 0;
            border: none;
          }

          .responsive-table td:before {
            content: attr(data-label) ": ";
            font-weight: bold;
            display: inline-block;
            min-width: 100px;
          }

          .date-inputs {
            flex-direction: column;
          }

          .date-inputs > div {
            min-width: unset;
          }

          .time-block {
            flex-direction: column;
            align-items: stretch;
          }

          .time-input {
            min-width: unset;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-buttons button {
            width: 100%;
            margin: 2px 0;
          }

          .form-actions {
            flex-direction: column;
          }

          .form-actions button {
            width: 100%;
          }

          .responsive-modal {
            max-width: 95vw;
            padding: 0.5rem;
          }
        }

        /* Tablet Styles */
        @media (max-width: 1024px) and (min-width: 769px) {
          .time-block {
            flex-wrap: wrap;
          }

          .time-input {
            min-width: 80px;
          }

          .add-slot-btn {
            width: 100%;
            padding: 2.5%;
          }

          .action-buttons {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        /* Small mobile adjustments */
        @media (max-width: 480px) {
          .dashboard-main {
            padding: 0.25rem !important;
          }

          .responsive-form {
            padding: 0.5rem;
          }

          .add-slot-btn {
            width: 100%;
            padding: 2.5%;
          }

          .btn {
            padding: 8px 12px;
            font-size: 0.9rem;
          }

          .responsive-input {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default DoctorSlotBooking;
