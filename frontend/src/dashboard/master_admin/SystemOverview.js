import React, { useEffect, useState } from "react";
import axios from "axios";
import { Chart } from "react-google-charts";
import { useTheme } from "../../ThemeProvider";
import "./master_admin.css";

const SystemOverview = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    collected: 0,
    processed: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    scheduledSessions: 0,
    completedSessions: 0,
    inProgress: 0,
    resolved: 0,
  });

  const [samples, setSamples] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [physioCharts, setPhysioCharts] = useState([]);
  const [dietCharts, setDietCharts] = useState([]);
  const [labTracking, setLabTracking] = useState([]);

  const fetchStats = async () => {
    try {
      const [
        samplesRes,
        assignmentsRes,
        sessionsRes,
        resolutionsRes,
        physioRes,
        dietRes,
        labRes,
      ] = await Promise.all([
        axios.get("http://localhost:3001/samples"),
        axios.get("http://localhost:3001/assignments"),
        axios.get("http://localhost:3001/sessions"),
        axios.get("http://localhost:3001/resolutions"),
        axios.get("http://localhost:3001/physioCharts"),
        axios.get("http://localhost:3001/dietCharts"),
        axios.get("http://localhost:3001/labTracking"),
      ]);

      const collected = samplesRes.data.filter(
        (s) => s.status === "collected"
      ).length;
      const processed = samplesRes.data.filter(
        (s) => s.status === "processed"
      ).length;

      const pendingAssignments = assignmentsRes.data.filter(
        (a) => a.status === "pending"
      ).length;
      const completedAssignments = assignmentsRes.data.filter(
        (a) => a.status === "completed"
      ).length;

      const scheduledSessions = sessionsRes.data.filter(
        (s) => s.status === "scheduled"
      ).length;
      const completedSessions = sessionsRes.data.filter(
        (s) => s.status === "completed"
      ).length;

      const inProgress = resolutionsRes.data.filter(
        (r) => r.status === "in progress"
      ).length;
      const resolved = resolutionsRes.data.filter(
        (r) => r.status === "resolved"
      ).length;

      setStats({
        collected,
        processed,
        pendingAssignments,
        completedAssignments,
        scheduledSessions,
        completedSessions,
        inProgress,
        resolved,
      });

      setSamples(samplesRes.data);
      setAssignments(assignmentsRes.data);
      setSessions(sessionsRes.data);
      setResolutions(resolutionsRes.data);
      setPhysioCharts(physioRes.data);
      setDietCharts(dietRes.data);
      setLabTracking(labRes.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className={`dashboard-main ${theme}`}>
      <h1>System Overview</h1>

      {/* Summary Cards */}
      <div className="overview-grid">
        <div className="card">
          <h3>Samples</h3>
          <p>Collected: {stats.collected}</p>
          <p>Processed: {stats.processed}</p>
          <div className="mini-table">
            <table>
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Status</th>
                  <th>Phlebotomist</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((s) => (
                  <tr key={s.id}>
                    <td>{s.mrn}</td>
                    <td>{s.status}</td>
                    <td>{s.phlebotomist || "-"}</td>
                    <td>{s.date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Doctor Assignments</h3>
          <p>Pending: {stats.pendingAssignments}</p>
          <p>Completed: {stats.completedAssignments}</p>
          <div className="mini-table">
            <table>
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Status</th>
                  <th>Doctor</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.mrn}</td>
                    <td>{a.status}</td>
                    <td>{a.doctor || "-"}</td>
                    <td>{a.date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Sessions</h3>
          <p>Scheduled: {stats.scheduledSessions}</p>
          <p>Completed: {stats.completedSessions}</p>
          <div className="mini-table">
            <table>
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.mrn}</td>
                    <td>{s.type}</td>
                    <td>{s.status}</td>
                    <td>{s.date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Resolutions</h3>
          <p>In Progress: {stats.inProgress}</p>
          <p>Resolved: {stats.resolved}</p>
          <div className="mini-table">
            <table>
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Status</th>
                  <th>Resolved By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {resolutions.map((r) => (
                  <tr key={r.id}>
                    <td>{r.mrn}</td>
                    <td>{r.status}</td>
                    <td>{r.by || "-"}</td>
                    <td>{r.date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Physio Charts</h3>
          <div className="mini-table">
            <table>
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Current Chart</th>
                  <th>Past Charts</th>
                  <th>Handled By</th>
                  <th>Submitted By</th>
                </tr>
              </thead>
              <tbody>
                {physioCharts.map((entry) => {
                  const latest = entry.charts[entry.charts.length - 1];
                  return (
                    <tr key={entry.id}>
                      <td>{entry.mrn}</td>
                      <td>
                        {latest.chartNumber} - {latest.chartName}
                      </td>
                      <td>
                        <details>
                          <summary
                            style={{
                              cursor: "pointer",
                              color: "var(--text-primary)",
                            }}
                          >
                            View Chart History
                          </summary>
                          <ul style={{ paddingLeft: "1rem" }}>
                            {entry.charts
                              .slice(0, -1)
                              .reverse()
                              .map((c, idx) => (
                                <li key={idx}>
                                  {c.chartNumber} - {c.chartName} 
                                </li>
                              ))}
                          </ul>
                        </details>
                      </td>
                      <td>{entry.handlerName || "-"}</td>
                      <td>{entry.submittedByDoctor || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Dietitian Charts</h3>
          <div className="mini-table">
            <table>
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Current Chart</th>
                  <th>Past Charts</th>
                  <th>Handled By</th>
                  <th>Submitted By</th>
                </tr>
              </thead>
              <tbody>
                {dietCharts.map((entry) => {
                  const chartList = entry.charts || [];
                  const latest = chartList[chartList.length - 1];

                  return (
                    <tr key={entry.id}>
                      <td>{entry.mrn}</td>
                      <td>
                        {latest
                          ? `${latest.chartNumber} - ${latest.chartName}`
                          : "-"}
                      </td>
                      <td>
                        <details>
                          <summary
                            style={{
                              cursor: "pointer",
                              color: "var(--text-primary)",
                            }}
                          >
                            View Chart History
                          </summary>
                          <ul style={{ paddingLeft: "1rem" }}>
                            {entry.charts
                              .slice(0, -1) // exclude the current one
                              .reverse()
                              .map((c, idx) => (
                                <li key={idx}>
                                  {c.chartNumber} - {c.chartName} (
                                  {c.dateAssigned})
                                </li>
                              ))}
                          </ul>
                        </details>
                      </td>

                      <td>{entry.handlerName || "-"}</td>
                      <td>{entry.submittedByDoctor || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Lab Tracking</h3>
          <div className="mini-table">
            <table>
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Submitted By</th>
                  <th>Submitted Date</th>
                  <th>Handled By</th>
                  <th>Report Date</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {labTracking.map((l) => (
                  <tr key={l.id}>
                    <td>{l.mrn}</td>
                    <td>{l.submittedBy}</td>
                    <td>{l.submittedDate}</td>
                    <td>{l.handledBy}</td>
                    <td>{l.reportGivenDate}</td>
                    <td>
                      {l.reportFile ? (
                        <a
                          href={l.reportFile}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Report
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="card">
          <h3>Resolution Status</h3>
          <Chart
            chartType="ColumnChart"
            data={[
              ["Status", "Count", { role: "style" }],
              ["In Progress", stats.inProgress, "#f1c40f"],
              ["Resolved", stats.resolved, "#3498db"],
            ]}
            options={{
              backgroundColor: "transparent",
              legend: "none",
              titleTextStyle: { color: "var(--text-primary)", fontSize: 18 },
              vAxis: { textStyle: { color: "var(--text-primary)" } },
              hAxis: { textStyle: { color: "var(--text-primary)" } },
            }}
            width="100%"
            height="300px"
          />
        </div>

        <div className="card">
          <h3>Doctor Assignments</h3>
          <Chart
            chartType="BarChart"
            data={[
              ["Status", "Count", { role: "style" }],
              ["Pending", stats.pendingAssignments, "#e67e22"],
              ["Completed", stats.completedAssignments, "#2ecc71"],
            ]}
            options={{
              backgroundColor: "transparent",
              legend: "none",
              titleTextStyle: { color: "var(--text-primary)", fontSize: 18 },
              hAxis: { textStyle: { color: "var(--text-primary)" } },
              vAxis: { textStyle: { color: "var(--text-primary)" } },
            }}
            width="100%"
            height="300px"
          />  
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;