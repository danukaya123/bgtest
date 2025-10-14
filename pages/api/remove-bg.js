import { Client } from "@gradio/client";

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  try {
    const { imageBase64, imageUrl } = req.body;
    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({ error: "Provide imageBase64 or imageUrl" });
    }

    let inputBlob;
    if (imageBase64) {
      // convert base64 to Blob
      const matches = imageBase64.match(/^data:(.*);base64,(.*)$/);
      const buffer = Buffer.from(matches[2], "base64");
      inputBlob = new Blob([buffer], { type: matches[1] });
    } else {
      const fetched = await fetch(imageUrl);
      inputBlob = await fetched.blob();
    }

    const client = await Client.connect("Jonny001/Background-Remover-C1");
    const result = await client.predict("/image", { image: inputBlob });

    // normalize result
    let output;
    if (Array.isArray(result.data)) {
      const first = result.data[0];
      output = first?.url ?? first; // get URL or base64
    } else {
      output = result.data ?? result;
    }

    return res.status(200).json({ result: output });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
