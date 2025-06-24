import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();

  const savedEmail = localStorage.getItem("savedEmail") || "";
  const savedPassword = localStorage.getItem("savedPassword") || "";
  const savedRole = localStorage.getItem("savedRole") || "doctor"; // default role

  const [formData, setFormData] = useState({
    email: savedEmail,
    password: savedPassword,
    role: savedRole,
  });

  const [rememberMe, setRememberMe] = useState(savedEmail !== "");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (lockoutTime > 0) {
      const interval = setInterval(() => {
        setLockoutTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.error) {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        setLoading(false);

        if (nextAttempts >= 3) {
          setLockoutTime(30);
          setMessage("Too many failed attempts. Please try again in 30 seconds.");
        } else {
          setMessage("Invalid credentials. Please try again.");
        }
        setMessageType("error");
        return;
      }

      // Successful login
      if (rememberMe) {
        localStorage.setItem("savedEmail", formData.email);
        localStorage.setItem("savedPassword", formData.password);
        localStorage.setItem("savedRole", formData.role);
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
        localStorage.removeItem("savedRole");
      }

      localStorage.setItem("currentUser", JSON.stringify(data));
      setMessage("Login successful");
      setMessageType("success");
      setAttempts(0);

      setTimeout(() => {
        setLoading(false);
        switch (data.role.toLowerCase()) {
          case "physio":
            navigate("/profile");
            break;
          case "dietitian":
            navigate("/diet/diet_profile");
            break;
          case "doctor":
            navigate("/doctor/DoctorDashboardHome");
            break;
          case "masteradmin":
            navigate("/masteradmin");
            break;
          case "counselor":
            navigate("/counselor");
            break;
          default:
            navigate("/unauthorized");
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      setMessage("Error connecting to server. Please try again later.");
      setMessageType("error");
    }
  };

  return (
    <div className="login-container">
      {showMessage && (
        <div className={`toast-message ${messageType}`}>
          <i
            className={`fa ${
              messageType === "error" ? "fa-times-circle" : "fa-check-circle"
            }`}
            style={{ marginRight: "8px" }}
          ></i>
          {message}
        </div>
      )}

      <div className="login-card">
        <h2 className="login-title">Login</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group floating-label-content">
            <input
              type="email"
              id="email"
              className="form-control floating-input"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="email" className="floating-label">
              Email
            </label>
          </div>

          <div className="form-group floating-label-content">
            <input
              type="password"
              id="password"
              className="form-control floating-input"
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="password" className="floating-label">
              Password
            </label>
          </div>

          <div className="form-group floating-label-content">
            <select
              id="role"
              className="form-control floating-input"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="doctor">Doctor</option>
              <option value="physio">Physio</option>
              <option value="dietitian">Dietitian</option>
              <option value="counselor">Counselor</option>
              <option value="masteradmin">Master Admin</option>
            </select>
            <label htmlFor="role" className="floating-label">
              Select Role
            </label>
          </div>

          <div className="form-group d-flex justify-content-between align-items-center">
            <label className="remember-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember Me
            </label>
            <Link to="/forgotpassword">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || lockoutTime > 0}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Signing in...
              </>
            ) : lockoutTime > 0 ? (
              `Try again in ${lockoutTime}s`
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
