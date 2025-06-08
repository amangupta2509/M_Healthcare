import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "../../ThemeProvider";
import "react-toastify/dist/ReactToastify.css";
import "./master_admin.css";

const SecurityControls = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [confirmModal, setConfirmModal] = useState({ visible: false, user: null, action: null });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower)
      )
    );
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to fetch users.");
    }
  };

  const logSecurityAction = async (userId, action, actor = "Admin") => {
    try {
      await axios.post("http://localhost:8080/api/securityLogs", {
        userId,
        action,
        actor
      });
    } catch {
      console.error("Logging failed");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`http://localhost:8080/api/users/${userId}`, {
        role: newRole,
      });
      await logSecurityAction(userId, `Role changed to ${newRole}`);
      toast.success(`Role updated for user ID ${userId} → ${newRole}`);
      fetchUsers();
    } catch {
      toast.error("Role update failed.");
    }
  };

  const confirmAction = (user, action) => {
    setConfirmModal({ visible: true, user, action });
    setNewPassword("");
    setConfirmPassword("");
  };

  const executeConfirmedAction = async () => {
    const { user, action } = confirmModal;

    if (action === "logout") {
      toast.warn(`User ID ${user.id} has been logged out`);
      await logSecurityAction(user.id, "Forced Logout");
      setConfirmModal({ visible: false });
    }

    if (action === "reset") {
      if (!newPassword || !confirmPassword) return toast.warning("Fill all password fields.");
      if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");

      try {
        await axios.patch(`http://localhost:8080/api/users/${user.id}`, {
          password: newPassword,
        });
        await logSecurityAction(user.id, "Password Reset");
        toast.success(`Password reset for ${user.name}`);
        setConfirmModal({ visible: false });
      } catch {
        toast.error("Password update failed.");
      }
    }
  };

  const getPasswordStrength = () => {
    if (newPassword.length < 6) return "Weak";
    if (newPassword.match(/[A-Z]/) && newPassword.match(/\d/)) return "Strong";
    return "Moderate";
  };

  const exportSecurityLog = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/securityLogs");
      const csv = [
        ["Timestamp", "User ID", "Action", "Actor"],
        ...res.data.map((l) => [
          new Date(l.timestamp).toLocaleString(),
          l.userId,
          l.action,
          l.actor,
        ]),
      ];
      const csvContent =
        "data:text/csv;charset=utf-8," + csv.map((e) => e.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "security_logs.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Security log exported.");
    } catch {
      toast.error("Failed to export logs.");
    }
  };

  return (
    <div className={`dashboard-main ${theme}`}>
      <ToastContainer position="top-center" autoClose={2000} />
      <h1>Security Controls</h1>

      <div className="log-controls">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={exportSecurityLog}>
          Export Logs
        </button>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className={`role-select ${u.role}`}
                  >
                    <option value="doctor">Doctor</option>
                    <option value="physio">Physio</option>
                    <option value="dietitian">Dietitian</option>
                    <option value="lab">Lab</option>
                    <option value="phlebotomist">Phlebotomist</option>
                  </select>
                </td>
                <td>
                  <button className="btn btn-primary" onClick={() => confirmAction(u, "reset")}>
                    Reset Password
                  </button>
                  <button className="btn btn-primary" onClick={() => confirmAction(u, "logout")}>
                    Force Logout
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="error-text">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.visible && (
        <div className="modal-overlay" onClick={() => setConfirmModal({ visible: false })}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>
              {confirmModal.action === "reset" ? "Password Reset" : "Force Logout"}
            </h3>
            <p>
              {confirmModal.action === "reset" ? (
                <>
                  Changing password for <strong>{confirmModal.user.name}</strong> (
                  {confirmModal.user.email})
                </>
              ) : (
                <>
                  Are you sure you want to <strong>logout</strong> user ID{" "}
                  {confirmModal.user.id}?
                </>
              )}
            </p>

            {confirmModal.action === "reset" && (
              <>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {newPassword && (
                  <p className="strength-msg">Strength: {getPasswordStrength()}</p>
                )}
              </>
            )}

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setConfirmModal({ visible: false })}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={executeConfirmedAction}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityControls;
