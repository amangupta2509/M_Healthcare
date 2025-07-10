import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { Link } from "react-router-dom";

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
  const [assignedPlans, setAssignedPlans] = useState([]);
  const [focusedCaloriesIndex, setFocusedCaloriesIndex] = useState(null);
  const [focusedProteinIndex, setFocusedProteinIndex] = useState(null);
  const [dietMode, setDietMode] = useState(""); // ✅ default hidden
  const [aiInjected, setAiInjected] = useState(false);

  const location = useLocation();
  const {
    aiGeneratedText = "",
    aiInitialData = {},
    mrn: stateMrn,
    clientData: stateClientData,
    fromDateTime: stateFrom,
    toDateTime: stateTo,
    bmiData: stateBmi,
    energyProteinDistribution: stateDist,
    selectedMeals: stateMeals,
  } = location.state || {};

  useEffect(() => {
    if (stateMrn) setMrn(stateMrn);
    if (stateClientData) setClientData(stateClientData);
    if (stateFrom) setFromDateTime(stateFrom);
    if (stateTo) setToDateTime(stateTo);
    if (stateBmi) setBmiData(stateBmi);
    if (stateDist) setEnergyProteinDistribution(stateDist);
    if (stateMeals) setSelectedMeals(stateMeals);
  }, []);

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
  const InputField = ({ label, name, value, onChange, readOnly = false }) => (
    <div>
      <label style={{ fontWeight: "600" }}>{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className="form-control"
        style={{
          backgroundColor: readOnly ? "#f0f0f0" : "var(--bg-primary)",
          color: readOnly ? "#555" : undefined,
        }}
      />
    </div>
  );

  const DropdownField = ({ label, name, value, onChange, options }) => (
    <div>
      <label style={{ fontWeight: "600" }}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="form-control"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-white)",
        }}
      >
        <option value="">-- Select --</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.split(" ")[0]}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
  useEffect(() => {
    if (
      !clientData?.height ||
      !clientData?.weight ||
      !clientData?.age ||
      !clientData?.gender
    )
      return;

    const heightInMeters = clientData.height / 100;
    const weight = clientData.weight;
    const age = clientData.age;
    const gender = clientData.gender.toLowerCase();

    // BMI
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);

    // BMI Category
    let bmiCategory = "";
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi < 24.9) bmiCategory = "Normal";
    else if (bmi < 29.9) bmiCategory = "Overweight";
    else bmiCategory = "Obese";

    // BMR
    let bmr;
    if (gender === "male") {
      bmr = (10 * weight + 6.25 * clientData.height - 5 * age + 5).toFixed(2);
    } else {
      bmr = (10 * weight + 6.25 * clientData.height - 5 * age - 161).toFixed(2);
    }

    // TDEE — only if dropdown selected
    const activityMultiplier = parseFloat(bmiData.tdee);
    let tdee = "";
    if (!isNaN(activityMultiplier)) {
      tdee = (bmr * activityMultiplier).toFixed(2);
    }

    setBmiData((prev) => ({
      ...prev,
      bmi,
      bmiCategory: prev.bmiCategory || bmiCategory,
      bmr,
      calculatedTdee: tdee || prev.calculatedTdee,
    }));
  }, [clientData, bmiData.tdee]);

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
  useEffect(() => {
    if (!aiGeneratedText || aiInjected) return;

    setDietMode("ai"); // Ensure AI mode is set
    setAiInjected(true); // ✅ Prevent further execution of this effect

    const breakfastIndex = energyProteinDistribution.findIndex(
      (row) => row.mealName.toLowerCase() === "breakfast"
    );

    if (breakfastIndex !== -1) {
      const updated = [...energyProteinDistribution];
      const alreadyHasAI = updated[breakfastIndex].options.some(
        (opt) => opt.meal === "AI Suggested"
      );

      if (!alreadyHasAI) {
        updated[breakfastIndex].options.push({
          meal: "AI Suggested",
          ingredients: "-",
          recipe: aiGeneratedText,
          cookingVideo: "",
        });
        setEnergyProteinDistribution(updated);
        toast.success("AI plan added to Breakfast automatically");
      }
    } else {
      setSelectedMeals((prev) => [...prev, "Breakfast"]);
      setEnergyProteinDistribution((prev) => [
        ...prev,
        {
          mealName: "Breakfast",
          mealTime: "08:00",
          calories: "400",
          protein: "20",
          enabled: true,
          options: [
            {
              meal: "AI Suggested",
              ingredients: "-",
              recipe: aiGeneratedText,
              cookingVideo: "",
            },
          ],
        },
      ]);
      toast.success("AI plan injected as Breakfast meal");
    }

    // Auto-scroll to meal section
    setTimeout(() => {
      const section = document.getElementById("meal-plan-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);
  }, [aiGeneratedText, energyProteinDistribution, aiInjected]);
  const handleSwitchToAI = () => {
    const hasManualData = energyProteinDistribution.length > 0;

    if (hasManualData) {
      const confirmSwitch = window.confirm(
        "You’ve already entered a manual diet plan. Switching to AI mode will discard it. Continue?"
      );
      if (!confirmSwitch) return;

      // Clear manual data
      setSelectedMeals([]);
      setEnergyProteinDistribution([]);
    }

    setDietMode("ai");
  };
  // Custom confirmation toast
  const ConfirmSwitchToast = ({ message, onConfirm, onCancel }) => (
    <div style={{ padding: "0.5rem" }}>
      <p style={{ marginBottom: "0.5rem" }}>{message}</p>
      <div
        style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}
      >
        <button
          onClick={() => {
            toast.dismiss();
            onConfirm();
          }}
          style={{
            background: "#16a34a",
            color: "#fff",
            border: "none",
            padding: "0.3rem 0.6rem",
            borderRadius: "5px",
          }}
        >
          Yes
        </button>
        <button
          onClick={() => {
            toast.dismiss();
            if (onCancel) onCancel();
          }}
          style={{
            background: "#dc2626",
            color: "#fff",
            border: "none",
            padding: "0.3rem 0.6rem",
            borderRadius: "5px",
          }}
        >
          No
        </button>
      </div>
    </div>
  );
  const handleSwitchToManual = () => {
    const hasAI = aiGeneratedText || dietMode === "ai";

    if (hasAI) {
      const confirmSwitch = window.confirm(
        "You're currently using an AI-generated plan. Switching to Manual mode will discard it. Continue?"
      );
      if (!confirmSwitch) return;

      // Clear AI data
      setEnergyProteinDistribution([]);
      setSelectedMeals([]);
      setAiInjected(false); // reset flag
      location.state = {}; // optional: clear nav state
    }

    setDietMode("manual");
  };

  const handleBmiChange = (e) => {
    let { name, value } = e.target;

    // Clean number before appending unit
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Append correct units
    if (name === "energy" || name === "target") {
      value = `${numericValue} kcal/day`;
    } else if (
      name === "protein" ||
      name === "carbohydrate" ||
      name === "fats"
    ) {
      value = `${numericValue} g`;
    }

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
      <div className="card" style={{ marginBottom: "1.5%" }}>
        <div
          className="form-group"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "0",
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
              marginBottom: "0",
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
            {/* Always visible Date Range and Choose Diet Plan Mode */}
            <h2 className="card-header">Daily Energy & Protein Distribution</h2>
            {(!fromDateTime || !toDateTime) && (
              <div
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  marginBottom: "1rem",
                  backgroundColor: "var(--bg-primary)",
                  color: "#FF0000",
                  border: "1px solid (255, 191, 0)",
                  borderRadius: "5px",
                }}
              >
                Please select a <strong>From</strong> and <strong>To</strong>{" "}
                date range to activate the distribution section.
              </div>
            )}
            {/* Date Range Pickers */}
            <div
              className="date-range-container"
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                marginBottom: "1rem",
              }}
            >
              <div style={{ flex: "1", minWidth: "150px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  From Date
                </label>
                <input
                  type="date"
                  placeholder="DD-MM-YYYY"
                  style={{
                    borderRadius: "6px",
                    border: "1px solid #cc5500",
                    fontSize: "1rem",
                    width: "100%",
                    color: "var(--text-white)",
                    backgroundColor: "var(--bg-primary)",
                  }}
                  value={fromDateTime}
                  onChange={(e) => setFromDateTime(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div style={{ flex: "1", minWidth: "150px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  To Date
                </label>
                <input
                  type="date"
                  placeholder="DD-MM-YYYY"
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #cc5500",
                    fontSize: "1rem",
                    width: "100%",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-white)",
                  }}
                  value={toDateTime}
                  onChange={(e) => setToDateTime(e.target.value)}
                  min={fromDateTime || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Choose Diet Plan Mode */}
            {clientData && fromDateTime && toDateTime && (
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h2 className="card-header">Choose Diet Plan Mode</h2>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className={`btn ${
                      dietMode === "manual" ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => {
                      const hasAI = aiGeneratedText || dietMode === "ai";

                      if (hasAI) {
                        toast.info(
                          <ConfirmSwitchToast
                            message="You're currently using an AI-generated plan. Switch to Manual Mode and discard AI data?"
                            onConfirm={() => {
                              setEnergyProteinDistribution([]);
                              setSelectedMeals([]);
                              setAiInjected(false);
                              if (location.state)
                                location.state.aiGeneratedText = "";
                              setDietMode("manual");
                              toast.success("Switched to Manual Mode");
                            }}
                          />,
                          { autoClose: false }
                        );
                      } else {
                        setDietMode("manual");
                      }
                    }}
                  >
                    Manual Mode
                  </button>

                  <button
                    className={`btn ${
                      dietMode === "ai" ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => {
                      const hasManualData =
                        energyProteinDistribution.length > 0;

                      if (hasManualData) {
                        toast.info(
                          <ConfirmSwitchToast
                            message="You've already entered a manual diet plan. Switch to AI Mode and discard it?"
                            onConfirm={() => {
                              setEnergyProteinDistribution([]);
                              setSelectedMeals([]);
                              setDietMode("ai");
                              toast.success("Switched to AI Mode");
                            }}
                          />,
                          { autoClose: false }
                        );
                      } else {
                        setDietMode("ai");
                      }
                    }}
                  >
                    AI Generated Plan 🤖
                  </button>
                </div>
              </div>
            )}

            {/* Conditionally Render Content Based on Diet Plan Mode */}
            <div className="card">
              {dietMode === "manual" && (
                <>
                  {/* Show Manual Mode Content */}
                  <h2>Manual Meal Plan</h2>
                  <p>Select Meal Time, Calories, and Protein</p>

                  {/* Meal Time Selector and Input Fields */}
                  <div className="meal-selector">
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                        color: "var(--text-white)", // optional if not globally styled
                      }}
                    >
                      Select Meal Time
                    </label>

                    {/* Dropdown to select meal */}
                    <select
                      className="form-control"
                      style={{
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #cc5500",
                        fontSize: "1rem",
                        width: "100%",
                        maxWidth: "250px",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-white)",
                        marginBottom: "1rem",
                      }}
                      onChange={(e) => {
                        const selected = e.target.value;
                        if (selected && !selectedMeals.includes(selected)) {
                          setSelectedMeals((prev) => [...prev, selected]);

                          setEnergyProteinDistribution((prev) => [
                            ...prev,
                            {
                              mealName: selected,
                              mealTime: "",
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
                      {availableMeals.map((meal) => (
                        <option key={meal.id} value={meal.name}>
                          {meal.name}
                        </option>
                      ))}
                    </select>

                    {/* Render selected meals as buttons with '×' to remove */}
                    <div
                      className="selected-meals"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        paddingTop: "5px",
                      }}
                    >
                      {selectedMeals.map((meal, index) => (
                        <div
                          key={index}
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <button
                            className="selected-meal-btn"
                            style={{
                              padding: "10px 14px",
                              fontSize: "0.95rem",
                              backgroundColor: "transparent",
                              border: "1px solid #cc5500",
                              borderRadius: "10px",
                              color: "var(--text-white)",
                              fontWeight: "bold",
                              cursor: "default",
                            }}
                            disabled
                          >
                            {meal}
                          </button>
                          <span
                            onClick={() => {
                              setSelectedMeals((prev) =>
                                prev.filter((m) => m !== meal)
                              );
                              setEnergyProteinDistribution((prev) =>
                                prev.filter((row) => row.mealName !== meal)
                              );
                            }}
                            style={{
                              position: "absolute",
                              top: "-6px",
                              right: "-6px",
                              backgroundColor: "#cc5500",
                              color: "#fff",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              fontSize: "14px",
                              fontWeight: "bold",
                              lineHeight: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              boxShadow: "0 0 2px rgba(0, 0, 0, 0.5)",
                              zIndex: 1,
                            }}
                            title="Remove"
                          >
                            ×
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conditionally Render Table for Manual Mode */}
                  {fromDateTime && toDateTime && selectedMeals.length > 0 && (
                    <div className="meal-table-container">
                      <style jsx>{`
                        .meal-table-container {
                          margin-top: 1rem;
                          overflow-x: auto;
                          border-radius: 4px;
                          overflow: hidden;
                          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                          background-color: var(--bg-primary);
                          -webkit-overflow-scrolling: touch;
                        }

                        .meal-table {
                          width: 100%;
                          border-collapse: collapse;
                          min-width: 700px;
                          font-family: -apple-system, BlinkMacSystemFont,
                            "Segoe UI", Roboto, sans-serif;
                        }

                        .meal-table thead {
                          background: linear-gradient(135deg, #cc5500, #cc5500);
                          color: "var(--text-white)";
                        }

                        .meal-table th {
                          padding: 12px 8px;
                          font-weight: 600;
                          font-size: 0.9rem;
                          text-align: center;
                          border: none;
                          position: sticky;
                          top: 0;
                          z-index: 10;
                          white-space: nowrap;
                        }

                        .meal-table tbody tr {
                          transition: background-color 0.2s ease;
                          border: 1px solid #cc5500;
                        }

                        .meal-table td {
                          padding: 12px 8px;
                          text-align: center;
                          vertical-align: middle;
                          border: none;
                        }

                        .meal-name {
                          font-weight: bold;
                          color: "var(--text-white)";
                          font-size: 0.95rem;
                          word-break: break-word;
                        }

                        .meal-input {
                          width: 100%;
                          min-width: 80px;
                          max-width: 120px;
                          padding: 8px;
                          border-radius: 6px;
                          border: 2px solid #cc5500;
                          font-size: 0.9rem;
                          background-color: #fff;
                          color: #333;
                          transition: border-color 0.2s ease,
                            box-shadow 0.2s ease;
                          box-sizing: border-box;
                        }

                        .meal-input:focus {
                          outline: none;
                          border-color: #cc5500;
                          box-shadow: 0 0 0 3px rgba(204, 85, 0, 0.1);
                        }

                        .meal-input::placeholder {
                          color: #888;
                          font-size: 0.85rem;
                        }

                        .meal-btn {
                          padding: 8px 12px;
                          border-radius: 6px;
                          background: linear-gradient(135deg, #cc5500, #e06600);
                          border: none;
                          color: white;
                          font-weight: bold;
                          font-size: 0.85rem;
                          cursor: pointer;
                          white-space: nowrap;
                          transition: all 0.2s ease;
                          box-shadow: 0 2px 4px rgba(204, 85, 0, 0.2);
                          min-width: fit-content;
                        }

                        .meal-btn:hover {
                          background: linear-gradient(135deg, #b84d00, #cc5500);
                          transform: translateY(-1px);
                          box-shadow: 0 4px 8px rgba(204, 85, 0, 0.3);
                        }

                        .meal-btn:disabled {
                          background: #ccc;
                          color: #666;
                          cursor: not-allowed;
                          transform: none;
                          box-shadow: none;
                        }

                        .options-cell {
                          vertical-align: top;
                          padding-top: 12px;
                        }

                        /* Card Layout for Mobile */
                        .meal-cards {
                          display: none;
                          flex-direction: column;
                          gap: 1rem;
                          padding: 1rem;
                        }

                        .meal-card {
                          background: var(--bg-primary);
                          border: 2px solid #cc5500;
                          border-radius: 8px;
                          padding: 1rem;
                          box-shadow: 0 2px 4px rgba(204, 85, 0, 0.1);
                        }

                        .meal-card-header {
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          margin-bottom: 1rem;
                          padding-bottom: 0.5rem;
                          border-bottom: 1px solid #e9ecef;
                        }

                        .meal-card-title {
                          font-weight: bold;
                          color: var(--text-primary);
                          font-size: 1.1rem;
                        }

                        .meal-card-grid {
                          display: grid;
                          grid-template-columns: 1fr 1fr;
                          gap: 1rem;
                          margin-bottom: 1rem;
                        }

                        .meal-card-field {
                          display: flex;
                          flex-direction: column;
                          gap: 0.25rem;
                        }

                        .meal-card-label {
                          font-weight: 600;
                          color: #cc5500;
                          font-size: 0.85rem;
                        }

                        .meal-card-input {
                          padding: 8px;
                          border-radius: 6px;
                          border: 2px solid #cc5500;
                          font-size: 0.9rem;
                          background-color: #fff;
                          color: #333;
                          transition: border-color 0.2s ease,
                            box-shadow 0.2s ease;
                        }

                        .meal-card-input:focus {
                          outline: none;
                          border-color: #cc5500;
                          box-shadow: 0 0 0 3px rgba(204, 85, 0, 0.1);
                        }

                        .meal-card-actions {
                          display: flex;
                          gap: 0.5rem;
                          justify-content: flex-end;
                        }

                        .meal-card-btn {
                          padding: 8px 16px;
                          border-radius: 6px;
                          background: linear-gradient(135deg, #cc5500, #e06600);
                          border: none;
                          color: white;
                          font-weight: bold;
                          font-size: 0.85rem;
                          cursor: pointer;
                          transition: all 0.2s ease;
                          box-shadow: 0 2px 4px rgba(204, 85, 0, 0.2);
                        }

                        .meal-card-btn:hover {
                          background: linear-gradient(135deg, #b84d00, #cc5500);
                          transform: translateY(-1px);
                          box-shadow: 0 4px 8px rgba(204, 85, 0, 0.3);
                        }

                        .meal-card-btn:disabled {
                          background: #ccc;
                          color: #666;
                          cursor: not-allowed;
                          transform: none;
                          box-shadow: none;
                        }

                        /* Mobile First Responsive Design */
                        @media (max-width: 768px) {
                          .meal-table-container {
                            margin: 1rem 0;
                            border-radius: 8px;
                            box-shadow: none;
                            background: transparent;
                            overflow: visible;
                          }

                          .meal-table {
                            display: none;
                          }

                          .meal-cards {
                            display: flex;
                          }

                          .meal-card-grid {
                            grid-template-columns: 1fr;
                            gap: 0.75rem;
                          }

                          .meal-card {
                            padding: 0.75rem;
                          }

                          .meal-card-actions {
                            flex-direction: column;
                            gap: 0.5rem;
                          }

                          .meal-card-btn {
                            width: 100%;
                          }
                        }

                        @media (max-width: 480px) {
                          .meal-cards {
                            padding: 0.5rem;
                            gap: 0.75rem;
                          }

                          .meal-card {
                            padding: 0.5rem;
                          }

                          .meal-card-title {
                            font-size: 1rem;
                          }

                          .meal-card-input {
                            padding: 6px;
                            font-size: 0.85rem;
                          }

                          .meal-card-btn {
                            padding: 6px 12px;
                            font-size: 0.8rem;
                          }
                        }

                        /* Large screens optimization */
                        @media (min-width: 1200px) {
                          .meal-table {
                            min-width: 800px;
                          }

                          .meal-input {
                            max-width: 140px;
                            padding: 10px;
                          }

                          .meal-btn {
                            padding: 10px 16px;
                            font-size: 0.9rem;
                          }
                        }
                      `}</style>

                      {/* Table Layout for Desktop */}
                      <table className="meal-table">
                        <thead>
                          <tr>
                            <th>Meal Name</th>
                            <th>Time</th>
                            <th>Calories</th>
                            <th>Protein</th>
                            <th>Actions</th>
                            <th>Options</th>
                          </tr>
                        </thead>
                        <tbody>
                          {energyProteinDistribution.map((row, index) => (
                            <tr
                              key={index}
                              className={!row.enabled ? "disabled-meal" : ""}
                            >
                              <td>
                                <div className="meal-name">{row.mealName}</div>
                              </td>

                              <td>
                                <input
                                  type="time"
                                  className="meal-input"
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

                              <td>
                                <input
                                  className="meal-input"
                                  type={
                                    focusedCaloriesIndex === index ||
                                    row.calories
                                      ? "number"
                                      : "text"
                                  }
                                  placeholder="kcal"
                                  value={row.calories}
                                  onChange={(e) =>
                                    handleEnergyProteinChange(
                                      index,
                                      "calories",
                                      e.target.value
                                    )
                                  }
                                  onFocus={() => setFocusedCaloriesIndex(index)}
                                  onBlur={() => setFocusedCaloriesIndex(null)}
                                />
                              </td>

                              <td>
                                <input
                                  className="meal-input"
                                  type={
                                    focusedProteinIndex === index || row.protein
                                      ? "number"
                                      : "text"
                                  }
                                  placeholder="g"
                                  value={row.protein}
                                  onChange={(e) =>
                                    handleEnergyProteinChange(
                                      index,
                                      "protein",
                                      e.target.value
                                    )
                                  }
                                  onFocus={() => setFocusedProteinIndex(index)}
                                  onBlur={() => setFocusedProteinIndex(null)}
                                />
                              </td>

                              <td>
                                <button
                                  className="meal-btn"
                                  onClick={() => handleAddOptionClick(index)}
                                >
                                  Add
                                </button>
                              </td>

                              <td className="options-cell">
                                <button
                                  className="meal-btn"
                                  onClick={() =>
                                    setShowOptionGridPopup({
                                      visible: true,
                                      index,
                                    })
                                  }
                                  disabled={row.options.length === 0}
                                >
                                  View ({row.options.length})
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Card Layout for Mobile */}
                      <div className="meal-cards">
                        {energyProteinDistribution.map((row, index) => (
                          <div key={index} className="meal-card">
                            <div className="meal-card-header">
                              <div className="meal-card-title">
                                {row.mealName}
                              </div>
                            </div>

                            <div className="meal-card-grid">
                              <div className="meal-card-field">
                                <label className="meal-card-label">Time</label>
                                <input
                                  type="time"
                                  className="meal-card-input"
                                  value={row.mealTime}
                                  onChange={(e) =>
                                    handleEnergyProteinChange(
                                      index,
                                      "mealTime",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="meal-card-field">
                                <label className="meal-card-label">
                                  Calories
                                </label>
                                <input
                                  className="meal-card-input"
                                  type={
                                    focusedCaloriesIndex === index ||
                                    row.calories
                                      ? "number"
                                      : "text"
                                  }
                                  placeholder="kcal"
                                  value={row.calories}
                                  onChange={(e) =>
                                    handleEnergyProteinChange(
                                      index,
                                      "calories",
                                      e.target.value
                                    )
                                  }
                                  onFocus={() => setFocusedCaloriesIndex(index)}
                                  onBlur={() => setFocusedCaloriesIndex(null)}
                                />
                              </div>

                              <div className="meal-card-field">
                                <label className="meal-card-label">
                                  Protein
                                </label>
                                <input
                                  className="meal-card-input"
                                  type={
                                    focusedProteinIndex === index || row.protein
                                      ? "number"
                                      : "text"
                                  }
                                  placeholder="g"
                                  value={row.protein}
                                  onChange={(e) =>
                                    handleEnergyProteinChange(
                                      index,
                                      "protein",
                                      e.target.value
                                    )
                                  }
                                  onFocus={() => setFocusedProteinIndex(index)}
                                  onBlur={() => setFocusedProteinIndex(null)}
                                />
                              </div>
                            </div>

                            <div className="meal-card-actions">
                              <button
                                className="meal-card-btn"
                                onClick={() => handleAddOptionClick(index)}
                              >
                                Add Option
                              </button>
                              <button
                                className="meal-card-btn"
                                onClick={() =>
                                  setShowOptionGridPopup({
                                    visible: true,
                                    index,
                                  })
                                }
                                disabled={row.options.length === 0}
                              >
                                View Options ({row.options.length})
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {dietMode === "ai" && (
                <div id="meal-plan-section">
                  <h2 className="card-header">AI-Generated Meal Plan</h2>
                  <p>
                    This section will automatically generate a personalized plan
                    based on the client's profile and goals.
                  </p>

                  <Link
                    to="/diet_ai_assistant"
                    state={{
                      aiInitialData: {
                        mrn,
                        clientData,
                        fromDateTime,
                        toDateTime,
                        bmiData,
                        energyProteinDistribution,
                        selectedMeals,
                      },
                    }}
                    className="btn btn-primary"
                  >
                    Launch AI Diet Assistant 🤖
                  </Link>

                  {aiGeneratedText && (
                    <div>
                      <h2 className="card-header">AI Generated Diet Plan ✨</h2>
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          padding: "1rem",
                          color: "#331a00",
                          maxHeight: "300px", // adjust height as needed
                          overflowY: "auto",
                          border: "1px solid #cc5500",
                          borderRadius: "6px",
                          scrollbarWidth: "thin", // for Firefox
                          scrollbarColor: "#cc5500 transparent",
                        }}
                        className="custom-scroll"
                      >
                        {aiGeneratedText}
                      </div>
                    </div>
                  )}
                  {/* 📝 Placeholder: show AI-generated content once logic is ready */}
                  <div style={{ marginTop: "1.5rem" }}>
                    <p>
                      <strong>Coming Soon:</strong> AI-generated diet chart will
                      be displayed here with meal options, calories, and protein
                      breakdown.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons for PDF and Assignment */}
            <div style={{ padding: "1rem", textAlign: "center" }}>
              <button
                className="btn btn-primary"
                style={{
                  fontSize: "1rem",
                  marginBottom: "1rem",
                  width: "100%",
                  maxWidth: "300px",
                }}
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

              <div>
                <button
                  id="complete-btn"
                  className="btn btn-primary"
                  style={{
                    fontSize: "1rem",
                    marginBottom: "1rem",
                    width: "100%",
                    maxWidth: "300px",
                  }}
                  onClick={handleCompleteAssignment}
                >
                  Complete Assignment
                </button>
              </div>

              {pdfUrl && (
                <button
                  className="btn btn-secondary"
                  style={{
                    padding: "10px 20px",
                    fontSize: "0.9rem",
                    width: "100%",
                    maxWidth: "250px",
                  }}
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
            backgroundColor: "var(--bg-primary)",
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
            backgroundColor: "var(--bg-primary)",
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
            backgroundColor: "var(--bg-primary)",
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
            // margin:"1rem",
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
              maxWidth: "750px",
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
              ✕
            </button>

            <h2 className="text-center mb-3">Modified BMI</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBmiSubmit();
              }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem 2rem",
              }}
            >
              {/* GROUP 1: Client Info */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                }}
              >
                👤 Client Information
              </div>

              <InputField
                label="Name"
                value={clientData?.name || ""}
                readOnly
              />
              <InputField label="Age" value={clientData?.age || ""} readOnly />
              <InputField
                label="Gender"
                value={clientData?.gender || ""}
                readOnly
              />
              <InputField
                label="Height (cm)"
                value={clientData?.height || ""}
                readOnly
              />
              <InputField
                label="Weight (kg)"
                value={clientData?.weight || ""}
                readOnly
              />

              {/* GROUP 2: Auto Calculated & Dropdowns */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  marginTop: "1rem",
                }}
              >
                ⚙️ Auto Calculated & Dropdowns
              </div>

              {/* BMI */}
              <div>
                <label style={{ fontWeight: "600" }}>
                  BMI{" "}
                  <span
                    style={{
                      fontWeight: "400",
                      fontSize: "0.85rem",
                      color: "gray",
                    }}
                  >
                    (Auto-calculated)
                  </span>
                </label>
                <input
                  type="text"
                  value={bmiData.bmi ? `${bmiData.bmi} kg/m²` : ""}
                  readOnly
                  className="form-control"
                  style={{ backgroundColor: "#f0f0f0", color: "#333" }}
                />
              </div>

              {/* BMI Category */}
              <DropdownField
                label="BMI Category"
                name="bmiCategory"
                value={bmiData.bmiCategory}
                onChange={handleBmiChange}
                options={["Underweight", "Normal", "Overweight", "Obese"]}
              />

              {/* BMR */}
              <div>
                <label style={{ fontWeight: "600" }}>
                  BMR{" "}
                  <span
                    style={{
                      fontWeight: "400",
                      fontSize: "0.85rem",
                      color: "gray",
                    }}
                  >
                    (Auto-calculated)
                  </span>
                </label>
                <input
                  type="text"
                  value={bmiData.bmr ? `${bmiData.bmr} kcal/day` : ""}
                  readOnly
                  className="form-control"
                  style={{ backgroundColor: "#f0f0f0", color: "#333" }}
                />
              </div>

              {/* TDEE Activity Level */}
              <DropdownField
                label="Activity Level"
                name="tdee"
                value={bmiData.tdee}
                onChange={handleBmiChange}
                options={[
                  "1.2 - Sedentary (little or no exercise)",
                  "1.37 - Lightly active (1–3 days/week)",
                  "1.55 - Moderately active (3–5 days/week)",
                  "1.7 - Very active (6–7 days/week)",
                  "1.9 - Extra active (physical job or 2x/day training)",
                ]}
              />

              {/* TDEE */}
              <div>
                <label style={{ fontWeight: "600" }}>
                  TDEE{" "}
                  <span
                    style={{
                      fontWeight: "400",
                      fontSize: "0.85rem",
                      color: "gray",
                    }}
                  >
                    (Auto-calculated after activity selection)
                  </span>
                </label>
                <input
                  type="text"
                  value={
                    bmiData.calculatedTdee
                      ? `${bmiData.calculatedTdee} kcal/day`
                      : ""
                  }
                  readOnly
                  className="form-control"
                  style={{ backgroundColor: "#f0f0f0", color: "#333" }}
                />
              </div>

              {/* GROUP 3: Manual Inputs */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  marginTop: "1rem",
                }}
              >
                ✍️ Manual Inputs
              </div>

              <InputField
                label="Target (kcal/day)"
                name="target"
                value={bmiData.target}
                onChange={handleBmiChange}
              />
              <InputField
                label="Energy (kcal/day)"
                name="energy"
                value={bmiData.energy}
                onChange={handleBmiChange}
              />
              <InputField
                label="Protein (g)"
                name="protein"
                value={bmiData.protein}
                onChange={handleBmiChange}
              />
              <InputField
                label="Carbohydrate (g)"
                name="carbohydrate"
                value={bmiData.carbohydrate}
                onChange={handleBmiChange}
              />
              <InputField
                label="Fats (g)"
                name="fats"
                value={bmiData.fats}
                onChange={handleBmiChange}
              />

              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  marginTop: "1rem",
                }}
              >
                <button type="submit" className="btn btn-primary">
                  Save BMI Data
                </button>
              </div>
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
            backgroundColor: "var(--bg-primary)",
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
              margin: "5%",
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
              close
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
            backgroundColor: "var(--bg-primary)",
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
            backgroundColor: "var(--bg-primary)",
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
          backgroundColor: "var(--bg-primary)",
          olor: "black",
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
