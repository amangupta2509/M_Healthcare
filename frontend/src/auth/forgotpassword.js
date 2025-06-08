import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./forgotpassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState(""); // 'success' | 'error'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    // Simulated forgot password logic
    setTimeout(() => {
      setLoading(false);
      setMessage("If this email is registered, a password reset link has been sent.");
      setMessageType("success");
      setEmail("");
    }, 1500);
  };

  return (
    <div className="login-container">
      {showMessage && (
        <div className={`toast-message ${messageType}`}>
          <i
            className={`fa ${messageType === "error" ? "fa-times-circle" : "fa-check-circle"}`}
            style={{ marginRight: "8px" }}
          ></i>
          {message}
        </div>
      )}

      <div className="login-card">
        <Link to="/login" className="internal-back-arrow">
          
          <span>Back To Login</span>
        </Link>

        <h2 className="login-title">Forgot Password</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group floating-label-content">
            <input
              type="email"
              id="email"
              className="form-control floating-input"
              placeholder=" "
              value={email}
              onChange={handleChange}
              required
            />
            <label htmlFor="email" className="floating-label">
              Enter your email address
            </label>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span> Sending...
              </>
            ) : (
              "Send Reset Request"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
