import React from "react";
import { useNavigate } from "react-router-dom";
import "./master_admin.css";

const appointmentTypes = [
  { label: "Doctor", icon: "🩺", path: "/masteradmin/appointments/doctor" },
  { label: "Dietitian", icon: "🥗", path: "/masteradmin/appointments/dietitian" },
  { label: "Physio", icon: "💪", path: "/masteradmin/appointments/physio" },
  { label: "Counselor", icon: "🧠", path: "/masteradmin/appointments/counselor" },
  { label: "Phlebotomist", icon: "🧪", path: "/masteradmin/appointments/phlebotomist" },
];


const AppointmentsContainer = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-main">
      <h1>Appointments</h1>
      <div className="appointments-grid">
        {appointmentTypes.map((type) => (
          <div
            key={type.label}
            className="card appointment-type-card"
            onClick={() => navigate(type.path)}
          >
            <div className="appointment-icon">{type.icon}</div>
            <h3>{type.label} Appointments</h3>
            <p>Manage all {type.label.toLowerCase()} bookings</p>
            <div className="center-btn">
              <button className="btn btn-primary">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsContainer;
