import { useState } from "react";
import { Client } from "@gradio/client";
import UploadPreview from "../components/UploadPreview";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  // Convert file to base64 for HF Space
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResultUrl(null);
    setError(null);
    console.log("Uploaded file:", e.target.files[0]);
  };

  const handleRemoveBackground = async () => {
    if (!file) return alert("Please select an image first!");
    setLoading(true);
    setError(null);

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);
      console.log("Base64 image length:", base64.length);

      // Connect to HF Space
      const client = await Client.connect("Jonny001/Background-Remover-C1");
      console.log("Connected to HF Space");

      // Call API
      const result = await client.predict("/image", {
        image: { url: base64 },
      });
      console.log("HF Space raw result:", result);

      // Extract processed image URL
      const output = result?.data?.[0];
      console.log("First item from result.data:", output);

      let processedUrl = null;

      if (output) {
        if (typeof output === "string") {
          processedUrl = output; // sometimes it's a string URL
        } else if (output.url) {
          processedUrl = output.url; // object with url field
        } else if (output.path) {
          // convert path to HF URL if needed
          processedUrl = output.path;
        }
      }

      if (!processedUrl) throw new Error("No URL found in HF Space response");

      console.log("Processed image URL:", processedUrl);
      setResultUrl(processedUrl);
    } catch (err) {
      console.error("Error during background removal:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>🪄 Image Background Remover</h1>
      <p>Upload an image and remove its background using HF Space API.</p>

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

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>❌ {error}</p>
      )}

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
