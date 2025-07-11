import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = "http://localhost:3001/phleboBookingsData";

const PhlebotomistAppointments = () => {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(API);
      const today = new Date().toISOString().split("T")[0];
      const filtered = res.data.filter((b) =>
        b.fastingDate.startsWith(today)
      );
      setBookings(filtered);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      toast.error("Failed to load appointments");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      toast.success("Booking cancelled");
      fetchBookings(); // reload list
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Could not cancel booking");
    }
  };

  const handleReschedule = (phone, slot) => {
    const msg = `Hi, please reschedule your phlebotomy slot (${slot}) at your convenience.`;
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, "_blank");
    toast.info("Opening WhatsApp to reschedule...");
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="card">
      <h2>Today's Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings for today.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Test</th>
                <th>Slot</th>
                <th>Reschedule</th>
                <th>Cancel</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.phone}</td>
                  <td>{b.testType}</td>
                  <td>{b.slot}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => handleReschedule(b.phone, b.slot)}>
                      WhatsApp
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(b.id)}>
                      Delete 🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PhlebotomistAppointments;
