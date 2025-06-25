// src/dashboard/master_admin/ReportTemplateBuilder.js
import React, { useState } from 'react';

const ReportTemplateBuilder = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category: '',
    subCategory: '',
    groupName: '',
    hasTraits: false,
    traits: [],
    directFeatures: [],
  });

  const handleAddTrait = () => {
    setForm((prev) => ({
      ...prev,
      traits: [...prev.traits, { label: '', value: '' }]
    }));
  };

  const handleAddFeature = () => {
    setForm((prev) => ({
      ...prev,
      directFeatures: [...prev.directFeatures, { label: '', value: '' }]
    }));
  };

  const handleSubmit = () => {
    console.log('Submitting Form:', form);
    alert("Report template section saved (check console)");
    // Here you’d call an API or save in local storage
  };

  return (
    <div className="dashboard-main">
      <h1>Create Report Template</h1>

      <div className="form-group">
        <label>Category</label>
        <input
          type="text"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="e.g., Nutrition"
        />
      </div>

      <div className="form-group">
        <label>Sub-Category</label>
        <input
          type="text"
          value={form.subCategory}
          onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
          placeholder="e.g., Nutrient Requirements"
        />
      </div>

      <div className="form-group">
        <label>Group Name</label>
        <input
          type="text"
          value={form.groupName}
          onChange={(e) => setForm({ ...form, groupName: e.target.value })}
          placeholder="e.g., FATTY ACIDS"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={form.hasTraits}
            onChange={(e) => setForm({ ...form, hasTraits: e.target.checked })}
          />
          This group has traits
        </label>
      </div>

      {form.hasTraits ? (
        <div>
          <h3>Traits</h3>
          {form.traits.map((trait, i) => (
            <div key={i} className="form-group">
              <input
                type="text"
                placeholder="Trait Label"
                value={trait.label}
                onChange={(e) => {
                  const updated = [...form.traits];
                  updated[i].label = e.target.value;
                  setForm({ ...form, traits: updated });
                }}
              />
              <input
                type="text"
                placeholder="Trait Value"
                value={trait.value}
                onChange={(e) => {
                  const updated = [...form.traits];
                  updated[i].value = e.target.value;
                  setForm({ ...form, traits: updated });
                }}
              />
            </div>
          ))}
          <button className="btn btn-primary" onClick={handleAddTrait}>Add Trait</button>
        </div>
      ) : (
        <div>
          <h3>Direct Features</h3>
          {form.directFeatures.map((feat, i) => (
            <div key={i} className="form-group">
              <input
                type="text"
                placeholder="Feature Label"
                value={feat.label}
                onChange={(e) => {
                  const updated = [...form.directFeatures];
                  updated[i].label = e.target.value;
                  setForm({ ...form, directFeatures: updated });
                }}
              />
              <input
                type="text"
                placeholder="Feature Value"
                value={feat.value}
                onChange={(e) => {
                  const updated = [...form.directFeatures];
                  updated[i].value = e.target.value;
                  setForm({ ...form, directFeatures: updated });
                }}
              />
            </div>
          ))}
          <button className="btn btn-primary" onClick={handleAddFeature}>Add Feature</button>
        </div>
      )}

      <br />
      <button className="btn btn-primary" onClick={handleSubmit}>Save Template Section</button>
    </div>
  );
};

export default ReportTemplateBuilder;
