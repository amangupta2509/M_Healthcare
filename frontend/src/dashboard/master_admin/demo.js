import React, { useState } from 'react';

const ResponsiveCategoryForm = () => {
  // Mock state for demonstration - replace with your actual state
  const [categories, setCategories] = useState([
    { 
      name: 'Sample Category', 
      subCategories: [
        { 
          name: 'Sample Sub', 
          groups: [
            { 
              name: 'Sample Group', 
              hasTraits: false, 
              traits: [], 
              fields: [] 
            }
          ] 
        }
      ] 
    }
  ]);
  
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [selectedSubCategoryIndex, setSelectedSubCategoryIndex] = useState(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);
  const [showSubCategoryCard, setShowSubCategoryCard] = useState(false);
  const [showGroupCard, setShowGroupCard] = useState(false);
  const [showGroupDetailsCard, setShowGroupDetailsCard] = useState(false);
  const [showAddTraitForm, setShowAddTraitForm] = useState(false);
  const [groupFinalizedPopup, setGroupFinalizedPopup] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showContentCard, setShowContentCard] = useState(true);
  
  const [subCategoryInput, setSubCategoryInput] = useState({ name: '', heading: '' });
  const [groupInput, setGroupInput] = useState('');
  const [newTrait, setNewTrait] = useState({ name: '', fields: [] });
  const [newFeature, setNewFeature] = useState({ key: '', value: '', type: 'text' });

  // Mock functions - replace with your actual functions
  const addSubCategory = () => console.log('Add sub category');
  const addGroup = () => console.log('Add group');
  const addTraitField = () => {
    setNewTrait({
      ...newTrait,
      fields: [...newTrait.fields, { key: '', value: '', type: 'text' }]
    });
  };
  const removeTraitField = (index) => {
    setNewTrait({
      ...newTrait,
      fields: newTrait.fields.filter((_, i) => i !== index)
    });
  };
  const updateTraitField = (index, field, value) => {
    const updatedFields = [...newTrait.fields];
    updatedFields[index][field] = value;
    setNewTrait({ ...newTrait, fields: updatedFields });
  };
  const handleSubmitTrait = () => {
    setShowAddTraitForm(false);
    setNewTrait({ name: '', fields: [] });
  };
  const addDirectFeature = () => console.log('Add direct feature');
  const finalizeCategoryFlow = () => console.log('Finalize category');

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <style jsx>{`
        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 1.5rem;
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .card-content {
          padding: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          margin: 0.25rem;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .btn-outline-primary {
          background: transparent;
          border: 2px solid #667eea;
          color: #667eea;
        }
        
        .btn-outline-primary:hover {
          background: #667eea;
          color: white;
        }
        
        .btn-outline-success {
          background: transparent;
          border: 2px solid #10b981;
          color: #10b981;
        }
        
        .btn-outline-success:hover {
          background: #10b981;
          color: white;
        }
        
        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        
        .btn-dark {
          background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
          color: white;
        }
        
        .btn-secondary {
          background: #ef4444;
          color: white;
        }
        
        .btn-outline-secondary {
          background: transparent;
          border: 2px solid #ef4444;
          color: #ef4444;
        }
        
        .btn-outline-secondary:hover {
          background: #ef4444;
          color: white;
        }
        
        .grid-fields {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 0.75rem;
          align-items: center;
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .grid-header {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        
        .trait-card {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 1rem;
        }
        
        .trait-card h4 {
          margin: 0 0 1rem 0;
          color: #1e293b;
          font-size: 1.25rem;
        }
        
        .trait-card ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        
        .trait-card li {
          margin-bottom: 0.5rem;
          color: #475569;
        }
        
        .center-btn {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .nested-form {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 1rem;
        }
        
        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 500 !important;
          text-transform: none !important;
          letter-spacing: normal !important;
        }
        
        .checkbox-label input[type="checkbox"] {
          width: auto !important;
          margin: 0 !important;
        }
        
        @media (max-width: 768px) {
          .grid-fields {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .grid-fields > span:last-child {
            justify-self: stretch;
          }
          
          .btn {
            width: 100%;
            justify-content: center;
            margin: 0.25rem 0;
          }
          
          .center-btn {
            flex-direction: column;
          }
          
          .card-content {
            padding: 1rem;
          }
          
          .nested-form {
            padding: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .card-header {
            padding: 0.75rem 1rem;
            font-size: 1.125rem;
          }
          
          .form-group input,
          .form-group select {
            padding: 0.625rem;
            font-size: 0.875rem;
          }
          
          .btn {
            padding: 0.625rem 1rem;
            font-size: 0.8125rem;
          }
        }
      `}</style>

      {showContentCard && !isSubmitted && (
        <>
          {/* CATEGORY SELECTION & SUB-CATEGORY MODULE */}
          <div className="card">
            <h2 className="card-header">📂 Sub-Category</h2>
            <div className="card-content">
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
                <div className="center-btn">
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
                </div>
              )}

              {showSubCategoryCard && (
                <div className="nested-form">
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
                      placeholder="Enter sub-category name"
                    />
                  </div>
                  <div className="form-group">
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
                      placeholder="Enter heading or description"
                    />
                  </div>
                  <div className="center-btn">
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

              {selectedCategoryIndex !== null &&
                categories[selectedCategoryIndex]?.subCategories.length > 0 && (
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
          </div>

          {/* GROUP MODULE */}
          {selectedSubCategoryIndex !== null && (
            <div className="card">
              <h2 className="card-header">🧪 Group & Traits</h2>
              <div className="card-content">
                <div className="center-btn">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setShowGroupCard(!showGroupCard)}
                  >
                    {showGroupCard ? "❌ Close Group Form" : "➕ Add Group"}
                  </button>
                </div>

                {showGroupCard && (
                  <div className="nested-form">
                    <div className="form-group">
                      <label>Group Name</label>
                      <input
                        type="text"
                        value={groupInput}
                        onChange={(e) => setGroupInput(e.target.value)}
                        placeholder="e.g., FATTY ACIDS"
                      />
                    </div>
                    <div className="center-btn">
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
                    <div className="center-btn">
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
                    </div>

                    {showGroupDetailsCard && (
                      <div className="nested-form">
                        <div className="form-group">
                          <label className="checkbox-label">
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
                            />
                            This group has traits
                          </label>
                        </div>

                        {/* ✅ GROUP HAS TRAITS */}
                        {categories[selectedCategoryIndex].subCategories[
                          selectedSubCategoryIndex
                        ].groups[selectedGroupIndex].hasTraits ? (
                          <div className="form-group">
                            {/* Add Trait Toggle Button */}
                            <div className="center-btn">
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
                            </div>

                            {/* Conditional Trait Form */}
                            {showAddTraitForm && (
                              <div className="nested-form">
                                <div className="form-group">
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
                                  />
                                </div>

                                <h5 style={{ marginBottom: "1rem", color: "#374151" }}>
                                  Trait Fields:
                                </h5>

                                {newTrait.fields.length > 0 && (
                                  <div className="grid-fields grid-header">
                                    <span>Key</span>
                                    <span>Value</span>
                                    <span>Type</span>
                                    <span>Action</span>
                                  </div>
                                )}

                                {newTrait.fields.map((field, index) => (
                                  <div key={index} className="grid-fields">
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
                                    >
                                      <option value="text">Text</option>
                                      <option value="number">Number</option>
                                      <option value="date">Date</option>
                                    </select>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => removeTraitField(index)}
                                    >
                                      ❌ Remove
                                    </button>
                                  </div>
                                ))}

                                <div className="center-btn" style={{ marginTop: "1rem" }}>
                                  <button
                                    className="btn btn-outline-secondary"
                                    onClick={addTraitField}
                                  >
                                    ➕ Add Field
                                  </button>

                                  <button
                                    className="btn btn-primary"
                                    onClick={handleSubmitTrait}
                                  >
                                    ✅ Submit Trait
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Display Existing Traits Below */}
                            <hr style={{ margin: "2rem 0", border: "1px solid #e5e7eb" }} />
                            {categories[selectedCategoryIndex].subCategories[
                              selectedSubCategoryIndex
                            ].groups[selectedGroupIndex].traits.map(
                              (trait, i) => (
                                <div key={i} className="trait-card">
                                  <h4>{trait.name}</h4>
                                  <ul>
                                    {trait.fields?.map((f, idx) => (
                                      <li key={idx}>
                                        <strong>{f.key}</strong>: {f.value}{" "}
                                        <em style={{ color: "#64748b" }}>
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
                            </div>
                            <div className="form-group">
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
                            </div>
                            <div className="form-group">
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
                            </div>
                            <div className="center-btn">
                              <button
                                className="btn btn-primary"
                                onClick={addDirectFeature}
                              >
                                ➕ Add Field
                              </button>
                            </div>
                            <ul style={{ marginTop: "1rem", paddingLeft: "1.5rem" }}>
                              {categories[
                                selectedCategoryIndex
                              ].subCategories[
                                selectedSubCategoryIndex
                              ].groups[selectedGroupIndex].fields?.map(
                                (f, i) => (
                                  <li key={i} style={{ marginBottom: "0.5rem", color: "#475569" }}>
                                    <strong>{f.key}</strong>: {f.value}{" "}
                                    <em style={{ color: "#64748b" }}>
                                      ({f.type})
                                    </em>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {/* ✅ Final Confirm Group Button */}
                        <div className="center-btn" style={{ marginTop: "2rem" }}>
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
                <div className="center-btn" style={{ marginTop: "2rem" }}>
                  <button
                    className="btn btn-dark"
                    onClick={finalizeCategoryFlow}
                  >
                    🎯 Final Submission for This Category
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResponsiveCategoryForm;