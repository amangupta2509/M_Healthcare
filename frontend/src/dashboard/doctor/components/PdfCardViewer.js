import React from "react";

const PdfCardViewer = ({ url, onClose }) => {
  return (
    <div className="pdf-card">
      <button className="close-btn" onClick={onClose}>X</button>
      <iframe
        src={url}
        title="PDF Viewer"
        width="100%"
        height="500px"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default PdfCardViewer;
