import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../physio/userDetails.css";

const UserDetails = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState({
    clientName: "",
    mrnId: "",
    days: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(null); // will be set dynamically

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const userResponse = await axios.get(
          `http://localhost:3001/users/${userId}`
        );

        const fitnessResponse = await axios.get(
          `http://localhost:3001/fitnessJourney?userId=${userId}`
        );

        if (fitnessResponse.data && fitnessResponse.data.length > 0) {
          const fitnessData = fitnessResponse.data[0];

          setUserData({
            ...fitnessData,
            clientName: userResponse.data?.name || "Unknown User",
            mrnId: userResponse.data?.mrn || "Unknown MRN",
          });

          // Set default viewMode to first available day
          if (fitnessData.days?.length > 0) {
            setViewMode(fitnessData.days[0].day);
          } else {
            setViewMode("all");
          }
        } else {
          setError("No fitness journey data found for this user");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load user or fitness journey data");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      setError("No user ID provided");
      setLoading(false);
    }
  }, [userId]);

  const renderSessionStatus = (status) => {
    const statusMapping = {
      Completed: { color: "#4CAF50", label: "Completed" },
      Missed: { color: "#F44336", label: "Missed" },
      Partial: { color: "#FFC107", label: "Partial" },
    };

    const { color, label } = statusMapping[status] || {};
    return (
      <span className="status-indicator">
        <span className="status-dot" style={{ backgroundColor: color }}></span>
        <span className="status-text">{label}</span>
      </span>
    );
  };

  const handleDaySelect = (dayValue) => {
    if (dayValue === "all") {
      setViewMode("all");
    } else {
      setViewMode(Number(dayValue));
    }
  };

  const renderDayCard = (day) => (
    <div key={day.day} className="card day-card">
      <h4>DAY {day.day}</h4>

      <div className="exercise-section">
        <h5>Yoga Exercises</h5>
        <div className="table-responsive">
          <table className="followup-table">
            <thead>
              <tr>
                <th>Yoga</th>
                <th>Times</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {day.yoga?.length > 0 ? (
                day.yoga.map((exercise, index) => (
                  <tr key={index}>
                    <td>{exercise.name}</td>
                    <td>{exercise.times}</td>
                    <td>{renderSessionStatus(exercise.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No yoga exercises found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="exercise-section">
        <h5>Resistance Training</h5>
        <div className="table-responsive">
          <table className="followup-table">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Times</th>
                <th>Missed</th>
              </tr>
            </thead>
            <tbody>
              {day.resistanceTraining?.length > 0 ? (
                day.resistanceTraining.map((exercise, index) => (
                  <tr key={index}>
                    <td>{exercise.name}</td>
                    <td>{exercise.times}</td>
                    <td className={exercise.missed ? "missed" : "completed"}>
                      {exercise.missed ? "Yes" : "No"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No resistance training exercises found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="content-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="fitness-journey">
        <div className="card user-info-card">
          <h2>Fitness Journey Schedule</h2>

          <div className="day-selector">
            <label htmlFor="day-select">View Day: </label>
            <select
              id="day-select"
              value={viewMode}
              onChange={(e) => handleDaySelect(e.target.value)}
            >
              <option value="all">All Days</option>
              {userData.days?.map((day) => (
                <option key={day.day} value={day.day}>
                  Day {day.day}
                </option>
              ))}
            </select>
          </div>
        </div>

        {userData.days?.length > 0 ? (
          viewMode === "all" ? (
            userData.days.map((day) => renderDayCard(day))
          ) : (
            renderDayCard(userData.days.find((day) => day.day === viewMode))
          )
        ) : (
          <div className="card">
            <p>No fitness journey data available for this user.</p>
          </div>
        )}

        <div className="card notes-section">
          <h5>Notes</h5>
          <ul>
            <li>Select a suitable weight of choice.</li>
            <li>Progress slowly.</li>
            <li>
              <strong>Take rest for 30–60 seconds between sets.</strong>
            </li>
            <li>Journal any difficulty faced in completing the session.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
