const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // needed for monthly query
const { getAvailability, setAvailability } = require('../models/availabilityModel');
const { handleAttendanceResponse, getMyResponse } = require("../controllers/userController");
const {protect} = require('../middlewares/authMiddleware'); // Optional

// ✅ GET /api/availability/month/:yearMonth
router.get('/month/:yearMonth', async (req, res) => {
  const { yearMonth } = req.params; // format: YYYY-MM

  try {
    const result = await pool.query(`
      SELECT date FROM availability
      WHERE TO_CHAR(date, 'YYYY-MM') = $1
    `, [yearMonth]);
    // console.log('Raw DB result:', result.rows);

    const availableDates = result.rows.map(row => {
      const localDate = new Date(row.date);
      const offsetMs = localDate.getTimezoneOffset() * 60000;
      const localIso = new Date(localDate.getTime() - offsetMs).toISOString();
      return localIso.split('T')[0];
    });
    
    res.json({ availableDates });
  } catch (err) {
    console.error('Error fetching availability by month:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ GET /api/availability/:date?phone=XXXXXXXXXX
router.get('/:date', protect, async (req, res) => {
  const { date } = req.params;
  const phone = req.user.phone; // secure and trusted

  try {
    // Fetch availability data for the date
    const availabilityResult = await pool.query(
      `SELECT required_members, remaining FROM availability WHERE date = $1`,
      [date]
    );

    if (availabilityResult.rowCount === 0) {
      return res.json({ available: false });
    }

    const { required_members, remaining } = availabilityResult.rows[0];

    // Fetch user's response securely using phone from token
    let user_response = 'not yet responded';

    const userResponseResult = await pool.query(
      `SELECT response FROM attendance_responses WHERE for_date = $1 AND phone_number = $2`,
      [date, phone]
    );

    if (userResponseResult.rowCount > 0) {
      user_response = userResponseResult.rows[0].response;
    }

    res.json({
      available: true,
      required_members,
      remaining,
      user_response
    });

  } catch (err) {
    console.error('🔥 Error fetching availability and user response:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});



// POST /api/availability
router.post('/', async (req, res) => {
  const { date, required_members } = req.body;

  if (!date || typeof required_members !== 'number') {
    return res.status(400).json({ error: 'Date and required_members are required' });
  }

  try {
    await setAvailability(date, required_members);
    res.json({ success: true, message: 'Availability updated successfully' });
  } catch (err) {
    console.error('Error setting availability:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
