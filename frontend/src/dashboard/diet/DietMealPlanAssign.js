// File: src/dashboard/diet/diet_mealplan_assign.js

import React, { useState, useRef, useEffect } from "react";
import "../physio/assign.css";
import "../master_admin/master_admin.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, Pencil, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import logo from "../../image/logo.png";
import signature from "../../image/signature.png";

const DietMealPlanAssign = () => {
  const [mrn, setMrn] = useState("");
  const [clientData, setClientData] = useState(null);
  const [showBmiPopup, setShowBmiPopup] = useState(false);
  const [showOptionPopup, setShowOptionPopup] = useState({
    index: null,
    visible: false,
  });
  const [showViewPopup, setShowViewPopup] = useState({
    visible: false,
    option: null,
  });
  const [confirmDelete, setConfirmDelete] = useState({
    visible: false,
    rowIndex: null,
    optIndex: null,
  });
  const [newOption, setNewOption] = useState({
    meal: "",
    ingredients: "",
    recipe: "",
    cookingVideo: "", // ✅ New field
  });

  const [editIndex, setEditIndex] = useState({ row: null, opt: null });
  const [approvedDate, setApprovedDate] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [fromDateTime, setFromDateTime] = useState("");
  const [toDateTime, setToDateTime] = useState("");
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [showHistoryCards, setShowHistoryCards] = useState(false);
  const [selectedPlanToView, setSelectedPlanToView] = useState(null);
  const [dietHistory, setDietHistory] = useState([]);
  const bmiCardRef = useRef(null);
  const [availableMeals, setAvailableMeals] = useState([]);
  const [dietaryGuidelines, setDietaryGuidelines] = useState([]);
  const [assignedPlans, setAssignedPlans] = useState([]); // ✅ Add this

  const [bmiData, setBmiData] = useState({
    bmiCategory: "",
    bmr: "",
    tdee: "",
    target: "",
    energy: "",
    protein: "",
    carbohydrate: "",
    fats: "",
  });

  const [energyProteinDistribution, setEnergyProteinDistribution] = useState(
    []
  );
  const [showOptionGridPopup, setShowOptionGridPopup] = useState({
    visible: false,
    index: null,
  });

  const toggleMealEnable = (index) => {
    const updated = [...energyProteinDistribution];
    updated[index].enabled = !updated[index].enabled;
    setEnergyProteinDistribution(updated);
  };
  const handleSearch = async () => {
    if (!mrn.trim()) {
      toast.error("Please enter a valid MRN number");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/mealclients?mrn=${mrn}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const client = data[0];
        setClientData(client);

        // ✅ Fetch previously assigned meals for this MRN
        const assignedRes = await fetch(
          `http://localhost:5000/assignedMeals?mrn=${mrn}`
        );
        const assignedData = await assignedRes.json();
        setAssignedPlans(assignedData); // ✅ Now this will populate "Previous Assigned Charts"

        setTimeout(() => {
          if (bmiCardRef.current) {
            bmiCardRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            bmiCardRef.current.classList.add("bmi-highlight");
            setTimeout(() => {
              bmiCardRef.current.classList.remove("bmi-highlight");
            }, 3000);
          }
        }, 400);

        setBmiData({
          bmiCategory: "",
          bmr: "",
          tdee: "",
          target: "",
          energy: "",
          protein: "",
          carbohydrate: "",
          fats: "",
        });

        setEnergyProteinDistribution((prev) =>
          prev.map((item) => ({
            ...item,
            calories: "",
            protein: "",
            options: [],
          }))
        );
      } else {
        toast.error("No client found with this MRN");
        setClientData(null);
        setAssignedPlans([]); // ❗ Clear any old data if no client found
        setBmiData({});
      }
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error("Search error:", error);
    }
  };

  const handleBmiChange = (e) => {
    const { name, value } = e.target;
    setBmiData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnergyProteinChange = (index, field, value) => {
    const updated = [...energyProteinDistribution];
    updated[index][field] = value;
    setEnergyProteinDistribution(updated);
  };

  const handleAddOptionClick = (index) => {
    setShowOptionPopup({ index, visible: true });
    setNewOption({ meal: "", ingredients: "", recipe: "" });
    setEditIndex({ row: null, opt: null });
  };

  const handleOptionSubmit = () => {
    const updated = [...energyProteinDistribution];
    const rowIndex = showOptionPopup.index;

    if (editIndex.row !== null && editIndex.opt !== null) {
      updated[editIndex.row].options[editIndex.opt] = { ...newOption };
      toast.success("Meal option updated!");
    } else {
      updated[rowIndex].options.push({ ...newOption });
      toast.success("Meal option added!");
    }

    setEnergyProteinDistribution(updated);
    setShowOptionPopup({ index: null, visible: false });
    setEditIndex({ row: null, opt: null });
  };

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setNewOption((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionView = (opt) => {
    setShowViewPopup({ visible: true, option: opt });
  };

  const handleOptionEdit = (row, optIndex) => {
    setNewOption({ ...energyProteinDistribution[row].options[optIndex] });
    setShowOptionPopup({ index: row, visible: true });
    setEditIndex({ row, opt: optIndex });
  };

  const handleDeleteConfirm = (rowIndex, optIndex) => {
    setConfirmDelete({ visible: true, rowIndex, optIndex });
  };

  const confirmDeleteOption = () => {
    const updated = [...energyProteinDistribution];
    updated[confirmDelete.rowIndex].options.splice(confirmDelete.optIndex, 1);
    setEnergyProteinDistribution(updated);
    setConfirmDelete({ visible: false, rowIndex: null, optIndex: null });
    toast.info("Option deleted");
  };
  const isBmiFilled = () => {
    return Object.values(bmiData).every((val) => val.trim() !== "");
  };
  const handleCompleteAssignment = async () => {
    // ✅ 1. Validate if BMI is filled
    const isBmiFilled = Object.values(bmiData).every(
      (val) => val.trim() !== ""
    );
    if (!isBmiFilled) {
      toast.error("Please complete the Modified BMI section.");

      // 🔁 Scroll and highlight the BMI card
      if (bmiCardRef?.current) {
        bmiCardRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        bmiCardRef.current.classList.add("bmi-highlight");
        setTimeout(() => {
          bmiCardRef.current.classList.remove("bmi-highlight");
        }, 3000);
      }

      // ❗ Shake the Complete Assignment button
      const btn = document.querySelector("#complete-btn");
      if (btn) {
        btn.classList.add("shake");
        setTimeout(() => btn.classList.remove("shake"), 500);
      }

      return;
    }

    // ✅ 2. Check for date & meal selection
    if (!fromDateTime || !toDateTime || selectedMeals.length === 0) {
      toast.error("Please fill date range and select at least one meal");
      return;
    }

    // ✅ 3. Validate date logic
    const today = new Date().toISOString().split("T")[0];
    if (fromDateTime < today) {
      toast.error("From date cannot be in the past.");
      return;
    }

    if (toDateTime < fromDateTime) {
      toast.error("To date cannot be earlier than From date.");
      return;
    }

    // ✅ 4. Validate meal data
    const selectedMealData = energyProteinDistribution.filter((row) =>
      selectedMeals.includes(row.mealName)
    );

    const isIncomplete = selectedMealData.some((meal) => {
      return (
        !meal.calories.trim() ||
        !meal.protein.trim() ||
        meal.options.length === 0
      );
    });

    if (isIncomplete) {
      toast.error(
        "Please fill calories, protein, and add at least one option for each selected meal."
      );
      return;
    }

    // ✅ 5. Construct payload and save
    const payload = {
      mrn,
      fromDateTime,
      toDateTime,
      bmiData,
      meals: selectedMealData,
    };

    try {
      await fetch("http://localhost:5000/assignedMeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success("Diet Plan Assigned and Saved!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save data.");
    }

    // ✅ 6. Reset form after submission
    setFromDateTime("");
    setToDateTime("");
    setSelectedMeals([]);
    setEnergyProteinDistribution([]);
    setClientData(null);
  };

  const handleBmiSubmit = () => {
    const isAnyEmpty = Object.values(bmiData).some((val) => !val.trim());

    if (isAnyEmpty) {
      toast.error("All BMI fields are required.");
      return;
    }

    console.log("Submitted BMI Data:", bmiData);
    toast.success("MODIFIED BMI data saved successfully!");
    setShowBmiPopup(false);
  };

  const button = document.querySelector("#complete-btn");
  if (button) {
    button.classList.add("shake");
    setTimeout(() => button.classList.remove("shake"), 400);
  }
  const generateDietPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    // ✅ Add the logo (already imported)
    pdf.addImage(logo, "PNG", 14, 10, 50, 20); // x, y, width, height

    // ---------- STEP 1: TITLE + CLIENT PROFILE ----------
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Personalized - Meal Plan", 105, 20, { align: "center" });

    pdf.setFontSize(14);
    pdf.text("Client Profile", 14, 35);

    const col1X = 14;
    const col2X = 105;
    let y = 45;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Name: ${clientData?.name || "-"}`, col1X, y);
    pdf.text(`Age: ${clientData?.age || "-"}`, col2X, y);
    y += 8;
    pdf.text(`Height: ${clientData?.height || "-"} cm`, col1X, y);
    pdf.text(`Weight: ${clientData?.weight || "-"} kg`, col2X, y);
    y += 8;
    pdf.text(`BMI: ${clientData?.bmi || "-"}`, col1X, y);
    pdf.text(`Ideal Body Weight: ${bmiData?.ibw || "-"}`, col2X, y);
    y += 14;

    // ---------- STEP 2: NUTRITIONAL BLUEPRINT ----------
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Personalized Nutritional Blueprint", 14, y);
    y += 4;

    autoTable(pdf, {
      startY: y + 2,
      head: [
        [
          "BMI Category",
          "BMR",
          "TDEE",
          "Target",
          "Energy",
          "Protein",
          "Carbohydrate",
          "Fats",
        ],
      ],
      body: [
        [
          bmiData?.bmiCategory || "-",
          bmiData?.bmr || "-",
          bmiData?.tdee || "-",
          bmiData?.target || "-",
          bmiData?.energy || "-",
          bmiData?.protein || "-",
          bmiData?.carbohydrate || "-",
          bmiData?.fats || "-",
        ],
      ],
      theme: "striped",
      styles: { fontSize: 10, halign: "center" },
      headStyles: { fillColor: [204, 85, 0], textColor: "#fff" },
    });

    // ---------- STEP 3: DAILY ENERGY & PROTEIN DISTRIBUTION ----------
    let distY = pdf.lastAutoTable.finalY + 10;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Daily Energy & Protein Distribution", 14, distY);
    distY += 4;

    const distRows = energyProteinDistribution
      .filter((row) => selectedMeals.includes(row.mealName))
      .map((row) => [
        `${row.mealName} (${row.mealTime || "-"})`,
        row.calories || "-",
        row.protein || "-",
      ]);

    autoTable(pdf, {
      startY: distY + 2,
      head: [["Meal Time", "Target Calories", "Target Protein"]],
      body: distRows,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [204, 85, 0], textColor: "#fff" },
    });

    // ---------- STEP 4: DETAILED MEAL PLAN (TABLE FORMAT) ----------
    let optionY = pdf.lastAutoTable.finalY + 10;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Detailed Meal Plan", 14, optionY);
    optionY += 4;

    const optionTableRows = [];

    energyProteinDistribution
      .filter((row) => selectedMeals.includes(row.mealName))
      .forEach((meal) => {
        const mealTime = `${meal.mealName} (${meal.mealTime || "-"})`;

        meal.options.forEach((opt, index) => {
          optionTableRows.push([
            mealTime,
            `Option ${index + 1}`,
            opt.meal || "-",
            opt.ingredients || "-",
            opt.recipe || "-",
            opt.cookingVideo || "-",
          ]);
        });
      });

    autoTable(pdf, {
      startY: optionY + 2,
      head: [["Meal Time", "Option", "Meal", "Ingredients", "Recipe", "Video"]],

      body: optionTableRows,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 2, valign: "top" },
      headStyles: { fillColor: [204, 85, 0], textColor: "#fff" },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 20 },
        2: { cellWidth: 35 },
        3: { cellWidth: 50 },
        4: { cellWidth: 50 },
        5: { cellWidth: 50 },
      },
    });

    // ---------- STEP 5: DIETARY GUIDELINES ----------
    let guideY = pdf.lastAutoTable.finalY + 10;

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Dietary Guidelines", 14, guideY);
    guideY += 4;

    autoTable(pdf, {
      startY: guideY + 2,
      head: [["Guideline", "Description"]],
      body: dietaryGuidelines.map((item) => [item.type, item.description]),
      theme: "striped",
      styles: { fontSize: 10, valign: "top" },
      headStyles: { fillColor: [204, 85, 0], textColor: "#fff" },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 130 },
      },
    });

    // ---------- SAVE PDF ----------
    pdf.save(`DietPlan_${mrn}.pdf`);
    toast.success("PDF successfully generated and downloaded!");
  };
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [mealsRes, guidelinesRes] = await Promise.all([
          fetch("http://localhost:3001/mealTimes"),
          fetch("http://localhost:3001/dietGuidelines"),
        ]);
        const meals = await mealsRes.json();
        const guidelines = await guidelinesRes.json();
        setAvailableMeals(meals);
        setDietaryGuidelines(guidelines);
      } catch (err) {
        toast.error("Failed to load initial data");
      }
    };

    fetchInitialData();
  }, []);

  return (
    <div className="dashboard-main">
      <ToastContainer position="top-center" autoClose={2000} />
      <h1>Diet Plan Assignment</h1>

      {/* Search Section */}
      <div className="card">
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

      {clientData && (
        <>
          <div className="row">
            <div className="col card">
              <h2 className="card-header">Client Details</h2>
              <div>
                <strong>Name:</strong> {clientData.name}
              </div>
              <div>
                <strong>Age:</strong> {clientData.age}
              </div>
              <div>
                <strong>Height:</strong> {clientData.height}
              </div>
              <div>
                <strong>Weight:</strong> {clientData.weight}
              </div>
              <div>
                <strong>BMI:</strong> {clientData.bmi}
              </div>
              <div>
                <strong>Goal:</strong> {clientData.goal}
              </div>
            </div>
            <div className="card" ref={bmiCardRef}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  padding: "1rem",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <h2 className="text-primary" style={{ margin: 0 }}>
                  MODIFIED BMI
                </h2>
                <p
                  className="text-muted"
                  style={{ margin: 0, fontSize: "0.9rem" }}
                >
                  Click the button below to enter MODIFIED BMI details.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowBmiPopup(true)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    fontSize: "1rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Enter MODIFIED BMI
                </button>
              </div>
            </div>
          </div>

          <div className="card mt-4">
            <h2 className="card-header">Daily Energy & Protein Distribution</h2>
 {/* Warning */}
            {(!fromDateTime || !toDateTime) && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "1rem",
                  padding: "1rem",
                  backgroundColor: "#fff3cd",
                  color: "#856404",
                  border: "1px solid #ffeeba",
                  borderRadius: "5px",
                }}
              >
                Please select a <strong>From</strong> and <strong>To</strong>{" "}
                date range to activate the distribution section.
              </div>
            )}
            {/* Date Range Pickers */}
            <div
              className="d-flex gap-4 flex-wrap mb-3"
              style={{
                gap: "1rem",
                flexWrap: "wrap",
                justifyContent: "flex-start",
              }}
            >
              <div style={{ minWidth: "200px", flex: "1" }}>
                <label>From Date</label>
                <input
                  type="date"
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #cc5500",
                    fontSize: "1rem",
                    width: "100%",
                    maxWidth: "200px",
                    backgroundColor: "#fff",
                    color: "#333",
                  }}
                  value={fromDateTime}
                  onChange={(e) => setFromDateTime(e.target.value)}
                  min={new Date().toISOString().split("T")[0]} // ✅ Prevent past dates
                />
              </div>
              <div style={{ minWidth: "200px", flex: "1" }}>
                <label>To Date</label>
                <input
                  type="date"
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #cc5500",
                    fontSize: "1rem",
                    width: "100%",
                    maxWidth: "200px",
                    backgroundColor: "#fff",
                    color: "#333",
                  }}
                  value={toDateTime}
                  onChange={(e) => setToDateTime(e.target.value)}
                  min={fromDateTime || new Date().toISOString().split("T")[0]} // ✅ Prevent earlier than From Date
                />
              </div>
            </div>

            {/* Meal Time Selector */}
            <div className="mb-3" style={{ padding: "10px" }}>
              <label>Select Meal Time</label>
              <select
                className="form-control"
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cc5500",
                  fontSize: "1rem",
                  width: "100%",
                  maxWidth: "200px",
                  backgroundColor: "#fff",
                  color: "#333",
                }}
                onChange={(e) => {
                  const selected = e.target.value;
                  if (selected && !selectedMeals.includes(selected)) {
                    setSelectedMeals((prev) => [...prev, selected]);

                    setEnergyProteinDistribution((prev) => [
                      ...prev,
                      {
                        mealName: selected,
                        mealTime: "", // editable field
                        calories: "",
                        protein: "",
                        options: [],
                        enabled: true,
                      },
                    ]);
                  }
                }}
              >
                <option value="">-- Choose Meal --</option>
                {availableMeals.map((meal, i) => (
                  <option key={i} value={meal}>
                    {meal}
                  </option>
                ))}
              </select>
            </div>

            {/* Undo Tags */}
            <div className="mb-4" style={{ paddingTop: "15px" }}>
              {selectedMeals.map((meal, index) => (
                <span
                  key={index}
                  className="badge bg-secondary me-2"
                  style={{
                    cursor: "pointer",
                    padding: "10px 14px",
                    fontSize: "0.95rem",
                    backgroundColor: "#f2f2f2",
                    border: "1px solid #ccc",
                    borderRadius: "20px",
                    color: "#cc5500",
                    fontWeight: "bold",
                    margin: "4px",
                    display: "inline-block",
                  }}
                  onClick={() => {
                    setSelectedMeals((prev) => prev.filter((m) => m !== meal));
                    setEnergyProteinDistribution((prev) =>
                      prev.filter((row) => row.mealName !== meal)
                    );
                  }}
                >
                  {meal} ❌
                </span>
              ))}
            </div>

           

            {/* Conditionally Render Table */}
            {fromDateTime && toDateTime && selectedMeals.length > 0 && (
              <div className="table-responsive mt-3">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: "20%" }}>Meal Name</th>
                      <th style={{ width: "10%" }}>Time</th>
                      <th style={{ width: "15%" }}>Target Calories</th>
                      <th style={{ width: "15%" }}>Target Protein</th>
                      <th style={{ width: "20%" }}>Actions</th>
                      <th style={{ width: "20%" }}>
                        Previous Assigned Options
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {energyProteinDistribution.map((row, index) => (
                      <tr
                        key={index}
                        className={!row.enabled ? "disabled-meal" : ""}
                      >
                        {/* Meal Name */}
                        <td
                          style={{
                            textAlign: "center",
                            verticalAlign: "middle",
                            padding: "8px",
                            fontWeight: "bold",
                          }}
                        >
                          {row.mealName}
                        </td>

                        {/* Time Picker */}
                        <td>
                          <input
                            type="time"
                            style={{
                              padding: "10px",
                              borderRadius: "6px",
                              border: "1px solid #cc5500",
                              fontSize: "1rem",
                              width: "100%",
                              maxWidth: "120px",
                              backgroundColor: "#fff",
                              color: "#333",
                            }}
                            value={row.mealTime}
                            onChange={(e) =>
                              handleEnergyProteinChange(
                                index,
                                "mealTime",
                                e.target.value
                              )
                            }
                          />
                        </td>

                        {/* Calories */}
                        <td>
                          <input
                            placeholder="kcal"
                            type="text"
                            value={row.calories}
                            onChange={(e) =>
                              handleEnergyProteinChange(
                                index,
                                "calories",
                                e.target.value
                              )
                            }
                            style={{
                              padding: "10px",
                              borderRadius: "6px",
                              border: "1px solid #cc5500",
                              fontSize: "1rem",
                              width: "100%",
                              maxWidth: "120px",
                              backgroundColor: "#fff",
                              color: "#333",
                            }}
                          />
                        </td>

                        {/* Protein */}
                        <td>
                          <input
                            placeholder="g"
                            type="text"
                            value={row.protein}
                            onChange={(e) =>
                              handleEnergyProteinChange(
                                index,
                                "protein",
                                e.target.value
                              )
                            }
                            style={{
                              padding: "10px",
                              borderRadius: "6px",
                              border: "1px solid #cc5500",
                              fontSize: "1rem",
                              width: "100%",
                              maxWidth: "120px",
                              backgroundColor: "#fff",
                              color: "#333",
                            }}
                          />
                        </td>

                        {/* Actions */}
                        <td>
                          <button
                            className="btn btn-primary"
                            style={{
                              padding: "8px 14px",
                              borderRadius: "6px",
                              backgroundColor: "#cc5500",
                              border: "none",
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: "0.95rem",
                              cursor: "pointer",
                              width: "fit-content",
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => handleAddOptionClick(index)}
                          >
                            + Add Option
                          </button>
                        </td>

                        {/* Previous Assigned Options */}
                        <td style={{ verticalAlign: "top" }}>
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              setShowOptionGridPopup({ visible: true, index })
                            }
                            disabled={row.options.length === 0}
                          >
                            View Options ({row.options.length})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={generateDietPDF}
              disabled={
                !fromDateTime ||
                !toDateTime ||
                selectedMeals.length === 0 ||
                energyProteinDistribution.length === 0
              }
            >
              Generate PDF
            </button>
            <div className="text-center mt-4">
              <center>
                {" "}
                <button
                  id="complete-btn"
                  className="btn btn-primary"
                  onClick={handleCompleteAssignment}
                >
                  Complete Assignment
                </button>
              </center>
              {pdfUrl && (
                <button
                  className="btn btn-secondary mt-2"
                  onClick={() => setShowPdfViewer(true)}
                >
                  View Generated PDF
                </button>
              )}
            </div>
          </div>
          {clientData && (
            <div className="text-end mt-3">
              <button
                className="btn btn-primary"
                onClick={() => setShowHistoryCards(true)}
              >
                Previous Assigned Charts
              </button>
            </div>
          )}
        </>
      )}
      {showHistoryCards && (
        <div className="card mt-3 p-3">
          <h4 className="text-center mb-3">Previous Plans</h4>
          <div className="row">
            {assignedPlans.map((plan, idx) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={idx}>
                <div className="card h-100">
                  <div className="card-body">
                    <p>
                      <strong>From:</strong> {plan.fromDateTime}
                    </p>
                    <p>
                      <strong>To:</strong> {plan.toDateTime}
                    </p>
                  </div>
                  <div className="card-footer text-end">
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedPlanToView(plan)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-end">
            <button
              className="btn btn-primary"
              onClick={() => setShowHistoryCards(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {selectedPlanToView && (
        <div
          className="popup-overlay"
          onClick={() => setSelectedPlanToView(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="popup-content card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={() => setSelectedPlanToView(null)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#cc5500",
                border: "none",
                padding: "0.5rem 1rem",
                fontWeight: "bold",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Close
            </button>

            <h3 className="text-center mb-3">Assigned Diet Plan</h3>
            <p>
              <strong>From:</strong> {selectedPlanToView.fromDateTime}
            </p>
            <p>
              <strong>To:</strong> {selectedPlanToView.toDateTime}
            </p>
            <p>
              <strong>BMI Category:</strong>{" "}
              {selectedPlanToView.bmiData?.bmiCategory || "-"}
            </p>

            {selectedPlanToView.meals.map((meal, idx) => (
              <div key={idx} className="card mb-3 p-3">
                <h5 className="text-primary">
                  {meal.meal || meal.mealName} (
                  {meal.mealTime || "Not specified"})
                </h5>

                <p>
                  <strong>Calories:</strong> {meal.calories} kcal
                </p>
                <p>
                  <strong>Protein:</strong> {meal.protein} g
                </p>
                <ul>
                  {meal.options.map((opt, i) => (
                    <li key={i}>
                      <strong>{opt.meal}</strong>
                      <br />
                      <em>Ingredients:</em> {opt.ingredients}
                      <br />
                      <em>Recipe:</em> {opt.recipe}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Popup */}
      {showViewPopup.visible && (
        <div
          className="popup-overlay"
          onClick={() => setShowViewPopup({ visible: false, option: null })}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="popup-content card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              className="close-btn"
              onClick={() => setShowViewPopup({ visible: false, option: null })}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#cc5500",
                border: "none",
                padding: "0.5rem 1rem",
                fontWeight: "bold",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Close
            </button>
            <h2>Meal Option Details</h2>
            <p>
              <strong>Meal:</strong> {showViewPopup.option.meal}
            </p>
            <p>
              <strong>Ingredients:</strong> {showViewPopup.option.ingredients}
            </p>
            <p>
              <strong>Recipe:</strong> {showViewPopup.option.recipe}
            </p>
            <p>
              <strong>Video:</strong>{" "}
              <a
                href={showViewPopup.option.cookingVideo}
                target="_blank"
                rel="noreferrer"
              >
                Watch Video
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Confirm Delete Popup */}
      {confirmDelete.visible && (
        <div
          className="popup-overlay"
          onClick={() =>
            setConfirmDelete({ visible: false, rowIndex: null, optIndex: null })
          }
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="popup-content card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this meal option?</p>
            <div className="d-flex justify-content-end gap-3 mt-3">
              <button className="btn btn-danger" onClick={confirmDeleteOption}>
                Yes, Delete
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() =>
                  setConfirmDelete({
                    visible: false,
                    rowIndex: null,
                    optIndex: null,
                  })
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showBmiPopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowBmiPopup(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="popup-content card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              className="close-btn"
              onClick={() => setShowBmiPopup(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#cc5500",
                border: "none",
                padding: "0.5rem 1rem",
                fontWeight: "bold",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              X
            </button>
            <h2>MODIFIED BMI</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault(); // prevent page reload
                handleBmiSubmit();
              }}
            >
              {Object.entries(bmiData).map(([key, value]) => (
                <div
                  className="form-group d-flex align-items-center mb-2"
                  key={key}
                  style={{ gap: "10px" }}
                >
                  <label
                    htmlFor={key}
                    style={{
                      width: "140px",
                      fontWeight: "600",
                      marginBottom: "0",
                    }}
                  >
                    {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                  </label>
                  <input
                    type="text"
                    name={key}
                    id={key}
                    value={value}
                    onChange={handleBmiChange}
                    className="form-control"
                    placeholder={`Enter ${key}`}
                    style={{ flex: 1 }}
                    required
                  />
                </div>
              ))}

              <center>
                <button type="submit" className="btn btn-primary mt-3">
                  Submit
                </button>
              </center>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Option Popup (already implemented earlier) */}
      {showOptionPopup.visible && (
        <div
          className="popup-overlay"
          onClick={() => setShowOptionPopup({ index: null, visible: false })}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="popup-content card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              className="close-btn"
              onClick={() =>
                setShowOptionPopup({ index: null, visible: false })
              }
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#cc5500",
                border: "none",
                padding: "0.5rem 1rem",
                fontWeight: "bold",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              X
            </button>
            <h2>{editIndex.row !== null ? "Edit" : "Add"} Meal Option</h2>
            <div className="form-group">
              <label>Meal</label>
              <input
                type="text"
                name="meal"
                value={newOption.meal}
                onChange={handleOptionChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>Ingredients</label>
              <textarea
                name="ingredients"
                value={newOption.ingredients}
                onChange={handleOptionChange}
                className="form-control"
                style={{ height: "160px" }}
                required
              />
            </div>

            <div className="form-group">
              <label>Recipe</label>
              <textarea
                name="recipe"
                value={newOption.recipe}
                onChange={handleOptionChange}
                className="form-control"
                style={{ height: "160px" }}
                required
              />
            </div>
            <div className="form-group">
              <label>Cooking Video Link</label>
              <input
                type="text"
                name="cookingVideo"
                value={newOption.cookingVideo}
                onChange={(e) =>
                  setNewOption({ ...newOption, cookingVideo: e.target.value })
                }
                className="form-control"
                placeholder="https://youtube.com/..."
              />
            </div>

            <center>
              <button
                className="btn btn-primary mt-2"
                type="button"
                onClick={handleOptionSubmit}
              >
                Submit
              </button>
            </center>
          </div>
        </div>
      )}
      {showOptionGridPopup.visible && (
        <div
          className="popup-overlay"
          onClick={() =>
            setShowOptionGridPopup({ visible: false, index: null })
          }
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9998,
          }}
        >
          <div
            className="popup-content card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "980px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <center>
              <h3 className="mb-3 text-center">Assigned Meal Options</h3>
            </center>
            <div className="row">
              {energyProteinDistribution[showOptionGridPopup.index].options.map(
                (opt, i) => (
                  <div className="col-md-4 mb-4" key={i}>
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title text-primary">
                          Option {i + 1}
                        </h5>
                        <p
                          className="card-text"
                          style={{
                            wordBreak: "break-word", // ✅ force break long words
                            whiteSpace: "normal", // ✅ allow wrapping
                            overflowWrap: "break-word",
                            lineHeight: "1.4",
                            maxWidth: "100%", // ✅ keep it inside the card
                          }}
                        >
                          <strong>Meal:</strong> {opt.meal || "N/A"}
                        </p>
                      </div>
                      <div className="card-footer d-flex justify-content-between">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleOptionView(opt)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            handleOptionEdit(showOptionGridPopup.index, i)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            handleDeleteConfirm(showOptionGridPopup.index, i)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
            <div className="text-end mt-3">
              <center>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setShowOptionGridPopup({ visible: false, index: null })
                  }
                >
                  Close
                </button>
              </center>
            </div>
          </div>
        </div>
      )}

      {showPdfViewer && pdfUrl && (
        <div
          className="popup-overlay"
          onClick={() => setShowPdfViewer(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="popup-content card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setShowPdfViewer(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#cc5500",
                border: "none",
                padding: "0.5rem 1rem",
                fontWeight: "bold",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Close
            </button>
            <iframe
              src={pdfUrl}
              title="Diet PDF"
              width="100%"
              height="600px"
              style={{ border: "none" }}
            ></iframe>
          </div>
        </div>
      )}

      <div
        id="pdf-preview"
        style={{
          visibility: "hidden",
          position: "absolute",
          left: "-9999px",
          top: 0,
          backgroundColor: "white",
          color: "black",
          padding: "2rem",
          width: "794px", // exact A4 width @ 96dpi
          fontSize: "14px",
          lineHeight: "1.6",
          zIndex: -1,
        }}
      >
        <h2 style={{ textAlign: "center" }}>Personalized Meal Plan</h2>
        <p>
          <strong>Name:</strong> {clientData?.name}
        </p>
        <p>
          <strong>Age:</strong> {clientData?.age}
        </p>
        <p>
          <strong>Height:</strong> {clientData?.height} cm
        </p>
        <p>
          <strong>Weight:</strong> {clientData?.weight} kg
        </p>
        <p>
          <strong>BMI:</strong> {clientData?.bmi}
        </p>
        <hr />
        <h3>Nutrition Blueprint</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }} border="1">
          <thead>
            <tr>
              <th>BMI Category</th>
              <th>BMR</th>
              <th>TDEE</th>
              <th>Target</th>
              <th>Energy</th>
              <th>Protein</th>
              <th>Carbs</th>
              <th>Fats</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{bmiData.bmiCategory}</td>
              <td>{bmiData.bmr}</td>
              <td>{bmiData.tdee}</td>
              <td>{bmiData.target}</td>
              <td>{bmiData.energy}</td>
              <td>{bmiData.protein}</td>
              <td>{bmiData.carbohydrate}</td>
              <td>{bmiData.fats}</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ marginTop: "2rem" }}>
          Daily Energy & Protein Distribution
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }} border="1">
          <thead>
            <tr>
              <th>Meal Time</th>
              <th>Calories</th>
              <th>Protein</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {energyProteinDistribution.map((meal, idx) => (
              <tr key={idx}>
                <td>{meal.meal || meal.mealName}</td>

                <td>{meal.calories}</td>
                <td>{meal.protein}</td>
                <td>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {meal.options.map((opt, i) => (
                        <tr key={i}>
                          <td style={{ paddingBottom: "10px" }}>
                            <strong>Option {i + 1}:</strong> {opt.meal}
                            <br />
                            <em>Ingredients:</em> {opt.ingredients}
                            <br />
                            <em>Recipe:</em> {opt.recipe}
                            {opt.cookingVideo && (
                              <>
                                <br />
                                <em>Video:</em>{" "}
                                <a
                                  href={opt.cookingVideo}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Watch
                                </a>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DietMealPlanAssign;
