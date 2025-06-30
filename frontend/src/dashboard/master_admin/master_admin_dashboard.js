import React, { useEffect, useState } from "react";
import { useTheme } from "../../ThemeProvider";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";
import { FiChevronDown, FiChevronUp, FiDownload } from "react-icons/fi";

import "./master_admin.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF"];

const ChartBox = ({ title, children, exportData }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleExport = () => {
    if (!exportData || exportData.length === 0) return;
    const keys = Object.keys(exportData[0]);
    const csv = [
      keys.join(","),
      ...exportData.map((row) => keys.map((k) => row[k]).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/\s+/g, "_")}.csv`;
    link.click();
  };

  return (
    <div className="chart-box">
      <div className="chart-header">
        <h3>{title}</h3>
        <div className="chart-actions">
          {exportData && (
            <FiDownload
              className="icon-btn"
              onClick={handleExport}
              title="Export to CSV"
            />
          )}
          {collapsed ? (
            <FiChevronDown
              className="icon-btn"
              onClick={() => setCollapsed(false)}
              title="Expand"
            />
          ) : (
            <FiChevronUp
              className="icon-btn"
              onClick={() => setCollapsed(true)}
              title="Collapse"
            />
          )}
        </div>
      </div>
      {!collapsed && children}
    </div>
  );
};

const BasicPage = () => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/dashboardMetrics")
      .then((res) => setMetrics(res.data));
  }, []);

  if (!metrics)
    return (
      <div className={`app ${theme}`}>
        <p>Loading dashboard metrics...</p>
      </div>
    );

  return (
    <div className={`app ${theme}`}>
      <div className="dashboard-main">
        <h1>Master Admin Dashboard</h1>

        {/* Small, responsive, wrapping role cards */}
        <div
          className="dashboard-cards"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "flex-start",
            marginBottom: "20px",
          }}
        >
          {metrics.roleCounts.map((r, i) => (
            <div className="card"
              key={i}
              style={{
                padding: "12px",
                minWidth: "246px",
                maxWidth: "160px",
                border: "1px solid #cc5500",
                backgroundColor: "transparent",
                textAlign: "center",
                fontSize: "20px",
                borderRadius: "8px",
                flex: "0 0 auto",
              }}
            >
              <h4 style={{ margin: 0, color: "#cc5500" }}>{r.role}</h4>
              <p style={{ fontSize: "20px", margin: "6px 0" }}>{r.count} Registered</p>
            </div>
          ))}
        </div>

        <div className="dashboard-charts">
          {/* Appointments Status */}
          <div className="col card">
            <ChartBox
              title="Appointments Status"
              exportData={metrics.appointmentsStatus}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.appointmentsStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#82ca9d" />
                  <Bar dataKey="pending" stackId="a" fill="#ffbb28" />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>

          {/* Daily Appointment Trends */}
          <div className="col card">
            <ChartBox
              title="Daily Appointment Trends"
              exportData={metrics.dailyAppointments}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.dailyAppointments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(metrics.dailyAppointments[0])
                    .filter((k) => k !== "date")
                    .map((key, i) => (
                      <Line
                        key={i}
                        type="monotone"
                        dataKey={key}
                        stroke={COLORS[i % COLORS.length]}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>

          {/* Top Doctors */}
          <div className="col card">
            <ChartBox
              title="Top 5 Busiest Doctors"
              exportData={metrics.topDoctors}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.topDoctors} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#cc5500" />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>

          {/* Report Contributions */}
          <div className="col card">
            <ChartBox
              title="Report Contributions"
              exportData={metrics.reportContributions}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.reportContributions}
                    dataKey="value"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {metrics.reportContributions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>

          {/* Patient-to-Role Ratio */}
          <div className="col card">
            <ChartBox
              title="Patient-to-Role Ratio"
              exportData={metrics.roleAssignment}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.roleAssignment}
                    dataKey="patients"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {metrics.roleAssignment.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicPage;