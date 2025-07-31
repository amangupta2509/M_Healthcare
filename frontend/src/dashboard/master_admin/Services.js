"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../ThemeProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./master_admin.css";

// API functions - easier to mock for testing
const createApiService = (apiUrl = "http://localhost:8080/api/services") => ({
  fetchServices: async () => {
    const response = await fetch(apiUrl);
    return response.json();
  },

  createService: async (serviceData) => {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData),
    });
    return response.json();
  },

  updateService: async (id, serviceData) => {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData),
    });
    return response.json();
  },

  deleteService: async (id) => {
    return fetch(`${apiUrl}/${id}`, { method: "DELETE" });
  },
});

// Toast utility functions - easier to test
const toastUtils = {
  showSuccess: (message) => toast.success(message),
  showError: (message) => toast.error(message),
  showInfo: (message) => toast.info(message),
  showConfirmation: (message, onConfirm, onCancel) => {
    toast.info(
      <div>
        <p style={{ color: "black" }}>{message}</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              onConfirm();
              toast.dismiss();
            }}
          >
            Confirm
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              toast.dismiss();
              if (onCancel) onCancel();
              else toastUtils.showInfo("Deletion cancelled.");
            }}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  },
};

// Form utilities - pure functions for easier testing
const formUtils = {
  getInitialFormData: () => ({
    banner: "",
    title: "",
    subtitle: "",
    priceMonthly: "",
    priceQuarterly: "",
    priceYearly: "",
    rating: "",
    description: "",
    previewVideo: "",
    features: [""],
  }),

  handleInputChange: (formData, name, value) => ({
    ...formData,
    [name]: value,
  }),

  handleFeatureChange: (formData, index, value) => {
    const updated = [...formData.features];
    updated[index] = value;
    return { ...formData, features: updated };
  },

  addFeature: (formData) => ({
    ...formData,
    features: [...formData.features, ""],
  }),

  removeFeature: (formData, index) => ({
    ...formData,
    features: formData.features.filter((_, i) => i !== index),
  }),

  handleBannerUpload: (formData, file) => ({
    ...formData,
    banner: URL.createObjectURL(file),
  }),
};

// Custom hook for services data - easier to test
const useServices = (apiService) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await apiService.fetchServices();
      setServices(data);
      setError(null);
    } catch (err) {
      setError("Error fetching services");
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const addService = async (serviceData) => {
    const newService = await apiService.createService(serviceData);
    setServices((prev) => [...prev, newService]);
    return newService;
  };

  const editService = async (id, serviceData) => {
    const updatedService = await apiService.updateService(id, serviceData);
    setServices((prev) => prev.map((s) => (s.id === id ? updatedService : s)));
    return updatedService;
  };

  const removeService = async (id) => {
    await apiService.deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    addService,
    editService,
    removeService,
    refetch: fetchServices,
  };
};

// Custom hook for form state - easier to test
const useServiceForm = () => {
  const [formData, setFormData] = useState(formUtils.getInitialFormData());
  const [editingServiceId, setEditingServiceId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => formUtils.handleInputChange(prev, name, value));
  };

  const handleFeatureChange = (index, value) => {
    setFormData((prev) => formUtils.handleFeatureChange(prev, index, value));
  };

  const addFeature = () => {
    setFormData((prev) => formUtils.addFeature(prev));
  };

  const removeFeature = (index) => {
    setFormData((prev) => formUtils.removeFeature(prev, index));
  };

  const handleBannerUpload = (file) => {
    setFormData((prev) => formUtils.handleBannerUpload(prev, file));
  };

  const resetForm = () => {
    setFormData(formUtils.getInitialFormData());
    setEditingServiceId(null);
  };

  const setEditingService = (service) => {
    setFormData(service);
    setEditingServiceId(service.id);
  };

  return {
    formData,
    editingServiceId,
    handleChange,
    handleFeatureChange,
    addFeature,
    removeFeature,
    handleBannerUpload,
    resetForm,
    setEditingService,
  };
};

// ServiceForm component - easier to test in isolation
const ServiceForm = ({
  formData,
  editingServiceId,
  onSubmit,
  onChange,
  onFeatureChange,
  onAddFeature,
  onRemoveFeature,
  onBannerUpload,
}) => (
  <form onSubmit={onSubmit} className="card" style={{ marginTop: "20px" }}>
    <label htmlFor="banner">Service Banner</label>
    <input
      id="banner"
      type="file"
      accept="image/*"
      onChange={onBannerUpload}
      required
    />
    {formData.banner && (
      <img
        src={formData.banner || "/placeholder.svg"}
        alt="preview"
        style={{ maxHeight: "150px", marginTop: "10px" }}
      />
    )}

    <label htmlFor="title">Title</label>
    <input
      id="title"
      name="title"
      value={formData.title}
      onChange={onChange}
      required
    />

    <label htmlFor="subtitle">Sub-Title</label>
    <input
      id="subtitle"
      name="subtitle"
      value={formData.subtitle}
      onChange={onChange}
      required
    />

    <label htmlFor="priceMonthly">Pricing Options</label>
    <div className="pricing-row">
      <input
        id="priceMonthly"
        name="priceMonthly"
        type="number"
        placeholder="1 Month"
        value={formData.priceMonthly}
        onChange={onChange}
        required
      />
      <input
        id="priceQuarterly"
        name="priceQuarterly"
        type="number"
        placeholder="3 Month"
        value={formData.priceQuarterly}
        onChange={onChange}
        required
      />
      <input
        id="priceYearly"
        name="priceYearly"
        type="number"
        placeholder="6 Month"
        value={formData.priceYearly}
        onChange={onChange}
        required
      />
    </div>

    <label htmlFor="rating">Rating</label>
    <input
      id="rating"
      name="rating"
      type="number"
      step="0.1"
      max="5"
      value={formData.rating}
      onChange={onChange}
      required
    />

    <label htmlFor="description">Description</label>
    <textarea
      id="description"
      name="description"
      value={formData.description}
      onChange={onChange}
      rows={4}
      required
    />

    <label htmlFor="previewVideo">Preview Video (YouTube)</label>
    <input
      id="previewVideo"
      name="previewVideo"
      value={formData.previewVideo}
      onChange={onChange}
      required
    />

    <label>Program Features</label>
    {formData.features.map((f, i) => (
      <div key={i} className="d-flex">
        <input
          id={`feature-${i}`}
          value={f}
          onChange={(e) => onFeatureChange(i, e.target.value)}
          placeholder={`Feature ${i + 1}`}
          required
        />
        {formData.features.length > 1 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onRemoveFeature(i)}
          >
            Remove
          </button>
        )}
      </div>
    ))}
    <button type="button" className="btn btn-primary" onClick={onAddFeature}>
      Add Feature
    </button>

    <div className="center-btn">
      <button type="submit" className="btn btn-primary">
        {editingServiceId ? "Update Service" : "Submit Service"}
      </button>
    </div>
  </form>
);

// ServiceCard component - easier to test in isolation
const ServiceCard = ({ service, onView, onEdit, onDelete }) => (
  <div className="card blog-card">
    <img
      src={service.banner || "/placeholder.svg"}
      alt="banner"
      style={{ height: "100px", objectFit: "cover", width: "100%" }}
    />
    <h3>{service.title}</h3>
    <p>
      <strong>{service.description}</strong>
    </p>
    <p>
      <em>{service.subtitle}</em>
    </p>
    <div className="center-btn">
      <button className="btn btn-primary" onClick={() => onView(service)}>
        View
      </button>
      <button className="btn btn-primary" onClick={() => onEdit(service)}>
        Edit
      </button>
      <button className="btn btn-primary" onClick={() => onDelete(service.id)}>
        Delete
      </button>
    </div>
  </div>
);

