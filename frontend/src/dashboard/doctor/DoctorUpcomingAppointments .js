import React, { useEffect, useState } from "react";
import { useTheme } from "../../ThemeProvider";
import { Eye } from "lucide-react";
import "../physio/assign.css";

const DoctorUpcomingAppointments = () => {
  const { theme } = useTheme();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("http://localhost:3001/doctorappointments");
        const data = await res.json();
        setAppointments(data);
      } catch (error) {
        console.error("Failed to load appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className={`assign-page ${theme}`}>
      <div className="assign-container">
        <h2 className="section-title">Upcoming Patient Appointments</h2>

        <div className="table-wrapper">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>MRN</th>
                <th>Appointment Date</th>
                <th>Report</th>
                <th>Samples Collected</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt, index) => (
                <tr key={index}>
                  <td data-label="Patient Name">{appt.name}</td>
                  <td data-label="MRN">{appt.mrn}</td>
                  <td data-label="Appointment Date">
                    {new Date(appt.appointmentDate).toLocaleDateString()}
                  </td>
                  <td data-label="Report">
                    <a
                      href={appt.reportPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="report-link"
                    >
                      <Eye size={16} /> View Report
                    </a>
                  </td>
                  <td data-label="Samples Collected">
                    {appt.samples.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
       <style jsx>{`
        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          margin-top: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .appointments-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
          background-color: ${theme === "dark"
            ? "var(--background-secondary, #1a1a1a)"
            : "var(--background-primary, #ffffff)"};
        }

        .appointments-table th,
        .appointments-table td {
          padding: 1rem 0.75rem;
          border-bottom: 1px solid
            ${theme === "dark"
              ? "var(--border-dark, #333)"
              : "var(--border-light, #e0e0e0)"};
          text-align: left;
          vertical-align: middle;
        }

        .appointments-table th {
          background-color: ${theme === "dark"
            ? "var(--accent-dark, #2d2d2d)"
            : "var(--accent-light, #f8f9fa)"};
          color: ${theme === "dark"
            ? "var(--text-primary-dark, #ffffff)"
            : "var(--text-primary-light, #333333)"};
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .appointments-table td {
          color: ${theme === "dark"
            ? "var(--text-secondary-dark, #cccccc)"
            : "var(--text-secondary-light, #666666)"};
          font-size: 0.875rem;
        }

        .appointments-table tr:hover {
          background-color: ${theme === "dark"
            ? "var(--hover-dark, #2a2a2a)"
            : "var(--hover-light, #f5f5f5)"};
          transition: background-color 0.2s ease;
        }

        .report-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: ${theme === "dark"
            ? "var(--primary-dark, #64b5f6)"
            : "var(--primary-light, #1976d2)"};
          font-weight: 500;
          text-decoration: none;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .report-link:hover {
          background-color: ${theme === "dark"
            ? "rgba(100, 181, 246, 0.1)"
            : "rgba(25, 118, 210, 0.1)"};
          text-decoration: none;
        }

        /* Tablet Styles */
        @media (max-width: 1024px) {
          .table-wrapper {
            margin-top: 1rem;
          }

          .appointments-table {
            min-width: 500px;
          }

          .appointments-table th,
          .appointments-table td {
            padding: 0.75rem 0.5rem;
            font-size: 0.8rem;
          }
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .table-wrapper {
            overflow-x: visible;
            box-shadow: none;
          }

          .appointments-table,
          .appointments-table thead,
          .appointments-table tbody,
          .appointments-table th,
          .appointments-table td,
          .appointments-table tr {
            display: block;
          }

          .appointments-table {
            min-width: auto;
            background-color: transparent;
          }

          .appointments-table thead {
            display: none;
          }

          .appointments-table tr {
            margin-bottom: 1rem;
            border: 1px solid
              ${theme === "dark"
                ? "var(--border-dark, #333)"
                : "var(--border-light, #e0e0e0)"};
            border-radius: 8px;
            padding: 1rem;
            background-color: ${theme === "dark"
              ? "var(--background-secondary, #1a1a1a)"
              : "var(--background-primary, #ffffff)"};
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .appointments-table tr:hover {
            background-color: ${theme === "dark"
              ? "var(--hover-dark, #2a2a2a)"
              : "var(--hover-light, #f5f5f5)"};
          }

          .appointments-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid
              ${theme === "dark"
                ? "var(--border-dark, #333)"
                : "var(--border-light, #e0e0e0)"};
            font-size: 0.875rem;
          }

          .appointments-table td:last-child {
            border-bottom: none;
          }

          .appointments-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: ${theme === "dark"
              ? "var(--text-primary-dark, #ffffff)"
              : "var(--text-primary-light, #333333)"};
            width: 40%;
            flex-shrink: 0;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .report-link {
            justify-content: flex-end;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            font-size: 0.8rem;
          }
        }

        /* Small Mobile Styles */
        @media (max-width: 480px) {
          .assign-container {
            padding: 0.5rem;
          }

          .section-title {
            font-size: 1.25rem;
            margin-bottom: 1rem;
          }

          .appointments-table tr {
            padding: 0.75rem;
          }

          .appointments-table td {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
            padding: 0.5rem 0;
          }

          .appointments-table td::before {
            width: 100%;
            margin-bottom: 0.25rem;
          }

          .report-link {
            align-self: flex-end;
            margin-top: 0.25rem;
          }
        }

        /* Large Desktop Styles */
        @media (min-width: 1200px) {
          .appointments-table th,
          .appointments-table td {
            padding: 1.25rem 1rem;
          }

          .appointments-table {
            font-size: 0.9rem;
          }
        }

        /* Print Styles */
        @media print {
          .table-wrapper {
            box-shadow: none;
          }

          .appointments-table {
            border: 1px solid #000;
          }

          .appointments-table th,
          .appointments-table td {
            border: 1px solid #000;
            color: #000;
            background-color: #fff;
          }

          .report-link {
            color: #000;
          }
        }
      `}</style>
    </div>
  );
};

export default DoctorUpcomingAppointments;
