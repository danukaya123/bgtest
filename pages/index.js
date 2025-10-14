import { useState } from "react";
import { Client } from "@gradio/client";
import UploadPreview from "../components/UploadPreview";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  // Convert file to base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    setFile(uploaded);
    setResultUrl(null);
    setError(null);
    console.log("Uploaded file:", uploaded);
  };

  const handleRemoveBackground = async () => {
    if (!file) return alert("Please select an image first!");
    setLoading(true);
    setError(null);

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);
      console.log("Base64 image length:", base64.length);

      // Build input object for HF Space
      const inputImage = {
        path: undefined,
        url: base64,
        size: file.size,
        orig_name: file.name,
        mime_type: file.type,
        is_stream: false,
        meta: {},
      };
      console.log("Input image object:", inputImage);

      // Connect to HF Space
      const client = await Client.connect("Jonny001/Background-Remover-C1");
      console.log("Connected to HF Space");

      // Call the /image API
      const result = await client.predict("/image", { image: inputImage });
      console.log("HF Space raw result:", result);

      // HF Space returns tuple: [processedImageObj, originalImageObj]
      const processedObj = Array.isArray(result.data) ? result.data[0] : null;
      console.log("Processed object:", processedObj);

      if (!processedObj || !processedObj.path) {
        throw new Error("No path found in HF Space response");
      }

      // Construct proper URL
      const processedUrl = `https://jonny001-background-remover-c1.hf.space/file=${processedObj.path}`;
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
        <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <h3>Original:</h3>
            <img
              src={URL.createObjectURL(file)}
              alt="original"
              style={{
                maxWidth: "300px",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0,0,0,0.3)",
              }}
            />
          </div>
          <div>
            <h3>Processed:</h3>
            <img
              src={resultUrl}
              alt="processed"
              style={{
                maxWidth: "300px",
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
        </div>
      )}
    </div>
  );
}
