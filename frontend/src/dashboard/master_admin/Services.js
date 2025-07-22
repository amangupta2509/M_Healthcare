import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../ThemeProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./master_admin.css";

const Services = () => {
  const { theme } = useTheme();
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
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
  });

  const API_URL = "http://localhost:8080/api/services";

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (index, value) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, features: updated }));
  };

  const addFeature = () =>
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));

  const removeFeature = (index) => {
    const updated = formData.features.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, features: updated }));
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, banner: url }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingServiceId ? "PUT" : "POST";
    const url = editingServiceId
      ? `${API_URL}/${editingServiceId}`
      : API_URL;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (editingServiceId) {
          setServices((prev) =>
            prev.map((s) => (s.id === editingServiceId ? data : s))
          );
          toast.success("Service updated successfully!");
        } else {
          setServices([...services, data]);
          toast.success("Service added successfully!");
        }
        resetForm();
        setShowForm(false);
      })
      .catch(() => toast.error("Error saving service."));
  };

  const resetForm = () => {
    setFormData({
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
    });
    setEditingServiceId(null);
  };

  const handleDelete = (id) => {
    toast.info(
      <div>
        <p style={{ color: "black" }}>Are you sure you want to delete this service?</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              fetch(`${API_URL}/${id}`, { method: "DELETE" }).then(() => {
                setServices((prev) => prev.filter((s) => s.id !== id));
                toast.dismiss();
                toast.error("Service deleted.");
              });
            }}
          >
            Confirm
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              toast.dismiss();
              toast.info("Deletion cancelled.");
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
  };

  const handleEdit = (service) => {
    setFormData(service);
    setEditingServiceId(service.id);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className={`dashboard-main ${theme}`}>
      <ToastContainer position="top-center" autoClose={3000} />
      <h1>Manage Services</h1>

      <button className="btn btn-primary" onClick={() => {
        setShowForm(!showForm);
        if (!showForm) resetForm();
      }}>
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
          <form onSubmit={handleSubmit} className="card" style={{ marginTop: "20px" }}>
            <label>Service Banner</label>
            <input type="file" accept="image/*" onChange={handleBannerUpload} required />
            {formData.banner && (
              <img src={formData.banner} alt="preview" style={{ maxHeight: "150px", marginTop: "10px" }} />
            )}

            <label>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required />
            <label>Sub-Title</label>
            <input name="subtitle" value={formData.subtitle} onChange={handleChange} required />

            <label>Pricing Options</label>
            <div className="pricing-row">
              <input name="priceMonthly" type="number" placeholder="1 Month" value={formData.priceMonthly} onChange={handleChange} required />
              <input name="priceQuarterly" type="number" placeholder="3 Month" value={formData.priceQuarterly} onChange={handleChange} required />
              <input name="priceYearly" type="number" placeholder="6 Month" value={formData.priceYearly} onChange={handleChange} required />
            </div>

            <label>Rating</label>
            <input name="rating" type="number" step="0.1" max="5" value={formData.rating} onChange={handleChange} required />
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} required />
            <label>Preview Video (YouTube)</label>
            <input name="previewVideo" value={formData.previewVideo} onChange={handleChange} required />

            <label>Program Features</label>
            {formData.features.map((f, i) => (
              <div key={i} className="d-flex">
                <input value={f} onChange={(e) => handleFeatureChange(i, e.target.value)} placeholder={`Feature ${i + 1}`} required />
                {formData.features.length > 1 && (
                  <button type="button" className="btn btn-primary" onClick={() => removeFeature(i)}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-primary" onClick={addFeature}>Add Feature</button>

            <div className="center-btn">
              <button type="submit" className="btn btn-primary">
                {editingServiceId ? "Update Service" : "Submit Service"}
              </button>
            </div>
          </form>
        )}
      </div>

      <h2 style={{ marginTop: "30px" }}>Added Services</h2>
      {services.length === 0 ? (
        <p>No services added</p>
      ) : (
        <div className="blog-grid">
          {services.map((s) => (
            <div key={s.id} className="card blog-card">
              <img src={s.banner} alt="banner" style={{ height: "100px", objectFit: "cover", width: "100%" }} />
              <h3>{s.title}</h3>
              <p><strong>{s.description}</strong></p>
              <p><em>{s.subtitle}</em></p>
              <div className="center-btn">
                <button className="btn btn-primary" onClick={() => setSelectedService(s)}>View</button>
                <button className="btn btn-primary" onClick={() => handleEdit(s)}>Edit</button>
                <button className="btn btn-primary" onClick={() => handleDelete(s.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedService && (
        <div className="modal-overlay" style={{ border: "1px solid #cc5500" }} onClick={() => setSelectedService(null)}>
          <div className="modals-box" style={{ border: "1px solid #cc5500" }} onClick={(e) => e.stopPropagation()}>
            <h2>{selectedService.title}</h2>
            <img src={selectedService.banner} alt="service-banner" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "10px", marginBottom: "20px" }} />

            <table className="popup-table">
              <tbody>
                <tr><td><strong>Sub-Title:</strong></td><td>{selectedService.subtitle}</td></tr>
                <tr><td><strong>1 Month:</strong></td><td>₹{selectedService.priceMonthly}</td></tr>
                <tr><td><strong>3 Month:</strong></td><td>₹{selectedService.priceQuarterly}</td></tr>
                <tr><td><strong>6 Month:</strong></td><td>₹{selectedService.priceYearly}</td></tr>
                <tr><td><strong>Rating:</strong></td><td>{selectedService.rating}</td></tr>
                <tr><td><strong>Description:</strong></td><td>{selectedService.description}</td></tr>
              </tbody>
            </table>

            <iframe
              width="100%"
              height="200"
              src={selectedService.previewVideo.replace("watch?v=", "embed/")}
              title="Preview Video"
              frameBorder="0"
              allowFullScreen
              style={{ margin: "20px 0" }}
            />

            <strong>Program Features:</strong>
            <ul style={{ paddingLeft: "10px" }}>
              {selectedService.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>

            <div className="center-btn" style={{ marginTop: "20px" }}>
              <center><button className="btn btn-primary" onClick={() => setSelectedService(null)}>Close</button></center>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;