// ServiceModal component - easier to test in isolation
const ServiceModal = ({ service, onClose }) => {
  if (!service) return null;

  return (
    <div
      className="modal-overlay"
      style={{ border: "1px solid #cc5500" }}
      onClick={onClose}
    >
      <div
        className="modals-box"
        style={{ border: "1px solid #cc5500" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{service.title}</h2>
        <img
          src={service.banner || "/placeholder.svg"}
          alt="service-banner"
          style={{
            width: "100%",
            maxHeight: "200px",
            objectFit: "cover",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        />
        <table className="popup-table">
          <tbody>
            <tr>
              <td>
                <strong>Sub-Title:</strong>
              </td>
              <td>{service.subtitle}</td>
            </tr>
            <tr>
              <td>
                <strong>1 Month:</strong>
              </td>
              <td>₹{service.priceMonthly}</td>
            </tr>
            <tr>
              <td>
                <strong>3 Month:</strong>
              </td>
              <td>₹{service.priceQuarterly}</td>
            </tr>
            <tr>
              <td>
                <strong>6 Month:</strong>
              </td>
              <td>₹{service.priceYearly}</td>
            </tr>
            <tr>
              <td>
                <strong>Rating:</strong>
              </td>
              <td>{service.rating}</td>
            </tr>
            <tr>
              <td>
                <strong>Description:</strong>
              </td>
              <td>{service.description}</td>
            </tr>
          </tbody>
        </table>
        <iframe
          width="100%"
          height="200"
          src={service.previewVideo.replace("watch?v=", "embed/")}
          title="Preview Video"
          frameBorder="0"
          allowFullScreen
          style={{ margin: "20px 0" }}
        />
        <strong>Program Features:</strong>
        <ul style={{ paddingLeft: "10px" }}>
          {service.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <div className="center-btn" style={{ marginTop: "20px" }}>
          <center>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </center>
        </div>
      </div>
    </div>
  );
};

// Main Services component
const Services = ({ apiUrl } = {}) => {
  const { theme } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const formRef = useRef(null);

  // Initialize API service
  const apiService = createApiService(apiUrl);

  // Use custom hooks
  const { services, addService, editService, removeService } =
    useServices(apiService);
  const {
    formData,
    editingServiceId,
    handleChange,
    handleFeatureChange,
    addFeature,
    removeFeature,
    handleBannerUpload,
    resetForm,
    setEditingService,
  } = useServiceForm();

  // Event handlers - now pure functions that are easier to test
  const handleBannerUploadWrapper = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleBannerUpload(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingServiceId) {
        await editService(editingServiceId, formData);
        toastUtils.showSuccess("Service updated successfully!");
      } else {
        await addService(formData);
        toastUtils.showSuccess("Service added successfully!");
      }
      resetForm();
      setShowForm(false);
    } catch (error) {
      toastUtils.showError("Error saving service.");
    }
  };

  const handleDelete = (id) => {
    toastUtils.showConfirmation(
      "Are you sure you want to delete this service?",
      async () => {
        try {
          await removeService(id);
          toastUtils.showError("Service deleted.");
        } catch (error) {
          toastUtils.showError("Error deleting service.");
        }
      }
    );
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleToggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) resetForm();
  };

  return (
    <div className={`dashboard-main ${theme}`}>
      <ToastContainer position="top-center" autoClose={3000} />
      <h1>Manage Services</h1>

      <button className="btn btn-primary" onClick={handleToggleForm}>
        {showForm ? "Close Form" : "Add Service"}
      </button>

      <div
        ref={formRef}
        style={{
          maxHeight: showForm ? "2000px" : "0",
          overflow: "hidden",
          transition: "max-height 0.5s ease-in-out",
        }}
      >
        {showForm && (
          <ServiceForm
            formData={formData}
            editingServiceId={editingServiceId}
            onSubmit={handleSubmit}
            onChange={handleChange}
            onFeatureChange={handleFeatureChange}
            onAddFeature={addFeature}
            onRemoveFeature={removeFeature}
            onBannerUpload={handleBannerUploadWrapper}
          />
        )}
      </div>

      <h2 style={{ marginTop: "30px" }}>Added Services</h2>
      {services.length === 0 ? (
        <p>No services added</p>
      ) : (
        <div className="blog-grid">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onView={setSelectedService}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
};

export default Services;

// Export utilities for testing
export {
  createApiService,
  toastUtils,
  formUtils,
  useServices,
  useServiceForm,
  ServiceForm,
  ServiceCard,
  ServiceModal,
};
