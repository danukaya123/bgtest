import { Client } from "@gradio/client";


// Next.js API route that accepts JSON body:
// { imageUrl: 'https://...' } OR { imageBase64: 'data:image/png;base64,...' }


export const config = {
api: {
bodyParser: true,
},
};


export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}


const hfToken = process.env.HF_TOKEN || null;
const { imageUrl, imageBase64 } = req.body;


if (!imageUrl && !imageBase64) {
return res.status(400).json({ error: "Provide imageUrl or imageBase64" });
}


try {
let imageInput;


if (imageBase64) {
// Convert data URL to a Blob-like object compatible with @gradio/client
// Node 18+ provides global Blob, and @gradio/client accepts a Blob
const matches = imageBase64.match(/^data:(.*);base64,(.*)$/);
if (!matches) throw new Error("Invalid base64 data URL");
const mime = matches[1];
const b64 = matches[2];
const buffer = Buffer.from(b64, "base64");


// Create a Blob in Node environment
const blob = new Blob([buffer], { type: mime });
imageInput = blob;
} else {
// If imageUrl is provided, fetch it and convert to Blob
const fetched = await fetch(imageUrl);
if (!fetched.ok) throw new Error("Failed to fetch image URL");
imageInput = await fetched.blob();
}


// Connect to the space (optionally with token)
const client = await Client.connect("Jonny001/Background-Remover-C1", {
hf_token: hfToken || undefined,
});


// Call the function name exposed by the space — per your space it is `/image`.
const result = await client.predict("/image", { image: imageInput });


// Return the raw result.
// result.data usually contains the processed image (either raw data or hosted URL)
return res.status(200).json(result.data ?? result);
} catch (err) {
console.error(err);
return res.status(500).json({ error: String(err?.message || err) });
}
}
