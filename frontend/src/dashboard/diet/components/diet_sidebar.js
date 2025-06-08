import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ProfileImage from "../../../image/1.png";
import "../../physio/components/Sidebar.css";
import {
  Home,
  Users,
  Dumbbell,
  BarChart2,
  LogOut,
  Hamburger,
  Menu,
  Workflow,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";

const DietSidebar = () => {
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

  useEffect(() => {
    document.body.classList.toggle(
      "sidebar-collapsed",
      collapsed && !isHovering
    );
  }, [collapsed, isHovering]);

  const navLinkClass = ({ isActive }) => (isActive ? "active" : "");

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    setShowLogoutConfirm(false);
    setToastMessage("Logged out successfully.");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate("/login");
    }, 3000);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>

      {isOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay show" onClick={closeSidebar}></div>
      )}

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
              <button className="btn btn-primary" onClick={confirmLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="toast-overlay">
          <div className="toast-container success">
            <div className="toast-content">
              <Check size={18} style={{ marginRight: "8px" }} />
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
            <span className="sidebar-username">Jane Dietitian</span>
          </div>
        </div>

        <nav className="sidebar-menu-wrapper">
          <ul className="sidebar-menu">
            <li>
              <NavLink to="/diet/diet_profile" className={navLinkClass}>
                <Home size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/diet/diet_clients" className={navLinkClass}>
                <Users size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Client Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/diet/diet_assign" className={navLinkClass}>
                <Hamburger size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Assign Diet Plan</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/diet/DietitiansAppointments" className={navLinkClass}>
                <Hamburger size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Appointments</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/diet/diet_reports" className={navLinkClass}>
                <BarChart2 size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Reports</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/diet/DietPasswordRequest" className={navLinkClass}>
                <Workflow size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Password Request</span>
              </NavLink>
            </li>
            <li>
              <a
                href="#"
                onClick={handleLogoutClick}
                className={navLinkClass({ isActive: false })}
                style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <LogOut size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Log Out</span>
              </a>
            </li>
          </ul>

          <button className="collapse-toggle" onClick={toggleCollapse}>
            <div className="claude-toggle">
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </div>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default DietSidebar;
