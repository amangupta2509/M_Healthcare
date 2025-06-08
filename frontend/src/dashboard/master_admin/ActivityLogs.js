import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "../../ThemeProvider";
import "react-toastify/dist/ReactToastify.css";
import "./master_admin.css";

const ActivityLogs = () => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/activityLogs");
        const sorted = res.data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setLogs(sorted);
      } catch (err) {
        console.error("Error fetching logs:", err);
        toast.error("Failed to fetch activity logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const isWithinDateRange = (timestamp) => {
    const ts = new Date(timestamp);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && ts < start) return false;
    if (end && ts > end) return false;
    return true;
  };

  const filtered = logs.filter((log) => {
    const matchSearch =
      log.mrn?.toLowerCase().includes(search.toLowerCase()) ||
      log.actor?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter
      ? log.actor?.toLowerCase().includes(roleFilter.toLowerCase())
      : true;
    return matchSearch && matchRole && isWithinDateRange(log.timestamp);
  });

  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const exportCSV = () => {
    const headers = ["Timestamp", "Actor", "MRN", "Action"];
    const rows = filtered.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.actor,
      log.mrn,
      log.action,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "activity_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully!");
  };

  const handleReset = () => {
    setSearch("");
    setRoleFilter("");
    setStartDate("");
    setEndDate("");
  };

  const actionClass = (action) => {
    const act = action?.toLowerCase() || "";
    if (act.includes("create")) return "badge-green";
    if (act.includes("update")) return "badge-yellow";
    if (act.includes("delete")) return "badge-red";
    return "badge-blue";
  };

  const highlightText = (text, keyword) => {
    if (!keyword || !text) return text;
    const parts = text.split(new RegExp(`(${keyword})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? <mark key={i}>{part}</mark> : part
    );
  };

  return (
    <div className={`dashboard-main ${theme}`}>
      <ToastContainer position="top-center" autoClose={2000} />
      <h1>Activity Logs</h1>

      <div className="log-controls">
        <input
          type="text"
          placeholder="Search by MRN, role, or action"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="doctor">Doctor</option>
          <option value="physio">Physio</option>
          <option value="dietitian">Dietitian</option>
          <option value="phlebotomist">Phlebotomist</option>
          <option value="lab">Lab</option>
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button className="btn btn-primary" onClick={handleReset}>Reset Filters</button>
        <button className="btn btn-primary" onClick={exportCSV}>Export to CSV</button>
      </div>

      {loading ? (
        <p className="loading-text">Loading activity logs...</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="appointments-table activity-log-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>MRN</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`role-badge badge-${log.actor?.toLowerCase()}`}>
                        {log.actor?.toUpperCase()}
                      </span>
                    </td>
                    <td>{highlightText(log.mrn, search)}</td>
                    <td>
                      <span className={`status-badge ${actionClass(log.action)}`}>
                        {highlightText(log.action, search)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="error-text">No logs found.</p>}
          </div>

          <p className="pagination-info">
            Showing {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, filtered.length)} of {filtered.length} logs
          </p>

          {filtered.length > itemsPerPage && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>
              <span>Page {page}</span>
              <button
                className="btn btn-secondary"
                disabled={page * itemsPerPage >= filtered.length}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityLogs;
