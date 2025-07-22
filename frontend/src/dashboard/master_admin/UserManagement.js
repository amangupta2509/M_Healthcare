import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../../ThemeProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./master_admin.css";

const roles = ["All", "doctor", "physio", "dietitian", "lab", "phlebotomist"];

const UserManagement = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState("All");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
  });
  const [editingUser, setEditingUser] = useState(null);
  const API_URL = "http://localhost:8080/api/users";

  useEffect(() => {
    fetchUsers();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const openModal = (user = null) => {
    setEditingUser(user);
    setFormData(
      user
        ? { ...user, password: "" }
        : { name: "", email: "", password: "", role: "doctor" }
    );
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      alert("Please fill in all fields");
      return;
    }

    try {
      if (editingUser) {
        await axios.put(`${API_URL}/${editingUser.id}`, formData);
        toast.success("User updated successfully");
      } else {
        await axios.post(API_URL, formData);
        toast.success("User added successfully");
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Error saving user");
    }
  };

  const handleDelete = (id) => {
    const confirmToast = ({ closeToast }) => (
      <div>
        <p style={{ color: "black" }}>
          Are you sure you want to delete this user?
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                await axios.delete(`${API_URL}/${id}`);
                setUsers((prev) => prev.filter((u) => u.id !== id));
                toast.dismiss();
                toast.error("User deleted.");
              } catch (error) {
                console.error("Error deleting user:", error);
                toast.dismiss();
                toast.error("Failed to delete user.");
              }
            }}
          >
            Confirm
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              toast.dismiss();
              toast.info("Deletion cancelled.");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );

    toast(confirmToast, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    const matchRole =
      activeRole === "All" ||
      (typeof user.role === "string" &&
        user.role.toLowerCase() === activeRole.toLowerCase());

    return matchSearch && matchRole;
  });

  return (
    <div className={`dashboard-main ${theme}`}>
      <style jsx>{`
        .dashboard-main {
          padding: 1rem;
          min-height: 100vh;
        }

        .dashboard-main h1 {
          margin-bottom: 1.5rem;
          font-size: clamp(1.5rem, 4vw, 2rem);
        }

        .user-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .user-actions {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
          }
        }

        .search-input {
          flex: 1;
          min-width: 200px;
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ddd;
          font-size: 1rem;
        }

        .role-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .role-filters {
            justify-content: flex-start;
          }
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .filter-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-bottom: 1rem;
        }

        .user-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }

        .user-table th,
        .user-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        .user-table th {
          background: #f8f9fa;
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .user-table td {
          vertical-align: middle;
        }

        .user-table td:last-child {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        @media (max-width: 767px) {
          .user-table td:last-child {
            flex-direction: column;
          }
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

        .modal-box {
          background: white;
          border-radius: 8px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #ddd;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }

        .close-modal {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-body {
          padding: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          box-sizing: border-box;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid #ddd;
        }

        @media (max-width: 480px) {
          .modal-actions {
            flex-direction: column-reverse;
          }
          
          .modal-actions button {
            width: 100%;
          }
        }

        /* Dark theme support */
        .dark .search-input,
        .dark .filter-btn,
        .dark .form-group input,
        .dark .form-group select {
          background: #333;
          color: white;
          border-color: #555;
        }

        .dark .filter-btn.active {
          background: #0056b3;
          border-color: #0056b3;
        }

        .dark .user-table th {
          background: #333;
          color: white;
        }

        .dark .modal-box {
          background: #222;
          color: white;
        }

        .dark .modal-header,
        .dark .modal-actions {
          border-color: #444;
        }
      `}</style>
      
      <ToastContainer position="top-center" autoClose={3000} />
      <h1>User Management</h1>

      <div className="user-actions">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="role-filters">
          {roles.map((role) => (
            <button
              key={role}
              className={`filter-btn ${activeRole === role ? "active" : ""}`}
              onClick={() => setActiveRole(role)}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          Add New User
        </button>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => openModal(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "1rem" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? "Edit User" : "Add New User"}</h3>
              <button className="close-modal" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="counselor">Counselor</option>
                  <option value="physio">Physio</option>
                  <option value="dietitian">Dietitian</option>
                  <option value="lab">Lab</option>
                  <option value="doctor">Doctor</option>
                  <option value="phlebotomist">Phlebotomist</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;