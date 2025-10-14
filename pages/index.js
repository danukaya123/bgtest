import { useState } from "react";
import { Client } from "@gradio/client";
import UploadPreview from "../components/UploadPreview";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setResultUrl(null);
    setError(null);

    // Debug
    console.log("Uploaded file URL:", URL.createObjectURL(uploadedFile));
  };

  // Helper to recursively find first URL in an object/array
  const findUrl = (data) => {
    if (!data) return null;
    if (typeof data === "string" && data.startsWith("http")) return data;
    if (Array.isArray(data)) {
      for (let item of data) {
        const found = findUrl(item);
        if (found) return found;
      }
    } else if (typeof data === "object") {
      for (let key in data) {
        const found = findUrl(data[key]);
        if (found) return found;
      }
    }
    return null;
  };

  const handleRemoveBackground = async () => {
    if (!file) return alert("Please select an image first!");
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const blob = new Blob([file], { type: file.type });
      console.log("Blob created:", blob);

      const client = await Client.connect("Jonny001/Background-Remover-C1");
      console.log("Connected to HF Space");

      const result = await client.predict("/image", { image: blob });
      console.log("HF Space raw result:", result);

      const url = findUrl(result.data);
      console.log("Processed image URL:", url);

      if (!url) throw new Error("No URL found in HF Space response");

      setResultUrl(url);
    } catch (err) {
      console.error("Error during background removal:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>🪄 Image Background Remover</h1>
      <p>Upload an image and remove its background using Hugging Face Space API.</p>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      <UploadPreview file={file} />

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleRemoveBackground}
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : "Remove Background"}
        </button>
      </div>

      {error && <p style={{ color: "red", marginTop: "20px" }}>❌ {error}</p>}

      {resultUrl && (
        <div style={{ marginTop: "30px" }}>
          <h3>Result:</h3>
          <img
            src={resultUrl}
            alt="result"
            style={{
              maxWidth: "100%",
              borderRadius: "10px",
              boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            }}
          />
          <br />
          <a
            href={resultUrl}
            download="removed-bg.png"
            style={{
              display: "inline-block",
              marginTop: "10px",
              background: "#10b981",
              color: "white",
              padding: "8px 14px",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            ⬇️ Download
          </a>
        </div>
      )}
    </div>
  );
}
