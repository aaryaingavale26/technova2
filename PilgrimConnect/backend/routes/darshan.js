import express from "express";
import { db } from "../db.js";

const router = express.Router();

// 1. GET all bookings (Admin/Dashboard usage)
router.get("/", (req, res) => {
  const q = "SELECT * FROM darshan_bookings ORDER BY booking_date DESC";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
});

// 2. POST (Book a Darshan Slot)
router.post("/", (req, res) => {
  const q = "INSERT INTO darshan_bookings (`full_name`, `booking_date`, `slot_time`, `members`, `special_needs`) VALUES (?)";
  
  const values = [
    req.body.full_name,
    req.body.booking_date,
    req.body.slot_time,
    req.body.members,
    req.body.special_needs || "None",
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json("Darshan booked successfully.");
  });
});

export default router;