import express from "express";
import cors from "cors";
import pilgrimRoutes from "./routes/pilgrims.js";
import darshanRoutes from "./routes/darshan.js"; // <--- 1. Import this

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/pilgrims", pilgrimRoutes);
app.use("/darshan", darshanRoutes); // <--- 2. Add this line

app.get("/", (req, res) => {
  res.json("Hello from Pilgrim Connect Backend!");
});

app.listen(8081, () => {
  console.log("Connected to backend on port 8081!");
});