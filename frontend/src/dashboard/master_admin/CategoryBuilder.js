// CategoryBuilder.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../master_admin/master_admin.css";
import "../physio/assign.css";

const CategoryBuilder = () => {
  const API_URL = "http://localhost:3001/categories";

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const [subCategoryInput, setSubCategoryInput] = useState({
    name: "",
    heading: "",
  });
  const [groupInput, setGroupInput] = useState("");

  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [selectedSubCategoryIndex, setSelectedSubCategoryIndex] =
    useState(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);

  const [newTrait, setNewTrait] = useState({ label: "" });
  const [newTraitFeature, setNewTraitFeature] = useState({ label: "" });
  const [newFeature, setNewFeature] = useState({ label: "" });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);

  const [showAddCategoryCard, setShowAddCategoryCard] = useState(false);
  const [showContentCard, setShowContentCard] = useState(false);
  const [showSubCategoryCard, setShowSubCategoryCard] = useState(false);
  const [showGroupCard, setShowGroupCard] = useState(false);
  const [showGroupDetailsCard, setShowGroupDetailsCard] = useState(false);
  const [newTraitFeatures, setNewTraitFeatures] = useState({});
  const [mrn, setMrn] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isAssigned, setIsAssigned] = useState(false);

  const [subCategoryAddedPopup, setSubCategoryAddedPopup] = useState(false);
  const [groupAddedPopup, setGroupAddedPopup] = useState(false);
  const [groupFinalizedPopup, setGroupFinalizedPopup] = useState(false);
  const finalizeCategoryFlow = () => {
    if (selectedCategoryIndex !== null) {
      const categoryName =
        categories[selectedCategoryIndex]?.name || "selected category";
      toast.success(`All data is saved for the ${categoryName}`, {
        position: "top-center",
      });
    }

    // Collapse all open forms/cards
    setShowSubCategoryCard(false); // ✅ Close sub-category form
    setShowGroupCard(false); // ✅ Close group form
    setShowGroupDetailsCard(false); // ✅ Close trait/feature form
    setShowContentCard(false); // ✅ CLOSE THIS TOO (Fix for your issue)

    // Reset selections
    setSelectedCategoryIndex(null);
    setSelectedSubCategoryIndex(null);
    setSelectedGroupIndex(null);
  };

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => setCategories(res.data))
      .catch(() =>
        toast.error("Failed to load categories", { position: "top-center" })
      );
  }, []);
  const handleSearch = () => {
    if (!mrn.trim()) return;

    axios
      .get(`http://localhost:3001/patients?mrn=${mrn}`)
      .then((res) => {
        if (res.data.length > 0) {
          setSelectedPatient(res.data[0]);
          toast.success(`Patient ${res.data[0].name} found!`, {
            position: "top-center",
          });
        } else {
          setSelectedPatient(null);
          toast.error("No patient found with this MRN", {
            position: "top-center",
          });
        }
      })
      .catch(() => {
        toast.error("Error fetching patient", {
          position: "top-center",
        });
      });
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    const newEntry = { name: newCategory, subCategories: [] };
    axios
      .post(API_URL, newEntry)
      .then((res) => {
        setCategories([...categories, res.data]);
        toast.success("Category added successfully!", {
          position: "top-center",
        });
        setNewCategory("");
        setShowAddCategoryCard(false);
      })
      .catch(() =>
        toast.error("Failed to add category", { position: "top-center" })
      );
  };

  const addSubCategory = () => {
    if (selectedCategoryIndex === null || !subCategoryInput.name.trim()) return;

    const updated = [...categories];
    updated[selectedCategoryIndex].subCategories.push({
      name: subCategoryInput.name,
      heading: subCategoryInput.heading,
      groups: [],
    });

    const id = updated[selectedCategoryIndex].id;
    axios
      .put(`${API_URL}/${id}`, updated[selectedCategoryIndex])
      .then(() => {
        setCategories(updated);
        setSubCategoryInput({ name: "", heading: "" });
        toast.success("Sub-Category added and saved", {
          position: "top-center",
        });
      })
      .catch(() =>
        toast.error("Failed to save Sub-Category", { position: "top-center" })
      );
  };

  const addGroup = () => {
    if (
      selectedCategoryIndex === null ||
      selectedSubCategoryIndex === null ||
      !groupInput.trim()
    )
      return;

    const updated = [...categories];
    updated[selectedCategoryIndex].subCategories[
      selectedSubCategoryIndex
    ].groups.push({
      name: groupInput,
      hasTraits: null,
      traits: [],
      directFeatures: [],
    });

    const id = updated[selectedCategoryIndex].id;
    axios
      .put(`${API_URL}/${id}`, updated[selectedCategoryIndex])
      .then(() => {
        setCategories(updated);
        setGroupInput("");
        toast.success("Group added and saved", { position: "top-center" });
      })
      .catch(() =>
        toast.error("Failed to save group", { position: "top-center" })
      );
  };

  const addTrait = () => {
    const updated = [...categories];
    updated[selectedCategoryIndex].subCategories[
      selectedSubCategoryIndex
    ].groups[selectedGroupIndex].traits.push({
      label: newTrait.label,
      features: [],
    });

    const id = updated[selectedCategoryIndex].id;
    axios
      .put(`${API_URL}/${id}`, updated[selectedCategoryIndex])
      .then(() => {
        setCategories(updated);
        setNewTrait({ label: "" });
        toast.success("Trait added and saved", { position: "top-center" });
      })
      .catch(() =>
        toast.error("Failed to save trait", { position: "top-center" })
      );
  };

  const addTraitFeature = (traitIndex) => {
    const label = newTraitFeatures[traitIndex];
    if (!label?.trim()) return;

    const updated = [...categories];
    updated[selectedCategoryIndex].subCategories[
      selectedSubCategoryIndex
    ].groups[selectedGroupIndex].traits[traitIndex].features.push({ label });

    const id = updated[selectedCategoryIndex].id;
    axios
      .put(`${API_URL}/${id}`, updated[selectedCategoryIndex])
      .then(() => {
        setCategories(updated);
        setNewTraitFeatures({
          ...newTraitFeatures,
          [traitIndex]: "", // Clear only the one you added
        });
        toast.success("Feature added and saved", { position: "top-center" });
      })
      .catch(() =>
        toast.error("Failed to save feature", { position: "top-center" })
      );
  };

  const addDirectFeature = () => {
    const updated = [...categories];
    updated[selectedCategoryIndex].subCategories[
      selectedSubCategoryIndex
    ].groups[selectedGroupIndex].directFeatures.push({
      label: newFeature.label,
    });

    const id = updated[selectedCategoryIndex].id;
    axios
      .put(`${API_URL}/${id}`, updated[selectedCategoryIndex])
      .then(() => {
        setCategories(updated);
        setNewFeature({ label: "" });
        toast.success("Feature added and saved", { position: "top-center" });
      })
      .catch(() =>
        toast.error("Failed to save feature", { position: "top-center" })
      );
  };

  const updateCategory = (updatedCategory, index) => {
    const id = categories[index]?.id;
    if (!id) return;
    return axios.put(`${API_URL}/${id}`, updatedCategory);
  };

  const handleSubmit = () => {
    Promise.all(categories.map((cat, idx) => updateCategory(cat, idx)))
      .then(() => {
        toast.success("Report Template Created Successfully!", {
          position: "top-center",
        });
        setIsSubmitted(true);
      })
      .catch(() =>
        toast.error("Submission failed", { position: "top-center" })
      );
  };

  const handleView = (category) => {
    setPopupData(category);
    setShowPopup(true);
  };

  return (
    <div className="dashboard-main">
      <ToastContainer position="top-center" autoClose={3000} />
      <h1 className="card-header">🧱 Category Builder</h1>
      <div className="card">
        <h2 className="card-header">🔍 Search Patient by MRN</h2>
        <div
          className="form-group"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Enter MRN Number"
            className="search-input"
            value={mrn}
            onChange={(e) => setMrn(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            style={{
              flex: "1",
              minWidth: "200px",
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #cc5500",
              borderRadius: "4px",
            }}
          />

          <button
            className="btn btn-primary"
            onClick={handleSearch}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              whiteSpace: "nowrap",
            }}
          >
            Search
          </button>
        </div>
      </div>

      {selectedPatient && !isAssigned && (
        <>
          {/* CategoryBuilder Form JSX goes here */}
          {/* === ACTION BUTTONS === */}
          <div className="row">
            <div className="col">
              <button
                className="btn btn-primary"
                onClick={() => setShowAddCategoryCard(!showAddCategoryCard)}
              >
                {showAddCategoryCard ? "Close Add Category" : "➕ Add Category"}
              </button>
            </div>
            {categories.length > 0 && (
              <div className="col">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowContentCard(!showContentCard)}
                >
                  {showContentCard
                    ? "Close Content Panel"
                    : "📂 Add Content to the Category"}
                </button>
              </div>
            )}
          </div>

          {/* === ADD CATEGORY CARD === */}
          {showAddCategoryCard && (
            <div className="card" style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label>New Category Name</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Nutrition"
                />
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "0.75rem" }}
                  onClick={addCategory}
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* === CONTENT PANEL === */}
          {showContentCard && !isSubmitted && (
            <>
              {/* CATEGORY SELECTION & SUB-CATEGORY MODULE */}
              <div className="card">
                <h2 className="card-header">📂 Sub-Category</h2>
                <div className="form-group">
                  <label>Select Category</label>
                  <select
                    value={selectedCategoryIndex ?? ""}
                    onChange={(e) => {
                      const index = Number(e.target.value);
                      setSelectedCategoryIndex(index);
                      setSelectedSubCategoryIndex(null);
                      setSelectedGroupIndex(null);
                      setShowSubCategoryCard(false);
                      setShowGroupCard(false);
                    }}
                  >
                    <option value="">-- Select --</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={index}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCategoryIndex !== null && (
                  <>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() =>
                        setShowSubCategoryCard(!showSubCategoryCard)
                      }
                    >
                      {showSubCategoryCard
                        ? "❌ Close Sub-Category Form"
                        : "➕ Add Sub-Category"}
                    </button>

                    {showSubCategoryCard && (
                      <div className="card" style={{ marginTop: "1rem" }}>
                        <div className="form-group">
                          <label>Sub-Category Name</label>
                          <input
                            type="text"
                            value={subCategoryInput.name}
                            onChange={(e) =>
                              setSubCategoryInput({
                                ...subCategoryInput,
                                name: e.target.value,
                              })
                            }
                          />
                          <label>Heading/Description</label>
                          <input
                            type="text"
                            value={subCategoryInput.heading}
                            onChange={(e) =>
                              setSubCategoryInput({
                                ...subCategoryInput,
                                heading: e.target.value,
                              })
                            }
                          />
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              addSubCategory();
                              setSubCategoryAddedPopup(true);
                              setShowSubCategoryCard(false);
                            }}
                          >
                            ✅ Submit Sub-Category
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {selectedCategoryIndex !== null &&
                  categories[selectedCategoryIndex]?.subCategories.length >
                    0 && (
                    <div className="form-group">
                      <label>Select Sub-Category</label>
                      <select
                        value={selectedSubCategoryIndex ?? ""}
                        onChange={(e) => {
                          setSelectedSubCategoryIndex(Number(e.target.value));
                          setSelectedGroupIndex(null);
                          setShowGroupCard(false);
                        }}
                      >
                        <option value="">-- Select --</option>
                        {categories[selectedCategoryIndex].subCategories.map(
                          (sub, index) => (
                            <option key={index} value={index}>
                              {sub.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}
              </div>

              {/* GROUP MODULE */}
              {selectedSubCategoryIndex !== null && (
                <div className="card">
                  <h2 className="card-header">🧪 Group & Traits</h2>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setShowGroupCard(!showGroupCard)}
                  >
                    {showGroupCard ? "❌ Close Group Form" : "➕ Add Group"}
                  </button>

                  {showGroupCard && (
                    <div className="card" style={{ marginTop: "1rem" }}>
                      <div className="form-group">
                        <label>Group Name</label>
                        <input
                          type="text"
                          value={groupInput}
                          onChange={(e) => setGroupInput(e.target.value)}
                          placeholder="e.g., FATTY ACIDS"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            addGroup();
                            setGroupAddedPopup(true);
                            setShowGroupCard(false);
                          }}
                        >
                          ✅ Submit Group
                        </button>
                      </div>
                    </div>
                  )}

                  {categories[selectedCategoryIndex].subCategories[
                    selectedSubCategoryIndex
                  ]?.groups.length > 0 && (
                    <div className="form-group">
                      <label>Select Group</label>
                      <select
                        value={selectedGroupIndex ?? ""}
                        onChange={(e) => {
                          setSelectedGroupIndex(Number(e.target.value));
                          setShowGroupDetailsCard(false);
                        }}
                      >
                        <option value="">-- Select --</option>
                        {categories[selectedCategoryIndex].subCategories[
                          selectedSubCategoryIndex
                        ].groups.map((grp, index) => (
                          <option key={index} value={index}>
                            {grp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* GROUP DETAILS MODULE */}
                  {selectedGroupIndex !== null && (
                    <>
                      <button
                        className="btn btn-outline-success"
                        onClick={() =>
                          setShowGroupDetailsCard(!showGroupDetailsCard)
                        }
                      >
                        {showGroupDetailsCard
                          ? "❌ Close Group Details"
                          : "➕ Add Details (Traits / Features)"}
                      </button>

                      {showGroupDetailsCard && (
                        <div className="card" style={{ marginTop: "1rem" }}>
                          <div className="form-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={
                                  categories[selectedCategoryIndex]
                                    .subCategories[selectedSubCategoryIndex]
                                    .groups[selectedGroupIndex].hasTraits ||
                                  false
                                }
                                onChange={(e) => {
                                  const updated = [...categories];
                                  updated[selectedCategoryIndex].subCategories[
                                    selectedSubCategoryIndex
                                  ].groups[selectedGroupIndex].hasTraits =
                                    e.target.checked;
                                  setCategories(updated);
                                }}
                              />{" "}
                              This group has traits
                            </label>
                          </div>

                          {categories[selectedCategoryIndex].subCategories[
                            selectedSubCategoryIndex
                          ].groups[selectedGroupIndex].hasTraits ? (
                            <div className="form-group">
                              <label>Add Trait</label>
                              <input
                                type="text"
                                value={newTrait.label}
                                onChange={(e) =>
                                  setNewTrait({ label: e.target.value })
                                }
                                placeholder="Trait label"
                              />
                              <button
                                className="btn btn-secondary"
                                onClick={addTrait}
                              >
                                Add Trait
                              </button>

                              {categories[selectedCategoryIndex].subCategories[
                                selectedSubCategoryIndex
                              ].groups[selectedGroupIndex].traits.map(
                                (trait, i) => (
                                  <div key={i} className="card">
                                    <h4>{trait.label}</h4>
                                    <input
                                      type="text"
                                      value={newTraitFeatures[i] || ""}
                                      onChange={(e) =>
                                        setNewTraitFeatures({
                                          ...newTraitFeatures,
                                          [i]: e.target.value,
                                        })
                                      }
                                    />

                                    <button
                                      className="btn btn-primary"
                                      onClick={() => addTraitFeature(i)}
                                    >
                                      Add Feature
                                    </button>
                                    <ul>
                                      {trait.features?.map((f, idx) => (
                                        <li key={idx}>{f.label}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="form-group">
                              <label>Add Feature (No Traits)</label>
                              <input
                                type="text"
                                value={newFeature.label}
                                onChange={(e) =>
                                  setNewFeature({ label: e.target.value })
                                }
                                placeholder="Feature label"
                              />
                              <button
                                className="btn btn-primary"
                                onClick={addDirectFeature}
                              >
                                Add Feature
                              </button>
                              <ul>
                                {categories[
                                  selectedCategoryIndex
                                ].subCategories[
                                  selectedSubCategoryIndex
                                ].groups[selectedGroupIndex].directFeatures.map(
                                  (f, i) => (
                                    <li key={i}>{f.label}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                          {/* ✅ Final Confirm Group Button */}
                          <div
                            className="center-btn"
                            style={{ marginTop: "1rem" }}
                          >
                            <button
                              className="btn btn-success"
                              onClick={() => {
                                setGroupFinalizedPopup(true); // Show confirmation
                                setShowGroupDetailsCard(false); // Collapse the details section only
                              }}
                            >
                              ✅ Confirm This Group
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div className="center-btn" style={{ marginTop: "1rem" }}>
                    <button
                      className="btn btn-dark"
                      onClick={finalizeCategoryFlow}
                    >
                      🎯 Final Submission for This Category
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* === SUBMISSION VIEW AFTER SUBMIT === */}
          {isSubmitted && (
            <div className="card">
              <h2 className="card-header">📦 Submitted Categories</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem",
                }}
              >
                {categories.map((cat, index) => (
                  <div key={index} className="card">
                    <h3>{cat.name}</h3>
                    <p>{cat.subCategories.length} subcategories</p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleView(cat)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* === PREVIOUSLY ADDED CATEGORIES SECTION === */}
          <div className="card">
            <h2 className="card-header">📦 Previously Added Categories</h2>

            {categories.length === 0 ? (
              <p
                style={{ padding: "1rem", color: "gray", fontStyle: "italic" }}
              >
                No categories added yet.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1rem",
                }}
              >
                {categories.map((cat, index) => (
                  <div key={index} className="card" style={{ padding: "1rem" }}>
                    <h3 style={{ marginBottom: "1rem", color: "#cc5500" }}>
                      {cat.name}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleView(cat)}
                      >
                        👁️ View
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSelectedCategoryIndex(index);
                          setShowContentCard(true);
                          toast.info(`Editing category: ${cat.name}`, {
                            position: "top-center",
                          });
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          toast(
                            ({ closeToast }) => (
                              <div>
                                <p>
                                  Are you sure you want to delete{" "}
                                  <b>{cat.name}</b>?
                                </p>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "10px",
                                    marginTop: "10px",
                                  }}
                                >
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                      const id = cat.id;
                                      axios
                                        .delete(`${API_URL}/${id}`)
                                        .then(() => {
                                          setCategories(
                                            categories.filter(
                                              (_, i) => i !== index
                                            )
                                          );
                                          toast.dismiss(); // Close the toast
                                          toast.error("Category deleted", {
                                            position: "top-center",
                                          });
                                        });
                                    }}
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                      toast.dismiss();
                                      toast.info("Deletion cancelled", {
                                        position: "top-center",
                                      });
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ),
                            {
                              position: "top-center",
                              autoClose: false,
                              draggable: false,
                              closeButton: false,
                            }
                          );
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* === POPUPS === */}
          {subCategoryAddedPopup && (
            <div className="modal-overlay">
              <div className="modalsc-box">
                <h2>Sub-Category Added ✅</h2>
                <p>Your sub-category has been successfully added.</p>
                <div className="center-btn">
                  <button
                    className="btn btn-primary"
                    onClick={() => setSubCategoryAddedPopup(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {groupAddedPopup && (
            <div className="modal-overlay">
              <div className="modalsc-box">
                <h2>Group Created ✅</h2>
                <p>Your group has been successfully added.</p>
                <div className="center-btn">
                  <button
                    className="btn btn-primary"
                    onClick={() => setGroupAddedPopup(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {groupFinalizedPopup && (
            <div className="modal-overlay">
              <div className="modalsc-box">
                <h2>Group Finalized ✅</h2>
                <p>All traits and features saved successfully.</p>
                <div className="center-btn">
                  <button
                    className="btn btn-primary"
                    onClick={() => setGroupFinalizedPopup(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPopup && popupData && (
            <div className="modal-overlay">
              <div
                className="modalsc-box"
                style={{
                  maxWidth: "60vw",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <h2>🗂️ Category Details: {popupData.name}</h2>

                {popupData.subCategories?.map((sub, i) => (
                  <div key={i} className="card" style={{ marginTop: "1rem" }}>
                    <h3>📁 Sub-Category: {sub.name}</h3>
                    <p>
                      <b>Description:</b> {sub.heading || "N/A"}
                    </p>

                    {sub.groups?.map((grp, j) => (
                      <div
                        key={j}
                        style={{ marginLeft: "1rem", marginTop: "0.5rem" }}
                      >
                        <h4>🧪 Group: {grp.name}</h4>
                        <p>
                          <b>Has Traits:</b> {grp.hasTraits ? "Yes" : "No"}
                        </p>

                        {grp.hasTraits ? (
                          grp.traits.map((trait, tIdx) => (
                            <div key={tIdx} style={{ marginLeft: "1rem" }}>
                              <p>
                                <b>Trait:</b> {trait.label}
                              </p>
                              <ul>
                                {trait.features.map((f, fIdx) => (
                                  <li key={fIdx}>🔹 {f.label}</li>
                                ))}
                              </ul>
                            </div>
                          ))
                        ) : (
                          <>
                            <p>
                              <b>Features:</b>
                            </p>
                            <ul>
                              {grp.directFeatures.map((f, fIdx) => (
                                <li key={fIdx}>🔸 {f.label}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                <div className="center-btn" style={{ marginTop: "1rem" }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowPopup(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ✅ "Assign Report" button at the end */}
          <div className="center-btn" style={{ marginTop: "2rem" }}>
            <button
              className="btn btn-success"
              onClick={() => {
                setIsAssigned(true);
                toast.success("Report assigned and saved!", {
                  position: "top-center",
                });
              }}
            >
              📝 Assign Report
            </button>
          </div>
        </>
      )}
    </div>
  );
};
export default CategoryBuilder;
