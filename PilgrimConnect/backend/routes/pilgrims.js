import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET all pilgrims
router.get("/", (req, res) => {
  const q = "SELECT * FROM pilgrims";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
});

// POST new pilgrim (Fixes Entity Issue: Matches Frontend Form Data)
router.post("/", (req, res) => {
  const q = "INSERT INTO pilgrims (`full_name`, `phone`, `age`, `gender`) VALUES (?)";
  
  const values = [
    req.body.full_name,
    req.body.phone,
    req.body.age,
    req.body.gender,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json("Pilgrim has been registered successfully.");
  });
});

// DELETE pilgrim
router.delete("/:id", (req, res) => {
  const pilgrimId = req.params.id;
  const q = "DELETE FROM pilgrims WHERE id = ?";

  db.query(q, [pilgrimId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("Pilgrim has been deleted successfully.");
  });
});

// UPDATE pilgrim (Fixes Entity Issue)
router.put("/:id", (req, res) => {
  const pilgrimId = req.params.id;
  const q = "UPDATE pilgrims SET `full_name`= ?, `phone`= ?, `age`= ?, `gender`= ? WHERE id = ?";

  const values = [
    req.body.full_name,
    req.body.phone,
    req.body.age,
    req.body.gender,
  ];

  db.query(q, [...values, pilgrimId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("Pilgrim details have been updated successfully.");
  });
});

export default router;