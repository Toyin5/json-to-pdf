import express from "express";
import cors from "cors";
import { exportAsPdf } from "./core/exportAsPdf";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/health", (req, res) => {
  res.status(200).json({ message: "Breathing... 🌬" });
});

app.post("/convert", async (req, res) => {
  const { json } = req.body;
  console.log(json);
  if (!json) {
    return res.status(400).json({ error: "No JSON provided" });
  }
  try {
    const file = await exportAsPdf("Testing", json);
    res
      .writeHead(200, {
        "Content-Length": Buffer.byteLength(await file.arrayBuffer()),
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=" + `${file.name}.pdf`,
      })
      .end(Buffer.from(new Uint8Array(await file.arrayBuffer())));
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Invalid JSON" });
  }
});

export default app;
