import { useRef } from "react";


export default function UploadPreview({ onDataUrl }) {
const inputRef = useRef();


function handleFile(e) {
const file = e.target.files?.[0];
if (!file) return;
const reader = new FileReader();
reader.onload = () => {
// reader.result is a data URL like: data:image/png;base64,...
onDataUrl(reader.result);
};
reader.readAsDataURL(file);
}


return (
<div>
<input
ref={inputRef}
type="file"
accept="image/*"
onChange={handleFile}
/>
<div style={{ marginTop: 8 }}>
<small>Upload an image (JPG/PNG) — it will be sent to the API as a base64 data URL.</small>
</div>
</div>
);
}
