const express = require("express");
const { handleAttendanceResponse, getMyResponse } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { addResponse } = require('../models/attendanceModel');
const pool = require("../config/db");

const router = express.Router();

// User confirms/rejects attendance
router.post("/respond", protect, handleAttendanceResponse);

// Get user's attendance response for a date
router.get("/my-response", protect, getMyResponse);

// Get current user's info
router.get("/me", protect, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, phone, created_at FROM users WHERE phone = $1",
      [req.user.phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user info:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// User gives attendance response
router.post('/attendance-response', protect, async (req, res) => {
  try {
    const phone_number = req.user.phone; // Auth middleware should set req.user
    const { date: for_date, response } = req.body;

    if (!for_date || !response) {
      return res.status(400).json({ message: 'Date and response are required' });
    }

    const result = await addResponse(for_date, phone_number, response);
    res.status(200).json({ message: 'Response recorded successfully', ...result });

  } catch (err) {
    console.error('❌ Attendance response error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
