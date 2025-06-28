// ReportBuilder.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../master_admin/master_admin.css";
import "../physio/assign.css";

const ReportBuilder = () => {
  const API_URL = "http://localhost:3001/categories";
  const [dnlId, setDnlId] = useState("");

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

  const [newTrait, setNewTrait] = useState({ name: "", fields: [] });
  const [showAddTraitForm, setShowAddTraitForm] = useState(false);

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
  const [deleteLock, setDeleteLock] = useState(false);

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
          const patient = res.data[0];

          setSelectedPatient(patient);
          setDnlId(patient.dnlId || ""); // NEW: Store dnlId from backend

          toast.success(`Patient ${patient.name} found!`, {
            position: "top-center",
          });
        } else {
          setSelectedPatient(null);
          setDnlId(""); // Clear dnlId if no patient found
          toast.error("No patient found with this MRN", {
            position: "top-center",
          });
        }
      })
      .catch(() => {
        setSelectedPatient(null);
        setDnlId(""); // Ensure clean state on error
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
  const addTraitField = () => {
    setNewTrait({
      ...newTrait,
      fields: [...newTrait.fields, { key: "", value: "", type: "text" }],
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
  const removeTraitField = (index) => {
    const updatedFields = newTrait.fields.filter((_, i) => i !== index);
    setNewTrait({ ...newTrait, fields: updatedFields });
  };

  const handleSubmitTrait = () => {
    if (!newTrait.name.trim() || newTrait.fields.length === 0) {
      toast.error("Trait name and at least one field are required", {
        position: "top-center",
      });
      return;
    }

    const updated = [...categories];

    updated[selectedCategoryIndex].subCategories[
      selectedSubCategoryIndex
    ].groups[selectedGroupIndex].traits.push({
      name: newTrait.name,
      fields: newTrait.fields,
    });

    const id = updated[selectedCategoryIndex].id;

    axios
      .put(`${API_URL}/${id}`, updated[selectedCategoryIndex])
      .then(() => {
        setCategories(updated);
        setNewTrait({ name: "", fields: [] });
        setShowAddTraitForm(false); // ✅ hide form after submit
        toast.success("Trait added and saved", { position: "top-center" });
      })
      .catch(() =>
        toast.error("Failed to save trait", { position: "top-center" })
      );
  };

  const exportJSON = () => {
    const primaryCategory = categories[0]?.name || "Untitled";

    // Transform all categories to backend format
    const transformedCategories = categories.map(({ id, ...cat }) => ({
      ...cat,
      subCategories: cat.subCategories.map((sub) => ({
        name: sub.name,
        groups: sub.groups.map((grp) => ({
          name: grp.name,
          hasTraits: grp.hasTraits,
          ...(grp.hasTraits
            ? {
                traits: grp.traits.map((trait) => ({
                  name: trait.name,
                  fields: trait.fields,
                })),
              }
            : {
                fields: grp.fields || [], // if no traits, use flat fields
              }),
        })),
      })),
    }));

    const payload = {
      dnlId: mrn,
      reportName: `${primaryCategory} Comprehensive Report`,
      categories: transformedCategories,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${dnlId || "report"}_report.json`;
    link.click();
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
  const updateTraitField = (index, key, value) => {
    const updatedFields = [...(newTrait.fields || [])];
    updatedFields[index][key] = value;
    setNewTrait({ ...newTrait, fields: updatedFields });
  };

  const addDirectFeature = () => {
    const updated = [...categories];
    const group =
      updated[selectedCategoryIndex].subCategories[selectedSubCategoryIndex]
        .groups[selectedGroupIndex];

    if (!group.fields) group.fields = [];

    group.fields.push({
      key: newFeature.key,
      value: newFeature.value,
      type: newFeature.type || "text",
    });

    const id = updated[selectedCategoryIndex].id;
    axios
      .put(`${API_URL}/${id}`, updated[selectedCategoryIndex])
      .then(() => {
        setCategories(updated);
        setNewFeature({ key: "", value: "", type: "text" });
        toast.success("Field added and saved", { position: "top-center" });
      })
      .catch(() =>
        toast.error("Failed to save field", { position: "top-center" })
      );
  };

  const updateCategory = (updatedCategory, index) => {
    const id = categories[index]?.id;
    if (!id) return;
    return axios.put(`${API_URL}/${id}`, updatedCategory);
  };

  const handleSubmit = () => {
    if (!dnlId || categories.length === 0) {
      toast.error("Missing DNL ID or categories", { position: "top-center" });
      return;
    }

    const primaryCategory = categories[0]?.name || "Untitled";

    const transformedCategories = categories.map(({ id, ...cat }) => ({
      ...cat,
      subCategories: cat.subCategories.map((sub) => ({
        name: sub.name,
        groups: sub.groups.map((grp) => ({
          name: grp.name,
          hasTraits: grp.hasTraits,
          ...(grp.hasTraits
            ? {
                traits: grp.traits.map((trait) => ({
                  name: trait.name,
                  fields: trait.fields,
                })),
              }
            : {
                fields: grp.fields || [],
              }),
        })),
      })),
    }));

    const payload = {
      dnlId: mrn,
      reportName: `${primaryCategory} Comprehensive Report`,
      categories: transformedCategories,
    };

    axios
      .post("http://localhost:3001/reports", payload)
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
      <h1 className="card-header">🧱 Report Builder</h1>
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

                          {/* ✅ GROUP HAS TRAITS */}
                          {categories[selectedCategoryIndex].subCategories[
                            selectedSubCategoryIndex
                          ].groups[selectedGroupIndex].hasTraits ? (
                            <div className="form-group">
                              {/* Add Trait Toggle Button */}
                              <button
                                className="btn btn-outline-primary"
                                onClick={() =>
                                  setShowAddTraitForm(!showAddTraitForm)
                                }
                              >
                                {showAddTraitForm
                                  ? "❌ Cancel Add Trait"
                                  : "➕ Add Trait"}
                              </button>

                              {/* Conditional Trait Form */}
                              {showAddTraitForm && (
                                <div
                                  style={{
                                    marginTop: "1rem",
                                    border: "1px solid #ccc",
                                    padding: "1rem",
                                    borderRadius: "6px",
                                  }}
                                >
                                  <label>Trait Name</label>
                                  <input
                                    type="text"
                                    value={newTrait.name || ""}
                                    onChange={(e) =>
                                      setNewTrait({
                                        ...newTrait,
                                        name: e.target.value,
                                      })
                                    }
                                    placeholder="Trait name"
                                    style={{
                                      width: "100%",
                                      padding: "0.5rem",
                                      marginTop: "0.5rem",
                                      borderRadius: "4px",
                                      border: "1px solid #ccc",
                                    }}
                                  />

                                  <h5
                                    style={{
                                      marginTop: "1rem",
                                      marginBottom: "0.5rem",
                                    }}
                                  >
                                    Trait Fields:
                                  </h5>

                                  {newTrait.fields.length > 0 && (
                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr 1fr auto",
                                        backgroundColor: "#f8f9fa",
                                        padding: "0.5rem",
                                        fontWeight: "600",
                                        color: "#cc5500",
                                        borderBottom: "1px solid #ccc",
                                      }}
                                    >
                                      <span>Key</span>
                                      <span>Value</span>
                                      <span>Type</span>
                                      <span>Action</span>
                                    </div>
                                  )}

                                  {newTrait.fields.map((field, index) => (
                                    <div
                                      key={index}
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr 1fr auto",
                                        gap: "0.5rem",
                                        alignItems: "center",
                                        borderBottom: "1px solid #eee",
                                        padding: "0.5rem 0",
                                      }}
                                    >
                                      <input
                                        type="text"
                                        placeholder="Key"
                                        value={field.key}
                                        onChange={(e) =>
                                          updateTraitField(
                                            index,
                                            "key",
                                            e.target.value
                                          )
                                        }
                                        style={{
                                          padding: "0.5rem",
                                          border: "1px solid #ccc",
                                          borderRadius: "4px",
                                        }}
                                      />
                                      <input
                                        type="text"
                                        placeholder="Value"
                                        value={field.value}
                                        onChange={(e) =>
                                          updateTraitField(
                                            index,
                                            "value",
                                            e.target.value
                                          )
                                        }
                                        style={{
                                          padding: "0.5rem",
                                          border: "1px solid #ccc",
                                          borderRadius: "4px",
                                        }}
                                      />
                                      <select
                                        value={field.type}
                                        onChange={(e) =>
                                          updateTraitField(
                                            index,
                                            "type",
                                            e.target.value
                                          )
                                        }
                                        style={{
                                          padding: "0.5rem",
                                          border: "1px solid #ccc",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="date">Date</option>
                                      </select>
                                      <button
                                        className="btn btn-secondary"
                                        type="button"
                                        onClick={() => removeTraitField(index)}
                                        style={{
                                          padding: "0.5rem 1rem",
                                          backgroundColor: "#cc5500",
                                          color: "white",
                                          border: "none",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                        }}
                                      >
                                        ❌ Remove
                                      </button>
                                    </div>
                                  ))}

                                  <div
                                    style={{
                                      marginTop: "1rem",
                                      display: "flex",
                                      gap: "1rem",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <button
                                      className="btn btn-outline-secondary"
                                      onClick={addTraitField}
                                      style={{
                                        padding: "0.5rem 1rem",
                                        border: "1px solid #cc5500",
                                        color: "#cc5500",
                                        borderRadius: "4px",
                                        backgroundColor: "transparent",
                                        cursor: "pointer",
                                      }}
                                    >
                                      ➕ Add Field
                                    </button>

                                    <button
                                      className="btn btn-primary"
                                      onClick={handleSubmitTrait}
                                      style={{
                                        padding: "0.5rem 1rem",
                                        backgroundColor: "#cc5500",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      ✅ Submit Trait
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Display Existing Traits Below */}
                              <hr style={{ marginTop: "2rem" }} />
                              {categories[selectedCategoryIndex].subCategories[
                                selectedSubCategoryIndex
                              ].groups[selectedGroupIndex].traits.map(
                                (trait, i) => (
                                  <div
                                    key={i}
                                    className="card"
                                    style={{
                                      marginTop: "1rem",
                                      padding: "1rem",
                                      border: "1px solid #ddd",
                                      borderRadius: "6px",
                                    }}
                                  >
                                    <h4>{trait.name}</h4>
                                    <ul>
                                      {trait.fields?.map((f, idx) => (
                                        <li key={idx}>
                                          <strong>{f.key}</strong>: {f.value}{" "}
                                          <em style={{ color: "gray" }}>
                                            ({f.type})
                                          </em>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            /* ✅ GROUP HAS NO TRAITS — direct fields */
                            <div className="form-group">
                              <label>Field Key</label>
                              <input
                                type="text"
                                value={newFeature.key || ""}
                                onChange={(e) =>
                                  setNewFeature({
                                    ...newFeature,
                                    key: e.target.value,
                                  })
                                }
                                placeholder="e.g., addiction_chance"
                              />
                              <label>Field Value</label>
                              <input
                                type="text"
                                value={newFeature.value || ""}
                                onChange={(e) =>
                                  setNewFeature({
                                    ...newFeature,
                                    value: e.target.value,
                                  })
                                }
                                placeholder="e.g., high"
                              />
                              <label>Type</label>
                              <select
                                value={newFeature.type || "text"}
                                onChange={(e) =>
                                  setNewFeature({
                                    ...newFeature,
                                    type: e.target.value,
                                  })
                                }
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                              </select>
                              <button
                                className="btn btn-primary"
                                style={{ marginTop: "0.75rem" }}
                                onClick={addDirectFeature}
                              >
                                Add Field
                              </button>
                              <ul style={{ marginTop: "0.5rem" }}>
                                {categories[
                                  selectedCategoryIndex
                                ].subCategories[
                                  selectedSubCategoryIndex
                                ].groups[selectedGroupIndex].fields?.map(
                                  (f, i) => (
                                    <li key={i}>
                                      <strong>{f.key}</strong>: {f.value}{" "}
                                      <em style={{ color: "gray" }}>
                                        ({f.type})
                                      </em>
                                    </li>
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
                                setGroupFinalizedPopup(true);
                                setShowGroupDetailsCard(false);
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
          {/* === DYNAMIC RENDERING OF ALL SUBCATEGORIES === */}

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
              <center>
                <p
                  style={{
                    padding: "1rem",
                    color: "gray",
                    fontStyle: "italic",
                  }}
                >
                  No categories added yet.
                </p>
              </center>
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
                          if (deleteLock) return; // ⛔ prevent duplicate dialogs
                          setDeleteLock(true); // ✅ lock delete popup

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
                                          setDeleteLock(false); // ✅ unlock on confirm
                                          toast.dismiss();
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
                                      setDeleteLock(false); // ✅ unlock on cancel
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
                        <h4>🧪 Group: {grp?.name || "Unnamed Group"}</h4>
                        <p>
                          <b>Has Traits:</b> {grp?.hasTraits ? "Yes" : "No"}
                        </p>

                        {grp?.hasTraits && Array.isArray(grp.traits) ? (
                          grp.traits.map((trait, tIdx) => (
                            <div
                              key={tIdx}
                              style={{
                                marginLeft: "1rem",
                                marginTop: "0.5rem",
                              }}
                            >
                              <p>
                                <b>Trait:</b> {trait?.name || "Unnamed Trait"}
                              </p>
                              {Array.isArray(trait.fields) &&
                              trait.fields.length > 0 ? (
                                <ul>
                                  {trait.fields.map((field, fIdx) => (
                                    <li key={fIdx}>
                                      <strong>{field.key || "key"}:</strong>{" "}
                                      {field.value || "N/A"}{" "}
                                      <em style={{ color: "gray" }}>
                                        ({field.type || "text"})
                                      </em>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p
                                  style={{ marginLeft: "1rem", color: "#999" }}
                                >
                                  No fields
                                </p>
                              )}
                            </div>
                          ))
                        ) : grp?.fields?.length > 0 ? (
                          <>
                            <p>
                              <b>Fields:</b>
                            </p>
                            <ul>
                              {grp.fields.map((field, fIdx) => (
                                <li key={fIdx}>
                                  <strong>{field.key || "key"}:</strong>{" "}
                                  {field.value || "N/A"}{" "}
                                  <em style={{ color: "gray" }}>
                                    ({field.type || "text"})
                                  </em>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p style={{ marginLeft: "1rem", color: "#999" }}>
                            No traits or fields available.
                          </p>
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
          <div className="center-btn" style={{ marginTop: "1rem" }}>
            <button className="btn btn-secondary" onClick={exportJSON}>
              📤 Export JSON
            </button>
          </div>

          <div className="center-btn" style={{ marginTop: "2rem" }}>
            <center>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsAssigned(true);
                  toast.success("Report assigned and saved!", {
                    position: "top-center",
                  });
                }}
              >
                📝 Assign Report
              </button>
            </center>
          </div>
        </>
      )}
    </div>
  );
};
export default ReportBuilder;
