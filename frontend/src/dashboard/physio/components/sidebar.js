import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ProfileImage from "../../../image/1.png";
import "./Sidebar.css";
import {
  Home,
  Users,
  Dumbbell,
  BarChart2,
  LogOut,
  Menu,
  Workflow,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [collapsed, setCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleResize = () => {
    setIsOpen(window.innerWidth > 768);
  };

  const closeSidebar = () => {
    if (isOpen && window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  // Hover handlers
  const handleMouseEnter = () => {
    if (collapsed && window.innerWidth > 768) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (collapsed && window.innerWidth > 768) {
      setIsHovering(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add body class for content margin adjustment
  useEffect(() => {
    document.body.classList.toggle(
      "sidebar-collapsed",
      collapsed && !isHovering
    );
  }, [collapsed, isHovering]);

  const navLinkClass = ({ isActive }) => (isActive ? "active" : "");

  // Show logout confirmation modal
  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutConfirm(true);
  };

  // Handle confirm logout
  const confirmLogout = () => {
    // Perform logout actions here
    localStorage.clear(); // or remove auth tokens etc.

    // Close the confirmation modal
    setShowLogoutConfirm(false);

    // Show toast message
    setToastMessage("Logged out successfully.");
    setShowToast(true);

    // After a delay, navigate to login page
    setTimeout(() => {
      setShowToast(false);
      navigate("/login");
    }, 3000);
  };

  // Handle cancel logout
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      {isOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay show" onClick={closeSidebar}></div>
      )}

      {/* Center Modal Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <center>
                <h3>Logout Confirmation</h3>
              </center>
              <button className="modal-close" onClick={cancelLogout}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to log out?</p>
            </div>
            <div className="modal-footer">
              {/* <button className="btn btn-secondary" onClick={cancelLogout}>
                Cancel
              </button> */}
              <button className="btn btn-primary" onClick={confirmLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centered Toast Message */}
      {showToast && (
        <div className="toast-overlay">
          <div className="toast-container success">
            <div className="toast-content">
              <Check
                size={18}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              {toastMessage}
            </div>
          </div>
        </div>
      )}

      <aside
        className={`sidebar ${isOpen ? "open" : ""} ${
          collapsed ? "collapsed" : ""
        } ${isHovering ? "hovering" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="sidebar-header">
          <div className="sidebar-profile">
            <img src={ProfileImage} alt="Profile" className="sidebar-avatar" />
            <span className="sidebar-username">John Doe</span>
          </div>
        </div>

        <nav className="sidebar-menu-wrapper">
          <ul className="sidebar-menu">
            <li>
              <NavLink to="/profile" className={navLinkClass}>
                <Home
                  size={18}
                  style={{
                    marginRight: !collapsed || isHovering ? "10px" : "0",
                  }}
                />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/clients" className={navLinkClass}>
                <Users
                  size={18}
                  style={{
                    marginRight: !collapsed || isHovering ? "10px" : "0",
                  }}
                />
                <span>Client Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/PhysiosAppointments" className={navLinkClass}>
                <Users
                  size={18}
                  style={{
                    marginRight: !collapsed || isHovering ? "10px" : "0",
                  }}
                />
                <span>Appointments</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/assign" className={navLinkClass}>
                <Dumbbell
                  size={18}
                  style={{
                    marginRight: !collapsed || isHovering ? "10px" : "0",
                  }}
                />
                <span>Assign Exercise</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/reports" className={navLinkClass}>
                <BarChart2
                  size={18}
                  style={{
                    marginRight: !collapsed || isHovering ? "10px" : "0",
                  }}
                />
                <span>Reports</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/physio" className={navLinkClass}>
                <Workflow
                  size={18}
                  style={{
                    marginRight: !collapsed || isHovering ? "10px" : "0",
                  }}
                />
                <span>Physio</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/PhysioPasswordRequest" className={navLinkClass}>
                <Workflow
                  size={18}
                  style={{
                    marginRight: !collapsed || isHovering ? "10px" : "0",
                  }}
                />
                <span>Password Request</span>
              </NavLink>
            </li>
            {/* Updated logout item */}
            <li>
              {/* Use a regular clickable element here instead of NavLink */}
              <a
                href="#"
                onClick={handleLogoutClick}
                className={navLinkClass({ isActive: false })}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LogOut
                  size={18}
                  style={{
                    marginRight: !collapsed || isHovering ? "10px" : "0",
                  }}
                />
                <span>Log Out</span>
              </a>
            </li>
          </ul>

          {/* Claude-style toggle button at the bottom */}
          <button
            className="collapse-toggle"
            onClick={toggleCollapse}
            aria-label="Toggle collapse"
          >
            <div className="claude-toggle">
              {collapsed ? (
                <ChevronRight size={16} className="toggle-icon" />
              ) : (
                <ChevronLeft size={16} className="toggle-icon" />
              )}
            </div>
            {/* <span className="collapse-toggle-text">Collapse</span> */}
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
