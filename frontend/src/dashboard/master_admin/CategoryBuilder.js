import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../master_admin/master_admin.css";

const CategoryBuilder = () => {
  const API_URL = "http://localhost:3001/categories";

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [subCategoryInput, setSubCategoryInput] = useState({ name: "", heading: "" });
  const [groupInput, setGroupInput] = useState("");

  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [selectedSubCategoryIndex, setSelectedSubCategoryIndex] = useState(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);

  const [newTrait, setNewTrait] = useState({ label: "" });
  const [newTraitFeature, setNewTraitFeature] = useState({ label: "" });
  const [newFeature, setNewFeature] = useState({ label: "" });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);

  // Fetch categories from json-server
  useEffect(() => {
    axios.get(API_URL)
      .then(res => setCategories(res.data))
      .catch(err => {
        console.error("Failed to load categories", err);
        toast.error("Failed to load categories", { position: "top-center" });
      });
  }, []);

  const addCategory = () => {
    if (!newCategory.trim()) return;
    const newEntry = { name: newCategory, subCategories: [] };

    axios.post(API_URL, newEntry)
      .then(res => {
        setCategories([...categories, res.data]);
        toast.info("Category added successfully!", { position: "top-center" });
        setNewCategory("");
      })
      .catch(err => {
        console.error("Add category failed", err);
        toast.error("Failed to add category", { position: "top-center" });
      });
  };

  const updateCategory = (updatedCategory, index) => {
    const id = categories[index]?.id;
    if (!id) return;
    return axios.put(`${API_URL}/${id}`, updatedCategory);
  };

  const handleSubmit = () => {
    Promise.all(categories.map((cat, idx) => updateCategory(cat, idx)))
      .then(() => {
        toast.success("Report Template Created Successfully!", { position: "top-center" });
        setIsSubmitted(true);
      })
      .catch(err => {
        console.error("Submit error", err);
        toast.error("Submission failed", { position: "top-center" });
      });
  };

  const addSubCategory = () => {
    if (selectedCategoryIndex === null || !subCategoryInput.name.trim()) return;
    const updated = [...categories];
    updated[selectedCategoryIndex].subCategories.push({
      name: subCategoryInput.name,
      heading: subCategoryInput.heading,
      groups: [],
    });
    setCategories(updated);
    setSubCategoryInput({ name: "", heading: "" });
  };

  const addGroup = () => {
    if (selectedCategoryIndex === null || selectedSubCategoryIndex === null || !groupInput.trim()) return;
    const updated = [...categories];
    updated[selectedCategoryIndex].subCategories[selectedSubCategoryIndex].groups.push({
      name: groupInput,
      hasTraits: null,
      traits: [],
      directFeatures: [],
    });
    setCategories(updated);
    setGroupInput("");
  };

  const addTrait = () => {
    const updated = [...categories];
    updated[selectedCategoryIndex]
      .subCategories[selectedSubCategoryIndex]
      .groups[selectedGroupIndex]
      .traits.push({ label: newTrait.label, features: [] });
    setCategories(updated);
    setNewTrait({ label: "" });
  };

  const addTraitFeature = (traitIndex) => {
    const updated = [...categories];
    updated[selectedCategoryIndex]
      .subCategories[selectedSubCategoryIndex]
      .groups[selectedGroupIndex]
      .traits[traitIndex]
      .features.push({ label: newTraitFeature.label });
    setCategories(updated);
    setNewTraitFeature({ label: "" });
  };

  const addDirectFeature = () => {
    const updated = [...categories];
    updated[selectedCategoryIndex]
      .subCategories[selectedSubCategoryIndex]
      .groups[selectedGroupIndex]
      .directFeatures.push({ label: newFeature.label });
    setCategories(updated);
    setNewFeature({ label: "" });
  };

  const handleView = (category) => {
    setPopupData(category);
    setShowPopup(true);
  };

  return (
    <div className="dashboard-main">
      <ToastContainer position="top-center" autoClose={3000} />
      <h1 className="card-header"> Category Builder</h1>
      <div className="card">
        <div className="form-group">
          <label>New Category</label>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g., Nutrition"
          />
          <button className="btn btn-primary" onClick={addCategory}>Add Category</button>
        </div>

        <div className="form-group">
          <label>Select Category</label>
          <select
            value={selectedCategoryIndex ?? ""}
            onChange={(e) => {
              const index = Number(e.target.value);
              setSelectedCategoryIndex(index);
              setSelectedSubCategoryIndex(null);
              setSelectedGroupIndex(null);
            }}
          >
            <option value="">-- Select --</option>
            {categories.map((cat, index) => (
              <option key={index} value={index}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!isSubmitted && selectedCategoryIndex !== null && (
        <>
          <div className="card">
            <h2 className="card-header">📂 Sub-Category</h2>
            <div className="form-group">
              <label>Sub-Category Name</label>
              <input
                type="text"
                value={subCategoryInput.name}
                onChange={(e) => setSubCategoryInput({ ...subCategoryInput, name: e.target.value })}
              />
              <label>Heading/Description</label>
              <input
                type="text"
                value={subCategoryInput.heading}
                onChange={(e) => setSubCategoryInput({ ...subCategoryInput, heading: e.target.value })}
              />
              <button className="btn btn-primary" onClick={addSubCategory}>Add Sub-Category</button>
            </div>

            <div className="form-group">
              <label>Select Sub-Category</label>
              <select
                value={selectedSubCategoryIndex ?? ""}
                onChange={(e) => {
                  setSelectedSubCategoryIndex(Number(e.target.value));
                  setSelectedGroupIndex(null);
                }}
              >
                <option value="">-- Select --</option>
                {categories[selectedCategoryIndex].subCategories.map((sub, index) => (
                  <option key={index} value={index}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedSubCategoryIndex !== null && (
            <div className="card">
              <h2 className="card-header">🧪 Group & Traits</h2>
              <div className="form-group">
                <label>Add Group</label>
                <input
                  type="text"
                  value={groupInput}
                  onChange={(e) => setGroupInput(e.target.value)}
                  placeholder="e.g., FATTY ACIDS"
                />
                <button className="btn btn-primary" onClick={addGroup}>Add Group</button>
              </div>

              <div className="form-group">
                <label>Select Group</label>
                <select
                  value={selectedGroupIndex ?? ""}
                  onChange={(e) => setSelectedGroupIndex(Number(e.target.value))}
                >
                  <option value="">-- Select --</option>
                  {categories[selectedCategoryIndex].subCategories[selectedSubCategoryIndex].groups.map((grp, index) => (
                    <option key={index} value={index}>{grp.name}</option>
                  ))}
                </select>
              </div>

              {selectedGroupIndex !== null && (
                <>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={categories[selectedCategoryIndex].subCategories[selectedSubCategoryIndex].groups[selectedGroupIndex].hasTraits || false}
                        onChange={(e) => {
                          const updated = [...categories];
                          updated[selectedCategoryIndex].subCategories[selectedSubCategoryIndex].groups[selectedGroupIndex].hasTraits = e.target.checked;
                          setCategories(updated);
                        }}
                      /> This group has traits
                    </label>
                  </div>

                  {categories[selectedCategoryIndex].subCategories[selectedSubCategoryIndex].groups[selectedGroupIndex].hasTraits ? (
                    <div className="form-group">
                      <label>Add Trait</label>
                      <input
                        type="text"
                        value={newTrait.label}
                        onChange={(e) => setNewTrait({ label: e.target.value })}
                        placeholder="Trait label"
                      />
                      <button className="btn btn-secondary" onClick={addTrait}>Add Trait</button>
                      {categories[selectedCategoryIndex].subCategories[selectedSubCategoryIndex].groups[selectedGroupIndex].traits.map((trait, i) => (
                        <div key={i} className="card">
                          <h4>{trait.label}</h4>
                          <input
                            type="text"
                            value={newTraitFeature.label}
                            onChange={(e) => setNewTraitFeature({ label: e.target.value })}
                            placeholder="Feature label"
                          />
                          <button className="btn btn-primary" onClick={() => addTraitFeature(i)}>Add Feature</button>
                          <ul>
                            {trait.features?.map((f, idx) => <li key={idx}>{f.label}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Add Feature (No Traits)</label>
                      <input
                        type="text"
                        value={newFeature.label}
                        onChange={(e) => setNewFeature({ label: e.target.value })}
                        placeholder="Feature label"
                      />
                      <button className="btn btn-primary" onClick={addDirectFeature}>Add Feature</button>
                      <ul>
                        {categories[selectedCategoryIndex].subCategories[selectedSubCategoryIndex].groups[selectedGroupIndex].directFeatures.map((f, i) => (
                          <li key={i}>{f.label}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="card">
            <button className="btn btn-primary" onClick={handleSubmit}>✅ Confirm & Submit</button>
          </div>
        </>
      )}

      {isSubmitted && (
        <div className="card">
          <h2 className="card-header">📦 Submitted Categories</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {categories.map((cat, index) => (
              <div key={index} className="card">
                <h3>{cat.name}</h3>
                <p>{cat.subCategories.length} subcategories</p>
                <button className="btn btn-secondary" onClick={() => handleView(cat)}>View</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPopup && popupData && (
        <div className="modal-overlay">
          <div className="modalsc-box" style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <h2>Category: {popupData.name}</h2>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "14px" }}>
              {JSON.stringify(popupData, null, 2)}
            </pre>
            <div className="center-btn">
              <button className="btn btn-primary" onClick={() => setShowPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryBuilder;
