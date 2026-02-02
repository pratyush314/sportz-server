import express from "express";
import { matchRouter } from "./routes/matches.route.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Server is running..." });
});

app.use("/matches", matchRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
