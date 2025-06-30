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
  Menu,
  Workflow,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Hospital,
  LayoutDashboard,
  BookText,
  Lock,
  Calendar,
  Newspaper,
  Key,
  KeyRound,
} from "lucide-react";

const MasterAdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [collapsed, setCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setCollapsed(!collapsed);
  const handleResize = () => setIsOpen(window.innerWidth > 768);
  const closeSidebar = () => {
    if (isOpen && window.innerWidth <= 768) setIsOpen(false);
  };

  const handleMouseEnter = () => {
    if (collapsed && window.innerWidth > 768) setIsHovering(true);
  };
  const handleMouseLeave = () => {
    if (collapsed && window.innerWidth > 768) setIsHovering(false);
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

  const cancelLogout = () => setShowLogoutConfirm(false);

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>

      {isOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay show" onClick={closeSidebar}></div>
      )}

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <center><h3>Logout Confirmation</h3></center>
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
           <a href="/masteradmin"> <span className="sidebar-username">Admin</span></a>
          </div>
        </div>

        <nav className="sidebar-menu-wrapper">
          <ul className="sidebar-menu">
            <li>
              <NavLink to="/masteradmin/UserManagement" className={navLinkClass}>
                <Users size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>User Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/masteradmin/SystemOverview" className={navLinkClass}>
                <LayoutDashboard size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>System Overview</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/masteradmin/Services" className={navLinkClass}>
                <Hospital size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Services</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/masteradmin/PatientJourney" className={navLinkClass}>
                <Workflow size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Patient Journey</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/masteradmin/appointments" className={navLinkClass}>
                <Calendar size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Appointments</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/masteradmin/AdminBlogSection" className={navLinkClass}>
                <Newspaper size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Blog Section</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/masteradmin/AllReports" className={navLinkClass}>
                <BarChart2 size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>All Reports</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/masteradmin/ReportBuilder" className={navLinkClass}>
                <BarChart2 size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Report Builder</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/masteradmin/TemplateDemo" className={navLinkClass}>
                <BarChart2 size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>TemplateDemo</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/masteradmin/ActivityLogs" className={navLinkClass}>
                <BookText size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Activity Logs</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/masteradmin/SecurityControls" className={navLinkClass}>
                <Lock size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Security Controls</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/masteradmin/AdminPasswordRequests" className={navLinkClass}>
                <KeyRound size={18} style={{ marginRight: !collapsed || isHovering ? "10px" : "0" }} />
                <span>Password Requests</span>
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

export default MasterAdminSidebar;
