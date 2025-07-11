import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./phlebotomist.css";
const PhlebotomistAppointments = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const rawData = JSON.parse(localStorage.getItem("phleboBookingsData")) || [];
    const today = new Date().toISOString().split("T")[0];
    const filtered = rawData.filter((b) =>
      b.fastingDate.startsWith(today)
    );
    setBookings(filtered);
  }, []);

  const handleReschedule = (phone, slot) => {
    const msg = `Hi, please reschedule your phlebotomy slot (${slot}) at your convenience.`;
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, "_blank");
    toast.info("Opening WhatsApp to reschedule...");
  };

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
                <th>Email</th>
                <th>Test</th>
                <th>Slot</th>
                <th>Reschedule</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={i}>
                  <td>{b.name}</td>
                  <td>{b.phone}</td>
                  <td>{b.email}</td>
                  <td>{b.testType}</td>
                  <td>{b.slot}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => handleReschedule(b.phone, b.slot)}>
                      WhatsApp
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
