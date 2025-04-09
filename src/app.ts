import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/health", (req, res) => {
  res.status(200).json({ message: "Breathing... 🌬" });
});

export default app;
