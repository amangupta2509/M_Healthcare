"use client";

import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../physio/assign.css";
import "../master_admin/master_admin.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../image/logo.png";
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
    cookingVideo: "",
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
  const [dietMode, setDietMode] = useState("");
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
    <div className="input-field">
      <label className="input-label">{label}</label>
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
    <div className="input-field">
      <label className="input-label">{label}</label>
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

    // TDEE
    const activityMultiplier = Number.parseFloat(bmiData.tdee);
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

        const assignedRes = await fetch(
          `http://localhost:5000/assignedMeals?mrn=${mrn}`
        );
        const assignedData = await assignedRes.json();
        setAssignedPlans(assignedData);

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
        setAssignedPlans([]);
        setBmiData({});
      }
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error("Search error:", error);
    }
  };

  useEffect(() => {
    if (!aiGeneratedText || aiInjected) return;

    setDietMode("ai");
    setAiInjected(true);

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
        "You've already entered a manual diet plan. Switching to AI mode will discard it. Continue?"
      );
      if (!confirmSwitch) return;

      setSelectedMeals([]);
      setEnergyProteinDistribution([]);
    }

    setDietMode("ai");
  };

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

      setEnergyProteinDistribution([]);
      setSelectedMeals([]);
      setAiInjected(false);
      location.state = {};
    }

    setDietMode("manual");
  };

  const handleBmiChange = (e) => {
    let { name, value } = e.target;

    const numericValue = value.replace(/[^0-9.]/g, "");

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
    setNewOption({ meal: "", ingredients: "", recipe: "", cookingVideo: "" });
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
    const isBmiFilled = Object.values(bmiData).every(
      (val) => val.trim() !== ""
    );
    if (!isBmiFilled) {
      toast.error("Please complete the Modified BMI section.");

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

      const btn = document.querySelector("#complete-btn");
      if (btn) {
        btn.classList.add("shake");
        setTimeout(() => btn.classList.remove("shake"), 500);
      }

      return;
    }

    if (!fromDateTime || !toDateTime || selectedMeals.length === 0) {
      toast.error("Please fill date range and select at least one meal");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (fromDateTime < today) {
      toast.error("From date cannot be in the past.");
      return;
    }

    if (toDateTime < fromDateTime) {
      toast.error("To date cannot be earlier than From date.");
      return;
    }

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

  const generateDietPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(logo, "PNG", 14, 10, 50, 20);

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
      <style jsx>{`
        .dashboard-main {
          padding: 1rem;
          width: 100%;
          overflow-x: hidden;
        }

        .card {
          background: var(--bg-primary);
          border: 1px solid #cc5500;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          font-size: 1.25rem;
          font-weight: bold;
          color: var(--text-primary);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #cc5500;
        }

        .search-containers {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0;
        }

        .search-input {
          flex: 1;
          min-width: 200px;
          padding: 0.75rem;
          font-size: 1rem;
          border: 1px solid #cc5500;
          border-radius: 4px;
          background: var(
            --bg-primary,
            #1e1e1e
          ); /* fallback if var not defined */
          color: var(--text-white, #ffffff);
        }

        .search-button {
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border: none;
          border-radius: 4px;
          background-color: #cc5500;
          color: white;
          cursor: pointer;
        }

        .btn.btn-primary {
          padding: 0.75rem 1rem;
          background-color: #cc5500;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          min-width: fit-content;
        }

        .btn-primary {
          background: linear-gradient(135deg, #cc5500, #e06600);
          color: white;
          font-weight: bold;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #b84d00, #cc5500);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .bmi-card {
          text-align: center;
          padding: 2rem 1rem;
        }

        .bmi-highlight {
          animation: highlight 3s ease-in-out;
        }

        @keyframes highlight {
          0%,
          100% {
            background-color: var(--bg-primary);
          }
          50% {
            background-color: rgba(204, 85, 0, 0.1);
          }
        }

        .date-range-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          font-weight: 600;
          color: var(--text-white);
        }

        .form-control {
          padding: 0.75rem;
          border: 1px solid #cc5500;
          border-radius: 4px;
          font-size: 1rem;
          background: var(--bg-primary);
          color: var(--text-white);
          width: 100%;
        }

        .form-control:focus {
          outline: none;
          border-color: #cc5500;
          box-shadow: 0 0 0 3px rgba(204, 85, 0, 0.1);
        }

        .diet-mode-selector {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin: 1rem 0;
        }

        .meal-selector {
          margin-bottom: 1rem;
        }

        .selected-meals {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .selected-meal-btn {
          position: relative;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid #cc5500;
          border-radius: 20px;
          color: var(--text-white);
          font-weight: bold;
        }

        .remove-meal {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #cc5500;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
        }

        .meal-table-container {
          overflow-x: auto;
          margin: 1rem 0;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .meal-table {
          width: 100%;
          min-width: 800px;
          border-collapse: collapse;
          background: var(--bg-primary);
        }

        .meal-table th {
          background: linear-gradient(135deg, #cc5500, #e06600);
          color: white;
          padding: 1rem 0.5rem;
          text-align: center;
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .meal-table td {
          padding: 1rem 0.5rem;
          text-align: center;
          border-bottom: 1px solid #cc5500;
          vertical-align: middle;
        }

        .meal-table tr:hover {
          background-color: rgba(204, 85, 0, 0.05);
        }

        .meal-input {
          width: 100%;
          max-width: 120px;
          padding: 0.5rem;
          border: 2px solid #cc5500;
          border-radius: 4px;
          font-size: 0.9rem;
          background: white;
          color: #333;
        }

        .meal-input:focus {
          outline: none;
          border-color: #cc5500;
          box-shadow: 0 0 0 3px rgba(204, 85, 0, 0.1);
        }

        .meal-cards {
          display: none;
        }

        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          padding: 1rem;
        }

        .popup-content {
          background: var(--bg-primary);
          border-radius: 8px;
          padding: 2rem;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #cc5500;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
          margin: 2rem 0;
        }

        .action-buttons .btn {
          width: 100%;
          max-width: 300px;
        }

        .history-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }

        .history-card {
          border: 1px solid #cc5500;
          border-radius: 8px;
          padding: 1rem;
          background: var(--bg-primary);
        }

        .shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .dashboard-main {
            padding: 0.5rem;
          }

          .card {
            padding: 0.75rem;
            margin-bottom: 0.75rem;
          }

          .card-header {
            font-size: 1.1rem;
          }

          .search-containers {
            gap: 0.75rem;
          }

          .search-input {
            min-width: 150px;
            padding: 0.6rem;
            font-size: 0.9rem;
          }

          .btn {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }

          .date-range-container {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .diet-mode-selector {
            flex-direction: column;
            align-items: center;
          }

          .diet-mode-selector .btn {
            width: 100%;
            max-width: 250px;
          }

          .meal-table-container {
            display: none;
          }

          .meal-cards {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .meal-card {
            border: 2px solid #cc5500;
            border-radius: 8px;
            padding: 1rem;
            background: var(--bg-primary);
          }

          .meal-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #cc5500;
          }

          .meal-card-title {
            font-weight: bold;
            color: var(--text-primary);
            font-size: 1.1rem;
          }

          .meal-card-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }

          .meal-card-actions {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .popup-content {
            padding: 1rem;
            margin: 0.5rem;
          }

          .bmi-card {
            padding: 1.5rem 0.5rem;
          }

          .action-buttons {
            margin: 1rem 0;
          }

          .history-cards {
            grid-template-columns: 1fr;
          }

          .selected-meals {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .dashboard-main {
            padding: 0.25rem;
          }

          .card {
            padding: 0.5rem;
          }

          .card-header {
            font-size: 1rem;
          }

          .search-containers {
            flex-direction: column;
            align-items: stretch;
          }

          .search-button {
            width: 50%;
          }

          .search-input {
            padding: 0.5rem;
            font-size: 0.85rem;
          }

          .btn {
            padding: 0.5rem 0.75rem;
            font-size: 0.85rem;
          }

          .popup-content {
            padding: 0.75rem;
            margin: 0.25rem;
          }

          .meal-card {
            padding: 0.75rem;
          }

          .meal-card-title {
            font-size: 1rem;
          }

          .form-control {
            padding: 0.5rem;
            font-size: 0.9rem;
          }

          .bmi-card {
            padding: 1rem 0.25rem;
          }
        }

        /* Large screen optimizations */
        @media (min-width: 1200px) {
          .dashboard-main {
            max-width: 100%;
            margin: 0 auto;
          }

          .date-range-container {
            grid-template-columns: repeat(2, 1fr);
          }

          .diet-mode-selector {
            justify-content: center;
          }

          .meal-table {
            min-width: 900px;
          }

          .action-buttons {
            flex-direction: row;
            justify-content: center;
          }

          .action-buttons .btn {
            width: auto;
            min-width: 200px;
          }
        }
      `}</style>

      <ToastContainer position="top-center" autoClose={2000} />
      <h1>Diet Plan Assignment</h1>

      {/* Search Section */}
      <div className="card">
        <div className="search-containers">
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
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {clientData && (
        <>
          {/* BMI Card */}
          <div className="card" ref={bmiCardRef}>
            <div className="bmi-card">
              <h2 className="text-primary" style={{ margin: 0 }}>
                MODIFIED BMI
              </h2>
              <p
                className="text-muted"
                style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}
              >
                Click the button below to enter MODIFIED BMI details.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setShowBmiPopup(true)}
              >
                Enter MODIFIED BMI
              </button>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="card">
            <h2 className="card-header">Daily Energy & Protein Distribution</h2>

            {(!fromDateTime || !toDateTime) && (
              <div
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  marginBottom: "1rem",
                  backgroundColor: "rgba(255, 191, 0, 0.1)",
                  color: "#FF0000",
                  border: "1px solid #FFBF00",
                  borderRadius: "5px",
                }}
              >
                Please select a <strong>From</strong> and <strong>To</strong>{" "}
                date range to activate the distribution section.
              </div>
            )}

            {/* Date Range Pickers */}
            <div className="date-range-container">
              <div className="input-field">
                <label className="input-label">From Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={fromDateTime}
                  onChange={(e) => setFromDateTime(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="input-field">
                <label className="input-label">To Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={toDateTime}
                  onChange={(e) => setToDateTime(e.target.value)}
                  min={fromDateTime || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Diet Mode Selector */}
            {clientData && fromDateTime && toDateTime && (
              <div className="card">
                <h2 className="card-header">Choose Diet Plan Mode</h2>
                <div className="diet-mode-selector">
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

            {/* Content based on diet mode */}
            {dietMode === "manual" && (
              <div className="card">
                <h2>Manual Meal Plan</h2>
                <p>Select Meal Time, Calories, and Protein</p>

                {/* Meal Selector */}
                <div className="meal-selector">
                  <label className="input-label">Select Meal Time</label>
                  <select
                    className="form-control"
                    style={{ maxWidth: "250px" }}
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

                  {/* Selected Meals */}
                  <div className="selected-meals">
                    {selectedMeals.map((meal, index) => (
                      <div key={index} className="selected-meal-btn">
                        {meal}
                        <span
                          className="remove-meal"
                          onClick={() => {
                            setSelectedMeals((prev) =>
                              prev.filter((m) => m !== meal)
                            );
                            setEnergyProteinDistribution((prev) =>
                              prev.filter((row) => row.mealName !== meal)
                            );
                          }}
                          title="Remove"
                        >
                          ×
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meal Table/Cards */}
                {fromDateTime && toDateTime && selectedMeals.length > 0 && (
                  <>
                    {/* Desktop Table */}
                    <div className="meal-table-container">
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
                            <tr key={index}>
                              <td>
                                <div style={{ fontWeight: "bold" }}>
                                  {row.mealName}
                                </div>
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
                                  className="btn btn-primary"
                                  style={{
                                    padding: "0.5rem 1rem",
                                    fontSize: "0.85rem",
                                  }}
                                  onClick={() => handleAddOptionClick(index)}
                                >
                                  Add
                                </button>
                              </td>
                              <td>
                                <button
                                  className="btn btn-primary"
                                  style={{
                                    padding: "0.5rem 1rem",
                                    fontSize: "0.85rem",
                                  }}
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
                    </div>

                    {/* Mobile Cards */}
                    <div className="meal-cards">
                      {energyProteinDistribution.map((row, index) => (
                        <div key={index} className="meal-card">
                          <div className="meal-card-header">
                            <div className="meal-card-title">
                              {row.mealName}
                            </div>
                          </div>

                          <div className="meal-card-grid">
                            <div className="input-field">
                              <label className="input-label">Time</label>
                              <input
                                type="time"
                                className="form-control"
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

                            <div className="input-field">
                              <label className="input-label">Calories</label>
                              <input
                                className="form-control"
                                type={
                                  focusedCaloriesIndex === index || row.calories
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

                            <div className="input-field">
                              <label className="input-label">Protein</label>
                              <input
                                className="form-control"
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
                              className="btn btn-primary"
                              onClick={() => handleAddOptionClick(index)}
                            >
                              Add Option
                            </button>
                            <button
                              className="btn btn-primary"
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
                  </>
                )}
              </div>
            )}

            {dietMode === "ai" && (
              <div id="meal-plan-section" className="card">
                <h2 className="card-header">AI-Generated Meal Plan</h2>
                <p>
                  This section will automatically generate a personalized plan
                  based on the client's profile and goals.
                </p>

                <div style={{ textAlign: "center", margin: "1rem 0" }}>
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
                </div>

                {aiGeneratedText && (
                  <div>
                    <h2 className="card-header">AI Generated Diet Plan ✨</h2>
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        padding: "1rem",
                        color: "#331a00",
                        maxHeight: "300px",
                        overflowY: "auto",
                        border: "1px solid #cc5500",
                        borderRadius: "6px",
                        backgroundColor: "rgba(204, 85, 0, 0.05)",
                      }}
                    >
                      {aiGeneratedText}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
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

              <button
                id="complete-btn"
                className="btn btn-primary"
                onClick={handleCompleteAssignment}
              >
                Complete Assignment
              </button>

              {pdfUrl && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPdfViewer(true)}
                >
                  View Generated PDF
                </button>
              )}
            </div>
          </div>

          {/* Previous Charts Button */}
          {clientData && (
            <div style={{ textAlign: "center", margin: "1rem 0" }}>
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

      {/* History Cards */}
      {showHistoryCards && (
        <div className="card">
          <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>
            Previous Plans
          </h4>
          <div className="history-cards">
            {assignedPlans.map((plan, idx) => (
              <div className="history-card" key={idx}>
                <p>
                  <strong>From:</strong> {plan.fromDateTime}
                </p>
                <p>
                  <strong>To:</strong> {plan.toDateTime}
                </p>
                <div style={{ textAlign: "right", marginTop: "1rem" }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => setSelectedPlanToView(plan)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowHistoryCards(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* All Popups */}
      {selectedPlanToView && (
        <div
          className="popup-overlay"
          onClick={() => setSelectedPlanToView(null)}
        >
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedPlanToView(null)}
            >
              Close
            </button>

            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Assigned Diet Plan
            </h3>
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
              <div key={idx} className="card" style={{ marginBottom: "1rem" }}>
                <h5 style={{ color: "#cc5500" }}>
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

      {showViewPopup.visible && (
        <div
          className="popup-overlay"
          onClick={() => setShowViewPopup({ visible: false, option: null })}
        >
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setShowViewPopup({ visible: false, option: null })}
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

      {confirmDelete.visible && (
        <div
          className="popup-overlay"
          onClick={() =>
            setConfirmDelete({ visible: false, rowIndex: null, optIndex: null })
          }
        >
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this meal option?</p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <button className="btn btn-primary" onClick={confirmDeleteOption}>
                Yes, Delete
              </button>
              <button
                className="btn btn-secondary"
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
        <div className="popup-overlay" onClick={() => setShowBmiPopup(false)}>
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "750px" }}
          >
            <button
              className="close-btn"
              onClick={() => setShowBmiPopup(false)}
            >
              ✕
            </button>

            <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Modified BMI
            </h2>

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

              <DropdownField
                label="BMI Category"
                name="bmiCategory"
                value={bmiData.bmiCategory}
                onChange={handleBmiChange}
                options={["Underweight", "Normal", "Overweight", "Obese"]}
              />

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

      {showOptionPopup.visible && (
        <div
          className="popup-overlay"
          onClick={() => setShowOptionPopup({ index: null, visible: false })}
        >
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() =>
                setShowOptionPopup({ index: null, visible: false })
              }
            >
              Close
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

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleOptionSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showOptionGridPopup.visible && (
        <div
          className="popup-overlay"
          onClick={() =>
            setShowOptionGridPopup({ visible: false, index: null })
          }
        >
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "980px" }}
          >
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Assigned Meal Options
            </h3>

            <div className="history-cards">
              {energyProteinDistribution[showOptionGridPopup.index].options.map(
                (opt, i) => (
                  <div className="history-card" key={i}>
                    <h5 style={{ color: "#cc5500", marginBottom: "0.5rem" }}>
                      Option {i + 1}
                    </h5>
                    <p
                      style={{
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        overflowWrap: "break-word",
                        lineHeight: "1.4",
                      }}
                    >
                      <strong>Meal:</strong> {opt.meal || "N/A"}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        marginTop: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className="btn btn-primary"
                        style={{ flex: "1", minWidth: "60px" }}
                        onClick={() => handleOptionView(opt)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ flex: "1", minWidth: "60px" }}
                        onClick={() =>
                          handleOptionEdit(showOptionGridPopup.index, i)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ flex: "1", minWidth: "60px" }}
                        onClick={() =>
                          handleDeleteConfirm(showOptionGridPopup.index, i)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                className="btn btn-primary"
                onClick={() =>
                  setShowOptionGridPopup({ visible: false, index: null })
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showPdfViewer && pdfUrl && (
        <div className="popup-overlay" onClick={() => setShowPdfViewer(false)}>
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "800px" }}
          >
            <button
              className="close-btn"
              onClick={() => setShowPdfViewer(false)}
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
          color: "black",
          padding: "2rem",
          width: "794px",
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
