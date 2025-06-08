import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "../../../ThemeProvider"; // Adjust the import based on your project structure
import "react-toastify/dist/ReactToastify.css";
import "../../master_admin/master_admin.css"; // Ensure this path is correct

const DietPasswordRequest = () => {
  const { theme } = useTheme(); // Access the current theme
  const [formData, setFormData] = useState({
    counselorName: "",
    email: "",
    reason: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.counselorName || !formData.email || !formData.reason) {
      toast.error("All fields are required!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/passwordChangeRequests", {
        ...formData,
        status: "Pending",
        requestedAt: new Date().toISOString(),
      });

      toast.success("Request submitted to admin!");
      setFormData({ counselorName: "", email: "", reason: "" });
    } catch (err) {
      toast.error("Failed to submit request.");
    }
  };

  return (
    <div className={`dashboard-main ${theme}`}>
      <ToastContainer position="top-center" autoClose={3000} />
      <h1>Password Change Request</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="counselorName">Counselor Name:</label>
            <input
              type="text"
              id="counselorName"
              name="counselorName"
              placeholder="Enter your name"
              value={formData.counselorName}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email ID:</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reason">Reason for Change:</label>
            <input
              type="text"
              id="reason"
              placeholder="Enter reason for password change"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="input-field"
            
              required
            />
          </div>
          <div className="center-btn">
           <center> <button type="submit" className="btn btn-primary">
              Submit Request
            </button></center>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DietPasswordRequest;
