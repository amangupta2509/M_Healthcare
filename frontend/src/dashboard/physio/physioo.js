import React, { useState, useEffect, useCallback } from "react";
import { Chart } from "react-google-charts";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./physio.css";

const Physioo = () => {
  const [searchMRN, setSearchMRN] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartOptions, setChartOptions] = useState({});
  const navigate = useNavigate();

  // Function to get current theme-based chart options
  const getChartOptions = useCallback(() => {
    const computed = getComputedStyle(document.body);
    
    const textColor = computed.getPropertyValue("--text-primary").trim() || "#1a1a1a";
    const bgColor = computed.getPropertyValue("--bg-primary").trim() || "#ffffff";

    return {
      title: "User Distribution",
      is3D: true,
      slices: { 0: { offset: 0.05 } },
      colors: ["#36A2EB", "#FF6384"],
      titleTextStyle: {
        fontSize: 18,
        bold: true,
        color: textColor,
      },
      legend: {
        position: "bottom",
        textStyle: {
          color: textColor,
          fontSize: 13,
        },
      },
      pieSliceText: "value",
      pieSliceTextStyle: {
        color: "#ffffff",
        fontSize: 14,
        bold: true,
      },
      backgroundColor: "transparent",
      chartArea: { width: "90%", height: "80%" },
      tooltip: {
        textStyle: { color: textColor },
        backgroundColor: bgColor,
      },
    };
  }, []);

  // Update chart options whenever theme changes
  useEffect(() => {
    const updateChartOptions = () => {
      setChartOptions(getChartOptions());
    };

    // Initialize chart options
    updateChartOptions();

    // Observe data-theme attribute changes on <body>
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateChartOptions();
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateChartOptions);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", updateChartOptions);
    };
  }, [getChartOptions]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/users");
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchMRN.trim()) {
      setFilteredUsers(users);
      return;
    }

    const result = users.filter((user) =>
      user.mrn.toLowerCase().includes(searchMRN.toLowerCase())
    );
    setFilteredUsers(result);
  };

  const handleViewUser = (userId) => {
    navigate(`/user-details/${userId}`);
  };

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
    <div className="physio-container">
      <h2>User and Subscribers Statistics</h2>

      <div className="physio-header">
        <div className="chart-container">
          <div className="card piechart">
            <Chart
              chartType="PieChart"
              data={[
                ["Metric", "Count"],
                ["Total Users", users.length],
                ["Total Subscribers", users.length],
              ]}
              options={chartOptions}
              width="100%"
              height="300px"
            />
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Enter MRN ID"
            value={searchMRN}
            onChange={(e) => setSearchMRN(e.target.value.toUpperCase())}
            className="search-input"
          />
          <button
            onClick={handleSearch}
            className="btn btn-primary search-button"
          >
            Search
          </button>
        </div>
      </div>

      <div className="card user-details">
        <h3 className="section-title">Client Details</h3>
        <div className="table-responsive">
          <table className="user-table">
            <thead>
              <tr>
                <th>MRN ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Product</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.mrn}>
                    <td>{user.mrn}</td>
                    <td>{user.name}</td>
                    <td>{user.gender}</td>
                    <td>{user.product}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleViewUser(user.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Physioo;