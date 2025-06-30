import React, { useState } from "react";

const fieldTypes = ["text", "textarea", "dropdown", "date"];

const TemplateDemo = () => {
  const [templateFields, setTemplateFields] = useState([]);
  const [currentField, setCurrentField] = useState({ label: "", type: "text", options: "" });
  const [savedTemplate, setSavedTemplate] = useState(null);
  const [formData, setFormData] = useState({});

  // 🛠 Handle field change for admin
  const handleFieldChange = (e) => {
    setCurrentField({ ...currentField, [e.target.name]: e.target.value });
  };

  // ➕ Add field to template
  const addField = () => {
    if (!currentField.label) return;
    setTemplateFields([...templateFields, currentField]);
    setCurrentField({ label: "", type: "text", options: "" });
  };

  // 🧹 Clear the template
  const clearTemplate = () => {
    setTemplateFields([]);
    setSavedTemplate(null);
  };

  // 💾 Save the template
  const saveTemplate = () => {
    setSavedTemplate(templateFields);
  };

  // 🧑‍💻 Handle form input in data entry form
  const handleInputChange = (label, value) => {
    setFormData({ ...formData, [label]: value });
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>🛠 Admin Template Builder</h2>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          name="label"
          placeholder="Field Label"
          value={currentField.label}
          onChange={handleFieldChange}
        />
        <select name="type" value={currentField.type} onChange={handleFieldChange}>
          {fieldTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {currentField.type === "dropdown" && (
          <input
            type="text"
            name="options"
            placeholder="Comma separated options"
            value={currentField.options}
            onChange={handleFieldChange}
          />
        )}
        <button onClick={addField}>Add Field</button>
      </div>

      <div>
        <h4>🧩 Current Fields:</h4>
        <ul>
          {templateFields.map((f, i) => (
            <li key={i}>
              <strong>{f.label}</strong> ({f.type}) {f.type === "dropdown" && `→ [${f.options}]`}
            </li>
          ))}
        </ul>
        <button onClick={saveTemplate}>✅ Save Template</button>
        <button onClick={clearTemplate} style={{ marginLeft: "1rem" }}>🗑 Clear</button>
      </div>

      <hr style={{ margin: "2rem 0" }} />

      <h2>🧑‍💻 Data Entry Form (Auto-Generated)</h2>
      {savedTemplate ? (
        <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {savedTemplate.map((field, i) => {
            const value = formData[field.label] || "";
            switch (field.type) {
              case "text":
                return (
                  <input
                    key={i}
                    type="text"
                    placeholder={field.label}
                    value={value}
                    onChange={(e) => handleInputChange(field.label, e.target.value)}
                  />
                );
              case "textarea":
                return (
                  <textarea
                    key={i}
                    placeholder={field.label}
                    value={value}
                    onChange={(e) => handleInputChange(field.label, e.target.value)}
                  />
                );
              case "date":
                return (
                  <input
                    key={i}
                    type="date"
                    value={value}
                    onChange={(e) => handleInputChange(field.label, e.target.value)}
                  />
                );
              case "dropdown":
                return (
                  <select
                    key={i}
                    value={value}
                    onChange={(e) => handleInputChange(field.label, e.target.value)}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.split(",").map((opt, j) => (
                      <option key={j} value={opt.trim()}>{opt.trim()}</option>
                    ))}
                  </select>
                );
              default:
                return null;
            }
          })}
          <button type="button" onClick={() => alert(JSON.stringify(formData, null, 2))}>
            📤 Submit Form
          </button>
        </form>
      ) : (
        <p><i>No template saved yet. Create and save a template above.</i></p>
      )}
    </div>
  );
};

export default TemplateDemo;
