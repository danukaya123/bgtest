import { useState } from "react";
import UploadPreview from "../components/UploadPreview";

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  async function handleRemove() {
    setError(null);
    setResultUrl(null);
    setLoading(true);

    try {
      const body = fileDataUrl
        ? { imageBase64: fileDataUrl }
        : { imageUrl };

      const res = await fetch("/api/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");

      const first = Array.isArray(data) ? data[0] : data?.data?.[0] ?? data[0];
      const url = first?.url ?? first;
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "Inter, Roboto, sans-serif", padding: 24 }}>
      <h1>🖼️ HuggingFace Background Remover</h1>

      <section style={{ marginTop: 24 }}>
        <h2>1️⃣ Paste image URL</h2>
        <input
          type="text"
          placeholder="https://example.com/photo.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            fontSize: 16,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Or upload a file</h2>
        <UploadPreview
          onDataUrl={(d) => {
            setFileDataUrl(d);
            setImageUrl("");
          }}
        />
      </section>

      <button
        onClick={handleRemove}
        disabled={loading || (!imageUrl && !fileDataUrl)}
        style={{
          marginTop: 20,
          padding: "10px 16px",
          fontSize: 16,
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {loading ? "Removing..." : "Remove Background"}
      </button>

      {error && (
        <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>
      )}

      {resultUrl && (
        <div style={{ marginTop: 24 }}>
          <h3>Result</h3>
          <img src={resultUrl} alt="result" style={{ maxWidth: "100%" }} />
          <p>
            <a href={resultUrl} target="_blank" rel="noreferrer">
              Open image in new tab
            </a>
          </p>
        </div>
      )}

      <footer style={{ marginTop: 48, color: "#666" }}>
        <small>
          Powered by <code>Jonny001/Background-Remover-C1</code> on Hugging Face
        </small>
      </footer>
    </div>
  );
}
