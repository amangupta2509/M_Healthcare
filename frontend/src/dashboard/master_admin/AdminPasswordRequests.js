import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./master_admin.css";

const AdminPasswordRequests = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/passwordChangeRequests");
      setRequests(res.data);
    } catch (err) {
      toast.error("Failed to fetch password requests.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:8080/api/passwordChangeRequests/${id}`, {
        status: newStatus,
      });
      toast.success(`Request ${newStatus}`);
      fetchRequests();
    } catch (err) {
      toast.error("Failed to update request.");
    }
  };

  return (
    <div className="table-container">
      <ToastContainer position="top-center" autoClose={2000} />
      <h2>Password Change Requests</h2>
      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>Counselor Name</th>
              <th>Email</th>
              <th>Reason</th>
              <th>Requested At</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.counselorName}</td>
                <td>{req.email}</td>
                <td>{req.reason}</td>
                <td>{new Date(req.requestedAt).toLocaleString()}</td>
                <td>
                  <span
                    className={`status-tag ${
                      req.status === "Pending"
                        ? "pending"
                        : req.status === "Approved"
                        ? "approved"
                        : "rejected"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td>
                  {req.status === "Pending" ? (
                    <>
                      <button
                        className="btn btn-success"
                        onClick={() => updateStatus(req.id, "Approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => updateStatus(req.id, "Rejected")}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <em>Processed</em>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPasswordRequests;
