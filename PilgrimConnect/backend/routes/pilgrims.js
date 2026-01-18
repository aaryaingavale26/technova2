import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET all pilgrims
router.get("/", (req, res) => {
  db.query("SELECT * FROM pilgrims", (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

// CREATE pilgrim
router.post("/", (req, res) => {
  const sql = "INSERT INTO pilgrims SET ?";
  db.query(sql, req.body, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId });
  });
});

export default router;
