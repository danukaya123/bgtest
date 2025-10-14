import React from "react";

export default function UploadPreview({ file }) {
  if (!file) return null;

  const imageUrl = URL.createObjectURL(file);

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Preview:</h3>
      <img
        src={imageUrl}
        alt="preview"
        style={{
          maxWidth: "100%",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}
