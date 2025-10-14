import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import { Client } from "@gradio/client";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.static("public"));

app.post("/remove-bg", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const imageBuffer = fs.readFileSync(filePath);

    const client = await Client.connect("Jonny001/Background-Remover-C1");
    const result = await client.predict("/image", { image: imageBuffer });

    fs.unlinkSync(filePath); // delete temp upload

    res.json({ processedImage: result.data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove background" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
