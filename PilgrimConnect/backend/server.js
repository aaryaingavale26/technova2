import express from "express";
import cors from "cors";
import pilgrimRoutes from "./routes/pilgrims.js";

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/pilgrims", pilgrimRoutes);

app.listen(5000, () => {
  console.log("Backend running at http://localhost:5000");
});
