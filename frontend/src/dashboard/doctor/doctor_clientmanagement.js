import React, { useState, useEffect } from "react";
import { useTheme } from "../../ThemeProvider";
import axios from "axios";
import "../physio/clientManagement.css";

export default function ClientManagement() {
  const { theme } = useTheme();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "Active",
    type: "Client",
    resolution: "In Progress",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:3001/clients");
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (client = null, index = null) => {
    if (client) {
      setFormData({
        ...client,
        type: client.type || "Client",
        resolution: client.resolution || "In Progress",
      });
      setEditIndex(index);
    } else {
      setFormData({
        name: "",
        email: "",
        status: "Active",
        type: "Client",
        resolution: "In Progress",
      });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (editIndex !== null) {
        const updatedClient = {
          ...formData,
          avatar: clients[editIndex].avatar,
        };
        await axios.put(
          `http://localhost:3001/clients/${clients[editIndex].id}`,
          updatedClient
        );
        const updated = [...clients];
        updated[editIndex] = updatedClient;
        setClients(updated);
      } else {
        const newClient = {
          ...formData,
          avatar: `https://i.pravatar.cc/150?img=${clients.length + 6}`,
        };
        const response = await axios.post(
          "http://localhost:3001/clients",
          newClient
        );
        setClients([...clients, response.data]);
      }
      closeModal();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleDelete = async (index) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        const clientId = clients[index].id;
        await axios.delete(`http://localhost:3001/clients/${clientId}`);
        const updated = [...clients];
        updated.splice(index, 1);
        setClients(updated);
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  const markAsResolved = async (index) => {
    try {
      const updatedClient = {
        ...clients[index],
        resolution: "Resolved",
      };
      await axios.put(
        `http://localhost:3001/clients/${clients[index].id}`,
        updatedClient
      );
      const updated = [...clients];
      updated[index] = updatedClient;
      setClients(updated);
    } catch (error) {
      console.error("Error updating resolution status:", error);
    }
  };

  const filteredClients = clients.filter((client) => {
    // Filter by search term
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by status button
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "IN PROGRESS" && client.resolution === "In Progress") ||
      (activeFilter === "RESOLVED" && client.resolution === "Resolved");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`client-page ${theme}`}>
      <div className="client-container">
        <div className="client-header">
          <h2>Client Management</h2>
          <div className="client-controls">
            {/* <div className="search-container">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div> */}
            <div className="filter-buttons">
              <button
                className={`filter-btn ${
                  activeFilter === "ALL" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("ALL")}
              >
                ALL
              </button>
              <button
                className={`filter-btn ${
                  activeFilter === "IN PROGRESS" ? "active in-progress" : ""
                }`}
                onClick={() => handleFilterChange("IN PROGRESS")}
              >
                In Progress
              </button>
              <button
                className={`filter-btn ${
                  activeFilter === "RESOLVED" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("RESOLVED")}
              >
                Resolved
              </button>
            </div>
            <div className="action-buttons-right">
              <button
                className="add-consultant-btn"
                onClick={() => {
                  setFormData({
                    name: "",
                    email: "",
                    status: "Active",
                    type: "Consultant",
                    resolution: "In Progress",
                  });
                  setShowModal(true);
                }}
              >
                Add Consultant
              </button>
              <button className="add-btn" onClick={() => openModal()}>
                <span className="btn-icon">+</span> Add Client
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <p>Loading clients...</p>
          ) : filteredClients.length > 0 ? (
            <table
              className="client-table"
              style={{ border: "1px solid #cc5500" }}
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="hide-sm">Email</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Resolution</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, i) => (
                  <tr key={client.id}>
                    <td className="client-name-cell">
                      <div className="client-info">
                        <img
                          src={client.avatar}
                          alt={client.name}
                          className="avatar"
                        />
                        <div className="client-details">
                          <span className="client-name">{client.name}</span>
                          <span className="client-email-mobile">
                            {client.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="hide-sm">{client.email}</td>
                    <td>
                      <span
                        className={`status-badge ${client.status.toLowerCase()}`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`type-badge ${(
                          client.type || "Client"
                        ).toLowerCase()}`}
                      >
                        {client.type || "Client"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`resolution-badge ${(
                          client.resolution || "In Progress"
                        )
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {client.resolution || "In Progress"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => openModal(client, i)}
                        >
                          <span className="btn-text">Edit</span>
                        </button>
                        {client.resolution !== "Resolved" && (
                          <button
                            className="resolve-btn"
                            onClick={() => markAsResolved(i)}
                          >
                            <span className="btn-text">Mark as Resolved</span>
                          </button>
                        )}
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(i)}
                        >
                          <span className="btn-text">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <p>No clients found matching your search.</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {editIndex !== null
                    ? "Edit Client"
                    : `Add New ${formData.type}`}
                </h3>
                <button className="close-modal" onClick={closeModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder={`Enter ${formData.type.toLowerCase()} name`}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder={`Enter ${formData.type.toLowerCase()} email`}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="Client">Client</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="resolution">Resolution Status</label>
                  <select
                    id="resolution"
                    name="resolution"
                    value={formData.resolution}
                    onChange={handleInputChange}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
